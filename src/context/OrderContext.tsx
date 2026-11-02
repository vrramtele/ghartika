"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { Order, OrderStatus, CustomerInfo, CartItem } from "@/types";

// Re-export for convenience so pages don't need two imports
export type { Order, OrderStatus, CustomerInfo, CartItem };

type OrderContextType = {
  orders: Order[];
  isLoading: boolean;
  refreshOrders: () => Promise<void>;
  placeOrder: (
    customer: CustomerInfo,
    items: CartItem[],
    total: number,
    razorpayOrderId?: string,
    razorpayPaymentId?: string
  ) => Promise<string>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  patchOrder: (orderId: string, patch: Partial<Order>) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const placeOrder = async (
    customer: CustomerInfo,
    items: CartItem[],
    total: number,
    razorpayOrderId?: string,
    razorpayPaymentId?: string
  ): Promise<string> => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer, items, total, razorpayOrderId, razorpayPaymentId }),
    });
    if (!res.ok) throw new Error("Failed to place order");
    const newOrder: Order = await res.json();
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder.id;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update order status");
    const updated: Order = await res.json();
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
  };

  /** Full patch — for shipping info, admin notes, payment status etc. */
  const patchOrder = async (orderId: string, patch: Partial<Order>): Promise<void> => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error("Failed to patch order");
    const updated: Order = await res.json();
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
  };

  const getOrderById = (orderId: string): Order | undefined =>
    orders.find((o) => o.id === orderId);

  return (
    <OrderContext.Provider
      value={{ orders, isLoading, refreshOrders, placeOrder, updateOrderStatus, patchOrder, getOrderById }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}
