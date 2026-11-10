import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useSiteSettings } from "@/hooks/use-site-settings";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Rivnexo" },
      {
        name: "description",
        content: "Learn how Rivnexo handles account and marketplace information.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { siteName, supportEmail } = useSiteSettings();

  return (
    <SiteLayout>
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <div className="text-center">
          <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary ring-1 ring-border">
            Legal
          </span>
          <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-sm text-muted-foreground">Last updated: November 9, 2026</p>
        </div>

        <article className="glass-panel mt-12 space-y-8 rounded-3xl p-6 sm:p-10">
          <section>
            <h2 className="text-xl font-semibold">1. Information we collect</h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              When you create an account, {siteName} may store your email address, display name,
              profile details, favorites, reviews, download history, and information needed to keep
              the service secure. We also receive basic technical information required to operate
              the website.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">2. How we use information</h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              We use information to provide accounts, show your profile and reviews, save favorites,
              record downloads, prevent abuse, respond to support requests, and improve the
              marketplace. We do not sell personal information.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">3. Public content</h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              Reviews, display names, and other content you choose to publish may be visible to
              other visitors. Do not include personal or confidential information in public reviews.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">4. Cookies and local storage</h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              The website may use browser storage for authentication, preferences such as theme
              settings, and basic offline support. You can clear browser storage through your
              browser settings, though some features may stop working.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">5. Third-party services</h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              {siteName} uses service providers to host the application, authenticate accounts,
              store marketplace data, and deliver files. External apps and websites linked from
              listings have their own privacy policies, which you should review before using them.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">6. Your choices</h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              You may update your profile information, sign out, or request help with your account.
              To ask about your information or request account assistance, contact{" "}
              {supportEmail ? (
                <a className="text-primary hover:underline" href={`mailto:${supportEmail}`}>
                  {supportEmail}
                </a>
              ) : (
                "our support team"
              )}
              .
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">7. Retention and deletion</h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              We keep account and marketplace information only for as long as needed to provide the
              service, maintain security, resolve disputes, comply with legal obligations, and keep
              necessary audit records. You may contact us to request account deletion or removal of
              personal information, subject to information we must retain for security or legal
              reasons.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">8. Security and privacy questions</h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              We use reasonable safeguards designed to protect information, but no online service
              can guarantee complete security. Contact the support address below to ask about your
              information, report a privacy concern, or request account assistance.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">9. Changes to this policy</h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              We may update this policy when the service changes. The latest version will always be
              available on this page.
            </p>
          </section>
        </article>
      </main>
    </SiteLayout>
  );
}
