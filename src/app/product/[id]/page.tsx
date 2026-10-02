"use client";

import { use, useState, useEffect } from "react";
import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductContext";
import {
  ShoppingCart,
  CheckCircle2,
  Minus,
  Plus,
  CreditCard,
  Share2,
  ChevronDown,
  ChevronUp,
  Tag,
  Truck,
  Leaf,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart } = useCart();
  const { products } = useProducts();
  
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");
  const [mounted, setMounted] = useState(false);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState({ d: 2, h: 23, m: 58, s: 48 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const product = products.find((p) => p.id === id);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { d, h, m, s } = prev;
        if (s > 0) s--;
        else {
          s = 59;
          if (m > 0) m--;
          else {
            m = 59;
            if (h > 0) h--;
            else {
              h = 23;
              if (d > 0) d--;
            }
          }
        }
        return { d, h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  if (!product) {
    return (
      <main className="min-h-screen flex flex-col bg-[var(--background)]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
        </div>
      </main>
    );
  }

  const originalPrice = product.originalPrice || Math.round(product.price * 1.25);
  const saveAmount = originalPrice - product.price;
  const discountPercent = Math.round((saveAmount / originalPrice) * 100);

  // Mock gallery images (since we only have 1 image per product in DB right now)
  const gallery = [product.image, product.image, product.image, product.image];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToCart(product);
    alert("Added to cart!");
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) addToCart(product);
    router.push("/checkout");
  };

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F5F0" }}>
      <Header />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full mt-20">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* LEFT: Image Gallery */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            <div className="rounded-xl overflow-hidden shadow-sm bg-white aspect-square border" style={{ borderColor: "var(--border-light)" }}>
              <img
                src={gallery[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === idx ? "border-[var(--brand-green)]" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="lg:w-1/2 flex flex-col">
            
            {/* Top Tags */}
            <div className="flex gap-2 mb-4">
              {["Aroma", "Color", "Taste Difference"].map((tag) => (
                <span key={tag} className="text-xs font-semibold px-3 py-1 rounded-full border bg-white text-gray-700" style={{ borderColor: "var(--border)" }}>
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl font-black mb-4 text-[#1E3932]">{product.name} | 100% Organic</h1>

            {/* Feature Description Box */}
            <div className="border border-dashed border-[#1E3932] p-4 rounded-lg mb-6 bg-white/50">
              <p className="text-[#1E3932] font-medium leading-relaxed text-sm">
                Add this fiery touch to your meals and enjoy the true taste of home—rich, bold, and unforgettable.
              </p>
            </div>

            {/* Price Block */}
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <span className="flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-md" style={{ backgroundColor: "#E6F4EA", color: "#137333" }}>
                <Tag className="w-3.5 h-3.5" /> You Save ₹{saveAmount}.00
              </span>
              <span className="text-3xl font-black text-[#D32F2F]">₹{product.price}.00</span>
              <span className="text-lg line-through text-gray-500 font-semibold">₹{originalPrice}.00</span>
              <span className="text-xs font-bold text-white px-2 py-1 rounded shadow-sm" style={{ backgroundColor: "#EF5350" }}>
                {discountPercent}% OFF
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-6 font-medium">Taxes included. <span className="underline cursor-pointer">Shipping</span> calculated at checkout.</p>

            {/* Timer */}
            <div className="rounded-xl p-4 mb-6 flex flex-col items-center border shadow-sm" style={{ backgroundColor: "#FCECD7", borderColor: "#F7CFA1" }}>
              <p className="text-[#B95A0B] font-bold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Spice Offers Ending In:
              </p>
              <div className="flex gap-3">
                {[
                  { v: timeLeft.d, l: "Days" },
                  { v: timeLeft.h, l: "Hours" },
                  { v: timeLeft.m, l: "Min" },
                  { v: timeLeft.s, l: "Sec" },
                ].map((t, i) => (
                  <div key={i} className="bg-white px-3 py-2 rounded-lg text-center shadow-sm min-w-[70px] border" style={{ borderColor: "#F7CFA1" }}>
                    <div className="text-xl font-black text-[#D32F2F]">{t.v.toString().padStart(2, '0')}</div>
                    <div className="text-[10px] uppercase font-bold text-gray-500">{t.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Size</p>
              <button className="px-6 py-2.5 rounded-lg border-2 font-bold text-[#1E3932] transition-colors" style={{ backgroundColor: "#E8F5E9", borderColor: "#4CAF50" }}>
                {product.weight}
              </button>
            </div>

            {/* Exclusive Offers */}
            <div className="mb-8">
              <h3 className="text-lg font-black text-[#1E3932] mb-3 border-b pb-2 border-gray-300">Exclusive Offers</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm font-bold text-[#1E3932]">
                  <CreditCard className="w-5 h-5 text-gray-500" /> Extra 10% OFF on Prepaid Orders
                </li>
                <li className="flex items-center gap-3 text-sm font-bold text-[#1E3932]">
                  <Truck className="w-5 h-5 text-gray-500" /> Free Shipping on Order Above ₹999
                </li>
              </ul>
            </div>

            {/* Actions: Qty, Add to Cart, Buy Now */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-gray-700 mb-2">Quantity</p>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Quantity */}
                <div className="flex items-center border border-gray-300 rounded-lg bg-transparent h-12">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 text-gray-500 hover:text-black">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold w-6 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="px-4 text-gray-500 hover:text-black">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Add To Cart */}
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 h-12 flex items-center justify-center gap-2 border-2 rounded-lg font-bold text-[#1E3932] hover:bg-gray-50 transition-colors"
                  style={{ borderColor: "#1E3932" }}
                >
                  <ShoppingCart className="w-4 h-4" /> Add To Cart
                </button>

                {/* Buy Now */}
                <button 
                  onClick={handleBuyNow}
                  className="flex-1 h-12 rounded-lg font-bold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2 shadow-md"
                  style={{ backgroundColor: "#1E3932" }}
                >
                  BUY NOW <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 4-Grid Trust Badges */}
            <div className="grid grid-cols-4 gap-2 mb-8 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              {[
                { icon: Leaf, title: "100%", sub: "Natural & Pure" },
                { icon: Shield, title: "No Artificial", sub: "Colors/Preservatives" },
                { icon: CheckCircle2, title: "Stone Ground", sub: "For Rich Aroma" },
                { icon: Zap, title: "Hygienically", sub: "Packed For Freshness" },
              ].map((badge, i) => (
                <div key={i} className="text-center flex flex-col items-center border-r last:border-0 border-gray-100 px-1">
                  <badge.icon className="w-6 h-6 mb-2" style={{ color: "#D4AF37" }} />
                  <p className="font-black text-[11px] leading-tight text-[#1E3932] mb-0.5">{badge.title}</p>
                  <p className="text-[9px] text-gray-500 leading-tight font-medium uppercase">{badge.sub}</p>
                </div>
              ))}
            </div>

            {/* Accordions */}
            <div className="border-y border-gray-200 divide-y divide-gray-200 mb-6">
              {[
                { id: "description", title: "Product Description", content: product.description || "Authentic spices packed with flavor and aroma. Sourced directly from farms and stone-ground to preserve natural oils." },
                { id: "why", title: "Why Choose Us", content: "At Ghartika Spices, we believe in 100% purity. Our spices are free from fillers, artificial colors, and preservatives. Lab-tested and guaranteed fresh." }
              ].map((acc) => (
                <div key={acc.id} className="py-1">
                  <button 
                    onClick={() => setOpenAccordion(openAccordion === acc.id ? null : acc.id)}
                    className="w-full flex items-center justify-between py-3 text-sm font-bold text-[#1E3932] hover:opacity-80"
                  >
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-gray-400" /> {acc.title}</span>
                    {openAccordion === acc.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {openAccordion === acc.id && (
                    <div className="pb-4 pt-1 text-sm text-gray-600 leading-relaxed px-6">
                      {acc.content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Share */}
            <button className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#1E3932] transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>

          </div>
        </div>
      </div>
    </main>
  );
}
