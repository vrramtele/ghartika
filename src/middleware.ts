import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "ghartika_admin_token";
const JWT_SECRET = process.env.JWT_SECRET || "ghartika-spices-super-secret-jwt-key-2024";

/**
 * Edge-compatible JWT verification (no jsonwebtoken — uses Web Crypto API)
 */
async function verifyJWT(token: string, secret: string): Promise<boolean> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split(".");
    if (!headerB64 || !payloadB64 || !signatureB64) return false;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBytes = Uint8Array.from(
      atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );

    const dataToVerify = encoder.encode(`${headerB64}.${payloadB64}`);
    const isValid = await crypto.subtle.verify("HMAC", cryptoKey, signatureBytes, dataToVerify);
    if (!isValid) return false;

    // Check expiry
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.exp && Date.now() / 1000 > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Redirect /admin/login to /admin (unified admin page handles login internally) ──
  if (pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // ── Protect admin-only API routes ─────────────────────────────────────────
  const protectedApis = [
    "/api/orders",
    "/api/products",
  ];

  // Allow POST /api/orders (place order — public), but block GET (fetch all — admin only)
  if (
    pathname === "/api/orders" &&
    request.method === "GET"
  ) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token || !(await verifyJWT(token, JWT_SECRET))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Protect product write operations (POST, PATCH, DELETE) & order status updates (PATCH) — admin only
  if (
    protectedApis.some((p) => pathname.startsWith(p)) &&
    ["POST", "PATCH", "DELETE"].includes(request.method) &&
    pathname !== "/api/orders" // orders POST is public (placing order)
  ) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token || !(await verifyJWT(token, JWT_SECRET))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/login",
    "/api/orders/:path*",
    "/api/products/:path*",
  ],
};
