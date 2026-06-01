import { NextRequest, NextResponse } from "next/server";
import { setAccessCookie } from "@/lib/share-access-cookie";

/**
 * POST /api/shares/[slug]/access-cookie
 * Sets the HMAC-signed access cookie after a successful password unlock.
 * Called by the PasswordGate client component before reloading the page.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  await setAccessCookie(slug);
  return NextResponse.json({ ok: true });
}
