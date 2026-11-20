// These paths belong to the application. Older aliases still work via /r/.
const reservedPaths = new Set(["auth", "dashboard", "r"]);

export function shortLinkPath(slug: string) {
  return reservedPaths.has(slug) ? `/r/${slug}` : `/${slug}`;
}

export function isReservedAlias(slug: string) {
  return reservedPaths.has(slug);
}

export function generateShortCode() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
  return Array.from(crypto.getRandomValues(new Uint8Array(6)), (byte) => alphabet[byte & 63]).join(
    "",
  );
}
