import type { Metadata } from "next";
import { OrderProvider } from "@/context/OrderContext";
import { CartProvider } from "@/context/CartContext";
import { ProductProvider } from "@/context/ProductContext";

export const metadata: Metadata = {
  title: "Ghartika Admin Panel",
  description: "Ghartika Spices — Order Management & Admin Dashboard",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProductProvider>
      <OrderProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </OrderProvider>
    </ProductProvider>
  );
}
