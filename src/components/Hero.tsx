"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Leaf, Star } from "lucide-react";

export default function Hero() {
  return (
    <section style={{ backgroundColor: "var(--surface-muted)", borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 items-center gap-12 py-16 lg:py-24">

          {/* ── LEFT: Text ── */}
          <div className="flex flex-col gap-7">

            {/* Eyebrow */}
            <div className="flex items-center gap-2">
              <span className="h-px w-8" style={{ backgroundColor: "var(--brand-red)", opacity: 0.6 }} />
              <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--brand-red)" }}>
                Maharashtra's Finest
              </span>
              <span className="h-px w-8" style={{ backgroundColor: "var(--brand-red)", opacity: 0.6 }} />
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight" style={{ color: "var(--text-primary)" }}>
              The Taste of a{" "}
              <span style={{ color: "var(--brand-red)" }}>Mother's Kitchen</span>
            </h1>

            {/* Sub */}
            <p className="text-lg leading-relaxed max-w-lg" style={{ color: "var(--text-secondary)" }}>
              Pure, stone-ground spices sourced from the farms of Maharashtra.
              No additives. No shortcuts. Just authentic flavor, delivered to your door.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold tracking-wide rounded text-white transition-all duration-200 group"
                style={{ backgroundColor: "var(--brand-red)" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--brand-red-hover)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--brand-red)")}
              >
                Explore Collection
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold tracking-wide rounded transition-all duration-200"
                style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
              >
                Our Story
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6 pt-6 mt-2" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4" style={{ color: "var(--brand-green)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>100% Natural</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" style={{ color: "var(--brand-red)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>No Preservatives</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" style={{ color: "var(--brand-gold)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Stone Ground</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Image ── */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-lg">
              {/* Main image */}
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12)", border: "1px solid var(--border)" }}
              >
                <img
                  src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=900&auto=format&fit=crop"
                  alt="Premium Ghartika Spices"
                  className="w-full object-cover"
                  style={{ height: "460px" }}
                />

                {/* Floating rating card */}
                <div
                  className="absolute bottom-5 left-5 rounded-lg px-5 py-4"
                  style={{ backgroundColor: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", border: "1px solid var(--border-light)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>4.9 / 5</p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>15,000+ Happy Families</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
