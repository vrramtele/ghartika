"use client";

import { Leaf, Hammer, ShieldX, Award, Truck, Heart } from "lucide-react";

const items = [
  {
    icon: <Hammer className="w-6 h-6 text-[var(--brand-red)]" />,
    title: "Traditional Stone Grinding",
    desc: "Ground at low temperatures to lock in natural oils, color, and aroma.",
  },
  {
    icon: <Leaf className="w-6 h-6 text-[var(--brand-green)]" />,
    title: "Farm Fresh & Organic",
    desc: "Sourced directly from certified organic farms across Maharashtra.",
  },
  {
    icon: <ShieldX className="w-6 h-6 text-[var(--brand-red)]" />,
    title: "Zero Preservatives",
    desc: "Pure spices. No artificial colors, additives, or preservatives. Ever.",
  },
  {
    icon: <Award className="w-6 h-6 text-[var(--brand-gold)]" />,
    title: "Quality Certified",
    desc: "Every batch is tested for purity and potency before it reaches you.",
  },
  {
    icon: <Truck className="w-6 h-6 text-[var(--brand-brown)]" />,
    title: "Fast, Safe Delivery",
    desc: "Packed air-tight and shipped swiftly to your doorstep across India.",
  },
  {
    icon: <Heart className="w-6 h-6 text-[var(--brand-red)]" />,
    title: "Made With Love",
    desc: "Every pack is a tribute to the traditions of Indian home kitchens.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-[var(--brand-red)] text-xs font-semibold uppercase tracking-[0.2em] mb-3">Why Ghartika</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] leading-tight mb-4">
            The Ghartika Promise
          </h2>
          <div className="h-px w-16 bg-[var(--brand-red)] opacity-40 mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex gap-5 p-6 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow duration-300"
            >
              <div className="shrink-0 w-12 h-12 bg-[var(--surface-muted)] rounded-lg flex items-center justify-center border border-[var(--border-light)]">
                {item.icon}
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-1.5 text-base">{item.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
