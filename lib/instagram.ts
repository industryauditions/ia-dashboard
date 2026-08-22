/** Pulls the @handle out of a pasted Instagram profile URL, e.g.
 * "https://www.instagram.com/janedoe/?hl=en" -> "janedoe". Falls back to
 * treating the input as a bare handle if it isn't a URL at all. */
export function parseInstagramUsername(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(
      trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
    );
    if (!/instagram\.com$/i.test(url.hostname.replace(/^www\./, ""))) {
      return trimmed.replace(/^@/, "") || null;
    }
    const [first] = url.pathname.split("/").filter(Boolean);
    return first ? first.replace(/^@/, "") : null;
  } catch {
    return trimmed.replace(/^@/, "") || null;
  }
}

/** Normalizes a pasted value into a full profile URL for storage/display. */
export function normalizeInstagramUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http")) return trimmed;
  const handle = trimmed.replace(/^@/, "");
  return handle ? `https://www.instagram.com/${handle}/` : null;
}
