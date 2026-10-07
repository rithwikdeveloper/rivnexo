import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppForm } from "@/components/admin/app-form";
import { supabase } from "@/integrations/supabase/client";
import type { AppRow } from "@/lib/queries";

export const Route = createFileRoute("/admin/apps/$id")({
  component: EditApp,
});

function EditApp() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-app", id],
    queryFn: async () => (await supabase.from("apps").select("*").eq("id", id).maybeSingle()).data as AppRow | null,
  });
  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!data) return <p>App not found.</p>;
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit {data.name}</h1>
      <AppForm initial={data} />
    </div>
  );
}
