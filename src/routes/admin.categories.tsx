import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/media";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/admin/categories")({ component: CategoriesPage });

function CategoriesPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const { data = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["categories"] });
  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("categories").insert({ name: name.trim(), slug: slugify(name), sort_order: data.length });
      if (error) throw error;
      await logAudit("category.create", name);
    },
    onSuccess: () => { setName(""); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      await logAudit("category.delete", id);
    },
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Categories</h1>
      <form className="mb-6 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (name.trim()) add.mutate(); }}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name" className="max-w-xs" />
        <Button type="submit" disabled={add.isPending}>Add</Button>
      </form>
      <div className="glass-panel divide-y divide-border rounded-2xl">
        {data.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-3 text-sm">
            <span>{c.name} <span className="text-muted-foreground">/{c.slug}</span></span>
            <Button size="icon" variant="ghost" onClick={() => confirm(`Delete ${c.name}?`) && del.mutate(c.id)}><Trash2 /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
