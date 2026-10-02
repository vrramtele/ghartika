"use client";

import Header from "@/components/Header";
import Link from "next/link";
import {
  Leaf,
  ShieldCheck,
  Truck,
  Star,
  Heart,
  Award,
  Users,
  ArrowRight,
  Quote,
} from "lucide-react";
import { motion, Variants } from "framer-motion";

/* ─── Animation helpers ─── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

const fadeRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

/* ─── Data ─── */
const values = [
  {
    icon: Leaf,
    title: "100% Shuddh",
    desc: "Koi bhi artificial color, preservative ya adulterant nahi. Sirf asli masale, seedhe kisan se.",
    iconColor: "#2E7D32",
    bg: "#F1F8F1",
    border: "#C8E6C9",
  },
  {
    icon: ShieldCheck,
    title: "Quality Promise",
    desc: "Har batch lab-tested hota hai. Hamari quality guarantee backed by trust — 100% refund agar santushti na ho.",
    iconColor: "#A01C2C",
    bg: "#FDF2F3",
    border: "#F5C6CB",
  },
  {
    icon: Heart,
    title: "Ghar Jaisa Pyaar",
    desc: "Har masala aise pisa jaata hai jaise ghar ki chakki mein. Har packet mein maa ke haath ki khushboo.",
    iconColor: "#C2185B",
    bg: "#FDF2F7",
    border: "#F8BBD0",
  },
  {
    icon: Truck,
    title: "Seedha Aapke Ghar",
    desc: "Kisan se seedha aapki rasoi tak. Koi middleman nahi, taza masale fresh delivery ke saath.",
    iconColor: "#B8860B",
    bg: "#FDF8EC",
    border: "#F5E0A0",
  },
];

const milestones = [
  { year: "2018", title: "Shuruaat", desc: "Indore ki ek choti si chakki se Ghartika ki neev rakhi gayi." },
  { year: "2019", title: "Pehle 1,000 Customers", desc: "Word-of-mouth se hazaron pariwaaron ne hamara vishwas kiya." },
  { year: "2021", title: "Online Launch", desc: "Digital platform ke zariye poore India mein delivery shuru ki." },
  { year: "2023", title: "10+ Products", desc: "Haldi se leke Garam Masala tak — ek poora spice family." },
  { year: "2025", title: "50,000+ Happy Families", desc: "Aaj hamare saath 50 hazaar se zyada parivaar hain." },
];

const stats = [
  { icon: Users, value: "50,000+", label: "Khush Parivaar" },
  { icon: Star, value: "4.9★", label: "Average Rating" },
  { icon: Award, value: "10+", label: "Premium Products" },
  { icon: Leaf, value: "100%", label: "Pure & Natural" },
];

const team = [
  {
    name: "Ramesh Sharma",
    role: "Founder & Master Blender",
    img: "https://images.unsplash.com/photo-1537511446984-935f663eb1f4?w=300&h=300&fit=crop&crop=face",
    quote: "Masala sirf swad nahi, yaadein bhi deta hai.",
  },
  {
    name: "Sunita Devi",
    role: "Quality Head",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face",
    quote: "Har packet mein meri amma ki mehnat hoti hai.",
  },
  {
    name: "Arjun Patel",
    role: "Sourcing & Farmer Relations",
    img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop&crop=face",
    quote: "Kisan khush toh masala shuddh — yahi hamara mantra hai.",
  },
];

