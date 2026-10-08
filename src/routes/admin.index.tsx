import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { compact } from "@/lib/media";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const c = (t: "apps" | "profiles" | "downloads" | "website_opens" | "reviews") =>
        supabase.from(t).select("*", { count: "exact", head: true });
      const [apps, users, dls, opens, revs, log] = await Promise.all([
        c("apps"), c("profiles"), c("downloads"), c("website_opens"), c("reviews"),
        supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(10),
      ]);
      return { apps: apps.count ?? 0, users: users.count ?? 0, dls: dls.count ?? 0, opens: opens.count ?? 0, revs: revs.count ?? 0, log: log.data ?? [] };
    },
  });
  const stats = [
    ["Applications", data?.apps], ["Users", data?.users], ["APK downloads", data?.dls], ["Website opens", data?.opens], ["Reviews", data?.revs],
  ] as const;
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map(([l, v]) => (
          <div key={l} className="glass-panel rounded-2xl p-4">
            <div className="text-xs text-muted-foreground">{l}</div>
            <div className="mt-1 text-2xl font-semibold">{compact(v ?? 0)}</div>
          </div>
        ))}
      </div>
      <h2 className="mb-3 mt-8 font-semibold">Recent activity</h2>
      <div className="glass-panel divide-y divide-border rounded-2xl">
        {(data?.log ?? []).length === 0 && <p className="p-4 text-sm text-muted-foreground">No activity yet.</p>}
        {data?.log.map((l) => (
          <div key={l.id} className="flex justify-between p-3 text-sm">
            <span>{l.action} {l.target && <span className="text-muted-foreground">· {l.target.slice(0, 8)}</span>}</span>
            <span className="text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
