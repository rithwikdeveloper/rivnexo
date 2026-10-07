import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Admin login by username + password. Bootstraps the first admin from server secrets. */
export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ username: z.string().trim().min(1).max(64), password: z.string().min(1).max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const username = data.username.toLowerCase();
    const invalid = { ok: false as const, error: "Invalid username or password." };

    const { count } = await supabaseAdmin.from("admin_accounts").select("*", { count: "exact", head: true });
    if (!count) {
      const envU = (process.env["ADMIN_USERNAME"] ?? "").toLowerCase().trim();
      const envP = process.env["ADMIN_PASSWORD"] ?? "";
      if (!envU || !envP || username !== envU || data.password !== envP) return invalid;
      const email = `${username.replace(/[^a-z0-9._-]/g, "")}@admin.rivnexo.app`;
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email, password: envP, email_confirm: true, user_metadata: { display_name: username },
      });
      if (error || !created.user) return { ok: false as const, error: "Could not create admin account." };
      await supabaseAdmin.from("admin_accounts").insert({ user_id: created.user.id, username });
      await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: "admin" });
    }

    const { data: acct } = await supabaseAdmin.from("admin_accounts").select("user_id").eq("username", username).maybeSingle();
    if (!acct) return invalid;
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(acct.user_id);
    const email = u.user?.email;
    if (!email) return invalid;

    const { createClient } = await import("@supabase/supabase-js");
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const pub = createClient(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { data: s, error } = await pub.auth.signInWithPassword({ email, password: data.password });
    if (error || !s.session) return invalid;
    const { data: role } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", acct.user_id).eq("role", "admin").maybeSingle();
    if (!role) return invalid;
    await supabaseAdmin.from("audit_log").insert({ admin_id: acct.user_id, action: "admin.login" });
    return { ok: true as const, access_token: s.session.access_token, refresh_token: s.session.refresh_token };
  });

/** Signed APK download link, records history. */
export const getApkDownload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ appId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: app } = await context.supabase.from("apps").select("id, kind, apk_path, version_name, slug").eq("id", data.appId).maybeSingle();
    if (!app || app.kind !== "apk" || !app.apk_path) throw new Error("This APK is not available.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: prof } = await supabaseAdmin.from("profiles").select("is_blocked").eq("id", context.userId).maybeSingle();
    if (prof?.is_blocked) throw new Error("Your account is blocked.");
    const { data: signed, error } = await supabaseAdmin.storage.from("apks").createSignedUrl(app.apk_path, 300, { download: `${app.slug}-${app.version_name ?? "latest"}.apk` });
    if (error || !signed) throw new Error("Could not prepare the download.");
    await supabaseAdmin.from("downloads").insert({ user_id: context.userId, app_id: app.id, version_name: app.version_name });
    const { data: cur } = await supabaseAdmin.from("apps").select("download_count").eq("id", app.id).single();
    await supabaseAdmin.from("apps").update({ download_count: (cur?.download_count ?? 0) + 1 }).eq("id", app.id);
    return { url: signed.signedUrl };
  });

/** Records a website open (public). */
export const recordWebsiteOpen = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ appId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: app } = await supabaseAdmin.from("apps").select("id, kind, is_published, open_count").eq("id", data.appId).maybeSingle();
    if (!app || app.kind !== "website" || !app.is_published) return { ok: false };
    await supabaseAdmin.from("website_opens").insert({ app_id: app.id });
    await supabaseAdmin.from("apps").update({ open_count: app.open_count + 1 }).eq("id", app.id);
    return { ok: true };
  });

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
}

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profiles } = await supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false }).limit(500);
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const { data: dls } = await supabaseAdmin.from("downloads").select("user_id");
    return (profiles ?? []).map((p) => ({
      ...p,
      is_admin: (roles ?? []).some((r) => r.user_id === p.id && r.role === "admin"),
      downloads: (dls ?? []).filter((d) => d.user_id === p.id).length,
    }));
  });

export const adminSetBlocked = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), blocked: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.userId === context.userId) throw new Error("You cannot block yourself.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("profiles").update({ is_blocked: data.blocked }).eq("id", data.userId);
    await supabaseAdmin.auth.admin.updateUserById(data.userId, { ban_duration: data.blocked ? "876000h" : "none" });
    await supabaseAdmin.from("audit_log").insert({ admin_id: context.userId, action: data.blocked ? "user.block" : "user.unblock", target: data.userId });
    return { ok: true };
  });
