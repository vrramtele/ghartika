"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ComboSection() {
  return (
    <section className="py-20 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.1)] border border-[var(--border)]">
            <img
              src="https://images.unsplash.com/photo-1599909696714-38c29db26c8e?q=80&w=900&auto=format&fit=crop"
              alt="Ghartika Combo Pack"
              className="w-full h-[380px] object-cover"
            />
            <div className="absolute top-5 left-5">
              <span className="bg-[var(--brand-gold)] text-white text-xs font-bold px-3 py-1.5 rounded tracking-wide">
                Save 20%
              </span>
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-[var(--brand-red)] text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                Best Value
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] leading-tight mb-4">
                The Maharashtra Jumbo Combo
              </h2>
              <div className="h-px w-12 bg-[var(--brand-red)] opacity-40 mb-6" />
              <p className="text-[var(--text-secondary)] text-base leading-relaxed">
                Get our complete range of everyday essentials plus our signature Special Garam Masala — everything you need for authentic Indian cooking, at a price that makes sense.
              </p>
            </div>

            <ul className="flex flex-col gap-2.5">
              {["Red Chili Powder (250g)", "Turmeric Powder (250g)", "Coriander Powder (250g)", "Special Garam Masala (200g)", "Cumin Powder (200g)"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-red)] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-3xl font-bold text-[var(--text-primary)]">₹999</span>
              <span className="text-base text-[var(--text-muted)] line-through">₹1,249</span>
              <span className="text-sm font-semibold text-[var(--brand-green)] bg-green-50 px-2 py-0.5 rounded">
                Save ₹250
              </span>
            </div>

            <Link
              href="/product/p7"
              className="inline-flex items-center gap-2 bg-[var(--brand-red)] text-white px-7 py-3.5 text-sm font-semibold rounded hover:bg-[var(--brand-brown)] transition-colors duration-200 w-max group"
            >
              Get the Combo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
