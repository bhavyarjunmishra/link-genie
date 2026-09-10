import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowRight,
  BarChart3,
  Check,
  Copy,
  Globe2,
  QrCode,
  Shield,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Link Genie — Bold short links, QR codes & click analytics" },
      {
        name: "description",
        content:
          "Shorten any URL, claim a custom alias, generate a QR code and watch clicks roll in on a live analytics dashboard.",
      },
      { property: "og:title", content: "Link Genie — Bold short links & analytics" },
      {
        property: "og:description",
        content: "Custom aliases, instant QR codes and real-time click analytics in one dashboard.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Wand2,
    title: "Custom aliases",
    body: "Claim readable slugs like /r/spring-sale so every link looks intentional, not random.",
  },
  {
    icon: QrCode,
    title: "Instant QR codes",
    body: "Every link ships with a downloadable, print-ready QR code — no extra tool needed.",
  },
  {
    icon: BarChart3,
    title: "Click analytics",
    body: "Track clicks over time, referrers, devices and geography from one live dashboard.",
  },
  {
    icon: Zap,
    title: "Instant redirects",
    body: "Links resolve immediately and record the visit in the background, never blocking the user.",
  },
  {
    icon: Shield,
    title: "Private by default",
    body: "Your links and stats belong to your account only — nobody else can list or edit them.",
  },
  {
    icon: Globe2,
    title: "Share anywhere",
    body: "One-tap copy and native share sheets on mobile make posting links effortless.",
  },
];

function Landing() {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const preview = useMemo(() => {
    const raw = url.trim().replace(/^https?:\/\//i, "").split("/")[0] ?? "";
    const seed = raw ? raw.split(".")[0]!.slice(0, 8).replace(/[^a-z0-9]/gi, "") : "";
    return `linkgenie.app/r/${seed || "your-alias"}`;
  }, [url]);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary/20 blur-[160px]" />
        <div className="pointer-events-none absolute right-0 top-40 h-72 w-72 rounded-full bg-accent/25 blur-[130px]" />

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
          <Badge variant="secondary" className="mb-6 rounded-full px-3 py-1 text-xs">
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" /> Links, QR codes & analytics
          </Badge>
          <h1 className="max-w-4xl text-5xl font-bold leading-[0.95] sm:text-7xl lg:text-8xl">
            Long links are <span className="text-gradient">dead weight.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Link Genie turns any messy URL into a short, branded link with a custom alias, a
            print-ready QR code and analytics that tell you exactly what's working.
          </p>

          <div className="mt-10 max-w-2xl rounded-3xl border border-border bg-card/80 p-2 backdrop-blur glow-primary">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a long URL to shorten"
                className="h-14 border-0 bg-transparent text-base focus-visible:ring-0"
              />
              <Button asChild size="lg" className="h-14 px-7 text-base font-semibold">
                <Link to="/auth">
                  Shorten it <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>Preview:</span>
            <code className="rounded-lg bg-muted px-3 py-1.5 font-mono text-foreground">
              {preview}
            </code>
            <button
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
              onClick={() => {
                navigator.clipboard.writeText(preview);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <dl className="mt-16 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              ["Live", "link analytics"],
              ["Custom", "short aliases"],
              ["Instant", "QR codes"],
              ["Private", "by default"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-3xl font-bold">{value}</dt>
                <dd className="text-sm text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Dashboard peek */}
      <section id="analytics" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <span className="h-3 w-3 rounded-full bg-destructive/70" />
            <span className="h-3 w-3 rounded-full bg-chart-4/70" />
            <span className="h-3 w-3 rounded-full bg-primary/70" />
            <span className="ml-3 text-sm text-muted-foreground">linkgenie.app/dashboard</span>
          </div>
          <div className="grid gap-6 p-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <p className="text-sm text-muted-foreground">Your click history</p>
              <p className="font-display text-4xl font-bold">Live analytics</p>
              <div className="mt-4 flex h-48 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
                Sign in to see your click history
              </div>
            </div>
            <div className="space-y-3">
              {["Custom aliases", "QR codes", "Device insights", "Referrer insights"].map((label) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-border bg-background/50 px-4 py-3"
                >
                  <span className="text-sm text-primary">{label}</span>
                  <Check className="h-4 w-4 text-primary" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="max-w-2xl text-4xl font-bold sm:text-5xl">
          Everything you need after the click.
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-3xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-4xl font-bold sm:text-5xl">Simple pricing</h2>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {[
            { name: "Free", price: "Free", perks: ["Short links", "Custom aliases", "QR codes", "Click analytics"] },
            {
              name: "Pro",
              price: "Pro",
              perks: ["More links", "Full analytics history", "Bulk QR export", "Priority redirects"],
              featured: true,
            },
            { name: "Team", price: "Team", perks: ["Everything in Pro", "Shared workspaces", "Audit log", "Team support"] },
          ].map((tier) => (
            <div
              key={tier.name}
              className={`rounded-3xl border p-7 ${
                tier.featured
                  ? "border-primary/60 bg-card glow-primary"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                {tier.featured && <Badge>Most popular</Badge>}
              </div>
              <p className="mt-4 font-display text-4xl font-bold">
                {tier.price}
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
                {tier.perks.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> {p}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="mt-7 w-full font-semibold"
                variant={tier.featured ? "default" : "secondary"}
              >
                <Link to="/auth">Get started</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
          <div className="relative">
            <h2 className="text-4xl font-bold sm:text-5xl">Shorten your first link today.</h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Free to start. No card required. Your dashboard is waiting.
            </p>
            <Button asChild size="lg" className="mt-8 h-14 px-8 text-base font-semibold">
              <Link to="/auth">
                Create your account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Link Genie</p>
          <p>Built for people who share links for a living.</p>
        </div>
      </footer>
    </div>
  );
}
