import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Link Genie" },
      { name: "description", content: "Sign in to Link Genie to create short links, QR codes and track clicks." },
      { property: "og:title", content: "Sign in — Link Genie" },
      { property: "og:description", content: "Create short links, QR codes and track every click." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      toast.error("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error) {
        toast.error(formatAuthError(error.message));
        return;
      }
      navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error(formatAuthError(error instanceof Error ? error.message : "Unable to sign in."));
    } finally {
      setLoading(false);
    }
  }

  async function resendConfirmation() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error("Enter your email address first.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resend({ type: "signup", email: normalizedEmail });
    setLoading(false);
    if (error) {
      toast.error(formatAuthError(error.message));
      return;
    }
    toast.success("A new confirmation email was sent.");
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || password.length < 6) {
      toast.error("Use a valid email and a password with at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        toast.error(formatAuthError(error.message));
        return;
      }
      if (data.session) {
        navigate({ to: "/dashboard", replace: true });
        return;
      }
      setEmail(normalizedEmail);
      setSent(true);
    } catch (error) {
      toast.error(formatAuthError(error instanceof Error ? error.message : "Unable to create your account."));
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-2xl backdrop-blur sm:p-8">
          {sent ? (
            <div className="space-y-3 text-center">
              <h1 className="text-2xl font-bold">Check your inbox</h1>
              <p className="text-sm text-muted-foreground">
                We sent a confirmation link to <span className="text-foreground">{email}</span>.
                Click it to activate your account.
              </p>
              <div className="flex flex-col gap-2">
                <Button variant="secondary" onClick={resendConfirmation} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Resend confirmation email
                </Button>
                <Button variant="ghost" onClick={() => setSent(false)}>
                  Back
                </Button>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6">
                <form onSubmit={signIn} className="space-y-4">
                  <Field id="si-email" label="Email" type="email" value={email} onChange={setEmail} />
                  <Field
                    id="si-password"
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                  />
                  <Button type="submit" className="w-full font-semibold" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign in
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={signUp} className="space-y-4">
                  <Field id="su-email" label="Email" type="email" value={email} onChange={setEmail} />
                  <Field
                    id="su-password"
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                  />
                  <Button type="submit" className="w-full font-semibold" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create account
                  </Button>
                </form>
              </TabsContent>

              <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or
                <span className="h-px flex-1 bg-border" />
              </div>

              <Button variant="secondary" className="w-full" onClick={google}>
                Continue with Google
              </Button>
            </Tabs>
          )}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}

function formatAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("email not confirmed")) {
    return "Confirm your email from the message we sent, then sign in again.";
  }
  if (normalized.includes("invalid login credentials")) {
    return "That email or password is incorrect. Create an account first if you are new here.";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Too many attempts. Wait a moment and try again.";
  }
  if (normalized.includes("failed to fetch") || normalized.includes("network")) {
    return "Unable to reach the sign-in service. Check your connection and try again.";
  }
  return message;
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        required
        autoComplete={type === "password" ? "current-password" : "email"}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
