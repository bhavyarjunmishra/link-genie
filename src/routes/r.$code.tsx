import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { resolveLink } from "@/lib/links";
import { Logo } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/r/$code")({
  ssr: false,
  component: RedirectPage,
});

function RedirectPage() {
  const { code } = useParams({ from: "/r/$code" });
  const [missing, setMissing] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setMissing(false);
    setFailed(false);
    (async () => {
      try {
        const data = await resolveLink({ data: { code, referrer: document.referrer } });
        if (cancelled) return;
        if (!data) return setMissing(true);
        window.location.replace(data.target_url);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      {failed ? (
        <>
          <h1 className="text-3xl font-bold">Unable to open this link</h1>
          <p>Please try again in a moment.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </>
      ) : missing ? (
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
