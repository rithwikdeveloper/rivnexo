import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useSiteSettings } from "@/hooks/use-site-settings";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report Content — Rivnexo" },
      { name: "description", content: "Report copyright, malware, abuse, or policy violations on Rivnexo." },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { siteName, supportEmail } = useSiteSettings();
  const subject = encodeURIComponent(`${siteName} content report`);
  const body = encodeURIComponent(
    "Please include the listing URL, type of report, details of the issue, and your contact information.",
  );

  return (
    <SiteLayout>
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="text-center">
          <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary ring-1 ring-border">Safety</span>
          <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">Report Content</h1>
          <p className="mt-4 text-muted-foreground">Help us review copyright, malware, abuse, and policy concerns.</p>
        </div>
        <section className="glass-panel mt-12 space-y-6 rounded-3xl p-6 sm:p-10">
          <div>
            <h2 className="text-xl font-semibold">What to report</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Copyright or trademark infringement</li>
              <li>Malware, suspicious APKs, or unsafe downloads</li>
              <li>Fraud, impersonation, spam, or deceptive listings</li>
              <li>Content that violates the Terms and Conditions</li>
            </ul>
          </div>
          {supportEmail ? (
            <a href={`mailto:${supportEmail}?subject=${subject}&body=${body}`} className="inline-flex rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground hover:opacity-90">
              Email a report
            </a>
          ) : (
            <p className="text-muted-foreground">Please use the support contact shown on the website.</p>
          )}
          <p className="text-sm text-muted-foreground">Include the listing URL, the reason for your report, and evidence or authorization where relevant. Do not send passwords or other sensitive information.</p>
        </section>
      </main>
    </SiteLayout>
  );
}
