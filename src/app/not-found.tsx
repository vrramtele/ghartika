"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { Home, ShoppingBag, Phone } from "lucide-react";

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--background)" }}
    >
      <Header />

      <div className="flex-1 flex items-center justify-center pt-24 pb-16 px-4">
        <div className="text-center max-w-lg w-full">
          {/* Animated 404 */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            className="relative mb-6"
          >
            <p
              className="text-[140px] md:text-[180px] font-black leading-none select-none"
              style={{
                background: "linear-gradient(135deg, var(--brand-red) 0%, var(--brand-gold) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              404
            </p>
            <motion.span
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
            >
              🌶️
            </motion.span>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-black mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Yeh Page Nahi Mila!
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-base mb-8"
            style={{ color: "var(--text-secondary)" }}
          >
            Lagta hai aap galat raste pe aa gaye. Koi baat nahi,{" "}
            <span style={{ color: "var(--brand-red)" }}>ghar wapas chalte hain!</span>
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 text-white px-8 py-3 rounded-full font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ backgroundColor: "var(--brand-red)" }}
            >
              <Home className="w-4 h-4" />
              Home Chalein
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold border transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
                backgroundColor: "var(--surface)",
              }}
            >
              <ShoppingBag className="w-4 h-4" />
              Shop Dekho
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold border transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
                backgroundColor: "var(--surface)",
              }}
            >
              <Phone className="w-4 h-4" />
              Help
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
