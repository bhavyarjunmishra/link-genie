export type DemoLink = {
  slug: string;
  target_url: string;
  title: string;
  clicks: number;
  created_at: string;
};

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

export const demoLinks: DemoLink[] = [
  {
    slug: "launch-2026",
    target_url: "https://blog.acme.dev/posts/spring-launch-keynote",
    title: "Spring launch keynote",
    clicks: 4821,
    created_at: daysAgo(3),
  },
  {
    slug: "pricing",
    target_url: "https://acme.dev/pricing?ref=newsletter",
    title: "Pricing page — newsletter",
    clicks: 2140,
    created_at: daysAgo(9),
  },
  {
    slug: "docs-api",
    target_url: "https://docs.acme.dev/reference/api/v3/quickstart",
    title: "API quickstart docs",
    clicks: 1387,
    created_at: daysAgo(14),
  },
  {
    slug: "hiring",
    target_url: "https://jobs.acme.dev/engineering/senior-frontend",
    title: "Senior frontend role",
    clicks: 623,
    created_at: daysAgo(21),
  },
  {
    slug: "demo-call",
    target_url: "https://cal.com/acme/30min",
    title: "Book a demo call",
    clicks: 908,
    created_at: daysAgo(30),
  },
];

export const demoTrend = Array.from({ length: 14 }, (_, i) => {
  const base = 180 + Math.round(Math.sin(i / 2.1) * 70 + i * 14);
  return {
    day: new Date(Date.now() - (13 - i) * 86_400_000).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    clicks: base,
    unique: Math.round(base * 0.72),
  };
});

export const demoSources = [
  { name: "Direct", value: 38 },
  { name: "Twitter / X", value: 26 },
  { name: "Newsletter", value: 19 },
  { name: "LinkedIn", value: 11 },
  { name: "Other", value: 6 },
];

export const demoDevices = [
  { name: "Mobile", value: 58 },
  { name: "Desktop", value: 34 },
  { name: "Tablet", value: 8 },
];

export const demoCountries = [
  { name: "United States", value: 41 },
  { name: "India", value: 17 },
  { name: "Germany", value: 12 },
  { name: "United Kingdom", value: 9 },
  { name: "Brazil", value: 7 },
];
