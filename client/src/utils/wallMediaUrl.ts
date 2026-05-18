/** Same-origin path for wall/cms uploads (works with Vite `/uploads` proxy). */
export function wallMediaUrl(url?: string | null): string | undefined {
  if (url == null) return undefined;
  const trimmed = String(url).trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith("/uploads/")) return trimmed;

  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (parsed.pathname.startsWith("/uploads/")) {
      return `${parsed.pathname}${parsed.search}`;
    }
    return trimmed;
  } catch {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }
}
