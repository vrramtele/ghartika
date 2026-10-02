import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  // Initialize Resend lazily (inside function) to avoid build-time crash
  const apiKey = process.env.RESEND_API_KEY;
  const isResendConfigured = apiKey && !apiKey.startsWith("re_xxx");
  const resend = isResendConfigured ? new Resend(apiKey) : null;

  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Sabhi zaroori fields bharein." },
        { status: 400 }
      );
    }

    const toEmail = process.env.CONTACT_TO_EMAIL || "support@ghartika.in";

    if (!resend) {
      console.warn("Resend not configured — skipping email");
      return NextResponse.json({ success: true, note: "Email service not configured" });
    }

    const { error } = await resend.emails.send({
      from: "Ghartika Website <onboarding@resend.dev>",
      to: [toEmail],
      subject: `📩 New Contact: [${subject}] from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #eee;">
          <div style="background: linear-gradient(135deg, #A01C2C, #B8860B); padding: 24px 32px;">
            <h1 style="color: white; margin: 0; font-size: 22px;">📩 New Contact Form Submission</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px;">Ghartika Spices Website</p>
          </div>
          
          <div style="padding: 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555; width: 130px;">👤 Naam</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #222;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">📧 Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #222;"><a href="mailto:${email}" style="color: #A01C2C;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">📱 Phone</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #222;">${phone || "—"}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #555;">📋 Vishay</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #222;">${subject}</td>
              </tr>
            </table>
            
            <div style="margin-top: 24px;">
              <p style="font-weight: bold; color: #555; margin-bottom: 8px;">💬 Message:</p>
              <div style="background: #f9f9f9; border-left: 4px solid #A01C2C; padding: 16px; border-radius: 4px; color: #333; line-height: 1.6;">
                ${message.replace(/\n/g, "<br/>")}
              </div>
            </div>
            
            <div style="margin-top: 28px; padding: 16px; background: #FDF8EC; border-radius: 8px; border: 1px solid #F5E0A0;">
              <p style="margin: 0; font-size: 13px; color: #666;">
                ⏰ Received at: <strong>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</strong>
              </p>
            </div>
          </div>
          
          <div style="background: #f5f5f5; padding: 16px 32px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #999;">Ghartika Spices · Indore, M.P. · <a href="mailto:support@ghartika.in" style="color: #A01C2C;">support@ghartika.in</a></p>
          </div>
        </div>
      `,
      // Also send auto-reply to customer
      replyTo: email,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Email bhejne mein problem aayi." },
        { status: 500 }
      );
    }

    // Send auto-reply to customer
    await resend.emails.send({
      from: "Ghartika Spices <onboarding@resend.dev>",
      to: [email],
      subject: "✅ Aapka message mil gaya! — Ghartika Spices",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #eee;">
          <div style="background: linear-gradient(135deg, #A01C2C, #B8860B); padding: 24px 32px;">
            <h1 style="color: white; margin: 0; font-size: 22px;">🙏 Shukriya, ${name}!</h1>
          </div>
          
          <div style="padding: 32px;">
            <p style="color: #333; line-height: 1.7; font-size: 15px;">
              Aapka message hamein mil gaya. Hum jald hi — usually <strong>24 ghante</strong> ke andar — aapse sampark karenge.
            </p>
            
            <div style="margin: 24px 0; background: #F1F8F1; border-radius: 8px; padding: 16px; border: 1px solid #C8E6C9;">
              <p style="margin: 0; font-size: 14px; color: #2E7D32;">
                ✅ Aapka vishay: <strong>${subject}</strong>
              </p>
            </div>
            
            <p style="color: #555; font-size: 14px;">
              Urgent kaam ke liye hum WhatsApp pe bhi available hain:<br/>
              <a href="https://wa.me/919876543210" style="color: #25D366; font-weight: bold;">📱 WhatsApp: +91 98765 43210</a>
            </p>
            
            <div style="margin-top: 24px; text-align: center;">
              <a href="https://ghartika.in/shop" style="display: inline-block; background: #A01C2C; color: white; padding: 12px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px;">
                🌶️ Hamare Masale Dekho
              </a>
            </div>
          </div>
          
          <div style="background: #f5f5f5; padding: 16px 32px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #999;">Ghartika Spices · Indore, M.P. · support@ghartika.in</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
