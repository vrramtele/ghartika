import { NextResponse } from "next/server";
import { getProducts, createProduct, Product } from "@/lib/db";

// GET /api/products — fetch all products
export async function GET() {
  try {
    const products = getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products — add new product (admin)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, price, weight, category, image, description, badge } = body;

    if (!name || !price || !weight || !category || !description) {
      return NextResponse.json(
        { error: "name, price, weight, category, description are required" },
        { status: 400 }
      );
    }

    const newProduct = createProduct({
      name,
      price: Number(price),
      weight,
      category,
      image: image || "/images/red-chili.jpg",
      description,
      badge: badge || undefined,
    } as Omit<Product, "id">);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
