import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLogin } from "@/lib/market.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin_/login")({
  head: () => ({
    meta: [
      { title: "Admin sign in — Rivnexo" },
      { name: "description", content: "Rivnexo administrator console sign in." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — Rivnexo" },
      { property: "og:description", content: "Authorized administrators only." },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const login = useServerFn(adminLogin);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await login({ data: { username, password } });
      if (!r.ok) throw new Error(r.error);
      const { error } = await supabase.auth.setSession({ access_token: r.access_token, refresh_token: r.refresh_token });
      if (error) throw error;
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error((err as Error).message || "Sign in failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="glow-orbs flex min-h-screen items-center justify-center overflow-hidden px-4">
      <form onSubmit={submit} className="glass-panel w-full max-w-sm space-y-4 rounded-2xl p-8">
        <Logo />
        <div>
          <h1 className="mt-4 text-2xl font-semibold">Admin console</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><ShieldCheck className="size-4" />Authorized administrators only.</p>
        </div>
        <div className="space-y-1.5"><Label htmlFor="u">Username</Label><Input id="u" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required maxLength={64} /></div>
        <div className="space-y-1.5">
          <Label htmlFor="p">Password</Label>
          <div className="relative">
            <Input id="p" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Show password">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign In"}</Button>
      </form>
    </div>
  );
}
