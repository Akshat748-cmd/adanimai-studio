export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function formatUrl(rawUrl: string): string {
  let formatted = rawUrl.trim();
  if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
    formatted = "https://" + formatted;
  }
  return formatted;
}
