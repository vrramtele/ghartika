"use client";

import { Star, CheckCircle2 } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Neha K.",
    location: "Pune",
    rating: 5,
    text: "Market wale masalon se bilkul alag hai! Haldi ki khushboo aur mirchi ka color ekdum natural hai. Khana banate time smell se hi pata chal jata hai ki stone-ground aur pure hai. Ghar me sabko taste bahut pasand aaya. Must try!",
    image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Manish Rajput",
    location: "Delhi",
    rating: 5,
    text: "Sunday chicken curry ke liye inka Special Garam Masala order kiya tha. Bhai maza aa gaya! Sirf ek chammach daala aur poore ghar me mehek aane lagi. Quality bahut acchi hai. Packing bhi ekdum mast hai.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Sunita Reddy",
    location: "Hyderabad",
    rating: 5,
    text: "First time I tried a D2C spice brand. Dhaniya powder is very fresh and fragrant. Price thoda high hai local market se but pure quality ki wajah se totally worth it. Delivery bhi 2 din me aa gayi.",
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
