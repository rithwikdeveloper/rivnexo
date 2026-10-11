/** Resolve a stored media reference (storage path or absolute URL) to a displayable URL. */
export function mediaUrl(ref?: string | null): string | undefined {
  if (!ref) return undefined;
  if (/^https?:\/\//.test(ref)) return ref;

  // App icons, banners and screenshots are public presentation assets. Using
  // Supabase's public object URL keeps them working in the local Vite client
  // too, where the server-only service-role key is intentionally unavailable.
  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (base) {
    const path = ref.split("/").map(encodeURIComponent).join("/");
    return `${base.replace(/\/$/, "")}/storage/v1/object/public/app-media/${path}`;
  }

  return `/api/public/media?p=${encodeURIComponent(ref)}`;
}

export function formatBytes(n?: number | null) {
  if (!n) return "—";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}

export function compact(n: number) {
  return Intl.NumberFormat("en", { notation: "compact" }).format(n);
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
}
