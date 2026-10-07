import { createFileRoute } from "@tanstack/react-router";

// Serves app icons, banners and screenshots from private storage via short-lived signed links.
export const Route = createFileRoute("/api/public/media")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const p = new URL(request.url).searchParams.get("p") ?? "";
        if (!/^[a-zA-Z0-9/_.\-]{1,300}$/.test(p) || p.includes("..")) {
          return new Response("Bad path", { status: 400 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("app-media").createSignedUrl(p, 3600);
        if (error || !data) return new Response("Not found", { status: 404 });
        return new Response(null, {
          status: 302,
          headers: { Location: data.signedUrl, "Cache-Control": "public, max-age=1800" },
        });
      },
    },
  },
});
