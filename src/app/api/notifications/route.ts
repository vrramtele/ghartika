import { NextResponse } from "next/server";
import {
  getNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/db";

export async function GET() {
  try {
    const notifs = await getNotifications();
    return NextResponse.json(notifs);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === "mark_all_read") {
      await markAllNotificationsRead();
      return NextResponse.json({ success: true });
    }
    if (!body.title || !body.message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }
    const notif = await createNotification({
      type: body.type || "system_alert",
      title: body.title,
      message: body.message,
      link: body.link,
    });
    return NextResponse.json(notif, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
    }
    const success = await markNotificationRead(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("Error marking notification read:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
