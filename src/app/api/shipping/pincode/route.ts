import { NextResponse } from "next/server";

// POST /api/shipping/pincode — Check serviceability & estimated delivery days
export async function POST(req: Request) {
  try {
    const { pincode } = await req.json();

    if (!pincode || typeof pincode !== "string") {
      return NextResponse.json({ serviceable: false, message: "Pincode is required" }, { status: 400 });
    }

    const cleanPincode = pincode.trim().replace(/\s+/g, "");

    // Validate 6-digit Indian pincode format
    if (!/^[1-9][0-9]{5}$/.test(cleanPincode)) {
      return NextResponse.json({
        serviceable: false,
        message: "Invalid Indian PIN code (must be 6 digits, cannot start with 0)",
      }, { status: 400 });
    }

    const firstDigit = cleanPincode.charAt(0);
    let region = "Central India";
    let estDays = "3-5 business days";

    switch (firstDigit) {
      case "1":
      case "2":
        region = "North India (Delhi/Punjab/UP/Haryana)";
        estDays = "2-4 business days";
        break;
      case "3":
      case "4":
        region = "West & Central India (MP/Gujarat/Maharashtra/Rajasthan)";
        estDays = "2-3 business days";
        break;
      case "5":
      case "6":
        region = "South India (Karnataka/TN/Kerala/AP/Telangana)";
        estDays = "3-5 business days";
        break;
      case "7":
      case "8":
        region = "East & North East (WB/Bihar/Odisha/Assam)";
        estDays = "4-6 business days";
        break;
    }

    return NextResponse.json({
      serviceable: true,
      pincode: cleanPincode,
      region,
      estimatedDelivery: estDays,
      codAvailable: true,
      partner: "Delhivery Surface / India Post Speed Post",
      message: `Delivery available to ${cleanPincode} in ${estDays} with COD! 🚚`,
    });
  } catch (error) {
    console.error("Error checking pincode:", error);
    return NextResponse.json({ serviceable: false, message: "Error checking pincode" }, { status: 500 });
  }
}
