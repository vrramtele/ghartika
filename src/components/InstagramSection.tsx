"use client";

export default function InstagramSection() {
  const posts = [
    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581600140682-d4e68c8cde32?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1615486171448-4fbaf0c6095d?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1599909696714-38c29db26c8e?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop",
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
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-square overflow-hidden rounded-md group"
            >
              <img
                src={url}
                alt={`Post ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400 ease-out"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
