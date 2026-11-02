import { NextResponse } from "next/server";
import { getReviews, createReview } from "@/lib/db";

// GET /api/reviews — List reviews (optional ?productId=... filter)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId") || undefined;
    const reviews = await getReviews(productId);
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST /api/reviews — Customer submits a review (public)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, productName, customerName, customerPhone, rating, comment } = body;

    if (!productId || !productName || !customerName || !comment) {
      return NextResponse.json({ error: "Product ID, name, customer name, and comment are required" }, { status: 400 });
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const review = await createReview({
      productId: String(productId),
      productName: String(productName).slice(0, 100),
      customerName: String(customerName).slice(0, 100),
      customerPhone: customerPhone ? String(customerPhone).slice(0, 20) : undefined,
      rating: Math.round(numRating),
      comment: String(comment).slice(0, 1000),
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
