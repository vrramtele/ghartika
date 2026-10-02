"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductContext";
import { ShoppingCart, Package, Gift, Star, Flame } from "lucide-react";
import { useState, useEffect } from "react";

export default function Shop() {
  const { addToCart } = useCart();
  const { products } = useProducts();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const regularProducts = products.filter((p) => !("isCombo" in p && p.isCombo));
  const comboProduct = products.find((p) => "isCombo" in p && p.isCombo);

  const handleAdd = (product: typeof products[0]) => {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--background)" }}>
      <Header />

      <div className="flex-1 pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-3 border"
            style={{ backgroundColor: "#FDF2F3", color: "var(--brand-red)", borderColor: "#F5C6CB" }}
          >
            🌶️ Hamare Products
          </div>
          <h1 className="text-4xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
            Ghartika Spice Store
          </h1>
          <p className="text-base max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
            100% shuddh · Stone ground · Direct from kisan · No artificial colors
          </p>
        </div>

        {/* ── 4 Regular Products ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {regularProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl overflow-hidden border hover:shadow-xl transition-all duration-300 group flex flex-col"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}
            >
              {/* Image */}
              <Link href={`/product/${product.id}`} className="block relative overflow-hidden h-56">
                {product.badge && (
                  <div className="absolute top-3 left-3 z-10">
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"
                      style={{ backgroundColor: "var(--brand-red)", color: "#fff" }}
                    >
                      {product.badge}
                    </span>
                  </div>
                )}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              {/* Info */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3 h-3 fill-current" style={{ color: "#F59E0B" }} />
                  ))}
                  <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>4.9</span>
                </div>

                <Link href={`/product/${product.id}`} className="block flex-1">
                  <h3 className="font-bold text-base mb-1 leading-snug group-hover:opacity-70 transition-opacity" style={{ color: "var(--text-primary)" }}>
                    {product.name}
                  </h3>
                </Link>

                <p className="text-xs mb-4 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                  {product.description}
                </p>

                <div
                  className="flex justify-between items-center pt-3 mt-auto border-t"
                  style={{ borderColor: "var(--border-light)" }}
                >
                  <div>
                    <span className="text-xl font-black" style={{ color: "var(--brand-red)" }}>
                      ₹{product.price}
                    </span>
                    <span className="text-xs ml-1.5" style={{ color: "var(--text-muted)" }}>
                      / {product.weight}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); handleAdd(product); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-white transition-all active:scale-95"
                    style={{ backgroundColor: addedId === product.id ? "var(--brand-green)" : "var(--brand-red)" }}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {addedId === product.id ? "Added!" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Combo Section ── */}
        {comboProduct && (
          <div
            className="relative rounded-3xl overflow-hidden border"
            style={{
              background: "linear-gradient(135deg, var(--brand-brown) 0%, #3D1F0A 100%)",
              borderColor: "var(--brand-gold)",
            }}
          >
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: "var(--brand-gold)" }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: "var(--brand-red)" }} />

            <div className="relative z-10 grid md:grid-cols-2 gap-0 items-center">
              {/* Left: Images grid */}
              <div className="p-8">
                <div className="grid grid-cols-2 gap-3">
                  {regularProducts.map((p) => (
                    <div key={p.id} className="rounded-2xl overflow-hidden aspect-square border-2" style={{ borderColor: "rgba(184,134,11,0.4)" }}>
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Details */}
              <div className="p-8 text-white">
                {/* Badge */}
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-5"
                  style={{ backgroundColor: "var(--brand-gold)", color: "var(--brand-brown)" }}
                >
                  <Gift className="w-4 h-4" />
                  Special Combo Offer
                </div>

                <h2 className="text-3xl font-black mb-2 leading-tight">
                  Ghartika<br />
                  <span style={{ color: "var(--brand-gold)" }}>Spice Combo</span>
                </h2>
                <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Charo premium masale ek saath — special discounted price mein!
                </p>

                {/* Combo items */}
                <ul className="space-y-2 mb-6">
                  {comboProduct.comboItems && comboProduct.comboItems.map((item: string) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <Flame className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--brand-gold)" }} />
                      <span style={{ color: "rgba(255,255,255,0.9)" }}>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-black" style={{ color: "var(--brand-gold)" }}>
                    ₹{comboProduct.price}
                  </span>
                  {"originalPrice" in comboProduct && (
                    <>
                      <span className="text-xl line-through opacity-50">₹{comboProduct.originalPrice}</span>
                      <span
                        className="text-sm font-bold px-3 py-1 rounded-full"
                        style={{ backgroundColor: "var(--brand-red)", color: "#fff" }}
                      >
                        Save ₹{(comboProduct.originalPrice as number) - comboProduct.price}
                      </span>
                    </>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleAdd(comboProduct)}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: "var(--brand-gold)", color: "var(--brand-brown)" }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {addedId === comboProduct.id ? "Cart Mein Add Ho Gaya! ✓" : "Combo Cart Mein Daalo"}
                  </button>
                  <Link
                    href={`/product/${comboProduct.id}`}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm border transition-all hover:opacity-80"
                    style={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}
                  >
                    <Package className="w-4 h-4" />
                    Details Dekho
                  </Link>
                </div>

                {/* Trust */}
                <p className="text-xs mt-4 opacity-60">
                  ✓ Free Delivery &nbsp;·&nbsp; ✓ COD Available &nbsp;·&nbsp; ✓ 7-Day Return
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
