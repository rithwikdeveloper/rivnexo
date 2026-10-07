import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { AppWindow, BarChart3, Download, FolderTree, Globe, LayoutDashboard, LogOut, MessageSquare, Plus, Settings, Smartphone, Users } from "lucide-react";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
    const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin").maybeSingle();
    if (!role) throw redirect({ to: "/admin/login" });
    return { user: data.user };
  },
  head: () => ({ meta: [{ title: "Admin — Rivnexo" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/apps", label: "Applications", icon: AppWindow },
  { to: "/admin/apps/new", label: "Add app", icon: Plus },
  { to: "/admin/apks", label: "APK management", icon: Smartphone },
  { to: "/admin/websites", label: "Websites", icon: Globe },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { to: "/admin/downloads", label: "Downloads", icon: Download },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };
  return (
    <div className="glow-orbs flex min-h-screen overflow-hidden">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-1 border-r border-border bg-sidebar p-4 backdrop-blur-xl md:flex">
        <Logo to="/admin" className="mb-6 px-2" />
        {nav.map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: "exact" in n || n.to === "/admin/apps" }} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground" activeProps={{ className: "bg-sidebar-accent text-foreground font-medium" }}>
            <n.icon className="size-4" />{n.label}
          </Link>
        ))}
        <Button variant="ghost" onClick={logout} className="mt-auto justify-start"><LogOut />Logout</Button>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 overflow-x-auto border-b border-border bg-glass p-3 backdrop-blur-xl md:hidden">
          <Logo to="/admin" />
          {nav.map((n) => <Link key={n.to} to={n.to} className="whitespace-nowrap rounded-lg px-2 py-1 text-xs text-muted-foreground">{n.label}</Link>)}
          <button onClick={logout} className="text-xs text-destructive">Logout</button>
        </div>
        <main className="mx-auto max-w-6xl p-4 sm:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
