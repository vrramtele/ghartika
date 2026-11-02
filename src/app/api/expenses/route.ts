import { NextResponse } from "next/server";
import { getExpenses, createExpense } from "@/lib/db";

export async function GET() {
  try {
    const expenses = await getExpenses();
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.category || !body.description || body.amount === undefined) {
      return NextResponse.json({ error: "Category, description, and amount are required" }, { status: 400 });
    }
    const expense = await createExpense(body);
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
