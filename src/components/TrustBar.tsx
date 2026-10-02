"use client";

import { Leaf, Package, Shield } from "lucide-react";

const pillars = [
  {
    icon: <Leaf className="w-7 h-7" style={{ color: "var(--brand-green)" }} />,
    title: "Sourced from Nature",
    desc: "We work directly with small-scale farmers in the Kumaon and Garhwal hills.",
  },
  {
    icon: <Shield className="w-7 h-7" style={{ color: "var(--brand-red)" }} />,
    title: "Purity Guaranteed",
    desc: "No blending, no fillers. What you get is 100% of what the label says.",
  },
  {
    icon: <Package className="w-7 h-7" style={{ color: "var(--brand-gold)" }} />,
    title: "Sealed for Freshness",
    desc: "Air-tight premium packaging that keeps your spices fresh for up to 12 months.",
  },
];

export default function TrustBar() {
  return (
    <section
      className="py-12"
      style={{ backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0" style={{ border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
          {pillars.map((p, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center gap-4 px-8 py-8"
              style={{
                backgroundColor: "var(--surface)",
                borderRight: i < pillars.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--surface-muted)", border: "1px solid var(--border)" }}
              >
                {p.icon}
              </div>
              <h3 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>{p.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
