import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MessageCircle } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { useSiteSettings } from "@/hooks/use-site-settings";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Contact Support — Rivnexo" },
      {
        name: "description",
        content: "Contact Rivnexo support for help with your account or marketplace experience.",
      },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  const { siteName, supportEmail } = useSiteSettings();

  return (
    <SiteLayout>
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="text-center">
          <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary ring-1 ring-border">
            Help center
          </span>
          <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">Contact Support</h1>
          <p className="mx-auto mt-4 max-w-[52ch] text-pretty text-muted-foreground">
            Need help with your {siteName} account, an app listing, or a download? Send us a message
            and we’ll get back to you.
          </p>
        </div>

        <section className="glass-panel mx-auto mt-12 max-w-xl rounded-3xl p-8 text-center">
          <span className="mx-auto inline-grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
            <MessageCircle className="size-6" />
          </span>
          <h2 className="mt-5 text-xl font-semibold">Email support</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please include your account email and a clear description of the problem.
          </p>
          {supportEmail ? (
            <a
              href={`mailto:${supportEmail}`}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Mail className="size-4" />
              {supportEmail}
            </a>
          ) : (
            <p className="mt-6 rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
              Support email is currently unavailable. Please check back later.
            </p>
          )}
          <div className="mt-6">
            <Link to="/terms" className="text-sm text-primary hover:underline">
              Read the Terms and Conditions
            </Link>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
