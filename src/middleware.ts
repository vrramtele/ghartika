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

    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.exp && Date.now() / 1000 > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyJWT(token, JWT_SECRET);
}

export async function middleware(request: NextRequest) {
  const { pathname, method } = request.nextUrl
    ? { pathname: request.nextUrl.pathname, method: request.method }
    : { pathname: "", method: "" };
  const reqMethod = request.method;

  // ── Redirect /admin/login to /admin (unified admin page handles login internally) ──
  if (pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // ── GET /api/orders — fetch all orders (admin only) ────────────────────────
  if (pathname === "/api/orders" && reqMethod === "GET") {
    if (!(await isAdminAuthenticated(request))) return unauthorized();
  }

  // ── All write operations on /api/orders/* (except POST /api/orders which is public) ──
  if (
    pathname.startsWith("/api/orders") &&
    ["PATCH", "DELETE", "PUT"].includes(reqMethod) &&
    pathname !== "/api/orders" // POST /api/orders (place order) is public
  ) {
    if (!(await isAdminAuthenticated(request))) return unauthorized();
  }

  // ── /api/orders/bulk — bulk status update (admin only) ─────────────────────
  if (pathname === "/api/orders/bulk" && reqMethod === "POST") {
    if (!(await isAdminAuthenticated(request))) return unauthorized();
  }

  // ── All write operations on /api/products/* (admin only) ───────────────────
  if (
    pathname.startsWith("/api/products") &&
    ["POST", "PATCH", "DELETE", "PUT"].includes(reqMethod)
  ) {
    if (!(await isAdminAuthenticated(request))) return unauthorized();
  }

  // ── /api/admin/* routes (except auth) — admin only ─────────────────────────
  if (
    pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/admin/auth")
  ) {
    if (!(await isAdminAuthenticated(request))) return unauthorized();
  }

  // ── /api/coupons (except POST /api/coupons/validate which is public) ───────
  if (pathname.startsWith("/api/coupons") && pathname !== "/api/coupons/validate") {
    if (!(await isAdminAuthenticated(request))) return unauthorized();
  }

  // ── /api/abandoned-carts (GET & PATCH are admin; POST is public cart sync) ──
  if (pathname.startsWith("/api/abandoned-carts") && reqMethod !== "POST") {
    if (!(await isAdminAuthenticated(request))) return unauthorized();
  }

  // ── /api/reviews/:id (PATCH / DELETE are admin; GET and POST are public) ──
  if (pathname.startsWith("/api/reviews/") && ["PATCH", "DELETE"].includes(reqMethod)) {
    if (!(await isAdminAuthenticated(request))) return unauthorized();
  }

  // ── /api/inventory, /api/staff, /api/activity — admin only ──────────────────
  if (
    pathname.startsWith("/api/inventory") ||
    pathname.startsWith("/api/staff") ||
    pathname.startsWith("/api/activity")
  ) {
    if (!(await isAdminAuthenticated(request))) return unauthorized();
  }

  return NextResponse.next();
  void method; // suppress unused warning
}

export const config = {
  matcher: [
    "/admin/login",
    "/api/orders/:path*",
    "/api/products/:path*",
    "/api/admin/:path*",
    "/api/coupons/:path*",
    "/api/abandoned-carts/:path*",
    "/api/reviews/:path*",
    "/api/inventory/:path*",
    "/api/staff/:path*",
    "/api/activity/:path*",
  ],
};