/* ─── Page ─── */
export default function AboutPage() {
  return (
    <>
      <Header />

      {/* ── Hero ── */}
      <section
        className="relative min-h-[70vh] flex items-center pt-28 pb-16 overflow-hidden"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* Background blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            className="absolute top-0 -left-1/4 w-2/3 h-2/3 opacity-10 blur-[120px] rounded-full"
            style={{ backgroundColor: "var(--brand-red)" }}
          />
          <div
            className="absolute bottom-0 -right-1/4 w-2/3 h-2/3 opacity-10 blur-[120px] rounded-full"
            style={{ backgroundColor: "var(--brand-gold)", animationDelay: "2s" }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left text */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            <div
              className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold w-max border"
              style={{
                backgroundColor: "#FDF2F3",
                color: "var(--brand-red)",
                borderColor: "#F5C6CB",
              }}
            >
              🌿 Hamari Kahani
            </div>

            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1]" style={{ color: "var(--text-primary)" }}>
              Ek Chakki,{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(to right, var(--brand-red), var(--brand-gold))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Kaafi Pyaar
              </span>
            </h1>

            <p className="text-lg max-w-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Ghartika Spices ki neev 2018 mein Indore ki galiyon mein rakhi gayi thi — ek simple sapne ke saath:{" "}
              <strong style={{ color: "var(--text-primary)" }}>har ghar mein shuddh, ghar jaisa swad.</strong>
            </p>

            <p className="max-w-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Aaj hum 50,000 se zyada pariwaaron ko fresh-ground masale deliver karte hain.
              Koi shortcut nahi, koi compromise nahi — sirf asli masale, seedhe dil se.
            </p>

            <div className="flex gap-4 flex-wrap mt-2">
              <Link
                href="/shop"
                className="text-white px-7 py-3 rounded-full font-bold transition-all shadow-lg hover:-translate-y-1 flex items-center gap-2"
                style={{ backgroundColor: "var(--brand-red)" }}
              >
                Hamare Masale Dekho <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="border px-7 py-3 rounded-full font-bold transition-all"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                Humse Baat Karo
              </Link>
            </div>
          </motion.div>

          {/* Right image collage */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            animate="visible"
            className="relative h-[420px] hidden lg:block"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 rounded-3xl overflow-hidden shadow-2xl z-20"
              style={{ border: "4px solid var(--brand-gold)" }}
            >
              <img
                src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=900&auto=format&fit=crop"
                alt="Ghartika Spices grinding"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute top-4 right-0 w-1/3 h-1/3 rounded-full overflow-hidden shadow-xl z-30"
              style={{ border: "4px solid white" }}
            >
              <img
                src="https://images.unsplash.com/photo-1615486171448-4fbaf0c6095d?q=80&w=400&auto=format&fit=crop"
                alt="Turmeric"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-4 left-0 w-1/3 h-1/3 rounded-full overflow-hidden shadow-xl z-10"
              style={{ border: "4px solid white" }}
            >
              <img
                src="https://images.unsplash.com/photo-1581600140682-d4e68c8cde32?q=80&w=400&auto=format&fit=crop"
                alt="Red chili"
                className="w-full h-full object-cover"
              />
            </motion.div>
            {/* Badge */}
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute bottom-16 right-4 z-40 rounded-2xl shadow-xl p-3"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Since</p>
              <p className="text-2xl font-black" style={{ color: "var(--brand-red)" }}>2018</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Indore, M.P.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section style={{ backgroundColor: "var(--brand-red)" }} className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex flex-col items-center gap-2"
              >
                <s.icon className="w-7 h-7 opacity-80" />
                <p className="text-3xl font-black">{s.value}</p>
                <p className="text-sm opacity-80 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden shadow-2xl aspect-video lg:aspect-square"
          >
            <img
              src="https://images.unsplash.com/photo-1543353071-10c8ba85a904?q=80&w=900&auto=format&fit=crop"
              alt="Spice grinding process"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col gap-5"
          >
            <div
              className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold w-max border"
              style={{ backgroundColor: "#FDF8EC", color: "#B8860B", borderColor: "#F5E0A0" }}
            >
              🏡 Hamari Kahani
            </div>
            <h2 className="text-4xl font-black leading-tight" style={{ color: "var(--text-primary)" }}>
              Ek Sapne Se Shuru Hua{" "}
              <span style={{ color: "var(--brand-red)" }}>Safar</span>
            </h2>

            <div
              className="relative pl-6 space-y-4"
              style={{ borderLeft: "4px solid var(--brand-gold)" }}
            >
              <Quote className="absolute -left-4 -top-2 w-7 h-7 opacity-60" style={{ color: "var(--brand-gold)" }} />
              <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Hamaare founder Ramesh Sharma ko yaad hai jab unki maa Indore ki chakki se masale pisti thi — woh khushboo,
                woh swad jo kisi market ke packet mein nahi milta tha. Unhi yaadein leke unhone Ghartika Spices ki shuruaat ki.
              </p>
              <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Aaj bhi hum wahi traditional methods use karte hain — stone grinding, slow roasting, aur careful blending.
                Koi shortcut nahi, koi compromise nahi.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              {[
                { label: "Kisan Partners", value: "120+" },
                { label: "States mein Delivery", value: "28" },
                { label: "Spice Varieties", value: "10+" },
                { label: "Years of Trust", value: "7+" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl p-4 border"
                  style={{
                    backgroundColor: "var(--surface-muted)",
                    borderColor: "var(--border-light)",
                  }}
                >
                  <p className="text-2xl font-black" style={{ color: "var(--brand-red)" }}>{item.value}</p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-20" style={{ backgroundColor: "var(--surface-muted)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-black mb-3" style={{ color: "var(--text-primary)" }}>
              Hamari{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(to right, var(--brand-red), var(--brand-gold))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Core Values
              </span>
            </h2>
            <p className="max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
              Yeh sirf words nahi hain — yeh hamare har masale mein dikta hai.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="rounded-2xl p-6 border hover:shadow-lg transition-shadow group"
                style={{ backgroundColor: v.bg, borderColor: v.border }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: "var(--surface)" }}
                >
                  <v.icon className="w-6 h-6" style={{ color: v.iconColor }} />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl font-black mb-3" style={{ color: "var(--text-primary)" }}>
            Hamara{" "}
            <span style={{ color: "var(--brand-red)" }}>Safar</span>
          </h2>
          <p style={{ color: "var(--text-muted)" }}>2018 se aaj tak ki journey.</p>
        </motion.div>

        <div className="relative">
          {/* Center line */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 hidden md:block"
            style={{
              background: "linear-gradient(to bottom, var(--brand-red), var(--brand-gold), transparent)",
            }}
          />

          <div className="flex flex-col gap-10">
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className={`flex items-center gap-6 md:gap-0 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Text side */}
                <div className={`flex-1 ${i % 2 === 0 ? "md:text-right md:pr-12" : "md:pl-12"}`}>
                  <div
                    className="inline-block rounded-2xl p-5 shadow-md border hover:shadow-xl transition-shadow"
                    style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}
                  >
                    <p className="font-black text-lg" style={{ color: "var(--brand-red)" }}>{m.year}</p>
                    <h3 className="font-bold text-base mt-0.5" style={{ color: "var(--text-primary)" }}>{m.title}</h3>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{m.desc}</p>
                  </div>
                </div>

                {/* Center dot */}
                <div className="hidden md:flex flex-col items-center z-10">
                  <div
                    className="w-5 h-5 rounded-full shadow-lg"
                    style={{
                      backgroundColor: "var(--brand-red)",
                      border: "4px solid var(--background)",
                    }}
                  />
                </div>

                {/* Empty side */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-20 text-white" style={{ backgroundColor: "var(--brand-brown)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-black mb-3">
              Hamaari{" "}
              <span style={{ color: "var(--brand-gold)" }}>Team</span>
            </h2>
            <p className="max-w-xl mx-auto text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
              Jo log har roz mehnat karte hain taaki aapke ghar mein shuddh masale pahunche.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-5">
                  <div
                    className="w-32 h-32 rounded-full overflow-hidden shadow-xl group-hover:scale-105 transition-transform"
                    style={{ border: "4px solid var(--brand-gold)" }}
                  >
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Online dot */}
                  <div
                    className="absolute bottom-1 right-1 w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: "var(--brand-green)",
                      border: "2px solid var(--brand-brown)",
                    }}
                  />
                </div>
                <h3 className="font-black text-lg">{member.name}</h3>
                <p className="text-sm font-medium mb-3" style={{ color: "var(--brand-gold)" }}>{member.role}</p>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 max-w-xs">
                  <Quote className="w-4 h-4 mb-1 mx-auto" style={{ color: "var(--brand-gold)" }} />
                  <p className="text-sm italic" style={{ color: "rgba(255,255,255,0.8)" }}>{member.quote}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: "var(--background)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-0 w-96 h-96 opacity-10 blur-[100px] rounded-full"
            style={{ backgroundColor: "var(--brand-red)" }}
          />
          <div
            className="absolute bottom-0 right-0 w-96 h-96 opacity-10 blur-[100px] rounded-full"
            style={{ backgroundColor: "var(--brand-gold)" }}
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-4xl md:text-5xl font-black mb-4" style={{ color: "var(--text-primary)" }}>
              Ready to taste{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(to right, var(--brand-red), var(--brand-gold))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Asli Masala?
              </span>
            </p>
            <p className="mb-8 text-lg" style={{ color: "var(--text-muted)" }}>
              Ghartika ke sath apni rasoi mein woh ghar jaisa swad wapas layein. 🌶️
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/shop"
                className="text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2"
                style={{ backgroundColor: "var(--brand-red)" }}
              >
                Shop Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 rounded-full font-bold text-lg transition-all border-2"
                style={{
                  borderColor: "var(--brand-red)",
                  color: "var(--brand-red)",
                }}
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
