import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect width="32" height="32" rx="10" className="fill-primary" />
      <path d="M10 23V9h6.2a4.4 4.4 0 0 1 1.3 8.6L22 23h-3.6l-3.9-5H13.2v5H10Zm3.2-7.8h2.9a1.6 1.6 0 1 0 0-3.2h-2.9v3.2Z" className="fill-primary-foreground" />
      <circle cx="23" cy="10" r="2" className="fill-accent" />
    </svg>
  );
}

export function Logo({ to = "/", className }: { to?: string; className?: string }) {
  const { siteName } = useSiteSettings();
  return (
    <Link to={to} className={cn("flex items-center gap-2 font-display text-lg font-semibold tracking-tight", className)}>
      <LogoMark />
      {siteName}
    </Link>
  );
}
