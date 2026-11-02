import { NextResponse } from "next/server";
import { getStoreSettings, updateStoreSettings } from "@/lib/db";

// GET /api/admin/settings — Get store settings
export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching store settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// PATCH /api/admin/settings — Update store settings (admin)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const allowed = [
      "storeName",
      "gstin",
      "fssaiNumber",
      "registeredAddress",
      "announcementText",
      "announcementActive",
      "announcementLink",
      "heroHeadline",
      "heroSubheadline",
      "contactPhone",
      "contactEmail",
      "freeShippingThreshold",
      "enableCod",
      "enableOnlinePayment",
      "maintenanceMode",
      "instagramUrl",
      "whatsappSupport",
    ];

    const patch: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) patch[key] = body[key];
    }

    if (patch.freeShippingThreshold !== undefined) {
      patch.freeShippingThreshold = Number(patch.freeShippingThreshold) || 499;
    }

    const updated = await updateStoreSettings(patch);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating store settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
