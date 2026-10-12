"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="text-center max-w-md">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"
          style={{ backgroundColor: "#FDF2F3" }}
        >
          🌶️
        </div>
        <h1
          className="text-2xl font-black mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Kuch Gadbad Ho Gayi!
        </h1>
        <p
          className="text-sm mb-8 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Ek chhoti si technical problem aa gayi. Hum isko jaldi theek kar denge.
          Tab tak, page dobara try karein.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: "var(--brand-red)" }}
          >
            <RefreshCw className="w-4 h-4" />
            Dobara Try Karein
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold border transition-all hover:-translate-y-0.5"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
              backgroundColor: "var(--surface)",
            }}
          >
            <Home className="w-4 h-4" />
            Home Chalein
          </Link>
        </div>
      </div>
    </div>
  );
}
