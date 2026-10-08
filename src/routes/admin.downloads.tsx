import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/downloads")({ component: DownloadsPage });

function DownloadsPage() {
  const { data = [] } = useQuery({
    queryKey: ["admin-downloads"],
    queryFn: async () => (await supabase.from("downloads").select("*, apps(name)").order("created_at", { ascending: false }).limit(300)).data ?? [],
  });
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Downloads</h1>
      <div className="glass-panel overflow-x-auto rounded-2xl">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground"><tr><th className="p-3">App</th><th className="p-3">Version</th><th className="p-3">User</th><th className="p-3">When</th></tr></thead>
          <tbody>
            {data.length === 0 && <tr><td colSpan={4} className="p-3 text-muted-foreground">No downloads yet.</td></tr>}
            {data.map((d) => (
              <tr key={d.id} className="border-t border-border">
                <td className="p-3">{d.apps?.name}</td>
                <td className="p-3">{d.version_name ?? "—"}</td>
                <td className="p-3 font-mono text-xs">{d.user_id?.slice(0, 8) ?? "guest"}</td>
                <td className="p-3">{new Date(d.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
