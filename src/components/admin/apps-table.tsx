import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppIcon, TypeBadge } from "@/components/app-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { AppRow } from "@/lib/queries";
import { logAudit } from "@/lib/audit";

export function AppsTable({ kind, title }: { kind?: "website" | "apk"; title: string }) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-apps", kind],
    queryFn: async () => {
      let query = supabase.from("apps").select("*, categories(name, slug)").order("created_at", { ascending: false });
      if (kind) query = query.eq("kind", kind);
      const { data, error } = await query;
      if (error) throw error;
      return data as AppRow[];
    },
  });
  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<AppRow> }) => {
      const { error } = await supabase.from("apps").update(patch).eq("id", id);
      if (error) throw error;
      await logAudit("app.update", id, patch);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-apps"] }),
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (app: AppRow) => {
      if (app.apk_path) await supabase.storage.from("apks").remove([app.apk_path]);
      const { error } = await supabase.from("apps").delete().eq("id", app.id);
      if (error) throw error;
      await logAudit("app.delete", app.id, { name: app.name });
    },
    onSuccess: () => { toast.success("App deleted"); qc.invalidateQueries({ queryKey: ["admin-apps"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const rows = data.filter((a) => !q || a.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <div className="flex gap-2">
          <Input placeholder="Filter…" value={q} onChange={(e) => setQ(e.target.value)} className="w-48" />
          <Button asChild><Link to="/admin/apps/new" search={kind ? { kind } : {}}>Add app</Link></Button>
        </div>
      </div>
      <div className="glass-panel mt-6 overflow-x-auto rounded-2xl">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr className="border-b border-border">
              <th className="p-3">App</th>
              {kind === "apk" && <><th className="p-3">Version</th><th className="p-3">Scan</th><th className="p-3">Approval</th></>}
              <th className="p-3">Featured</th><th className="p-3">Published</th><th className="p-3">Usage</th><th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td className="p-6 text-muted-foreground" colSpan={9}>Loading…</td></tr>}
            {!isLoading && !rows.length && <tr><td className="p-6 text-muted-foreground" colSpan={9}>No apps yet.</td></tr>}
            {rows.map((a) => (
              <tr key={a.id} className="border-b border-border last:border-0">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <AppIcon app={a} size="sm" />
                    <div><p className="font-medium">{a.name}</p><div className="flex items-center gap-2 text-xs text-muted-foreground"><TypeBadge kind={a.kind} />{a.categories?.name}</div></div>
                  </div>
                </td>
                {kind === "apk" && (
                  <>
                    <td className="p-3">{a.version_name ?? "—"}</td>
                    <td className="p-3">
                      <select value={a.scan_status} onChange={(e) => update.mutate({ id: a.id, patch: { scan_status: e.target.value } })} className="rounded-md bg-secondary px-2 py-1 ring-1 ring-border">
                        <option value="pending">Pending</option><option value="clean">Clean</option><option value="flagged">Flagged</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <select value={a.approval_status} onChange={(e) => update.mutate({ id: a.id, patch: { approval_status: e.target.value } })} className="rounded-md bg-secondary px-2 py-1 ring-1 ring-border">
                        <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </>
                )}
                <td className="p-3"><Switch checked={a.is_featured} onCheckedChange={(v) => update.mutate({ id: a.id, patch: { is_featured: v } })} /></td>
                <td className="p-3"><Switch checked={a.is_published} onCheckedChange={(v) => update.mutate({ id: a.id, patch: { is_published: v } })} /></td>
                <td className="p-3 text-muted-foreground">{a.kind === "apk" ? `${a.download_count} dl` : `${a.open_count} opens`}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild><Link to="/admin/apps/$id" params={{ id: a.id }} aria-label="Edit"><Pencil /></Link></Button>
                    <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => confirm(`Delete ${a.name}?`) && del.mutate(a)}><Trash2 /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
