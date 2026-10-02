/**
 * db.ts — Unified database layer
 * Uses Upstash Redis (via @upstash/redis) when KV_REST_API_URL is set,
 * falls back to local JSON files for local development.
 */

import { products as initialProducts } from "@/data/products";
import fs from "fs";
import path from "path";

// ── Types ─────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type CustomerInfo = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  weight: string;
  image: string;
};

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

// ── Redis client (lazy) ───────────────────────────────────────────────────────

function getRedis() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null;
  }
  const { Redis } = require("@upstash/redis");
  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

// ── Local JSON fallback (dev only) ────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

function readJSON<T>(filePath: string): T[] {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]", "utf-8");
      return [];
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJSON<T>(filePath: string, data: T[]): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function getOrders(): Promise<Order[]> {
  const redis = getRedis();
  if (redis) {
    const ids: string[] = (await redis.lrange("orders:ids", 0, -1)) || [];
    if (ids.length === 0) return [];
    const orders: Order[] = [];
    for (const id of ids) {
      const o = await redis.get(`order:${id}`);
      if (o) orders.push(o as Order);
    }
    return orders;
  }
  return readJSON<Order>(ORDERS_FILE);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const redis = getRedis();
  if (redis) {
    const o = await redis.get(`order:${id}`);
    return o ? (o as Order) : undefined;
  }
  return readJSON<Order>(ORDERS_FILE).find((o) => o.id === id);
}

export async function createOrder(
  customer: CustomerInfo,
  items: CartItem[],
  total: number,
  razorpayOrderId?: string,
  razorpayPaymentId?: string
): Promise<Order> {
  const newOrder: Order = {
    id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    date: new Date().toISOString(),
    customer,
    items,
    total,
    status: "Pending",
    razorpayOrderId,
    razorpayPaymentId,
  };

  const redis = getRedis();
  if (redis) {
    await redis.set(`order:${newOrder.id}`, JSON.stringify(newOrder));
    await redis.lpush("orders:ids", newOrder.id);
    return newOrder;
  }

  const orders = readJSON<Order>(ORDERS_FILE);
  orders.unshift(newOrder);
  writeJSON(ORDERS_FILE, orders);
  return newOrder;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  const redis = getRedis();
  if (redis) {
    const o = await redis.get(`order:${id}`);
    if (!o) return null;
    const updated = { ...(o as Order), status };
    await redis.set(`order:${id}`, JSON.stringify(updated));
    return updated;
  }

  const orders = readJSON<Order>(ORDERS_FILE);
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], status };
  writeJSON(ORDERS_FILE, orders);
  return orders[idx];
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const redis = getRedis();
  if (redis) {
    const ids: string[] = (await redis.lrange("products:ids", 0, -1)) || [];
    if (ids.length === 0) {
      // Seed with initial products
      for (const p of initialProducts as Product[]) {
        await redis.set(`product:${p.id}`, JSON.stringify(p));
        await redis.rpush("products:ids", p.id);
      }
      return initialProducts as Product[];
    }
    const products: Product[] = [];
    for (const id of ids) {
      const p = await redis.get(`product:${id}`);
      if (p) products.push(p as Product);
    }
    return products;
  }

  const products = readJSON<Product>(PRODUCTS_FILE);
  if (products.length === 0) {
    writeJSON(PRODUCTS_FILE, initialProducts as Product[]);
    return initialProducts as Product[];
  }
  return products;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const redis = getRedis();
  if (redis) {
    const p = await redis.get(`product:${id}`);
    return p ? (p as Product) : undefined;
  }
  return readJSON<Product>(PRODUCTS_FILE).find((p) => p.id === id);
}

export async function createProduct(
  data: Omit<Product, "id">
): Promise<Product> {
  const newProduct: Product = { ...data, id: `p${Date.now()}` };
  const redis = getRedis();
  if (redis) {
    await redis.set(`product:${newProduct.id}`, JSON.stringify(newProduct));
    await redis.rpush("products:ids", newProduct.id);
    return newProduct;
  }
  const products = readJSON<Product>(PRODUCTS_FILE);
  products.push(newProduct);
  writeJSON(PRODUCTS_FILE, products);
  return newProduct;
}

export async function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<Product | null> {
  const redis = getRedis();
  if (redis) {
    const p = await redis.get(`product:${id}`);
    if (!p) return null;
    const updated = { ...(p as Product), ...data };
    await redis.set(`product:${id}`, JSON.stringify(updated));
    return updated;
  }
  const products = readJSON<Product>(PRODUCTS_FILE);
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...data };
  writeJSON(PRODUCTS_FILE, products);
  return products[idx];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    const exists = await redis.exists(`product:${id}`);
    if (!exists) return false;
    await redis.del(`product:${id}`);
    await redis.lrem("products:ids", 0, id);
    return true;
  }
  const products = readJSON<Product>(PRODUCTS_FILE);
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  writeJSON(PRODUCTS_FILE, filtered);
  return true;
}
