import { Link, useNavigate } from "@tanstack/react-router";
import type { MouseEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Download, ExternalLink, Globe, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { compact, mediaUrl } from "@/lib/media";
import type { AppRow } from "@/lib/queries";

export function AppIcon({ app, size = "md" }: { app: Pick<AppRow, "name" | "icon_url" | "kind">; size?: "sm" | "md" | "lg" | "xl" }) {
  const s = { sm: "size-11 rounded-[12px] text-sm", md: "size-14 rounded-[14px]", lg: "size-12 rounded-[13px]", xl: "size-24 rounded-[24px] text-2xl" }[size];
  const src = mediaUrl(app.icon_url);
  const tone = app.kind === "apk" ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary";
  if (src) return <img src={src} alt="" loading="lazy" className={cn(s, "shrink-0 object-cover ring-1 ring-border")} />;
  return (
    <span className={cn(s, tone, "grid shrink-0 place-items-center font-semibold")}>
      {app.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
    </span>
  );
}

export function TypeBadge({ kind }: { kind: "website" | "apk" }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
      kind === "apk" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary",
    )}>
      {kind === "apk" ? <Smartphone className="size-3" /> : <Globe className="size-3" />}
      {kind === "apk" ? "APK" : "Website"}
    </span>
  );
}

export function ActionLabel({ kind }: { kind: "website" | "apk" }) {
  return kind === "apk" ? (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-sm font-semibold text-ink-foreground"><Download className="size-3.5" />Download APK</span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"><ExternalLink className="size-3.5" />Open Website</span>
  );
}

export function useSignInGate() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  return (e: MouseEvent) => {
    if (loading || user) return;
    e.preventDefault();
    toast.info("Please sign in first to open websites and APK apps");
    navigate({ to: "/auth" });
  };
}

function usage(app: AppRow) {
  return app.kind === "apk" ? `${compact(app.download_count)} downloads` : `${compact(app.open_count)} opens`;
}

export function FeaturedCard({ app }: { app: AppRow }) {
  const gate = useSignInGate();
  const banner = mediaUrl(app.banner_url);
  return (
    <Link to="/apps/$slug" params={{ slug: app.slug }} onClick={gate} className="glass-panel w-[300px] shrink-0 overflow-hidden rounded-2xl transition hover:-translate-y-0.5">
      <div className={cn("aspect-[16/9]", app.kind === "apk" ? "bg-accent/10" : "bg-primary/10")}>
        {banner && <img src={banner} alt="" loading="lazy" className="size-full object-cover" />}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3">
          <AppIcon app={app} size="sm" />
          <div className="min-w-0">
            <h3 className="truncate font-sans font-semibold">{app.name}</h3>
            <p className="truncate text-xs text-muted-foreground">{app.developer ?? app.categories?.name}</p>
          </div>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-pretty text-muted-foreground">{app.short_description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-medium text-star">{usage(app)}</span>
          <ActionLabel kind={app.kind} />
        </div>
      </div>
    </Link>
  );
}

export function RowCard({ app }: { app: AppRow }) {
  const gate = useSignInGate();
  return (
    <Link to="/apps/$slug" params={{ slug: app.slug }} onClick={gate} className="glass-panel flex gap-4 rounded-2xl p-4 transition hover:-translate-y-0.5">
      <AppIcon app={app} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-sans font-semibold">{app.name}</h3>
          <TypeBadge kind={app.kind} />
        </div>
        <p className="truncate text-xs text-muted-foreground">{[app.developer, app.categories?.name].filter(Boolean).join(" · ")}</p>
        <p className="mt-1 line-clamp-1 text-sm text-pretty text-muted-foreground">{app.short_description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-medium text-star">{usage(app)}</span>
          <ActionLabel kind={app.kind} />
        </div>
      </div>
    </Link>
  );
}

export function CompactCard({ app }: { app: AppRow }) {
  const gate = useSignInGate();
  return (
    <Link to="/apps/$slug" params={{ slug: app.slug }} onClick={gate} className="glass-panel rounded-2xl p-5 transition hover:-translate-y-0.5">
      <div className="flex items-center gap-3">
        <AppIcon app={app} size="lg" />
        <div className="min-w-0">
          <h3 className="truncate font-sans font-semibold">{app.name}</h3>
          <p className="truncate text-xs text-muted-foreground">{app.categories?.name ?? app.developer}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-medium text-star">{usage(app)}</span>
        <ActionLabel kind={app.kind} />
      </div>
    </Link>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return <div className={cn("glass-panel h-36 animate-pulse rounded-2xl", className)} />;
}
