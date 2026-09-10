import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, session) =>
      setEmail(session?.user.email ?? null),
    );
    return () => data.subscription.unsubscribe();
  }, []);

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
          <a href="/#pricing" className="transition-colors hover:text-foreground">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-2">
          {email ? (
            <Button asChild size="sm" className="font-semibold">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="font-semibold">
                <Link to="/auth">Start free</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
