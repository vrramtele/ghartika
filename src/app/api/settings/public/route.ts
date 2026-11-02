import { NextResponse } from "next/server";
import { getStoreSettings } from "@/lib/db";

// GET /api/settings/public — Safe public storefront settings (no secrets exposed)
export async function GET() {
  try {
    const settings = await getStoreSettings();

    // Whitelist ONLY public storefront fields
    const publicSettings = {
      storeName: settings.storeName || "GharTika Spices",
      announcementText: settings.announcementText || "",
      announcementActive: settings.announcementActive ?? true,
      announcementLink: settings.announcementLink || "/#shop",
      freeShippingThreshold: settings.freeShippingThreshold ?? 499,
      enableCod: settings.enableCod ?? true,
      enableOnlinePayment: settings.enableOnlinePayment ?? true,
      enableUpiQr: settings.enableUpiQr ?? true,
      upiId: settings.upiId || "rytvishal@okicici",
      upiName: settings.upiName || "Ghartika Spices",
      contactPhone: settings.contactPhone || "",
      contactEmail: settings.contactEmail || "",
      whatsappSupport: settings.whatsappSupport || "",
      maintenanceMode: settings.maintenanceMode ?? false,
    };

    return NextResponse.json(publicSettings, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching public settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

