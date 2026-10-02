"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { Truck, Clock, MapPin, Package, CheckCircle, Phone, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" as const },
  }),
};

export default function ShippingPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden" style={{ backgroundColor: "var(--background)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-80 h-80 opacity-10 blur-[100px] rounded-full" style={{ backgroundColor: "var(--brand-red)" }} />
          <div className="absolute bottom-0 right-0 w-80 h-80 opacity-10 blur-[100px] rounded-full" style={{ backgroundColor: "var(--brand-gold)" }} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-4 border"
            style={{ backgroundColor: "#FDF2F3", color: "var(--brand-red)", borderColor: "#F5C6CB" }}
          >
            <Truck className="w-4 h-4" /> Delivery & Shipping
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl md:text-5xl font-black mb-4" style={{ color: "var(--text-primary)" }}
          >
            Shipping{" "}
            <span className="text-transparent bg-clip-text" style={{
              backgroundImage: "linear-gradient(to right, var(--brand-red), var(--brand-gold))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Information</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}
          >
            Hum poore India mein deliver karte hain — fast, safe, aur guaranteed. 📦
          </motion.p>
        </div>
      </section>

      {/* Delivery Timeline Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Package, title: "Order Processing", time: "Same Day", desc: "Aapka order place hone ke baad same day process hota hai (orders before 2 PM).", color: "var(--brand-red)", bg: "#FDF2F3", border: "#F5C6CB" },
            { icon: Truck, title: "Standard Delivery", time: "3–5 Days", desc: "India ke sabhi major cities aur states mein 3 se 5 business days mein delivery.", color: "var(--brand-gold)", bg: "#FDF8EC", border: "#F5E0A0" },
            { icon: CheckCircle, title: "Express Delivery", time: "1–2 Days", desc: "Select cities mein express delivery available hai extra charge ke saath.", color: "var(--brand-green)", bg: "#F1F8F1", border: "#C8E6C9" },
          ].map((item, i) => (
            <motion.div
              key={item.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="rounded-2xl p-6 border shadow-sm hover:shadow-lg transition-all text-center group"
              style={{ backgroundColor: item.bg, borderColor: item.border }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform" style={{ backgroundColor: "var(--surface)" }}>
                <item.icon className="w-7 h-7" style={{ color: item.color }} />
              </div>
              <p className="text-2xl font-black mb-1" style={{ color: item.color }}>{item.time}</p>
              <h3 className="font-bold text-base mb-2" style={{ color: "var(--text-primary)" }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Shipping Charges */}
      <section className="py-16" style={{ backgroundColor: "var(--surface-muted)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl font-black text-center mb-10" style={{ color: "var(--text-primary)" }}
          >
            Delivery <span style={{ color: "var(--brand-red)" }}>Charges</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-3xl overflow-hidden border shadow-md"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--brand-red)", color: "white" }}>
                  <th className="text-left px-6 py-4 font-bold">Order Value</th>
                  <th className="text-left px-6 py-4 font-bold">Delivery Type</th>
                  <th className="text-right px-6 py-4 font-bold">Charge</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { order: "₹500 se upar", type: "Standard Delivery", charge: "FREE 🎉", green: true },
                  { order: "₹500 se neeche", type: "Standard Delivery", charge: "₹49", green: false },
                  { order: "Koi bhi amount", type: "Express Delivery", charge: "₹99", green: false },
                ].map((row, i) => (
                  <tr key={i} className="border-t" style={{ borderColor: "var(--border-light)" }}>
                    <td className="px-6 py-4 font-medium" style={{ color: "var(--text-primary)" }}>{row.order}</td>
                    <td className="px-6 py-4" style={{ color: "var(--text-secondary)" }}>{row.type}</td>
                    <td className="px-6 py-4 text-right font-bold" style={{ color: row.green ? "var(--brand-green)" : "var(--text-primary)" }}>{row.charge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
          <p className="text-center text-sm mt-4" style={{ color: "var(--text-muted)" }}>
            * ₹500+ ke orders par FREE delivery poore India mein
          </p>
        </div>
      </section>

      {/* Coverage & Tracking */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Coverage */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="rounded-3xl p-8 border shadow-sm"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FDF2F3" }}>
                <MapPin className="w-5 h-5" style={{ color: "var(--brand-red)" }} />
              </div>
              <h3 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>Delivery Coverage</h3>
            </div>
            <ul className="space-y-3">
              {[
                "📍 Poore India mein — 28 states, 700+ cities",
                "🏙️ Metro cities: Mumbai, Delhi, Bangalore, Pune, Hyderabad",
                "🏘️ Tier-2 cities bhi cover hain",
                "🌿 Remote areas mein 5–7 days lag sakte hain",
                "🚫 Sirf J&K aur Andaman mein limited service",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Tracking */}
          <motion.div
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="rounded-3xl p-8 border shadow-sm"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#F1F8F1" }}>
                <Clock className="w-5 h-5" style={{ color: "var(--brand-green)" }} />
              </div>
              <h3 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>Order Tracking</h3>
            </div>
            <ul className="space-y-3">
              {[
                "📱 Order place hone ke baad phone pe update milega",
                "🚚 Tracking number WhatsApp pe bheja jaayega",
                "📦 Delivery confirmation SMS milega",
                "📞 Koi bhi problem ho toh humse call karo",
                "⏰ Mon–Sat: 9 AM–7 PM support available",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-3xl p-8 border"
          style={{ backgroundColor: "#FDF8EC", borderColor: "#F5E0A0" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <AlertCircle className="w-6 h-6" style={{ color: "var(--brand-gold)" }} />
            <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Important Notes</h3>
          </div>
          <ul className="space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
            <li>• Orders before 2 PM same day dispatch hote hain, baad mein next business day.</li>
            <li>• Public holidays aur Sundays ko dispatch nahi hota.</li>
            <li>• Delivery estimate business days mein hai (Sundays exclude).</li>
            <li>• Agar package damaged aata hai, turant humse contact karo with photo.</li>
            <li>• Incomplete address ki wajah se delay ke liye hum responsible nahi hain.</li>
          </ul>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-14 text-white" style={{ backgroundColor: "var(--brand-brown)" }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-3">Aur Sawaal Hai? 🌶️</h2>
          <p className="mb-6 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
            Delivery ke baare mein koi confusion ho toh hum hain!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/contact" className="inline-flex items-center gap-2 text-white px-7 py-3 rounded-full font-bold border-2 border-white/30 hover:border-white transition-all">
              <Phone className="w-4 h-4" /> Contact Karo
            </Link>
            <Link href="/shop" className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold transition-all"
              style={{ backgroundColor: "var(--brand-gold)", color: "var(--brand-brown)" }}>
              Shop Karo →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
