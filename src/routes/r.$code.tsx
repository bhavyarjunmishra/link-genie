import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/r/$code")({
  ssr: false,
  component: RedirectPage,
});

function RedirectPage() {
  const { code } = useParams({ from: "/r/$code" });
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("links")
        .select("id, target_url")
        .eq("slug", code)
        .eq("is_active", true)
        .maybeSingle();

      if (cancelled) return;
      if (!data) return setMissing(true);

      const ua = navigator.userAgent;
      const device = /Mobi|Android|iPhone/i.test(ua)
        ? "Mobile"
        : /iPad|Tablet/i.test(ua)
          ? "Tablet"
          : "Desktop";
      await supabase.from("clicks").insert({
        link_id: data.id,
        referrer: document.referrer || null,
        device,
      });
      window.location.replace(data.target_url);
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      {missing ? (
        <>
          <h1 className="text-3xl font-bold">This link doesn't exist</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            The short link <span className="text-foreground">/r/{code}</span> is inactive or was
            never created.
          </p>
          <Button asChild>
            <Link to="/">Go home</Link>
          </Button>
        </>
      ) : (
        <p className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Redirecting you…
        </p>
      )}
    </main>
  );
}
