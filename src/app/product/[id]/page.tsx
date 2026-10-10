"use client";

import { use, useState, useEffect } from "react";
import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductContext";
import {
  ShoppingCart, CheckCircle2, Minus, Plus, CreditCard,
  Share2, ChevronDown, ChevronUp, Tag, Truck, Leaf,
  Shield, Zap, Star, ArrowLeft, Heart, Package,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Toast notification component
function Toast({ message, show }: { message: string; show: boolean }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
      <div className="flex items-center gap-3 px-6 py-3.5 rounded-full shadow-2xl text-white text-sm font-bold"
        style={{ backgroundColor: "var(--brand-red)", boxShadow: "0 8px 30px rgba(160,28,44,0.4)" }}>
        <CheckCircle2 className="w-4 h-4" />
        {message}
      </div>
    </div>
  );
}

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart } = useCart();
  const { products } = useProducts();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [wishlisted, setWishlisted] = useState(false);

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({ h: 23, m: 58, s: 48 });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        if (s > 0) s--;
        else { s = 59; if (m > 0) m--; else { m = 59; if (h > 0) h--; else h = 23; } }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  const product = products.find((p) => p.id === id);

  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2500);
  };

  if (!product) {
    return (
      <main className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--background)" }}>
        <Header />
        <div className="flex-1 flex items-center justify-center flex-col gap-4 pt-24">
          <p className="text-6xl">🔍</p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Product not found</h1>
          <Link href="/shop" className="px-6 py-3 rounded-full text-white font-bold"
            style={{ backgroundColor: "var(--brand-red)" }}>Back to Shop</Link>
        </div>
      </main>
    );
  }

  const originalPrice = product.originalPrice || Math.round(product.price * 1.2);
  const saveAmount = originalPrice - product.price;
  const discountPercent = Math.round((saveAmount / originalPrice) * 100);
  const gallery = [product.image, product.image, product.image];

  // Related products (same category, not self)
  const related = products.filter((p) => p.id !== product.id && !p.isCombo).slice(0, 3);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToCart(product);
    showToast(`${quantity} item${quantity > 1 ? "s" : ""} added to cart! 🛒`);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) addToCart(product);
    router.push("/checkout");
  };

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--background)" }}>
      <Header />
      <Toast message={toast.msg} show={toast.show} />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:underline">Shop</Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>{product.name}</span>
        </div>

        {/* Main Grid */}
        <div className="flex flex-col lg:flex-row gap-12">

          {/* ── LEFT: Image Gallery ── */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            {/* Main image */}
            <div className="relative rounded-3xl overflow-hidden shadow-lg border"
              style={{ border: "1px solid var(--border-light)", backgroundColor: "var(--surface)" }}>
              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                    style={{ backgroundColor: "var(--brand-red)" }}>
                    {product.badge}
                  </span>
                </div>
              )}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button onClick={() => setWishlisted(!wishlisted)}
                  className="w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                  style={{ backgroundColor: "white", border: "1px solid var(--border)" }}>
                  <Heart className={`w-4 h-4 transition-colors ${wishlisted ? "fill-current" : ""}`}
                    style={{ color: wishlisted ? "var(--brand-red)" : "var(--text-muted)" }} />
                </button>
                <button onClick={() => { if (navigator.share) navigator.share({ title: product.name, url: window.location.href }); }}
                  className="w-9 h-9 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all"
                  style={{ backgroundColor: "white", border: "1px solid var(--border)" }}>
                  <Share2 className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
              <img src={gallery[activeImage]} alt={product.name}
                className="w-full object-cover" style={{ height: "420px" }} />
            </div>
            {/* Thumbnails */}
            <div className="flex gap-3">
              {gallery.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImage(idx)}
                  className="w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all hover:scale-105"
                  style={{ borderColor: activeImage === idx ? "var(--brand-red)" : "var(--border)" }}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div className="lg:w-1/2 flex flex-col">

            {/* Category + tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs font-semibold px-3 py-1 rounded-full border"
                style={{ backgroundColor: "var(--surface-muted)", color: "var(--text-muted)", borderColor: "var(--border)" }}>
                {product.category}
              </span>
              {["Stone Ground", "No Additives", "Farm Fresh"].map((tag) => (
                <span key={tag} className="text-xs font-semibold px-3 py-1 rounded-full border"
                  style={{ backgroundColor: "#FDF2F3", color: "var(--brand-red)", borderColor: "#F5C6CB" }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-black mb-2 leading-tight" style={{ color: "var(--text-primary)" }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-current" style={{ color: "#F59E0B" }} />)}
              </div>
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>4.9</span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>(150+ reviews)</span>
            </div>

            {/* Price */}
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <span className="text-4xl font-black" style={{ color: "var(--brand-red)" }}>₹{product.price}</span>
              <span className="text-xl line-through font-semibold" style={{ color: "var(--text-muted)" }}>₹{originalPrice}</span>
              <span className="text-sm font-bold px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: "var(--brand-green)" }}>
                {discountPercent}% OFF
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-3.5 h-3.5" style={{ color: "var(--brand-green)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--brand-green)" }}>
                You save ₹{saveAmount} on this order!
              </span>
            </div>
            <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
              Weight: <strong>{product.weight}</strong> · Free delivery included
            </p>

            {/* Countdown */}
            <div className="rounded-2xl p-4 mb-6 border"
              style={{ backgroundColor: "#FDF8EC", borderColor: "#F5E0A0" }}>
              <p className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--brand-gold)" }}>
                <Zap className="w-4 h-4" /> Limited Time Offer Ends In:
              </p>
              <div className="flex gap-3">
                {[
                  { v: timeLeft.h, l: "Hours" },
                  { v: timeLeft.m, l: "Min" },
                  { v: timeLeft.s, l: "Sec" },
                ].map((t, i) => (
                  <div key={i} className="text-center rounded-xl px-4 py-2 min-w-[64px] shadow-sm"
                    style={{ backgroundColor: "white", border: "1px solid #F5E0A0" }}>
                    <div className="text-xl font-black" style={{ color: "var(--brand-red)" }}>
                      {t.v.toString().padStart(2, "0")}
                    </div>
                    <div className="text-[10px] uppercase font-bold" style={{ color: "var(--text-muted)" }}>{t.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity + Actions */}
            <div className="mb-6">
              <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>Quantity</p>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Qty selector */}
                <div className="flex items-center rounded-xl border overflow-hidden"
                  style={{ borderColor: "var(--border)" }}>
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    style={{ color: "var(--text-secondary)" }}>
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-black text-lg" style={{ color: "var(--text-primary)" }}>
                    {quantity}
                  </span>
                  <button onClick={() => setQuantity((q) => q + 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    style={{ color: "var(--text-secondary)" }}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart */}
                <button onClick={handleAddToCart}
                  className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95 border-2"
                  style={{ borderColor: "var(--brand-red)", color: "var(--brand-red)", backgroundColor: "#FDF2F3" }}>
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>

                {/* Buy Now */}
                <button onClick={handleBuyNow}
                  className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
                  style={{ backgroundColor: "var(--brand-red)", boxShadow: "0 4px 15px rgba(160,28,44,0.3)" }}>
                  Buy Now →
                </button>
              </div>
            </div>

            {/* Offers */}
            <div className="rounded-2xl p-4 mb-6 border"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}>
              <p className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>🎁 Exclusive Offers</p>
              <div className="space-y-2">
                {[
                  { Icon: CreditCard, text: "Extra 10% OFF on Prepaid Orders" },
                  { Icon: Truck, text: "FREE Delivery on all orders" },
                  { Icon: Package, text: "7-Day Easy Returns & Replacement" },
                ].map(({ Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "var(--brand-gold)" }} />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-4 gap-3 mb-6 rounded-2xl p-4 border"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}>
              {[
                { Icon: Leaf, title: "100%", sub: "Natural" },
                { Icon: Shield, title: "No", sub: "Additives" },
                { Icon: CheckCircle2, title: "Stone", sub: "Ground" },
                { Icon: Zap, title: "Fresh", sub: "Packed" },
              ].map(({ Icon, title, sub }, i) => (
                <div key={i} className="text-center flex flex-col items-center">
                  <Icon className="w-5 h-5 mb-1" style={{ color: "var(--brand-gold)" }} />
                  <p className="text-xs font-black" style={{ color: "var(--text-primary)" }}>{title}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{sub}</p>
                </div>
              ))}
            </div>

            {/* Accordions */}
            <div className="border-t divide-y mb-6" style={{ borderColor: "var(--border)" }}>
              {[
                { id: "description", title: "📦 Product Description", content: product.description },
                { id: "why", title: "🌿 Why Choose Ghartika?", content: "We believe in 100% purity. Our spices are stone-ground, free from fillers, artificial colors, and preservatives. Lab-tested and guaranteed fresh. Sourced directly from farmers in Maharashtra." },
                { id: "delivery", title: "🚚 Delivery & Returns", content: "Free delivery Pan India. Delivery in 3-5 business days. 7-day easy return policy — if you're not satisfied, we'll replace or refund. COD available on all orders." },
              ].map((acc) => (
                <div key={acc.id}>
                  <button onClick={() => setOpenAccordion(openAccordion === acc.id ? null : acc.id)}
                    className="w-full flex items-center justify-between py-4 text-sm font-bold transition-colors"
                    style={{ color: "var(--text-primary)" }}>
                    {acc.title}
                    {openAccordion === acc.id
                      ? <ChevronUp className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                      : <ChevronDown className="w-4 h-4" style={{ color: "var(--text-muted)" }} />}
                  </button>
                  {openAccordion === acc.id && (
                    <div className="pb-4 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {acc.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
                  You May Also Like
                </h2>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Other popular products</p>
              </div>
              <Link href="/shop"
                className="text-sm font-bold hover:underline flex items-center gap-1"
                style={{ color: "var(--brand-red)" }}>
                View All <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`}
                  className="group rounded-2xl overflow-hidden border hover:shadow-xl transition-all duration-300 flex flex-col"
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}>
                  <div className="relative overflow-hidden" style={{ height: "200px" }}>
                    <img src={p.image} alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {p.badge && (
                      <span className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full text-white"
                        style={{ backgroundColor: "var(--brand-red)" }}>
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-sm mb-1" style={{ color: "var(--text-primary)" }}>{p.name}</h3>
                    <p className="text-xs line-clamp-2 mb-3 flex-1" style={{ color: "var(--text-muted)" }}>
                      {p.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black" style={{ color: "var(--brand-red)" }}>₹{p.price}</span>
                      <span className="text-xs px-3 py-1 rounded-full font-semibold"
                        style={{ backgroundColor: "#FDF2F3", color: "var(--brand-red)", border: "1px solid #F5C6CB" }}>
                        View →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
