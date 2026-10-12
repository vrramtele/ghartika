/**
 * @file src/types/index.ts
 * Single source of truth for all shared types.
 * Import from here — never redeclare these types elsewhere.
 */

// ── Order Status ──────────────────────────────────────────────────────────────

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

// ── Customer ──────────────────────────────────────────────────────────────────

export type CustomerInfo = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

// ── Cart ──────────────────────────────────────────────────────────────────────

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  weight: string;
  image: string;
  badge?: string;
};

// ── Product ───────────────────────────────────────────────────────────────────

export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  weight: string;
  category: string;
  image: string;
  badge?: string;
  description: string;
  isCombo?: boolean;
  comboItems?: string[];
};

// ── Order ─────────────────────────────────────────────────────────────────────

export type Order = {
  id: string;
  date: string;
  customer: CustomerInfo;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
};
