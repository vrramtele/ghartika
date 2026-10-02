"use client";

import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { useEffect, useState } from "react";

export default function FeaturedProducts() {
  const { addToCart } = useCart();
  const { products } = useProducts();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const featured = products.filter(
    (p) => p.category === "Everyday Essentials" || p.category === "Premium Blends"
  ).slice(0, 8);

  return (
    <section className="py-20 bg-[var(--surface-muted)] border-y border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <div>
            <p className="text-[var(--brand-red)] text-xs font-semibold uppercase tracking-[0.2em] mb-2">Shop</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">Our Collection</h2>
          </div>
          <Link
            href="/shop"
            className="text-sm font-medium text-[var(--brand-red)] hover:underline underline-offset-4 self-start md:self-end"
          >
            View all products →
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => (
            <div
              key={product.id}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden group hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow duration-300"
            >
              {/* Image */}
              <Link href={`/product/${product.id}`} className="block relative overflow-hidden bg-[var(--surface-muted)]">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  {/* Badge */}
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-[var(--brand-red)] text-white text-[10px] font-semibold px-2.5 py-1 rounded tracking-wide">
                      {product.badge}
                    </span>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="p-4 flex flex-col gap-2.5">
                {/* Category */}
                <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
                  {product.category}
                </span>

                {/* Name */}
                <Link href={`/product/${product.id}`}>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-snug hover:text-[var(--brand-red)] transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>

                {/* Weight */}
                <p className="text-xs text-[var(--text-muted)]">{product.weight}</p>

                {/* Rating */}
                <div className="flex items-center gap-1.5">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">(48)</span>
                </div>

                {/* Price + Cart */}
                <div className="flex items-center justify-between mt-1 pt-3 border-t border-[var(--border-light)]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-[var(--text-primary)]">₹{product.price}</span>
                    <span className="text-xs text-[var(--text-muted)] line-through">₹{product.price + 50}</span>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="flex items-center gap-1.5 bg-[var(--brand-red)] text-white text-xs font-semibold px-3 py-2 rounded hover:bg-[var(--brand-brown)] transition-colors duration-200"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
