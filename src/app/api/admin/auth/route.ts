import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const JWT_SECRET = process.env.JWT_SECRET || "ghartika-spices-super-secret-jwt-key-2024";
const COOKIE_NAME = "ghartika_admin_token";

// POST /api/admin/auth — login or logout
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, password } = body;

    // ── Logout ──
    if (action === "logout") {
      const res = NextResponse.json({ success: true });
      res.cookies.delete(COOKIE_NAME);
      return res;
    }

    // ── Login ──
    if (action === "login") {
      if (password !== ADMIN_PASSWORD) {
        return NextResponse.json(
          { error: "Galat password!" },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        { role: "admin", iat: Date.now() },
        JWT_SECRET,
        { expiresIn: "8h" }
      );

      const res = NextResponse.json({ success: true });
      res.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
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

// GET /api/admin/auth — check if logged in
export async function GET(req: Request) {
  try {
    const cookie = req.headers
      .get("cookie")
      ?.split(";")
      .find((c) => c.trim().startsWith(`${COOKIE_NAME}=`));

    if (!cookie) {
      return NextResponse.json({ loggedIn: false });
    }

    const token = cookie.split("=")[1]?.trim();
    jwt.verify(token, JWT_SECRET); // throws if invalid/expired
    return NextResponse.json({ loggedIn: true });
  } catch {
    return NextResponse.json({ loggedIn: false });
  }
}
