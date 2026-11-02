import { NextResponse } from "next/server";
import { getStaffMembers, createStaffMember } from "@/lib/db";
import type { StaffRole } from "@/types";

// GET /api/staff — List staff members (admin)
export async function GET() {
  try {
    const staff = await getStaffMembers();
    return NextResponse.json(staff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

// POST /api/staff — Add new staff member (admin)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, role, status = "active" } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Name, email, and role are required" }, { status: 400 });
    }

    const validRoles: StaffRole[] = ["Owner", "Manager", "Packer", "Support"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid staff role" }, { status: 400 });
    }

    const member = await createStaffMember({
      name: String(name).slice(0, 100),
      email: String(email).trim().toLowerCase().slice(0, 100),
      role,
      status: status === "inactive" ? "inactive" : "active",
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Error adding staff:", error);
    return NextResponse.json({ error: "Failed to add staff member" }, { status: 500 });
  }
}
