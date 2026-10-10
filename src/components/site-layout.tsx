import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Logo } from "@/components/brand";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useAuth } from "@/hooks/use-auth";

function MaintenanceScreen({ siteName, supportEmail }: { siteName: string; supportEmail: string }) {
  return (
    <div className="glow-orbs flex min-h-screen items-center justify-center p-6">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-10 text-center">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-6 text-3xl font-semibold">Under maintenance</h1>
        <p className="mt-3 text-muted-foreground">
          We're currently updating {siteName}. We'll be back shortly — thanks for your patience!
        </p>
        {supportEmail && (
          <p className="mt-6 text-sm text-muted-foreground">
            Need help? <a className="text-primary underline" href={`mailto:${supportEmail}`}>{supportEmail}</a>
          </p>
        )}
      </div>
    </div>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const { maintenance, siteName, supportEmail } = useSiteSettings();
  const { isAdmin } = useAuth();
  if (maintenance && !isAdmin) return <MaintenanceScreen siteName={siteName} supportEmail={supportEmail} />;
  return (
    <div className="glow-orbs min-h-screen overflow-hidden">
      <SiteHeader />
      <main className="min-h-[70vh]">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="glass-panel mx-auto max-w-md rounded-2xl p-10 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      {body && <p className="mt-2 text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
