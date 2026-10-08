import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { compact } from "@/lib/media";

export const Route = createFileRoute("/admin/analytics")({ component: AnalyticsPage });

function AnalyticsPage() {
  const { data } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const { data } = await supabase.from("apps").select("id, name, kind, download_count, open_count, categories(name)");
      return data ?? [];
    },
  });
  const apps = data ?? [];
  const top = [...apps].sort((a, b) => b.download_count + b.open_count - (a.download_count + a.open_count)).slice(0, 10);
  const max = Math.max(1, ...top.map((a) => a.download_count + a.open_count));
  const byCat = new Map<string, number>();
  apps.forEach((a) => { const k = a.categories?.name ?? "Uncategorized"; byCat.set(k, (byCat.get(k) ?? 0) + a.download_count + a.open_count); });
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <section className="glass-panel rounded-2xl p-5">
        <h2 className="mb-4 font-semibold">Top applications</h2>
        {top.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
        <div className="space-y-3">
          {top.map((a) => {
            const v = a.download_count + a.open_count;
            return (
              <div key={a.id} className="text-sm">
                <div className="mb-1 flex justify-between"><span>{a.name}</span><span className="text-muted-foreground">{compact(v)}</span></div>
                <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${(v / max) * 100}%` }} /></div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="glass-panel rounded-2xl p-5">
        <h2 className="mb-4 font-semibold">By category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...byCat.entries()].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-muted/50 p-3 text-sm"><div className="text-muted-foreground">{k}</div><div className="text-lg font-semibold">{compact(v)}</div></div>
          ))}
        </div>
      </section>
    </div>
  );
}
