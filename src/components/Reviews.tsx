"use client";

import { Star, CheckCircle2 } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "The mirchi powder is extraordinary. It brings back the exact taste of my nani's cooking. Deep color, perfect heat, and no artificial smell. Completely hooked.",
    image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Rahul Verma",
    location: "Delhi",
    rating: 5,
    text: "I've been using Ghartika's Haldi and Dhaniya powders for 6 months. You only need half the quantity compared to market brands. The aroma is just incredible.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Anjali Desai",
    location: "Ahmedabad",
    rating: 5,
    text: "Their Garam Masala is a game-changer for my Sunday curries. Premium quality, beautiful packaging, and lightning-fast delivery. Highly recommend.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
  },
];

export default function Reviews() {
  return (
    <section className="py-20 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-[var(--brand-red)] text-xs font-semibold uppercase tracking-[0.2em] mb-3">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
            What Our Customers Say
          </h2>
          <div className="h-px w-16 bg-[var(--brand-red)] opacity-40 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-7 flex flex-col gap-5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.07)] transition-shadow duration-300"
            >
              {/* Stars */}
              <div className="flex gap-0.5 text-yellow-400">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>

              {/* Review text */}
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed flex-grow">
                "{review.text}"
              </p>

              {/* Reviewer */}
              <div className="flex items-center gap-4 pt-5 border-t border-[var(--border-light)]">
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-[var(--border)]"
                />
                <div>
                  <p className="font-semibold text-[var(--text-primary)] text-sm">{review.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-[var(--brand-green)]" />
                    <p className="text-xs text-[var(--text-muted)]">Verified · {review.location}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
