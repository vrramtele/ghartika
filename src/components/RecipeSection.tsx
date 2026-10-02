"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function RecipeSection() {
  return (
    <section className="py-20 bg-[var(--surface-muted)] border-y border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Text - Left */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-[var(--brand-red)] text-xs font-semibold uppercase tracking-[0.2em] mb-3">From the Kitchen</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] leading-tight mb-4">
                Recipes That Celebrate Real Spices
              </h2>
              <div className="h-px w-12 bg-[var(--brand-red)] opacity-40 mb-6" />
              <p className="text-[var(--text-secondary)] text-base leading-relaxed">
                Our spices are made to be cooked with. Explore our curated recipes — from a slow-cooked Dal Makhani to a Pahadi Aloo Tamatar — and taste the difference that pure, stone-ground spices make.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Dal Makhani", tag: "45 mins", img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop" },
                { name: "Paneer Butter Masala", tag: "30 mins", img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc0?q=80&w=400&auto=format&fit=crop" },
              ].map((r) => (
                <div key={r.name} className="rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--surface)] group hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-shadow duration-300">
                  <div className="h-28 overflow-hidden">
                    <img src={r.img} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-1">{r.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">⏱ {r.tag}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[var(--brand-red)] text-sm font-semibold hover:underline underline-offset-4 group w-max"
            >
              View All Recipes
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Image - Right */}
          <div className="rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.1)] border border-[var(--border)]">
            <img
              src="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=900&auto=format&fit=crop"
              alt="Spice Recipe"
              className="w-full h-[420px] object-cover"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
