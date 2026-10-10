"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductContext";
import { ShoppingCart, Package, Gift, Star, Flame, Search, SlidersHorizontal, CheckCircle2, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

const CATEGORIES = ["All", "Everyday Essentials", "Premium Blends", "Combos"];
const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name A-Z", value: "name-asc" },
];

export default function Shop() {
  const { addToCart } = useCart();
  const { products, isLoading } = useProducts();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => setMounted(true), []);
  const handleAdd = (product: typeof products[0]) => {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  const filtered = useMemo(() => {
    let list = [...products];
    if (category !== "All") list = list.filter((p) => p.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, category, search, sort]);

  const regularProducts = filtered.filter((p) => !p.isCombo);
  const comboProduct = filtered.find((p) => p.isCombo);
  const allCombos = products.filter((p) => !p.isCombo);
  if (!mounted) return null;

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--background)" }}>
      <Header />

      {/* ── Page Hero ── */}
      <div className="relative pt-24 pb-10 overflow-hidden" style={{ backgroundColor: "var(--surface-muted)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-5 blur-3xl"
            style={{ backgroundColor: "var(--brand-red)" }} />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-5 blur-3xl"
            style={{ backgroundColor: "var(--brand-gold)" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold border mb-4"
            style={{ backgroundColor: "#FDF2F3", color: "var(--brand-red)", borderColor: "#F5C6CB" }}>
            🌶️ Hamare Products
          </span>
          <h1 className="text-4xl sm:text-5xl font-black mb-3" style={{ color: "var(--text-primary)" }}>
            Ghartika Spice Store
          </h1>
          <p className="text-base max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
            100% shuddh · Stone ground · Direct from kisan · No artificial colors
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10">

        {/* ── Search + Filter Bar ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search spices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
                color: "var(--text-primary)",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition">
                <X className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-3 rounded-xl border text-sm focus:outline-none transition cursor-pointer"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
              color: "var(--text-primary)",
              minWidth: "180px",
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* ── Category Tabs ── */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-5 py-2 rounded-full text-sm font-semibold border transition-all hover:-translate-y-0.5"
              style={category === cat ? {
                backgroundColor: "var(--brand-red)",
                color: "white",
                borderColor: "var(--brand-red)",
                boxShadow: "0 4px 12px rgba(160,28,44,0.25)",
              } : {
                backgroundColor: "var(--surface)",
                color: "var(--text-secondary)",
                borderColor: "var(--border)",
              }}
            >
              {cat === "All" ? "🌶️ All" : cat === "Everyday Essentials" ? "🏠 Everyday" : cat === "Premium Blends" ? "👑 Premium" : "🎁 Combos"}
            </button>
          ))}
          <span className="ml-auto self-center text-sm" style={{ color: "var(--text-muted)" }}>
            {filtered.length} products found
          </span>
        </div>

        {/* ── No Results ── */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "var(--brand-red)", borderTopColor: "transparent" }}></div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Loading products...</h3>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Koi product nahi mila!</h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Search ya filter change karo</p>
            <button onClick={() => { setSearch(""); setCategory("All"); }}
              className="px-6 py-2.5 rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: "var(--brand-red)" }}>
              Reset Filters
            </button>
          </div>
        )}

        {/* ── Product Grid ── */}
        {regularProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-14">
            {regularProducts.map((product) => (
              <div key={product.id}
                className="rounded-2xl overflow-hidden border hover:shadow-xl transition-all duration-300 group flex flex-col relative"
                style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}>

                {/* Image */}
                <Link href={`/product/${product.id}`} className="block relative overflow-hidden" style={{ height: "220px" }}>
                  {product.badge && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{ backgroundColor: "var(--brand-red)", color: "#fff" }}>
                        {product.badge}
                      </span>
                    </div>
                  )}
                  <img src={product.image} alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                {/* Info */}
                <div className="p-5 flex flex-col flex-1">
                  {/* Stars */}
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 fill-current" style={{ color: "#F59E0B" }} />
                    ))}
                    <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>4.9 (120+)</span>
                  </div>

                  <Link href={`/product/${product.id}`} className="block flex-1">
                    <h3 className="font-bold text-base mb-1 leading-snug" style={{ color: "var(--text-primary)" }}>
                      {product.name}
                    </h3>
                  </Link>

                  <p className="text-xs mb-4 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                    {product.description}
                  </p>

                  {/* Category chip */}
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full self-start mb-3"
                    style={{ backgroundColor: "var(--surface-muted)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                    {product.category}
                  </span>

                  <div className="flex justify-between items-center pt-3 mt-auto border-t"
                    style={{ borderColor: "var(--border-light)" }}>
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
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-white transition-all active:scale-95 hover:-translate-y-0.5"
                      style={{
                        backgroundColor: addedId === product.id ? "var(--brand-green)" : "var(--brand-red)",
                        boxShadow: "0 2px 8px rgba(160,28,44,0.3)",
                        transition: "all 0.2s",
                      }}
                    >
                      {addedId === product.id
                        ? <><CheckCircle2 className="w-3.5 h-3.5" /> Added!</>
                        : <><ShoppingCart className="w-3.5 h-3.5" /> Add</>
                      }
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Combo Section ── */}
        {comboProduct && (
          <div className="relative rounded-3xl overflow-hidden border mb-10"
            style={{
              background: "linear-gradient(135deg, var(--brand-brown) 0%, #3D1F0A 60%, #1A0A00 100%)",
              borderColor: "var(--brand-gold)",
              boxShadow: "0 20px 60px rgba(92,51,23,0.3)",
            }}>
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: "var(--brand-gold)" }} />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: "var(--brand-red)" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] opacity-5 select-none pointer-events-none">🌶️</div>

            <div className="relative z-10 grid md:grid-cols-2 gap-0 items-center">
              {/* Images */}
              <div className="p-8">
                <div className="grid grid-cols-2 gap-3">
                  {allCombos.map((p) => (
                    <div key={p.id} className="rounded-2xl overflow-hidden aspect-square border-2 hover:scale-105 transition-transform"
                      style={{ borderColor: "rgba(184,134,11,0.4)" }}>
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="p-8 text-white">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-5"
                  style={{ backgroundColor: "var(--brand-gold)", color: "var(--brand-brown)" }}>
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

                <ul className="space-y-2 mb-6">
                  {comboProduct.comboItems?.map((item: string) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <Flame className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--brand-gold)" }} />
                      <span style={{ color: "rgba(255,255,255,0.9)" }}>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-black" style={{ color: "var(--brand-gold)" }}>
                    ₹{comboProduct.price}
                  </span>
                  {comboProduct.originalPrice && (
                    <>
                      <span className="text-xl line-through opacity-50">₹{comboProduct.originalPrice}</span>
                      <span className="text-sm font-bold px-3 py-1 rounded-full"
                        style={{ backgroundColor: "var(--brand-red)", color: "#fff" }}>
                        Save ₹{(comboProduct.originalPrice as number) - comboProduct.price}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => handleAdd(comboProduct)}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-95 hover:-translate-y-0.5"
                    style={{ backgroundColor: "var(--brand-gold)", color: "var(--brand-brown)", boxShadow: "0 4px 15px rgba(184,134,11,0.4)" }}>
                    <ShoppingCart className="w-4 h-4" />
                    {addedId === comboProduct.id ? "Added to Cart! ✓" : "Add Combo to Cart"}
                  </button>
                  <Link href={`/product/${comboProduct.id}`}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm border transition-all hover:opacity-80"
                    style={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}>
                    <Package className="w-4 h-4" />
                    Details
                  </Link>
                </div>

                <p className="text-xs mt-4 opacity-60">
                  ✓ Free Delivery &nbsp;·&nbsp; ✓ COD Available &nbsp;·&nbsp; ✓ 7-Day Return
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Bottom Trust Strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { emoji: "🚚", title: "Free Delivery", sub: "On orders above ₹299" },
            { emoji: "✅", title: "100% Pure", sub: "No adulterants, ever" },
            { emoji: "↩️", title: "7-Day Returns", sub: "Quality guarantee" },
            { emoji: "💳", title: "Secure Payment", sub: "Razorpay + COD" },
          ].map(({ emoji, title, sub }) => (
            <div key={title} className="flex items-center gap-3 p-4 rounded-2xl border text-center sm:text-left sm:flex-row flex-col"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}>
              <span className="text-2xl">{emoji}</span>
              <div>
                <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{title}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
