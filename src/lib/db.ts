import fs from "fs";
import path from "path";
import { products as initialProducts } from "@/data/products";

// Paths to the JSON "database" files
const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

// ── Generic helpers ────────────────────────────────────────────────────────────

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
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ── Orders ────────────────────────────────────────────────────────────────────

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

export function getOrders(): Order[] {
  return readJSON<Order>(ORDERS_FILE);
}

export function getOrderById(id: string): Order | undefined {
  return getOrders().find((o) => o.id === id);
}

export function createOrder(
  customer: CustomerInfo,
  items: CartItem[],
  total: number,
  razorpayOrderId?: string,
  razorpayPaymentId?: string
): Order {
  const orders = getOrders();
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
  orders.unshift(newOrder); // latest first
  writeJSON(ORDERS_FILE, orders);
  return newOrder;
}

export function updateOrderStatus(
  id: string,
  status: OrderStatus
): Order | null {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], status };
  writeJSON(ORDERS_FILE, orders);
  return orders[idx];
}

// ── Products ──────────────────────────────────────────────────────────────────

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

export function getProducts(): Product[] {
  const products = readJSON<Product>(PRODUCTS_FILE);
  // Seed with initial products if DB is empty
  if (products.length === 0) {
    writeJSON(PRODUCTS_FILE, initialProducts as Product[]);
    return initialProducts as Product[];
  }
  return products;
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id);
}

export function createProduct(data: Omit<Product, "id">): Product {
  const products = getProducts();
  const newProduct: Product = { ...data, id: `p${Date.now()}` };
  products.push(newProduct);
  writeJSON(PRODUCTS_FILE, products);
  return newProduct;
}

export function updateProduct(
  id: string,
  data: Partial<Product>
): Product | null {
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...data };
  writeJSON(PRODUCTS_FILE, products);
  return products[idx];
}

export function deleteProduct(id: string): boolean {
  const products = getProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  writeJSON(PRODUCTS_FILE, filtered);
  return true;
}
