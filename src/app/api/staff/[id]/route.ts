import { NextResponse } from "next/server";
import { updateStaffMember, deleteStaffMember } from "@/lib/db";
import type { StaffRole } from "@/types";

// PATCH /api/staff/[id] — Update staff role/status (admin)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, email, role, status } = body;

    const patch: Record<string, unknown> = {};
    if (name) patch.name = String(name).slice(0, 100);
    if (email) patch.email = String(email).trim().toLowerCase().slice(0, 100);
    if (role) {
      const validRoles: StaffRole[] = ["Owner", "Manager", "Packer", "Support"];
      if (validRoles.includes(role)) patch.role = role;
    }
    if (status) patch.status = status === "inactive" ? "inactive" : "active";

    const updated = await updateStaffMember(id, patch);
    if (!updated) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating staff:", error);
    return NextResponse.json({ error: "Failed to update staff" }, { status: 500 });
  }
}

// DELETE /api/staff/[id] — Remove staff member (admin)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteStaffMember(id);
    if (!deleted) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting staff:", error);
    return NextResponse.json({ error: "Failed to delete staff" }, { status: 500 });
  }
}
