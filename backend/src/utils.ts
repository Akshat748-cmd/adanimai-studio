export function formatUrl(rawUrl: string): string {
  let formatted = (rawUrl || '').trim();
  if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
    formatted = "https://" + formatted;
  }
  return formatted;
}

export function isValidUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== 'string') return false;
  try {
    const formatted = formatUrl(urlString);
    const url = new URL(formatted);
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes('.');
  } catch {
    return false;
  }
}
