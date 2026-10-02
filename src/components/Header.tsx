"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, Search, User } from "lucide-react";
import { useCart } from "../context/CartContext";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Announcement Bar */}
      <div
        className="text-center py-2 text-xs font-medium tracking-widest uppercase text-white"
        style={{ backgroundColor: "var(--brand-red)" }}
      >
        Free Shipping on Orders Above ₹999 &nbsp;|&nbsp; 100% Pure & Natural Spices
      </div>

      <header
        className="sticky top-0 w-full z-50 bg-white transition-shadow duration-300"
        style={{
          boxShadow: isScrolled ? "0 2px 12px rgba(0,0,0,0.08)" : "none",
          borderBottom: isScrolled ? "none" : "1px solid var(--border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <img src="/logo.png" alt="Ghartika Spices" className="h-14 w-auto object-contain" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-sm font-medium tracking-wide relative pb-1 transition-colors duration-200"
                    style={{ color: isActive ? "var(--brand-red)" : "var(--text-secondary)" }}
                  >
                    {link.name}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 w-full"
                        style={{ height: "1.5px", backgroundColor: "var(--brand-red)" }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <button className="transition-colors" style={{ color: "var(--text-secondary)" }}>
                <Search className="w-5 h-5" />
              </button>
              <Link href="/login" className="transition-colors" style={{ color: "var(--text-secondary)" }}>
                <User className="w-5 h-5" />
              </Link>
              <Link href="/cart" className="relative transition-colors" style={{ color: "var(--text-secondary)" }}>
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold"
                    style={{ backgroundColor: "var(--brand-red)" }}
                  >
                    {totalItems}
                  </span>
                )}
              </Link>
              <Link
                href="/shop"
                className="ml-2 text-white px-5 py-2 text-sm font-semibold rounded tracking-wide transition-colors duration-200"
                style={{ backgroundColor: "var(--brand-red)" }}
              >
                Shop Now
              </Link>
            </div>

            {/* Mobile Toggle */}
            <div className="flex md:hidden items-center gap-4">
              <Link href="/cart" className="relative" style={{ color: "var(--text-secondary)" }}>
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold"
                    style={{ backgroundColor: "var(--brand-red)" }}
                  >
                    {totalItems}
                  </span>
                )}
              </Link>
              <button
                style={{ color: "var(--text-primary)" }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden bg-white px-6 pb-6 pt-4 flex flex-col gap-5"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-base font-medium transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/shop"
              className="mt-2 text-center text-white py-3 text-sm font-semibold rounded tracking-wide"
              style={{ backgroundColor: "var(--brand-red)" }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Shop Now
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
