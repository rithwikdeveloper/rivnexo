import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => (await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle()).data,
  });
  const [f, setF] = useState({ site_name: "", tagline: "", support_email: "", maintenance_mode: false });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (data) setF({ site_name: data.site_name, tagline: data.tagline ?? "", support_email: data.support_email ?? "", maintenance_mode: data.maintenance_mode });
  }, [data]);
  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_settings").update({ ...f, updated_at: new Date().toISOString() }).eq("id", 1);
    setSaving(false);
    if (error) return toast.error(error.message);
    await logAudit("settings.update", undefined, f);
    qc.invalidateQueries({ queryKey: ["site-settings"] });
    toast.success("Settings saved");
  };
  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold">Settings</h1>
      {!data && <p className="mb-4 text-sm text-muted-foreground">No settings row found yet.</p>}
      <div className="glass-panel space-y-4 rounded-2xl p-5">
        <div className="space-y-1"><Label>Site name</Label><Input value={f.site_name} onChange={(e) => setF({ ...f, site_name: e.target.value })} /></div>
        <div className="space-y-1"><Label>Tagline</Label><Input value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} /></div>
        <div className="space-y-1"><Label>Support email</Label><Input type="email" value={f.support_email} onChange={(e) => setF({ ...f, support_email: e.target.value })} /></div>
        <div className="flex items-center justify-between"><Label>Maintenance mode</Label><Switch checked={f.maintenance_mode} onCheckedChange={(v) => setF({ ...f, maintenance_mode: v })} /></div>
        <Button onClick={save} disabled={saving || !data}>Save</Button>
      </div>
    </div>
  );
}
