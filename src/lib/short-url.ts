// These paths belong to the application. Older aliases still work via /r/.
const reservedPaths = new Set(["auth", "dashboard", "r"]);

export function shortLinkPath(slug: string) {
  return reservedPaths.has(slug) ? `/r/${slug}` : `/${slug}`;
}

export function isReservedAlias(slug: string) {
  return reservedPaths.has(slug);
}

export function generateShortCode() {
  return crypto.randomUUID().replaceAll("-", "").slice(0, 10);
}
