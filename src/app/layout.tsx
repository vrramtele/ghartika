import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { OrderProvider } from "@/context/OrderContext";
import { ProductProvider } from "@/context/ProductContext";
import Footer from "@/components/Footer";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghartika Spices | Premium D2C Indian Spices",
  description: "Experience the authentic taste of tradition with Ghartika Spices. 100% Pure, Stone Ground, and Premium Quality.",
  keywords: ["indian spices", "masala", "premium spices", "organic spices", "stone ground spices", "buy spices online india"],
  authors: [{ name: "Ghartika" }],
  creator: "Ghartika Spices",
  publisher: "Ghartika Spices",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://ghartika.in",
    siteName: "Ghartika Spices",
    title: "Ghartika Spices | Authentic Premium Indian Spices",
    description: "100% pure, unadulterated, stone-ground spices delivered straight from farms to your kitchen.",
    images: [
      {
        url: "/og-image.jpg", // Needs an actual image in public folder later
        width: 1200,
        height: 630,
        alt: "Ghartika Premium Spices",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ghartika Spices | Premium Indian Spices",
    description: "100% pure, unadulterated, stone-ground spices delivered straight from farms to your kitchen.",
  },
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      </head>
      <body
        className={`${outfit.variable} antialiased min-h-screen font-sans bg-[var(--background)] text-[var(--text-primary)]`}
      >
        <ProductProvider>
          <OrderProvider>
            <CartProvider>
              {children}
              <Footer />
            </CartProvider>
          </OrderProvider>
        </ProductProvider>
      </body>
    </html>
  );
}
