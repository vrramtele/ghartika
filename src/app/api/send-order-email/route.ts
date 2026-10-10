import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  const isResendConfigured = apiKey && !apiKey.startsWith("re_xxx");
  const resend = isResendConfigured ? new Resend(apiKey) : null;

  try {
    const body = await req.json();
    const { order } = body;

    if (!order || !order.customer || !order.items) {
      return NextResponse.json(
        { error: "Order data required" },
        { status: 400 }
      );
    }

    const { customer, items, total, id, razorpayPaymentId } = order;

    if (!resend) {
      console.warn("Resend not configured — skipping order confirmation email");
      return NextResponse.json({ success: true, note: "Email service not configured" });
    }

    // Don't send if no email
    if (!customer.email) {
      return NextResponse.json({ success: true, note: "No customer email provided" });
    }

    const itemsHtml = items
      .map(
        (item: { name: string; weight: string; quantity: number; price: number }) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
            <p style="margin: 0; font-weight: 600; color: #222; font-size: 14px;">${item.name}</p>
            <p style="margin: 4px 0 0; color: #888; font-size: 12px;">${item.weight} × ${item.quantity}</p>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 700; color: #A01C2C; font-size: 14px; white-space: nowrap;">
            ₹${item.price * item.quantity}
          </td>
        </tr>
      `
      )
      .join("");

    const paymentMode = razorpayPaymentId === "COD"
      ? "Cash on Delivery"
      : `Online Payment (ID: ${razorpayPaymentId || "—"})`;

    // Send confirmation to customer
    await resend.emails.send({
      from: "Ghartika Spices <onboarding@resend.dev>",
      to: [customer.email],
      subject: `✅ Order Confirmed! #${id} — Ghartika Spices`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #eee; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #A01C2C 0%, #7B1521 50%, #B8860B 100%); padding: 32px; text-align: center;">
            <p style="color: rgba(255,255,255,0.7); margin: 0 0 8px; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">Order Confirmed 🎉</p>
            <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 900;">Shukriya, ${customer.name}!</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Aapka masala order ho gaya! 🌶️</p>
          </div>

          <!-- Order ID Banner -->
          <div style="background: #FDF8EC; border-bottom: 2px solid #F5E0A0; padding: 14px 32px; text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #666;">Order ID: <strong style="color: #A01C2C; font-size: 15px; font-family: monospace;">${id}</strong></p>
          </div>

          <div style="padding: 32px;">
            
            <!-- Delivery Address -->
            <div style="background: #F9F9F9; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #eee;">
              <p style="margin: 0 0 12px; font-weight: 700; color: #333; font-size: 14px;">📦 Delivery Address</p>
              <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.8;">
                ${customer.name}<br/>
                ${customer.address}<br/>
                ${customer.city}, ${customer.state} – ${customer.pincode}<br/>
                📱 ${customer.phone}
              </p>
            </div>

            <!-- Order Items -->
            <p style="font-weight: 700; color: #333; font-size: 15px; margin: 0 0 12px;">🛒 Aapke Items</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              ${itemsHtml}
            </table>

            <!-- Total -->
            <div style="background: linear-gradient(to right, #FDF2F3, #FDF8EC); border-radius: 10px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border: 1px solid #F5C6CB;">
              <div style="display: flex; justify-content: space-between; width: 100%;">
                <div>
                  <p style="margin: 0; color: #555; font-size: 13px;">Delivery</p>
                  <p style="margin: 4px 0 0; font-size: 12px; color: #2E7D32; font-weight: 600;">FREE ✓</p>
                </div>
                <div style="text-align: right;">
                  <p style="margin: 0; color: #555; font-size: 13px;">Total Amount</p>
                  <p style="margin: 4px 0 0; font-size: 22px; font-weight: 900; color: #A01C2C;">₹${total}</p>
                </div>
              </div>
            </div>

            <!-- Payment Mode -->
            <div style="background: #F1F8F1; border-radius: 10px; padding: 14px 20px; margin-bottom: 24px; border: 1px solid #C8E6C9;">
              <p style="margin: 0; font-size: 13px; color: #2E7D32;">
                💳 Payment: <strong>${paymentMode}</strong>
              </p>
            </div>

            <!-- Timeline -->
            <p style="font-weight: 700; color: #333; font-size: 15px; margin: 0 0 16px;">📅 Aage Kya Hoga?</p>
            <div style="position: relative; padding-left: 24px; margin-bottom: 28px;">
              ${[
                { emoji: "✅", text: "Order Confirmed", sub: "Abhi", done: true },
                { emoji: "📦", text: "Order Pack Ho Raha Hai", sub: "1-2 business days", done: false },
                { emoji: "🚚", text: "Shipment Dispatch", sub: "2-3 business days", done: false },
                { emoji: "🏠", text: "Delivery", sub: "3-5 business days total", done: false },
              ]
                .map(
                  (step) => `
                <div style="display: flex; gap: 12px; margin-bottom: 14px; align-items: flex-start;">
                  <div style="width: 32px; height: 32px; border-radius: 50%; background: ${step.done ? "#A01C2C" : "#f0f0f0"}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 14px;">
                    ${step.emoji}
                  </div>
                  <div>
                    <p style="margin: 0; font-weight: ${step.done ? "700" : "600"}; color: ${step.done ? "#A01C2C" : "#333"}; font-size: 14px;">${step.text}</p>
                    <p style="margin: 2px 0 0; font-size: 12px; color: #888;">${step.sub}</p>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>

            <!-- CTA Buttons -->
            <div style="text-align: center; margin-bottom: 8px;">
              <a href="https://ghartika.in/shop" style="display: inline-block; background: #A01C2C; color: white; padding: 14px 36px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 14px; margin-right: 8px;">
                🌶️ Aur Masale Dekho
              </a>
            </div>

            <p style="text-align: center; font-size: 13px; color: #888; margin-top: 20px;">
              Koi bhi problem? WhatsApp karein: 
              <a href="https://wa.me/917972146152" style="color: #25D366; font-weight: 600;">+91 79721 46152</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #F5F5F5; padding: 20px 32px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; font-size: 13px; font-weight: 700; color: #A01C2C;">Ghartika Spices</p>
            <p style="margin: 4px 0 0; font-size: 11px; color: #999;">
              Nagpur, Maharashtra · 
              <a href="mailto:support@ghartika.in" style="color: #A01C2C;">support@ghartika.in</a>
            </p>
            <p style="margin: 8px 0 0; font-size: 11px; color: #bbb;">
              © ${new Date().getFullYear()} Ghartika Spices. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    // Notify admin about new order
    const adminEmail = process.env.CONTACT_TO_EMAIL || "support@ghartika.in";
    await resend.emails.send({
      from: "Ghartika Orders <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `🛒 New Order #${id} — ₹${total} from ${customer.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #eee;">
          <div style="background: linear-gradient(135deg, #A01C2C, #B8860B); padding: 24px 32px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">🛒 New Order Received!</h1>
          </div>
          <div style="padding: 28px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #555; font-size: 13px; width: 130px;">Order ID</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: 700; font-family: monospace; color: #A01C2C;">${id}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #555; font-size: 13px;">Customer</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #222;">${customer.name}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #555; font-size: 13px;">Phone</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #222;">${customer.phone}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #555; font-size: 13px;">Email</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #222;">${customer.email || "—"}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #555; font-size: 13px;">Address</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #222;">${customer.address}, ${customer.city}, ${customer.state} – ${customer.pincode}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #555; font-size: 13px;">Total</td><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: 800; color: #A01C2C; font-size: 16px;">₹${total}</td></tr>
              <tr><td style="padding: 8px 0; color: #555; font-size: 13px;">Payment</td><td style="padding: 8px 0; color: #222;">${paymentMode}</td></tr>
            </table>
            <div style="margin-top: 16px;">
              <p style="font-weight: 700; color: #333; margin-bottom: 8px;">Items Ordered:</p>
              ${items.map((item: { name: string; weight: string; quantity: number; price: number }) =>
                `<p style="margin: 4px 0; color: #555; font-size: 13px;">• ${item.name} (${item.weight}) × ${item.quantity} = ₹${item.price * item.quantity}</p>`
              ).join("")}
            </div>
            <div style="margin-top: 24px; text-align: center;">
              <a href="https://ghartika.in/admin" style="background: #A01C2C; color: white; padding: 12px 28px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 13px;">
                🔧 Admin Panel Dekho
              </a>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Order email error:", err);
    return NextResponse.json(
      { error: "Email send karne mein problem aayi" },
      { status: 500 }
    );
  }
}
