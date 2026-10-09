import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Search } from "lucide-react";
import { SiteLayout, EmptyState } from "@/components/site-layout";
import { CardSkeleton, CompactCard, FeaturedCard, RowCard } from "@/components/app-card";
import { categoriesQuery, homeQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rivnexo — The marketplace for apps that run anywhere" },
      { name: "description", content: "Open website apps in a tap or download verified Android APKs. Browse featured, latest and popular apps on Rivnexo." },
      { property: "og:title", content: "Rivnexo — The marketplace for apps that run anywhere" },
      { property: "og:description", content: "Open website apps in a tap or download verified Android APKs." },
    ],
  }),
  component: Home,
});

function Section({ title, link, children }: { title: string; link?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {link}
      </div>
      {children}
    </section>
  );
}

function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | "website" | "apk">("all");
  const { data: cats } = useQuery(categoriesQuery);
  const { data, isLoading } = useQuery(homeQuery);
  const { siteName, tagline } = useSiteSettings();
  useEffect(() => { document.title = `${siteName} — ${tagline}`; }, [siteName, tagline]);
  const go = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/search", search: { q: q || undefined, type: type === "all" ? undefined : type } });
  };
  const empty = !isLoading && data && !data.latest.length;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary ring-1 ring-border backdrop-blur">Curated apps · checksum-verified APKs</span>
          <h1 className="mx-auto mt-5 max-w-[20ch] text-balance text-4xl font-semibold leading-tight sm:text-5xl">{tagline}</h1>
          <p className="mx-auto mt-4 max-w-[52ch] text-pretty text-base text-muted-foreground sm:text-lg">Open a website app in a tap, or download a verified Android APK. One storefront, no storefront fees.</p>
        </div>
        <form onSubmit={go} className="glass-panel mx-auto mt-8 max-w-2xl rounded-2xl p-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex flex-1 items-center gap-2 rounded-xl bg-secondary px-4 py-3 ring-1 ring-border">
              <Search className="size-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} className="w-full bg-transparent text-base placeholder:text-muted-foreground focus:outline-none" placeholder='Try "notes", "fitness tracker", "PDF reader"' aria-label="Search" />
            </label>
            <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Search apps</button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1 rounded-xl bg-secondary/60 p-1">
            {(["all", "website", "apk"] as const).map((t) => (
              <button type="button" key={t} onClick={() => setType(t)} className={cn("rounded-lg px-4 py-1.5 text-sm font-medium", type === t ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:bg-secondary")}>
                {t === "all" ? "All" : t === "website" ? "Websites" : "APKs"}
              </button>
            ))}
          </div>
        </form>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {cats?.map((c) => (
            <Link key={c.id} to="/search" search={{ category: c.slug }} className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium ring-1 ring-border backdrop-blur hover:text-primary">{c.name}</Link>
          ))}
        </div>
      </section>

      {empty ? (
        <div className="px-4 pb-20"><EmptyState title="No apps published yet" body="Apps added by Rivnexo admins will appear here." /></div>
      ) : (
        <>
          <Section title="Featured this week" link={<Link to="/search" className="text-sm font-medium text-primary">View all</Link>}>
            <div className="flex gap-5 overflow-x-auto pb-3">
              {isLoading ? [0, 1, 2].map((i) => <CardSkeleton key={i} className="h-72 w-[300px] shrink-0" />)
                : data?.featured.length ? data.featured.map((a) => <FeaturedCard key={a.id} app={a} />)
                : <p className="text-sm text-muted-foreground">No featured apps yet.</p>}
            </div>
          </Section>
          <Section title="Latest releases" link={<Link to="/search" search={{ sort: "newest" }} className="text-sm font-medium text-primary">See everything</Link>}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading ? [0, 1, 2].map((i) => <CardSkeleton key={i} />) : data?.latest.map((a) => <RowCard key={a.id} app={a} />)}
            </div>
          </Section>
          <Section title="Popular right now" link={<Link to="/search" search={{ sort: "popular" }} className="text-sm font-medium text-primary">Trending list</Link>}>
            <div className="grid gap-5 pb-10 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading ? [0, 1, 2].map((i) => <CardSkeleton key={i} />) : data?.popular.map((a) => <CompactCard key={a.id} app={a} />)}
            </div>
          </Section>
        </>
      )}
    </SiteLayout>
  );
}
