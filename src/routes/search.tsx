import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Search } from "lucide-react";
import { SiteLayout, EmptyState } from "@/components/site-layout";
import { CardSkeleton, RowCard } from "@/components/app-card";
import { categoriesQuery, searchQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

const schema = z.object({
  q: z.string().max(100).optional(),
  type: z.enum(["all", "website", "apk"]).optional(),
  category: z.string().max(60).optional(),
  sort: z.enum(["newest", "popular", "name"]).optional(),
});

export const Route = createFileRoute("/search")({
  validateSearch: schema,
  head: () => ({
    meta: [
      { title: "Browse & search apps — Rivnexo" },
      { name: "description", content: "Search Rivnexo for website apps and Android APKs by name, developer or category." },
      { property: "og:title", content: "Browse & search apps — Rivnexo" },
      { property: "og:description", content: "Filter website apps and Android APKs by type, category and popularity." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const [q, setQ] = useState(s.q ?? "");
  useEffect(() => setQ(s.q ?? ""), [s.q]);
  const { data: cats } = useQuery(categoriesQuery);
  const { data, isLoading, isError, refetch } = useQuery(searchQuery(s));
  const set = (patch: Partial<typeof s>) => navigate({ search: (prev) => ({ ...prev, ...patch }) });
  const type = s.type ?? "all";

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold">Browse apps</h1>
        <form onSubmit={(e) => { e.preventDefault(); set({ q: q || undefined }); }} className="mt-5 flex max-w-2xl items-center gap-2 rounded-xl bg-secondary px-4 py-3 ring-1 ring-border">
          <Search className="size-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="w-full bg-transparent focus:outline-none" placeholder="Search by name, developer, package…" aria-label="Search" />
        </form>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {(["all", "website", "apk"] as const).map((t) => (
            <button key={t} onClick={() => set({ type: t === "all" ? undefined : t })} className={cn("rounded-lg px-4 py-1.5 text-sm font-medium ring-1 ring-border", type === t ? "bg-ink text-ink-foreground" : "bg-secondary text-muted-foreground")}>
              {t === "all" ? "All" : t === "website" ? "Websites" : "APKs"}
            </button>
          ))}
          <select value={s.category ?? ""} onChange={(e) => set({ category: e.target.value || undefined })} className="rounded-lg bg-secondary px-3 py-1.5 text-sm ring-1 ring-border" aria-label="Category">
            <option value="">All categories</option>
            {cats?.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <select value={s.sort ?? "newest"} onChange={(e) => set({ sort: e.target.value as "newest" })} className="rounded-lg bg-secondary px-3 py-1.5 text-sm ring-1 ring-border" aria-label="Sort">
            <option value="newest">Newest</option>
            <option value="popular">Most popular</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && [0, 1, 2, 3, 4, 5].map((i) => <CardSkeleton key={i} />)}
          {data?.map((a) => <RowCard key={a.id} app={a} />)}
        </div>
        {isError && <EmptyState title="Couldn't load apps" action={<button onClick={() => refetch()} className="text-primary">Try again</button>} />}
        {data && !data.length && <EmptyState title="No apps found" body="Try a different search or clear filters." />}
      </div>
    </SiteLayout>
  );
}
