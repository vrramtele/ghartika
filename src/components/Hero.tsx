"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Leaf, Star, Truck, Award } from "lucide-react";
import { useState, useEffect } from "react";

const slides = [
  {
    headline: "The Taste of a",
    highlight: "Mother's Kitchen",
    sub: "Pure, stone-ground spices from the farms of Maharashtra. No additives. No shortcuts.",
    image: "/images/red-chili.jpg",
    badge: "🌶️ Maharashtra's Finest",
    color: "from-[#5C3317]/80",
  },
  {
    headline: "Stone Ground.",
    highlight: "Naturally Pure.",
    sub: "Every masala is cold-ground on stone — preserving aroma, nutrients and that authentic home flavour.",
    image: "/images/turmeric.jpg",
    badge: "✨ 100% Natural",
    color: "from-[#A01C2C]/80",
  },
  {
    headline: "Straight from",
    highlight: "Farm to Kitchen",
    sub: "We source directly from trusted farmers — no middlemen, no compromises on quality or freshness.",
    image: "/images/coriander.jpg",
    badge: "🌿 Farm Direct",
    color: "from-[#2E7D32]/80",
  },
];

const stats = [
  { value: "50K+", label: "Happy Families" },
  { value: "100%", label: "Pure & Natural" },
  { value: "4.9★", label: "Avg Rating" },
  { value: "Free", label: "Delivery" },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setAnimating(false);
      }, 400);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const slide = slides[current];

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden" style={{ backgroundColor: "var(--surface-muted)" }}>

      {/* ── Announcement Bar ── */}
      <div className="relative z-20 text-white text-center text-xs font-semibold py-2.5 px-4 flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(90deg, var(--brand-red), var(--brand-brown))" }}>
        <Truck className="w-3.5 h-3.5 flex-shrink-0" />
        <span>🎉 FREE Delivery on all orders above ₹299 · COD Available Pan India</span>
        <span className="hidden sm:inline">·</span>
        <Link href="/shop" className="hidden sm:inline underline underline-offset-2 hover:no-underline font-bold">
          Shop Now →
        </Link>
      </div>

      {/* ── Main Hero ── */}
      <div className="flex-1 grid lg:grid-cols-2 items-center gap-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full">

        {/* ── LEFT: Content ── */}
        <div className={`flex flex-col gap-6 lg:pr-12 transition-all duration-400 ${animating ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"}`}
          style={{ transition: "opacity 0.4s, transform 0.4s" }}>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 self-start">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold border"
              style={{ backgroundColor: "#FDF2F3", color: "var(--brand-red)", borderColor: "#F5C6CB" }}>
              {slide.badge}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight"
            style={{ color: "var(--text-primary)" }}>
            {slide.headline}{" "}
            <span className="relative">
              <span style={{ color: "var(--brand-red)" }}>{slide.highlight}</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none"
                style={{ color: "var(--brand-gold)" }}>
                <path d="M0 6 Q50 0 100 5 Q150 10 200 4" stroke="currentColor" strokeWidth="3"
                  fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          {/* Sub */}
          <p className="text-base sm:text-lg leading-relaxed max-w-lg" style={{ color: "var(--text-secondary)" }}>
            {slide.sub}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link href="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold tracking-wide rounded-full text-white transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-xl"
              style={{ backgroundColor: "var(--brand-red)", boxShadow: "0 4px 15px rgba(160,28,44,0.3)" }}>
              Shop Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/about"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold tracking-wide rounded-full transition-all duration-200 hover:-translate-y-0.5"
              style={{ border: "2px solid var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--surface)" }}>
              Our Story
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-4 pt-5 mt-2" style={{ borderTop: "1px solid var(--border)" }}>
            {[
              { Icon: Leaf, text: "100% Natural", color: "var(--brand-green)" },
              { Icon: ShieldCheck, text: "No Additives", color: "var(--brand-red)" },
              { Icon: Award, text: "Stone Ground", color: "var(--brand-gold)" },
            ].map(({ Icon, text, color }) => (
              <div key={text} className="flex items-center gap-1.5">
                <Icon className="w-4 h-4" style={{ color }} />
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Image ── */}
        <div className="relative flex justify-center lg:justify-end mt-8 lg:mt-0">
          <div className="relative w-full max-w-md lg:max-w-lg">

            {/* Decorative circle */}
            <div className="absolute inset-0 rounded-3xl scale-105 opacity-10"
              style={{ backgroundColor: "var(--brand-red)", filter: "blur(40px)" }} />

            {/* Main image */}
            <div className={`relative rounded-3xl overflow-hidden transition-all duration-400 ${animating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
              style={{
                boxShadow: "0 30px 80px rgba(0,0,0,0.15)",
                border: "2px solid var(--border)",
                transition: "opacity 0.4s, transform 0.4s",
              }}>
              <img
                src={slide.image}
                alt="Ghartika Premium Spices"
                className="w-full object-cover"
                style={{ height: "440px" }}
              />
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${slide.color} to-transparent opacity-60`} />
            </div>

            {/* Floating: Rating card */}
            <div className="absolute -bottom-5 -left-5 rounded-2xl px-4 py-3 shadow-2xl"
              style={{ backgroundColor: "white", border: "1px solid var(--border-light)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: "#FDF2F3" }}>
                  ⭐
                </div>
                <div>
                  <div className="flex text-yellow-400 mb-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                  </div>
                  <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>4.9 / 5.0</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>15,000+ Reviews</p>
                </div>
              </div>
            </div>

            {/* Floating: Free Delivery */}
            <div className="absolute -top-4 -right-4 rounded-2xl px-4 py-3 shadow-xl"
              style={{ backgroundColor: "var(--brand-red)", color: "white" }}>
              <p className="text-xs font-black">FREE</p>
              <p className="text-[10px] opacity-80">Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Slide Indicators ── */}
      <div className="flex justify-center gap-2 pb-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setAnimating(true); setTimeout(() => { setCurrent(i); setAnimating(false); }, 300); }}
            className="transition-all duration-300"
            style={{
              width: current === i ? "28px" : "8px",
              height: "8px",
              borderRadius: "99px",
              backgroundColor: current === i ? "var(--brand-red)" : "var(--border)",
              border: "none",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      {/* ── Stats Bar ── */}
      <div style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--border)]">
            {stats.map(({ value, label }) => (
              <div key={label} className="py-5 px-6 text-center group hover:bg-[#FDF2F3] transition-colors">
                <p className="text-2xl font-black" style={{ color: "var(--brand-red)" }}>{value}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
