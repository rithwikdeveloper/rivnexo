import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type Notif = { id: string; title: string; body: string | null; is_read: boolean; created_at: string; apps: { slug: string } | null };

export function NotificationBell({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["notifications", userId],
    refetchInterval: 60_000,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).from("notifications").select("id, title, body, is_read, created_at, apps(slug)").eq("user_id", userId).order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data as Notif[];
    },
  });
  const unread = data.filter((n) => !n.is_read).length;
  const markAll = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async () => { await (supabase as any).from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
  return (
    <DropdownMenu onOpenChange={(o) => { if (!o && unread) markAll.mutate(); }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell />
          {unread > 0 && <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">{unread}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <p className="px-2 py-1.5 text-sm font-semibold">Updates</p>
        {!data.length && <p className="px-2 py-4 text-center text-sm text-muted-foreground">No updates yet. Save or download apps to get notified.</p>}
        {data.map((n) => (
          <DropdownMenuItem key={n.id} asChild>
            {n.apps ? (
              <Link to="/apps/$slug" params={{ slug: n.apps.slug }} className={cn("flex flex-col items-start gap-0.5", !n.is_read && "bg-secondary")}>
                <span className="text-sm font-medium">{n.title}</span>
                {n.body && <span className="text-xs text-muted-foreground">{n.body}</span>}
                <span className="text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
              </Link>
            ) : <span className="text-sm">{n.title}</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
