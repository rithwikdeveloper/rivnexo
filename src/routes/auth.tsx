import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Check, Eye, EyeOff, Loader2, Lock, Mail, User, X } from "lucide-react";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or create an account — Rivnexo" },
      { name: "description", content: "Sign in to Rivnexo to download APKs, save favorites and review apps." },
      { property: "og:title", content: "Sign in — Rivnexo" },
      { property: "og:description", content: "Create a free Rivnexo account with your email." },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  name: z.string().trim().max(60).optional(),
});

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "reset") {
        const r = z.string().trim().email().safeParse(email);
        if (!r.success) throw new Error("Enter a valid email");
        const { error } = await supabase.auth.resetPasswordForEmail(r.data, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success("Check your email for a reset link.");
        return;
      }
      const p = schema.safeParse({ email, password, name: name || undefined });
      if (!p.success) throw new Error(p.error.issues[0].message);
      if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({
          email: p.data.email, password: p.data.password,
          options: { emailRedirectTo: window.location.origin, data: { display_name: p.data.name } },
        });
        if (error) throw error;
        if (!data.session) { toast.success("Check your email to confirm your account."); return; }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: p.data.email, password: p.data.password });
        if (error) throw error;
      }
      navigate({ to: "/" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const strength = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ["Too short", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = strength <= 1 ? "bg-destructive" : strength === 2 ? "bg-accent-foreground/60" : "bg-primary";

  return (
    <div className="glow-orbs flex min-h-screen flex-col overflow-hidden">
      <header className="glass-panel sticky top-0 z-10 flex items-center justify-between rounded-none border-x-0 border-t-0 px-4 py-3 sm:px-8">
        <Link to="/"><Logo /></Link>
        <Button asChild variant="outline" size="sm">
          <Link to="/"><ArrowLeft className="size-4" /> Back to marketplace</Link>
        </Button>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="glass-panel w-full max-w-md rounded-2xl p-6 sm:p-8">
          {mode === "reset" ? (
            <button type="button" onClick={() => setMode("in")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" /> Back to sign in
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1" role="tablist">
              {(["in", "up"] as const).map((m) => (
                <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
                  className={`rounded-full py-2 text-sm font-medium transition-all ${mode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {m === "in" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>
          )}

          <h1 className="mt-6 text-2xl font-semibold">{mode === "up" ? "Create your account" : mode === "reset" ? "Reset password" : "Welcome back"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "up" ? "Join to download apps, save favorites and write reviews." : mode === "reset" ? "We'll email you a link to set a new password." : "Sign in to continue to the marketplace."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "up" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Display name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="name" className="pl-9" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Your name" />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" className="pl-9" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
            </div>
            {mode !== "reset" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pw">Password</Label>
                  {mode === "in" && <button type="button" onClick={() => setMode("reset")} className="text-xs text-primary hover:underline">Forgot password?</button>}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="pw" className="px-9" type={show ? "text" : "password"} autoComplete={mode === "up" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
                </div>
                {mode === "up" && password.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="grid grid-cols-4 gap-1">
                      {[0, 1, 2, 3].map((i) => <div key={i} className={`h-1.5 rounded-full ${i < strength ? strengthColor : "bg-muted"}`} />)}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className={`flex items-center gap-1 ${password.length >= 8 ? "text-primary" : ""}`}>
                        {password.length >= 8 ? <Check className="size-3" /> : <X className="size-3" />} At least 8 characters
                      </span>
                      <span>{strengthLabel}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              {busy ? "Please wait…" : mode === "up" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
