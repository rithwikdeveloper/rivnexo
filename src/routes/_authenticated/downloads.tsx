import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, EmptyState } from "@/components/site-layout";
import { AppIcon } from "@/components/app-card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/downloads")({
  head: () => ({ meta: [{ title: "Download history — Rivnexo" }, { name: "description", content: "APKs you downloaded from Rivnexo." }, { property: "og:title", content: "Downloads — Rivnexo" }, { property: "og:description", content: "Your APK download history." }] }),
  component: Downloads,
});

function Downloads() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-downloads"],
    queryFn: async () => {
      const { user } = (await supabase.auth.getUser()).data;
      const { data, error } = await supabase.from("downloads").select("id, created_at, version_name, apps(name, slug, icon_url, kind)").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data;
    },
  });
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold">Download history</h1>
        <div className="mt-6 space-y-3">
          {isLoading && <div className="glass-panel h-20 animate-pulse rounded-2xl" />}
          {data?.map((d) => d.apps && (
            <Link key={d.id} to="/apps/$slug" params={{ slug: d.apps.slug }} className="glass-panel flex items-center gap-4 rounded-2xl p-4">
              <AppIcon app={d.apps} size="sm" />
              <div className="flex-1"><p className="font-medium">{d.apps.name}</p><p className="text-xs text-muted-foreground">v{d.version_name ?? "?"} · {new Date(d.created_at).toLocaleString()}</p></div>
            </Link>
          ))}
        </div>
        {data && !data.length && <EmptyState title="No downloads yet" body="APKs you download will show up here." />}
      </div>
    </SiteLayout>
  );
}
