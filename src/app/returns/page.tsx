"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { RefreshCw, CheckCircle, XCircle, Phone, Package, AlertCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" as const },
  }),
};

export default function ReturnsPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden" style={{ backgroundColor: "var(--background)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 opacity-10 blur-[100px] rounded-full" style={{ backgroundColor: "var(--brand-green)" }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 opacity-10 blur-[100px] rounded-full" style={{ backgroundColor: "var(--brand-gold)" }} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-4 border"
            style={{ backgroundColor: "#F1F8F1", color: "var(--brand-green)", borderColor: "#C8E6C9" }}
          >
            <RefreshCw className="w-4 h-4" /> Returns & Refunds
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl md:text-5xl font-black mb-4" style={{ color: "var(--text-primary)" }}
          >
            Hamari{" "}
            <span className="text-transparent bg-clip-text" style={{
              backgroundImage: "linear-gradient(to right, var(--brand-green), var(--brand-gold))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Return Policy</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}
          >
            Aapki santushti hamari zimmedari hai. Koi bhi problem ho — hum solve karenge. 🙏
          </motion.p>
        </div>
      </section>

      {/* Promise Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-3xl p-8 text-white text-center"
          style={{ background: "linear-gradient(135deg, var(--brand-green) 0%, #1B5E20 100%)" }}
        >
          <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-black mb-2">100% Satisfaction Guarantee</h2>
          <p className="text-sm opacity-85 max-w-lg mx-auto">
            Agar aapko product ki quality se koi bhi shikayat hai — hum bina sawaal ke <strong>poora refund</strong> ya <strong>replacement</strong> denge.
          </p>
        </motion.div>
      </section>

      {/* Return Window */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Clock, title: "Return Window", value: "7 Days", desc: "Delivery date ke 7 din ke andar return request karo.", color: "var(--brand-red)", bg: "#FDF2F3", border: "#F5C6CB" },
            { icon: RefreshCw, title: "Refund Time", value: "5–7 Days", desc: "Approved refund aapke account mein 5-7 business days mein.", color: "var(--brand-gold)", bg: "#FDF8EC", border: "#F5E0A0" },
            { icon: Package, title: "Replacement", value: "Free", desc: "Quality issue pe replacement bilkul free mein milegi.", color: "var(--brand-green)", bg: "#F1F8F1", border: "#C8E6C9" },
          ].map((item, i) => (
            <motion.div
              key={item.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="rounded-2xl p-6 border shadow-sm hover:shadow-lg transition-all text-center group"
              style={{ backgroundColor: item.bg, borderColor: item.border }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform" style={{ backgroundColor: "var(--surface)" }}>
                <item.icon className="w-7 h-7" style={{ color: item.color }} />
              </div>
              <p className="text-2xl font-black mb-1" style={{ color: item.color }}>{item.value}</p>
              <h3 className="font-bold text-base mb-2" style={{ color: "var(--text-primary)" }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* What's Covered / Not Covered */}
      <section className="py-16" style={{ backgroundColor: "var(--surface-muted)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl font-black text-center mb-10" style={{ color: "var(--text-primary)" }}
          >
            Kya <span style={{ color: "var(--brand-green)" }}>Covered</span> Hai & Kya <span style={{ color: "var(--brand-red)" }}>Nahi</span>
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Covered */}
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="rounded-3xl p-8 border shadow-sm"
              style={{ backgroundColor: "#F1F8F1", borderColor: "#C8E6C9" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-7 h-7" style={{ color: "var(--brand-green)" }} />
                <h3 className="text-xl font-black" style={{ color: "var(--brand-green)" }}>Return/Refund Milega</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Product quality kharab ho ya adulterated ho",
                  "Package tampered ya damaged aaya ho",
                  "Wrong product deliver hua ho",
                  "Product expire date ke paas ho",
                  "Taste ya fragrance original jaisa na ho",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--brand-green)" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Not Covered */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="rounded-3xl p-8 border shadow-sm"
              style={{ backgroundColor: "#FDF2F3", borderColor: "#F5C6CB" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <XCircle className="w-7 h-7" style={{ color: "var(--brand-red)" }} />
                <h3 className="text-xl font-black" style={{ color: "var(--brand-red)" }}>Return Nahi Milega</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "7 din ke baad return request (bina valid reason)",
                  "Product khola aur use kar liya — personal preference",
                  "Galat address dene ki wajah se delivery fail",
                  "Discount ya sale products (clearly marked)",
                  "Product packaging loose ho (seal intact ho)",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--brand-red)" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How to Return */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-3xl font-black text-center mb-10" style={{ color: "var(--text-primary)" }}
        >
          Return Kaise <span style={{ color: "var(--brand-red)" }}>Karein?</span>
        </motion.h2>
        <div className="relative">
          {/* Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 hidden md:block" style={{ backgroundColor: "var(--border)" }} />
          <div className="flex flex-col gap-6">
            {[
              { step: "01", title: "Humse Contact Karo", desc: "WhatsApp ya email pe apna Order ID aur problem photo ke saath bhejo.", icon: Phone },
              { step: "02", title: "Request Review Karenge", desc: "24 ghante ke andar hamari team aapki request review karegi.", icon: CheckCircle },
              { step: "03", title: "Pickup ya Refund", desc: "Approved hone par — replacement dispatch ya refund initiate ho jaayega.", icon: Package },
              { step: "04", title: "Refund Credited", desc: "5–7 business days mein original payment method pe refund aayega.", icon: RefreshCw },
            ].map((item, i) => (
              <motion.div
                key={item.step} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="flex items-start gap-6 md:pl-20 relative"
              >
                <div className="absolute left-4 -translate-x-1/2 w-8 h-8 rounded-full hidden md:flex items-center justify-center text-white text-xs font-black" style={{ backgroundColor: "var(--brand-red)" }}>
                  {item.step}
                </div>
                <div className="rounded-2xl p-6 border w-full shadow-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}>
                  <div className="flex items-center gap-3 mb-2">
                    <item.icon className="w-5 h-5" style={{ color: "var(--brand-red)" }} />
                    <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>{item.title}</h3>
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Note */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="rounded-3xl p-6 border flex items-start gap-4"
          style={{ backgroundColor: "#FDF8EC", borderColor: "#F5E0A0" }}
        >
          <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: "var(--brand-gold)" }} />
          <div>
            <h4 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>Ek Zaroori Baat</h4>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Return ke liye hamesha apna <strong>Order ID</strong> aur product ki <strong>clear photo</strong> zaroor bhejo —
              isse process fast ho jaata hai. WhatsApp: <strong>+91 98765 43210</strong>
            </p>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-14 text-white" style={{ backgroundColor: "var(--brand-brown)" }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-3">Problem Hai? Hum Hain! 🙏</h2>
          <p className="mb-6 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
            Return ya refund ke liye directly humse baat karo — hum hamesha ready hain.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/contact" className="inline-flex items-center gap-2 text-white px-7 py-3 rounded-full font-bold border-2 border-white/30 hover:border-white transition-all">
              <Phone className="w-4 h-4" /> Contact Karo
            </Link>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold transition-all"
              style={{ backgroundColor: "#25D366", color: "white" }}>
              WhatsApp →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
