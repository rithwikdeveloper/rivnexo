import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, EmptyState } from "@/components/site-layout";
import { CardSkeleton, RowCard } from "@/components/app-card";
import { supabase } from "@/integrations/supabase/client";
import type { AppRow } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/favorites")({
  head: () => ({ meta: [{ title: "Your favorites — Rivnexo" }, { name: "description", content: "Apps you saved on Rivnexo." }, { property: "og:title", content: "Favorites — Rivnexo" }, { property: "og:description", content: "Apps you saved on Rivnexo." }] }),
  component: Favorites,
});

function Favorites() {
  const { data, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const { data, error } = await supabase.from("favorites").select("created_at, apps(*, categories(name, slug))").order("created_at", { ascending: false });
      if (error) throw error;
      return data.map((d) => d.apps).filter(Boolean) as unknown as AppRow[];
    },
  });
  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold">Favorites</h1>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && [0, 1, 2].map((i) => <CardSkeleton key={i} />)}
          {data?.map((a) => <RowCard key={a.id} app={a} />)}
        </div>
        {data && !data.length && <EmptyState title="No favorites yet" body="Tap Save on any app to keep it here." action={<Link to="/search" className="text-primary">Browse apps</Link>} />}
      </div>
    </SiteLayout>
  );
}
