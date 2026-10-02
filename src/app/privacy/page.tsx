"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { Shield, Lock, Eye, Database, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" as const },
  }),
};

const sections = [
  {
    icon: Database,
    title: "Hum Kya Data Collect Karte Hain",
    color: "var(--brand-red)",
    bg: "#FDF2F3",
    border: "#F5C6CB",
    content: [
      "Aapka naam, phone number, email address — order ke liye",
      "Delivery address — package deliver karne ke liye",
      "Payment information — Razorpay secure gateway handle karta hai (hum card details store nahi karte)",
      "Order history — aapki purchase track karne ke liye",
      "Website usage data — better experience ke liye (cookies)",
    ],
  },
  {
    icon: Eye,
    title: "Data Ka Use Kaise Hota Hai",
    color: "var(--brand-gold)",
    bg: "#FDF8EC",
    border: "#F5E0A0",
    content: [
      "Order process karna aur delivery arrange karna",
      "Order status aur delivery updates bhejne ke liye",
      "Customer support provide karna",
      "New products aur offers ki information (sirf aapki permission se)",
      "Website improve karna aur technical issues fix karna",
    ],
  },
  {
    icon: Shield,
    title: "Aapka Data Kitna Safe Hai",
    color: "var(--brand-green)",
    bg: "#F1F8F1",
    border: "#C8E6C9",
    content: [
      "HTTPS encryption — data transit mein secure hai",
      "Payment data Razorpay PCI DSS certified servers pe hai",
      "Hum aapka data third parties ko kabhi nahi bechte",
      "Data sirf authorized team members access kar sakte hain",
      "Regular security audits kiye jaate hain",
    ],
  },
  {
    icon: Lock,
    title: "Aapke Adhikar (Your Rights)",
    color: "#7B1FA2",
    bg: "#F9F0FF",
    border: "#E1BEE7",
    content: [
      "Apna data access ya download karne ka adhikar",
      "Galat information correct karwane ka adhikar",
      "Data delete karwane ka adhikar (account close karna)",
      "Marketing emails se opt-out karne ka adhikar",
      "Data processing pe objection karne ka adhikar",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden" style={{ backgroundColor: "var(--background)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-80 h-80 opacity-10 blur-[100px] rounded-full" style={{ backgroundColor: "#7B1FA2" }} />
          <div className="absolute bottom-0 right-0 w-80 h-80 opacity-10 blur-[100px] rounded-full" style={{ backgroundColor: "var(--brand-red)" }} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-4 border"
            style={{ backgroundColor: "#F9F0FF", color: "#7B1FA2", borderColor: "#E1BEE7" }}
          >
            <Shield className="w-4 h-4" /> Privacy Policy
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl md:text-5xl font-black mb-4" style={{ color: "var(--text-primary)" }}
          >
            Aapki Privacy,{" "}
            <span className="text-transparent bg-clip-text" style={{
              backgroundImage: "linear-gradient(to right, #7B1FA2, var(--brand-red))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Hamari Zimmedari</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}
          >
            Hum aapka data collect karte hain — lekin sirf itna jo zaroori hai, aur bilkul safe rakhte hain. 🔒
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.5 }}
            className="text-xs mt-3" style={{ color: "var(--text-muted)" }}
          >
            Last updated: October 2026
          </motion.p>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-3xl p-8 border shadow-sm"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}
        >
          <p className="text-base leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
            Ghartika Spices (&quot;hum&quot;, &quot;hamara&quot;) aapki privacy ko seriously lete hain. Yeh Privacy Policy batati hai ki jab aap hamaari website{" "}
            <strong style={{ color: "var(--text-primary)" }}>ghartika.in</strong> use karte hain ya hamare se order karte hain, tab hum aapki kaunsi information collect karte hain, use kaise karte hain, aur protect kaise karte hain.
          </p>
          <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Hamaari website use karke aap is policy se agree karte hain. Agar koi sawaal ho toh humse{" "}
            <Link href="/contact" style={{ color: "var(--brand-red)" }} className="font-semibold hover:underline">contact karo</Link>.
          </p>
        </motion.div>
      </section>

      {/* Policy Sections */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col gap-6">
          {sections.map((section, i) => (
            <motion.div
              key={section.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="rounded-3xl p-8 border shadow-sm"
              style={{ backgroundColor: section.bg, borderColor: section.border }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--surface)" }}>
                  <section.icon className="w-5 h-5" style={{ color: section.color }} />
                </div>
                <h2 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>{section.title}</h2>
              </div>
              <ul className="space-y-3">
                {section.content.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: section.color }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Cookies */}
      <section className="py-16" style={{ backgroundColor: "var(--surface-muted)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-3xl p-8 border shadow-sm"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FDF8EC" }}>
                <span className="text-xl">🍪</span>
              </div>
              <h2 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>Cookies ke Baare Mein</h2>
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Hum cookies use karte hain aapke shopping cart remember karne ke liye, login session maintain karne ke liye, aur website analytics ke liye. Aap apne browser settings se cookies disable kar sakte hain, lekin kuch features kaam nahi kar sakte.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { name: "Essential Cookies", desc: "Cart, login — ye zaroori hain", required: true },
                { name: "Analytics Cookies", desc: "Website traffic samajhne ke liye", required: false },
                { name: "Marketing Cookies", desc: "Personalized ads ke liye", required: false },
              ].map((cookie) => (
                <div key={cookie.name} className="rounded-xl p-4 border" style={{ backgroundColor: "var(--surface-muted)", borderColor: "var(--border-light)" }}>
                  <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>{cookie.name}</p>
                  <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{cookie.desc}</p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
                    backgroundColor: cookie.required ? "#F1F8F1" : "#FDF2F3",
                    color: cookie.required ? "var(--brand-green)" : "var(--brand-red)",
                  }}>
                    {cookie.required ? "Required" : "Optional"}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact for Privacy */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-3xl p-8 border text-center shadow-sm"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}
        >
          <h2 className="text-2xl font-black mb-2" style={{ color: "var(--text-primary)" }}>Privacy Concern Hai? 🔒</h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Data delete, access ya correction ke liye humse directly contact karo.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/contact"
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full font-bold transition-all"
              style={{ backgroundColor: "var(--brand-red)" }}
            >
              <Mail className="w-4 h-4" /> Email Karo
            </Link>
            <a href="tel:+919876543210"
              className="inline-flex items-center gap-2 border px-6 py-3 rounded-full font-bold transition-all"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              <Phone className="w-4 h-4" /> Call Karo
            </a>
          </div>
        </motion.div>
      </section>
    </>
  );
}
