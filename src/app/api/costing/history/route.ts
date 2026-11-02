import { NextResponse } from "next/server";
import { getCostHistory } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") || undefined;
    const history = await getCostHistory(productId);
    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching cost history:", error);
    return NextResponse.json({ error: "Failed to fetch cost history" }, { status: 500 });
  }
}
