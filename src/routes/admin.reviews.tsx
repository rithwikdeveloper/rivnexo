import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/admin/reviews")({ component: ReviewsPage });

function ReviewsPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => (await supabase.from("reviews").select("*, apps(name)").order("created_at", { ascending: false }).limit(200)).data ?? [],
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-reviews"] });
  const toggle = useMutation({
    mutationFn: async ({ id, hidden }: { id: string; hidden: boolean }) => {
      const { error } = await supabase.from("reviews").update({ is_hidden: hidden }).eq("id", id);
      if (error) throw error;
      await logAudit(hidden ? "review.hide" : "review.show", id);
    },
    onSuccess: refresh, onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
      await logAudit("review.delete", id);
    },
    onSuccess: refresh, onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Reviews</h1>
      <div className="glass-panel divide-y divide-border rounded-2xl">
        {data.length === 0 && <p className="p-4 text-sm text-muted-foreground">No reviews yet.</p>}
        {data.map((r) => (
          <div key={r.id} className="flex flex-wrap items-start justify-between gap-3 p-4 text-sm">
            <div className="min-w-0 flex-1">
              <div className="font-medium">{r.apps?.name} · {"★".repeat(r.rating)}{r.is_hidden && <span className="ml-2 text-destructive">Hidden</span>}</div>
              <div className="text-xs text-muted-foreground">{r.author_name ?? "Anonymous"} · {new Date(r.created_at).toLocaleDateString()}</div>
              {r.body && <p className="mt-1">{r.body}</p>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toggle.mutate({ id: r.id, hidden: !r.is_hidden })}>{r.is_hidden ? "Show" : "Hide"}</Button>
              <Button size="sm" variant="destructive" onClick={() => confirm("Delete review?") && del.mutate(r.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
