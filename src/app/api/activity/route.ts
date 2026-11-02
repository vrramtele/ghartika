import { NextResponse } from "next/server";
import { getActivityLogs } from "@/lib/db";

// GET /api/activity — List recent admin activity logs
export async function GET() {
  try {
    const logs = await getActivityLogs();
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 });
  }
}
