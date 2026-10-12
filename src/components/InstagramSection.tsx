"use client";

import Image from "next/image";

export default function InstagramSection() {
  const posts = [
    "/images/red-chili.jpg",
    "/images/turmeric.jpg",
    "/images/combo-pack.jpg",
    "/images/dal.jpg",
    "/images/recipe-main.jpg",
    "/images/paneer.jpg",
  ];

  return (
    <section className="py-16 bg-[var(--background)] border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-[var(--text-muted)] text-xs uppercase tracking-[0.2em] mb-2">Follow Us</p>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8">@ghartikaspice</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {posts.map((url, i) => (
            <a
              key={i}
              href="https://instagram.com/ghartikaspice"
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-square overflow-hidden rounded-md group relative"
            >
              <Image
                src={url}
                alt={`Ghartika Spices Instagram Post ${i + 1}`}
                fill
                sizes="(max-width: 768px) 33vw, 16vw"
                className="object-cover group-hover:scale-105 transition-transform duration-400 ease-out"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
