import { NextResponse } from "next/server";
import { getOrders, getProducts, getStoreSettings } from "@/lib/db";

export async function GET() {
  const startTime = Date.now();
  let redisStatus = "not_configured";
  let dbLatency = 0;
  let dbConnected = false;

  try {
    const dbStart = Date.now();
    await getStoreSettings();
    dbLatency = Date.now() - dbStart;
    dbConnected = true;
    redisStatus = process.env.KV_REST_API_URL ? "connected" : "local_file_fallback";
  } catch {
    dbConnected = false;
    redisStatus = "error";
  }

  const razorpayConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  const emailConfigured = !!process.env.RESEND_API_KEY;

  let totalOrders = 0;
  let totalProducts = 0;
  try {
    const orders = await getOrders();
    const products = await getProducts();
    totalOrders = orders.length;
    totalProducts = products.length;
  } catch {}

  const mem = process.memoryUsage();

  return NextResponse.json({
    status: dbConnected ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || "development",
    responseTimeMs: Date.now() - startTime,
    database: {
      status: redisStatus,
      connected: dbConnected,
      latencyMs: dbLatency,
      isRedis: !!process.env.KV_REST_API_URL,
    },
    services: {
      razorpay: {
        configured: razorpayConfigured,
        keyPrefix: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.slice(0, 8) + "..." : "none",
      },
      emailService: {
        configured: emailConfigured,
        provider: "Resend",
      },
    },
    counts: {
      totalOrders,
      totalProducts,
    },
    memory: {
      rssMb: Math.round(mem.rss / 1024 / 1024),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
    },
  });
}
