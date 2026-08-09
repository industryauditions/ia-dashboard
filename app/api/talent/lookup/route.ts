import { NextResponse } from "next/server";

// Best-effort public Instagram profile lookup. Instagram frequently blocks
// server-side scraping, so this is wrapped end-to-end in a try/catch and
// simply returns an empty result on any failure — callers should treat a
// lookup miss as normal, not an error, and let the user fill in the name
// manually.
export async function POST(request: Request) {
  let handle = "";
  try {
    const body = await request.json();
    handle = String(body?.handle ?? "").trim().replace(/^@/, "");
  } catch {
    return NextResponse.json({ found: false });
  }

  if (!handle) {
    return NextResponse.json({ found: false });
  }

  try {
    const res = await fetch(`https://www.instagram.com/${encodeURIComponent(handle)}/`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      return NextResponse.json({ found: false });
    }

    const html = await res.text();

    const titleMatch = html.match(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
    );
    const imageMatch = html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    );

    let displayName: string | null = null;
    if (titleMatch?.[1]) {
      // og:title is typically like "Jane Doe (@janedoe) • Instagram photos and videos"
      displayName = titleMatch[1].split(" (@")[0].trim() || null;
    }

    const photoUrl = imageMatch?.[1] ? imageMatch[1].replace(/&amp;/g, "&") : null;

    if (!displayName && !photoUrl) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({ found: true, displayName, photoUrl });
  } catch {
    return NextResponse.json({ found: false });
  }
}
