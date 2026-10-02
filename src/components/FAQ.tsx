"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Are your spices 100% natural with no preservatives?",
    a: "Yes, absolutely. Every spice from Ghartika is sourced from organic farms, stone-ground without heat, and packed with zero artificial colors, preservatives, or additives of any kind.",
  },
  {
    q: "What is 'Stone Grinding' and why does it matter?",
    a: "Stone grinding is a traditional method that grinds spices at low temperatures, preserving the natural oils and volatile compounds responsible for aroma and flavor. Modern machine grinding uses high heat which destroys much of this.",
  },
  {
    q: "How long do the spices stay fresh after opening?",
    a: "Store in a cool, dry place in an airtight container away from sunlight. Our spices remain peak-fresh for 8–12 months after opening, and up to 24 months if the seal is unbroken.",
  },
  {
    q: "Do you offer free shipping?",
    a: "Yes! We offer free express shipping across India on all orders above ₹999. For smaller orders, a flat shipping fee of ₹49 applies.",
  },
  {
    q: "Can I return or exchange a product?",
    a: "We have a 7-day hassle-free return policy. If you're unhappy with your order for any reason, reach out to us and we'll make it right.",
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 bg-[var(--surface-muted)] border-y border-[var(--border)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-12">
          <p className="text-[var(--brand-red)] text-xs font-semibold uppercase tracking-[0.2em] mb-3">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="flex flex-col divide-y divide-[var(--border)]">
          {faqs.map((faq, index) => (
            <div key={index} className="py-5">
              <button
                className="w-full flex items-center justify-between gap-4 text-left"
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              >
                <span className="font-semibold text-[var(--text-primary)] text-base pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 shrink-0 text-[var(--brand-red)] transition-transform duration-200 ${
                    activeIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeIndex === index && (
                <p className="mt-3 text-sm text-[var(--text-muted)] leading-relaxed pr-8">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
