import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Your profile — Rivnexo" }, { name: "description", content: "Manage your Rivnexo profile." }, { property: "og:title", content: "Profile — Rivnexo" }, { property: "og:description", content: "Manage your Rivnexo profile." }] }),
  component: Profile,
});

function Profile() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data,
  });
  const [name, setName] = useState("");
  useEffect(() => setName(data?.display_name ?? ""), [data]);
  const save = async () => {
    const { error } = await supabase.from("profiles").update({ display_name: name.trim().slice(0, 60) }).eq("id", user.id);
    error ? toast.error(error.message) : toast.success("Profile saved");
  };
  return (
    <SiteLayout>
      <div className="mx-auto max-w-lg px-4 py-10">
        <h1 className="text-3xl font-semibold">Profile</h1>
        <div className="glass-panel mt-6 space-y-4 rounded-2xl p-6">
          <div className="space-y-1.5"><Label>Email</Label><Input value={user.email ?? ""} disabled /></div>
          <div className="space-y-1.5"><Label htmlFor="n">Display name</Label><Input id="n" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} /></div>
          <p className="text-xs text-muted-foreground">Member since {new Date(user.created_at).toLocaleDateString()}</p>
          <div className="flex gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}>Sign out</Button>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
