/**
 * Strips trailing slashes with a linear scan. A `/\/+$/` regex would be quadratic on
 * strings with many non-trailing slashes (URLs are attacker-controlled input).
 */
const stripTrailingSlashes = (value: string): string => {
  let end = value.length;
  while (end > 0 && value[end - 1] === "/") end--;
  return value.slice(0, end);
};

/**
 * Normalizes a URL or user-entered pattern for comparison: lowercase, strip
 * scheme, strip leading www., strip trailing slash(es).
 */
export const normalizeForMatch = (value: string): string =>
  stripTrailingSlashes(
    value
      .trim()
      .toLowerCase()
      .replace(/^[a-z][a-z0-9+.-]*:\/\//, "")
      .replace(/^www\./, ""),
  );

/**
 * True when `url` matches `pattern`. A pattern containing "/" is treated as
 * path-scoped and matched by substring against the full URL; otherwise it's
 * treated as a hostname and matched exactly or as a subdomain of it.
 */
export const matchesPattern = (url: string, pattern: string): boolean => {
  const normalizedPattern = normalizeForMatch(pattern);
  if (!normalizedPattern) return false;

  const normalizedUrl = normalizeForMatch(url);

  if (normalizedPattern.includes("/")) {
    return normalizedUrl.includes(normalizedPattern);
  }

  const host = normalizedUrl.split("/")[0];
  return host === normalizedPattern || host.endsWith(`.${normalizedPattern}`);
};

/**
 * True when `url` matches any pattern in the muted-pages list.
 */
export const isPageMuted = (url: string | null | undefined, patterns: string[]): boolean => {
  if (!url) return false;
  return patterns.some((pattern) => matchesPattern(url, pattern));
};

/**
 * Extracts a display-friendly hostname from a URL (no www. prefix), or null
 * if the URL can't be parsed.
 */
export const getHostname = (url: string): string | null => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};
