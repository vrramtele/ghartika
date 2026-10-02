"use client";

import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

const links = {
  shop: [
    { name: "Everyday Essentials", href: "/shop" },
    { name: "Premium Blends", href: "/shop" },
    { name: "Value Combos", href: "/shop" },
    { name: "Whole Spices", href: "/shop" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Our Story", href: "/about" },
    { name: "Recipes", href: "/" },
    { name: "Contact", href: "/contact" },
  ],
  support: [
    { name: "FAQ", href: "/#faq" },
    { name: "Shipping Info", href: "/shipping" },
    { name: "Returns & Refunds", href: "/returns" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[var(--text-primary)] text-white">

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-5">
              <div className="bg-white rounded-lg p-2 inline-block">
                <img src="/logo.png" alt="Ghartika Spices" className="h-14 w-auto object-contain" />
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-6">
              Bringing the pure, stone-ground spices of Maharashtra to kitchens across India. Traditional methods. Uncompromised quality.
            </p>
            <div className="flex flex-col gap-3 text-sm text-gray-400">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[var(--brand-red)] mt-0.5 shrink-0" />
                <span>Ghartika Spices, Plot No. 12, Masala Bazar, Indore, M.P. – 452001</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[var(--brand-red)] shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[var(--brand-red)] shrink-0" />
                <span>support@ghartika.in</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {[
            { title: "Shop", items: links.shop },
            { title: "Company", items: links.company },
            { title: "Support", items: links.support },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white mb-5 uppercase tracking-widest">{col.title}</h4>
              <ul className="flex flex-col gap-3">
                {col.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-150"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Ghartika Spices. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link>
            <Link href="/returns" className="hover:text-white transition-colors">Returns & Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
