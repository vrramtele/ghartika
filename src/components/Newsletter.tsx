"use client";

import { ArrowRight } from "lucide-react";

export default function Newsletter() {
  return (
    <section className="py-20 bg-[var(--brand-red)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-red-200 text-xs font-semibold uppercase tracking-[0.2em] mb-4">Newsletter</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
          Get 10% Off Your First Order
        </h2>
        <p className="text-red-100 text-base mb-8 leading-relaxed">
          Subscribe for exclusive offers, authentic recipes, and spice stories from the hills.
        </p>
        <form
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="Enter your email address"
            required
            className="flex-grow px-4 py-3 rounded text-sm bg-white/95 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border-0 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-[var(--brand-brown)] text-white px-6 py-3 text-sm font-semibold rounded hover:bg-[var(--text-primary)] transition-colors duration-200 shrink-0 group"
          >
            Subscribe
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>
        <p className="text-red-200 text-xs mt-4 opacity-70">No spam, ever. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
