import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSiteSettings() {
  const { data } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => (await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle()).data,
    staleTime: 60_000,
  });
  return {
    siteName: data?.site_name || "Rivnexo",
    tagline: data?.tagline || "The marketplace for apps that run anywhere.",
    maintenance: !!data?.maintenance_mode,
    supportEmail: data?.support_email || "",
    ownerName: ((data as { owner_name?: string | null } | null)?.owner_name) || "",
  };
}
