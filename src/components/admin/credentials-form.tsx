import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminUpdateCredentials } from "@/lib/market.functions";

export function CredentialsForm() {
  const update = useServerFn(adminUpdateCredentials);
  const [cur, setCur] = useState("");
  const [user, setUser] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.trim() && !pw) return toast.error("Enter a new username or password.");
    if (pw && pw !== pw2) return toast.error("New passwords don't match.");
    if (pw && pw.length < 8) return toast.error("New password must be at least 8 characters.");
    setBusy(true);
    try {
      await update({ data: { currentPassword: cur, newUsername: user.trim() || undefined, newPassword: pw || undefined } });
      toast.success("Credentials updated");
      setCur(""); setUser(""); setPw(""); setPw2("");
    } catch (err) {
      toast.error((err as Error).message || "Update failed");
    } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="glass-panel mt-6 space-y-4 rounded-2xl p-5">
      <h2 className="text-lg font-semibold">Change admin login</h2>
      <p className="text-sm text-muted-foreground">Leave a field empty to keep it unchanged.</p>
      <div className="space-y-1"><Label>New username</Label><Input value={user} onChange={(e) => setUser(e.target.value)} maxLength={64} autoComplete="off" /></div>
      <div className="space-y-1"><Label>New password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /></div>
      <div className="space-y-1"><Label>Confirm new password</Label><Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" /></div>
      <div className="space-y-1"><Label>Current password</Label><Input type="password" value={cur} onChange={(e) => setCur(e.target.value)} required autoComplete="current-password" /></div>
      <Button type="submit" disabled={busy}>{busy ? "Updating…" : "Update credentials"}</Button>
    </form>
  );
}
