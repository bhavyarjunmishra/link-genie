import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import QRCode from "qrcode";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Check,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  MousePointerClick,
  Plus,
  QrCode,
  Search,
  Share2,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Logo } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Link Genie" },
      { name: "description", content: "Create short links, generate QR codes and track clicks." },
      { property: "og:title", content: "Dashboard — Link Genie" },
      { property: "og:description", content: "Your links, QR codes and click analytics." },
    ],
  }),
  component: Dashboard,
});

type LinkRow = {
  id: string;
  slug: string;
  target_url: string;
  title: string | null;
  is_active: boolean;
  created_at: string;
};

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function randomSlug() {
  return Math.random().toString(36).slice(2, 8);
}

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [origin, setOrigin] = useState("");
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [qrLink, setQrLink] = useState<LinkRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const linksQuery = useQuery({
    queryKey: ["links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("links")
        .select("id, slug, target_url, title, is_active, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LinkRow[];
    },
  });

  const clicksQuery = useQuery({
    queryKey: ["clicks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clicks")
        .select("link_id, created_at, device, referrer, country")
        .order("created_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      return data ?? [];
    },
  });

  const links = linksQuery.data ?? [];
  const clicks = clicksQuery.data ?? [];

  const clicksByLink = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of clicks) map.set(c.link_id, (map.get(c.link_id) ?? 0) + 1);
    return map;
  }, [clicks]);

  const rows = useMemo(() => {
    const list = links.map((l) => ({ ...l, clicks: clicksByLink.get(l.id) ?? 0 }));
    const q = search.trim().toLowerCase();
    return q
      ? list.filter(
          (l) =>
            l.slug.toLowerCase().includes(q) ||
            l.target_url.toLowerCase().includes(q) ||
            (l.title ?? "").toLowerCase().includes(q),
        )
      : list;
  }, [links, clicksByLink, search]);

  const trend = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(Date.now() - (13 - i) * 86_400_000);
      return { key: d.toISOString().slice(0, 10), day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), clicks: 0 };
    });
    const index = new Map(days.map((d) => [d.key, d]));
    for (const c of clicks) {
      const entry = index.get(String(c.created_at).slice(0, 10));
      if (entry) entry.clicks += 1;
    }
    return days;
  }, [clicks]);

  const totalClicks = clicks.length;
  const last7 = trend.slice(7).reduce((s, d) => s + d.clicks, 0);
  const prev7 = trend.slice(0, 7).reduce((s, d) => s + d.clicks, 0);
  const delta = prev7 === 0 ? null : Math.round(((last7 - prev7) / prev7) * 100);

  const devices = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of clicks) map.set(c.device ?? "Unknown", (map.get(c.device ?? "Unknown") ?? 0) + 1);
    return [...map].map(([name, value]) => ({ name, value }));
  }, [clicks]);

  const sources = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of clicks) {
      let name = "Direct";
      if (c.referrer) {
        try {
          name = new URL(c.referrer).hostname.replace("www.", "");
        } catch {
          name = "Other";
        }
      }
      map.set(name, (map.get(name) ?? 0) + 1);
    }
    return [...map].map(([name, value]) => ({ name, value })).slice(0, 5);
  }, [clicks]);

  const countries = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of clicks) {
      const name = c.country ?? "Unknown";
      map.set(name, (map.get(name) ?? 0) + 1);
    }
    return [...map]
      .map(([name, value]) => ({ name, value, percentage: totalClicks ? Math.round((value / totalClicks) * 100) : 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [clicks, totalClicks]);

  async function createLink(e: React.FormEvent) {
    e.preventDefault();
    let target = url.trim();
    if (!target) return;
    if (!/^https?:\/\//i.test(target)) target = `https://${target}`;
    try {
      new URL(target);
    } catch {
      toast.error("That doesn't look like a valid URL.");
      return;
    }
    setCreating(true);
    const { data: userData } = await supabase.auth.getUser();
    const slug = (alias.trim() || randomSlug()).replace(/[^a-zA-Z0-9-_]/g, "");
    const { error } = await supabase.from("links").insert({
      user_id: userData.user!.id,
      slug,
      target_url: target,
      title: title.trim() || null,
    });
    setCreating(false);
    if (error) {
      toast.error(
        error.message.includes("duplicate") ? "That alias is already taken." : error.message,
      );
      return;
    }
    setUrl("");
    setAlias("");
    setTitle("");
    toast.success(`Short link /r/${slug} created`);
    queryClient.invalidateQueries({ queryKey: ["links"] });
  }

  async function removeLink(id: string) {
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Link deleted");
    queryClient.invalidateQueries({ queryKey: ["links"] });
  }

  async function toggleActive(row: LinkRow) {
    await supabase.from("links").update({ is_active: !row.is_active }).eq("id", row.id);
    queryClient.invalidateQueries({ queryKey: ["links"] });
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const shortUrl = (slug: string) => `${origin}/r/${slug}`;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[180px] truncate text-sm text-muted-foreground sm:block">
              {email}
            </span>
            <Button variant="secondary" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Your links</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {links.length} link{links.length === 1 ? "" : "s"} · {totalClicks} total clicks
            </p>
          </div>
        </div>

        {/* Create */}
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-7">
          <form onSubmit={createLink} className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="url">Destination URL</Label>
              <Input
                id="url"
                placeholder="https://example.com/a/very/long/link"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alias">Custom alias</Label>
              <div className="flex items-center rounded-md border border-input bg-transparent pl-3">
                <span className="text-sm text-muted-foreground">/r/</span>
                <Input
                  id="alias"
                  placeholder="spring-sale"
                  className="border-0 bg-transparent px-1 focus-visible:ring-0"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Label</Label>
              <Input
                id="title"
                placeholder="Spring campaign"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full font-semibold lg:w-auto" disabled={creating}>
                {creating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Shorten
              </Button>
            </div>
          </form>
        </section>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat icon={MousePointerClick} label="Total clicks" value={totalClicks.toLocaleString()} />
          <Stat
            icon={BarChart3}
            label="Clicks last 7 days"
            value={last7.toLocaleString()}
            hint={delta === null ? "No prior clicks to compare" : `${delta >= 0 ? "+" : ""}${delta}% vs prior week`}
          />
          <Stat icon={Link2} label="Active links" value={String(links.filter((link) => link.is_active).length)} />
          <Stat icon={Link2} label="Total links" value={links.length.toLocaleString()} />
        </section>

        {/* Charts */}
        <section id="analytics" className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-5 xl:col-span-2">
            <h2 className="text-lg font-semibold">Clicks over time</h2>
            <p className="mb-4 text-sm text-muted-foreground">Last 14 days</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" width={32} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      color: "var(--color-foreground)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2.5}
                    fill="url(#fill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">Devices</h2>
            <p className="mb-4 text-sm text-muted-foreground">Share of clicks</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={devices}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {devices.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              {devices.map((d, i) => (
                <span key={d.name} className="flex items-center gap-2 text-muted-foreground">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  {d.name}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">Top referrers</h2>
            <p className="mb-4 text-sm text-muted-foreground">Where clicks come from</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sources} layout="vertical" margin={{ left: 8 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    width={92}
                    fontSize={12}
                    stroke="var(--color-muted-foreground)"
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-muted)" }}
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 6, 6]} fill="var(--color-chart-2)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 xl:col-span-2">
            <h2 className="text-lg font-semibold">Top countries</h2>
            <p className="mb-4 text-sm text-muted-foreground">Share of clicks</p>
            <ul className="space-y-3">
              {countries.length === 0 ? (
                <li className="text-sm text-muted-foreground">No country data recorded yet.</li>
              ) : countries.map((c) => (
                <li key={c.name} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span>{c.name}</span>
                    <span className="text-muted-foreground">{c.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${c.percentage}%`, maxWidth: "100%" }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Link list */}
        <section className="rounded-3xl border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
            <h2 className="text-lg font-semibold">Manage links</h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search links"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {linksQuery.isLoading ? (
            <div className="p-10 text-center text-muted-foreground">
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            </div>
          ) : rows.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">No links match that search.</p>
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((row) => (
                <li key={row.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-base font-semibold text-primary">
                        /r/{row.slug}
                      </span>
                      {row.title && <Badge variant="secondary">{row.title}</Badge>}
                      {!row.is_active && <Badge variant="outline">Paused</Badge>}
                    </div>
                    <a
                      href={row.target_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block truncate text-sm text-muted-foreground hover:text-foreground"
                    >
                      {row.target_url}
                    </a>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-display text-xl font-bold">{row.clicks.toLocaleString()}</p>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">clicks</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <CopyButton value={shortUrl(row.slug)} />
                      <IconButton
                        label="Share"
                        icon={Share2}
                        onClick={async () => {
                          const shareData = { title: row.title ?? "Link Genie", url: shortUrl(row.slug) };
                          if (navigator.share) await navigator.share(shareData).catch(() => {});
                          else {
                            await navigator.clipboard.writeText(shareData.url);
                            toast.success("Link copied — ready to share");
                          }
                        }}
                      />
                      <IconButton
                        label="QR code"
                        icon={QrCode}
                        onClick={() => setQrLink(row as LinkRow)}
                      />
                      <IconButton
                        label="Open"
                        icon={ExternalLink}
                        onClick={() => window.open(row.target_url, "_blank")}
                      />
                      <IconButton
                        label="Delete"
                        icon={Trash2}
                        onClick={() => removeLink(row.id)}
                      />
                      <Switch
                        checked={row.is_active}
                        onCheckedChange={() => toggleActive(row as LinkRow)}
                        aria-label="Toggle link"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <QrDialog link={qrLink} origin={origin} onClose={() => setQrLink(null)} />
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Link2;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function IconButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: typeof Link2;
  onClick: () => void;
}) {
  return (
    <Button variant="ghost" size="icon" aria-label={label} title={label} onClick={onClick}>
      <Icon className="h-4 w-4" />
    </Button>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Copy short link"
      title="Copy short link"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        toast.success("Short link copied");
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}

function QrDialog({
  link,
  origin,
  onClose,
}: {
  link: LinkRow | null;
  origin: string;
  onClose: () => void;
}) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    if (!link) return;
    QRCode.toDataURL(`${origin}/r/${link.slug}`, {
      width: 640,
      margin: 1,
      color: { dark: "#0d0f16", light: "#ffffff" },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [link, origin]);

  return (
    <Dialog open={!!link} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>QR code</DialogTitle>
          <DialogDescription>
            Point a camera at this code to open /r/{link?.slug}
          </DialogDescription>
        </DialogHeader>
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`QR code for ${link?.slug}`}
            className="mx-auto w-56 rounded-2xl bg-white p-3"
          />
        ) : (
          <div className="flex h-56 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        <Button asChild className="font-semibold">
          <a href={dataUrl} download={`link-genie-${link?.slug}.png`}>
            Download PNG
          </a>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
