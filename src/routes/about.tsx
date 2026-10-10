import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe, Smartphone, Heart, Star, ShieldCheck, Share2, History } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { useSiteSettings } from "@/hooks/use-site-settings";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Rivnexo" },
      { name: "description", content: "Learn about Rivnexo — the marketplace for website apps and verified Android APKs, owned and developed by Rithwik Duvva." },
      { property: "og:title", content: "About — Rivnexo" },
      { property: "og:description", content: "The marketplace for apps that run anywhere — website apps and verified Android APKs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

const features = [
  { icon: Globe, title: "Website apps", body: "Curated web apps you can open instantly in a new tab — no installs, no store fees." },
  { icon: Smartphone, title: "Android APKs", body: "Direct APK downloads with version, size and package details, plus SHA-256 checksums and security scan badges." },
  { icon: Heart, title: "Favorites", body: "Save the apps you love to your personal list and find them again in one tap." },
  { icon: Star, title: "Ratings & reviews", body: "Rate apps from 1 to 5 stars and share your experience with written reviews." },
  { icon: History, title: "Download history", body: "Keep track of every APK you've downloaded from your account." },
  { icon: Share2, title: "Share anywhere", body: "Send any app to WhatsApp, Telegram, X or your device's native share sheet." },
];

function AboutPage() {
  const { siteName, tagline, ownerName, supportEmail } = useSiteSettings();
  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary ring-1 ring-border backdrop-blur">About us</span>
          <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">{siteName}</h1>
          <p className="mx-auto mt-4 max-w-[52ch] text-pretty text-base text-muted-foreground sm:text-lg">{tagline}</p>
        </div>

        <section className="glass-panel mx-auto mt-12 max-w-3xl rounded-3xl p-8">
          <h2 className="text-xl font-semibold">What is {siteName}?</h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            {siteName} is an independent marketplace that brings two kinds of apps together in one place: website apps that open instantly in your browser, and Android APKs you can download directly to your phone. Every listing is curated, and APK files are checksum-verified before they reach you.
          </p>
          <p className="mt-3 text-pretty text-muted-foreground">
            Signing in unlocks the full experience — opening website apps, downloading APKs, saving favorites, leaving reviews and keeping your download history. A built-in security scan badge tells you when an APK has passed its checks, and every app page can be shared with friends in a tap.
          </p>
          <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-success" />
            <span>Checksum-verified APKs · Curated listings · No storefront fees</span>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-center text-2xl font-semibold">App details</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="glass-panel rounded-2xl p-6">
                <span className="inline-grid size-10 place-items-center rounded-xl bg-primary/15 text-primary"><f.icon className="size-5" /></span>
                <h3 className="mt-4 font-sans font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-pretty text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel mt-12 rounded-3xl p-8 text-center">
          <h2 className="text-xl font-semibold">Owned &amp; developed by</h2>
          <p className="mt-2 text-2xl font-semibold text-primary">{ownerName || "Rithwik Duvva"}</p>
          <p className="mx-auto mt-3 max-w-[52ch] text-pretty text-sm text-muted-foreground">
            {siteName} is designed, built and maintained independently — not affiliated with any app store.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/search" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Browse apps</Link>
            {supportEmail && <a href={`mailto:${supportEmail}`} className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-semibold ring-1 ring-border">Contact support</a>}
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
