"use client";

import { useState } from "react";
import Header from "@/components/Header";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  CheckCircle,
} from "lucide-react";
import { motion, Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: "easeOut" as const },
  }),
};

const contactInfo = [
  {
    icon: MapPin,
    title: "Hamara Pata",
    lines: ["Ghartika Spices, Plot No. 12,", "Masala Bazar, Indore, M.P. – 452001"],
    iconColor: "var(--brand-red)",
    bg: "#FDF2F3",
    border: "#F5C6CB",
  },
  {
    icon: Phone,
    title: "Phone / WhatsApp",
    lines: ["+91 98765 43210", "+91 91234 56789"],
    iconColor: "var(--brand-green)",
    bg: "#F1F8F1",
    border: "#C8E6C9",
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["support@ghartika.in", "orders@ghartika.in"],
    iconColor: "var(--brand-gold)",
    bg: "#FDF8EC",
    border: "#F5E0A0",
  },
  {
    icon: Clock,
    title: "Business Hours",
    lines: ["Mon – Sat: 9:00 AM – 7:00 PM", "Sunday: 10:00 AM – 4:00 PM"],
    iconColor: "#7B1FA2",
    bg: "#F9F0FF",
    border: "#E1BEE7",
  },
];

const inputClass =
  "w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Kuch problem aayi. Dobara try karein.");
        return;
      }
      setSubmitted(true);
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      {/* ── Hero Banner ── */}
      <section
        className="relative pt-32 pb-20 overflow-hidden"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* Background blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            className="absolute top-0 left-0 w-96 h-96 opacity-10 blur-[120px] rounded-full"
            style={{ backgroundColor: "var(--brand-red)" }}
          />
          <div
            className="absolute bottom-0 right-0 w-96 h-96 opacity-10 blur-[120px] rounded-full"
            style={{ backgroundColor: "var(--brand-gold)" }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-5 py-2 rounded-full text-sm font-semibold mb-4 border"
            style={{
              backgroundColor: "#FDF2F3",
              color: "var(--brand-red)",
              borderColor: "#F5C6CB",
            }}
          >
            📬 Hum Yahan Hain
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Humse{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(to right, var(--brand-red), var(--brand-gold))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Baat Karo
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="text-lg max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Koi bhi sawaal ho — masale ke baare mein, order ke baare mein, ya kuch bhi —
            hum hamesha available hain. 🌶️
          </motion.p>
        </div>
      </section>

      {/* ── Info Cards ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((item, i) => (
            <motion.div
              key={item.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="rounded-2xl p-6 border shadow-sm hover:shadow-lg transition-shadow group"
              style={{ backgroundColor: item.bg, borderColor: item.border }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform"
                style={{ backgroundColor: "var(--surface)" }}
              >
                <item.icon className="w-6 h-6" style={{ color: item.iconColor }} />
              </div>
              <h3 className="font-bold text-base mb-2" style={{ color: "var(--text-primary)" }}>
                {item.title}
              </h3>
              {item.lines.map((line, j) => (
                <p key={j} className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {line}
                </p>
              ))}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Form + Map ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="rounded-3xl shadow-xl p-8 border"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-light)",
            }}
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-16 gap-4 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                >
                  <CheckCircle className="w-20 h-20" style={{ color: "var(--brand-green)" }} />
                </motion.div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Shukriya! 🙏
                </h2>
                <p className="max-w-xs" style={{ color: "var(--text-muted)" }}>
                  Aapka message mil gaya. Hum jald hi aapse sampark karenge.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
                  }}
                  className="mt-4 px-6 py-3 rounded-full font-semibold text-white transition-colors"
                  style={{ backgroundColor: "var(--brand-red)" }}
                >
                  Naya Message Bhejo
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black mb-1" style={{ color: "var(--text-primary)" }}>
                  Message Bhejo
                </h2>
                <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                  Sabhi fields (*) zaroori hain.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name + Phone */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-sm font-semibold mb-1"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Aapka Naam *
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Ramesh Kumar"
                        className={inputClass}
                        style={{
                          borderColor: "var(--border)",
                          backgroundColor: "var(--surface-muted)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="contact-phone"
                        className="block text-sm font-semibold mb-1"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Phone Number
                      </label>
                      <input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+91 XXXXX XXXXX"
                        className={inputClass}
                        style={{
                          borderColor: "var(--border)",
                          backgroundColor: "var(--surface-muted)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-sm font-semibold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="aapka@email.com"
                      className={inputClass}
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface-muted)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="block text-sm font-semibold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Vishay *
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      className={inputClass}
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface-muted)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <option value="">-- Vishay chunein --</option>
                      <option value="order">Order Enquiry / Tracking</option>
                      <option value="product">Product / Quality</option>
                      <option value="bulk">Bulk / Corporate Order</option>
                      <option value="return">Return / Refund</option>
                      <option value="franchise">Franchise / Partnership</option>
                      <option value="other">Kuch Aur</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-sm font-semibold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Aapka Sandesh *
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Yahan apni baat likhein..."
                      className={`${inputClass} resize-none`}
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface-muted)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>

                  <button
                    id="contact-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 text-white px-8 py-4 rounded-full font-bold text-base active:scale-95 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "var(--brand-red)" }}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Bheja ja raha hai...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" /> Sandesh Bhejo
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>

          {/* Right: Map + WhatsApp + Social */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            {/* Map Embed */}
            <div
              className="rounded-3xl overflow-hidden shadow-xl border h-64 lg:h-80"
              style={{ borderColor: "var(--border-light)" }}
            >
              <iframe
                title="Ghartika Spices Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117753.26484669305!2d75.78489677294922!3d22.71927180000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fcad1b410ddb%3A0x96ec4da356240f4!2sIndore%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1720000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* WhatsApp CTA */}
            <a
              id="contact-whatsapp-cta"
              href="https://wa.me/919876543210?text=Namaste%20Ghartika%20Spices!%20Mujhe%20kuch%20poochna%20tha..."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 text-white rounded-2xl px-6 py-5 shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all group"
              style={{ backgroundColor: "#25D366" }}
            >
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-8 h-8" />
              </div>
              <div>
                <p className="font-black text-lg leading-tight">WhatsApp Pe Baat Karo</p>
                <p className="text-sm text-green-100">
                  Seedha chat karein — fast reply guaranteed! ⚡
                </p>
              </div>
            </a>

            {/* Social Links */}
            <div
              className="rounded-2xl shadow-md border p-6"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border-light)",
              }}
            >
              <h3 className="font-bold text-base mb-4" style={{ color: "var(--text-primary)" }}>
                Social Media Pe Milein
              </h3>
              <div className="flex flex-col gap-3">
                {[
                  {
                    id: "contact-instagram",
                    Icon: () => (
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" style={{ color: "#E1306C" }}>
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    ),
                    label: "Instagram",
                    handle: "@ghartika.spice",
                    href: "https://instagram.com/ghartika.spice",
                    bg: "#FDF2F7",
                    border: "#F8BBD0",
                  },
                  {
                    id: "contact-facebook",
                    Icon: () => (
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" style={{ color: "#1877F2" }}>
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    ),
                    label: "Facebook",
                    handle: "Ghartika Spices",
                    href: "https://facebook.com/ghartika",
                    bg: "#EFF5FF",
                    border: "#BBDEFB",
                  },
                  {
                    id: "contact-twitter",
                    Icon: () => (
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" style={{ color: "#1DA1F2" }}>
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                      </svg>
                    ),
                    label: "Twitter / X",
                    handle: "@GhartikaSpice",
                    href: "https://twitter.com/GhartikaSpice",
                    bg: "#E8F6FD",
                    border: "#B3E5FC",
                  },
                ].map(({ id, Icon, label, handle, href, bg, border }) => (
                  <a
                    id={id}
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 hover:scale-[1.02] transition-transform border"
                    style={{ backgroundColor: bg, borderColor: border }}
                  >
                    <Icon />
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        {label}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {handle}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ Strip ── */}
      <section className="py-16 text-white" style={{ backgroundColor: "var(--brand-brown)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-black mb-2"
          >
            Aksar Pooche Jane Wale Sawaal
          </motion.h2>
          <p className="mb-10 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
            Shayad aapka jawab pehle se yahan ho!
          </p>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            {[
              {
                q: "Delivery kitne din mein hoti hai?",
                a: "Hum 3–5 business days mein deliver karte hain. Express delivery bhi available hai.",
              },
              {
                q: "Kya masale 100% pure hain?",
                a: "Bilkul! Koi artificial color, preservative ya adulterant nahi. Sirf shuddh masale.",
              },
              {
                q: "Bulk order possible hai?",
                a: "Haan, restaurants aur businesses ke liye bulk orders available hain. Email karein.",
              },
              {
                q: "Return policy kya hai?",
                a: "Quality problem hone par 7 din mein full refund ya replacement milega.",
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10"
              >
                <p className="font-bold mb-1 flex items-start gap-2" style={{ color: "var(--brand-gold)" }}>
                  <span className="mt-0.5">🌶️</span> {faq.q}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
