import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { OrderProvider } from "@/context/OrderContext";
import { CartProvider } from "@/context/CartContext";
import { ProductProvider } from "@/context/ProductContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghartika Admin Panel",
  description: "Ghartika Spices — Order Management & Admin Dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} antialiased font-sans`}
        style={{ margin: 0, padding: 0 }}
      >
        <ProductProvider>
          <OrderProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </OrderProvider>
        </ProductProvider>
      </body>
    </html>
  );
}
