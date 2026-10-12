import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "ghartika_admin_token";

// ── Simple in-memory rate limiter (5 attempts per 15 minutes per IP) ─────────
const failedAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = failedAttempts.get(ip);

  if (!record || now > record.resetAt) {
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - record.count };
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = failedAttempts.get(ip);

  if (!record || now > record.resetAt) {
    failedAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    record.count += 1;
  }
}

function clearFailedAttempts(ip: string): void {
  failedAttempts.delete(ip);
}

// ── POST /api/admin/auth — login or logout ────────────────────────────────────
export async function POST(req: Request) {
  // Config guard
  if (!ADMIN_PASSWORD || !JWT_SECRET) {
    console.error("ADMIN_PASSWORD or JWT_SECRET not configured");
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { action, password } = body;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // ── Logout ──
    if (action === "logout") {
      const res = NextResponse.json({ success: true });
      res.cookies.delete(COOKIE_NAME);
      return res;
    }

    // ── Login ──
    if (action === "login") {
      // Rate limit check
      const { allowed, remaining } = checkRateLimit(ip);
      if (!allowed) {
        return NextResponse.json(
          { error: "Too many failed attempts. Try again in 15 minutes." },
          { status: 429 }
        );
      }

      if (password !== ADMIN_PASSWORD) {
        recordFailedAttempt(ip);
        return NextResponse.json(
          { error: `Galat password! ${remaining - 1} attempts remaining.` },
          { status: 401 }
        );
      }

      // Successful login — clear rate limit
      clearFailedAttempts(ip);

      const token = jwt.sign(
        { role: "admin" },
        JWT_SECRET,
        { expiresIn: "8h" }
      );

      const res = NextResponse.json({ success: true });
      res.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 8, // 8 hours
      });
      return res;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}

// ── GET /api/admin/auth — check if logged in ──────────────────────────────────
export async function GET(req: Request) {
  if (!JWT_SECRET) return NextResponse.json({ loggedIn: false });

  try {
    const cookie = req.headers
      .get("cookie")
      ?.split(";")
      .find((c) => c.trim().startsWith(`${COOKIE_NAME}=`));

    if (!cookie) {
      return NextResponse.json({ loggedIn: false });
    }

    const token = cookie.split("=").slice(1).join("=").trim();
    jwt.verify(token, JWT_SECRET);
    return NextResponse.json({ loggedIn: true });
  } catch {
    return NextResponse.json({ loggedIn: false });
  }
}

