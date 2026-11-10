import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useSiteSettings } from "@/hooks/use-site-settings";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions — Rivnexo" },
      { name: "description", content: "The Terms and Conditions governing use of Rivnexo." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { siteName, supportEmail } = useSiteSettings();

  return (
    <SiteLayout>
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <div className="text-center">
          <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary ring-1 ring-border">
            Legal
          </span>
          <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">Terms and Conditions</h1>
          <p className="mt-4 text-sm text-muted-foreground">Last updated: November 9, 2026</p>
        </div>

        <article className="glass-panel mt-12 space-y-8 rounded-3xl p-6 sm:p-10">
          <section>
            <h2 className="text-xl font-semibold">1. Acceptance of these terms</h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              By accessing or using {siteName}, you agree to these Terms and Conditions. If you do
              not agree, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. About {siteName}</h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              {siteName} is an independent marketplace for website apps and Android application
              packages (APKs). Listings may be provided by third parties. We do not own or control
              every app, website, or external service linked from the marketplace.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Accounts</h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              You are responsible for the accuracy of your account information and for keeping your
              login credentials confidential. You must notify us if you believe your account has
              been accessed without permission. We may suspend or block accounts that violate these
              terms or create risk for other users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. APKs and external links</h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              Download and install APKs only on devices you own or are authorized to manage.
              Security checks and checksums are provided as safeguards, not as a guarantee that an
              app is error-free, secure, compatible, or suitable for your device. External websites
              and services are governed by their own terms and privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Acceptable use</h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              You may not misuse the service, attempt unauthorized access, interfere with its
              operation, upload malicious content, infringe another person’s rights, or use Rivnexo
              for unlawful activity. Reviews and other user content must be accurate, relevant, and
              respectful.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Intellectual property</h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              Rivnexo’s branding, interface, and original content belong to Rivnexo or its
              licensors. App names, logos, content, and software remain the property of their
              respective owners. You may not copy or redistribute Rivnexo’s original materials
              without permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. User-submitted listings and reports</h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              Anyone submitting a listing must own or have permission to publish the app, APK,
              website information, screenshots, logos, and other materials included in that listing.
              By submitting content, you grant Rivnexo a limited permission to host, display, and
              distribute it as part of the marketplace. Do not submit pirated, malicious, deceptive,
              or infringing content. We may review, restrict, or remove listings and accounts after
              receiving a valid copyright, malware, abuse, or policy report. Reports can be sent
              through the Report Content page or the support contact provided on the website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Availability and disclaimers</h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              The service is provided on an “as available” basis. We may change, suspend, or
              discontinue features or listings. To the extent permitted by law, Rivnexo is not
              responsible for loss, damage, incompatibility, or harm resulting from third-party
              apps, external websites, downloads, or reliance on marketplace content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Changes and contact</h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              We may update these terms from time to time. Continued use after an update means you
              accept the revised terms.{" "}
              {supportEmail ? (
                <>
                  Questions can be sent to{" "}
                  <a className="text-primary hover:underline" href={`mailto:${supportEmail}`}>
                    {supportEmail}
                  </a>
                  .
                </>
              ) : (
                "Questions can be sent through the support contact provided on the website."
              )}
            </p>
          </section>
        </article>
      </main>
    </SiteLayout>
  );
}
