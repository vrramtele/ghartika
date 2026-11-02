import { NextResponse } from "next/server";
import { getCostingSettings, updateCostingSettings } from "@/lib/db";

export async function GET() {
  try {
    const settings = await getCostingSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching costing settings:", error);
    return NextResponse.json({ error: "Failed to fetch costing settings" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const updated = await updateCostingSettings(body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating costing settings:", error);
    return NextResponse.json({ error: "Failed to update costing settings" }, { status: 500 });
  }
}
