import { Link } from "@tanstack/react-router";
import { Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Link2 className="h-5 w-5" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">Link Genie</span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="/#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="/#analytics" className="transition-colors hover:text-foreground">
            Analytics
          </a>
          <a href="/#features" className="transition-colors hover:text-foreground">
            Absolutely free
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="font-semibold">
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
