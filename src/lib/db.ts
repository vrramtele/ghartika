/**
 * db.ts — Unified database layer
 * Uses Upstash Redis (via @upstash/redis) when KV_REST_API_URL is set,
 * falls back to local JSON files for local development.
 */

import type {
  Order,
  OrderStatus,
  CustomerInfo,
  CartItem,
  Product,
  StatusHistoryEntry,
  Coupon,
  AbandonedCart,
  Review,
  ReviewStatus,
  StoreSettings,
  InventoryLog,
  InventoryReason,
  StaffMember,
  StaffRole,
  ActivityLog,
  // Phase 4
  Category,
  Expense,
  Supplier,
  PurchaseOrder,
  MediaFile,
  AdminNotification,
  SEOPageMeta,
  // Phase 5: Costing
  RawMaterial,
  ProductRecipe,
  ProductCostConfig,
  CostHistoryRecord,
  OrderLineCostSnapshot,
  CostingSettings,
  MeasurementUnit,
  CostingMethod,
} from "@/types";
import { products as initialProducts } from "@/data/products";
import { createLineItemCostSnapshot } from "@/lib/costing-engine";
import fs from "fs";
import path from "path";

// Re-export types for legacy imports (routes that import from @/lib/db)
export type {
  Order,
  OrderStatus,
  CustomerInfo,
  CartItem,
  Product,
  Coupon,
  AbandonedCart,
  Review,
  ReviewStatus,
  StoreSettings,
  InventoryLog,
  InventoryReason,
  StaffMember,
  StaffRole,
  ActivityLog,
  // Phase 4
  Category,
  Expense,
  Supplier,
  PurchaseOrder,
  MediaFile,
  AdminNotification,
  SEOPageMeta,
  // Phase 5: Costing
  RawMaterial,
  ProductRecipe,
  ProductCostConfig,
  CostHistoryRecord,
  OrderLineCostSnapshot,
  CostingSettings,
  MeasurementUnit,
  CostingMethod,
};

// ── Redis client (lazy) ───────────────────────────────────────────────────────

function getRedis() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
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
const COUPONS_FILE = path.join(DATA_DIR, "coupons.json");
const ABANDONED_CARTS_FILE = path.join(DATA_DIR, "abandoned_carts.json");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const INVENTORY_LOGS_FILE = path.join(DATA_DIR, "inventory_logs.json");
const ACTIVITY_LOGS_FILE = path.join(DATA_DIR, "activity_logs.json");
const STAFF_FILE = path.join(DATA_DIR, "staff.json");
// Phase 4 files
const CATEGORIES_FILE = path.join(DATA_DIR, "categories.json");
const EXPENSES_FILE = path.join(DATA_DIR, "expenses.json");
const SUPPLIERS_FILE = path.join(DATA_DIR, "suppliers.json");
const PURCHASE_ORDERS_FILE = path.join(DATA_DIR, "purchase_orders.json");
const MEDIA_FILE = path.join(DATA_DIR, "media.json");
const NOTIFICATIONS_FILE = path.join(DATA_DIR, "notifications.json");
const SEO_FILE = path.join(DATA_DIR, "seo.json");
// Phase 5 Costing files
const RAW_MATERIALS_FILE = path.join(DATA_DIR, "raw_materials.json");
const RECIPES_FILE = path.join(DATA_DIR, "recipes.json");
const PRODUCT_COSTS_FILE = path.join(DATA_DIR, "product_costs.json");
const COST_HISTORY_FILE = path.join(DATA_DIR, "cost_history.json");
const COST_SNAPSHOTS_FILE = path.join(DATA_DIR, "cost_snapshots.json");
const COSTING_SETTINGS_FILE = path.join(DATA_DIR, "costing_settings.json");

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseRedisValue<T>(value: T | string | null): T | null {
  if (value === null || value === undefined) return null;
  return typeof value === "string" ? JSON.parse(value) : value;
}

/** Derives payment method from existing fields for backward-compat with old orders */
function derivePaymentMethod(order: Order): Order {
  if (!order.paymentMethod) {
    order.paymentMethod =
      order.razorpayOrderId === "COD" || !order.razorpayOrderId
        ? "COD"
        : "Online";
  }
  if (!order.paymentStatus) {
    order.paymentStatus =
      order.paymentMethod === "COD" ? "Pending" : "Paid";
  }
  if (!order.statusHistory) {
    // Seed history from the single current status
    order.statusHistory = [
      { status: order.status, timestamp: order.date },
    ];
  }
  return order;
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function getOrders(): Promise<Order[]> {
  const redis = getRedis();
  if (redis) {
    const ids: string[] = (await redis.lrange("orders:ids", 0, -1)) || [];
    if (ids.length === 0) return [];
    const results = (await redis.mget(
      ...ids.map((id: string) => `order:${id}`)
    )) as (Order | string | null)[];
    return results
      .filter((o): o is Order | string => o !== null && o !== undefined)
      .map((o) => derivePaymentMethod(parseRedisValue<Order>(o as Order | string)!));
  }
  return readJSON<Order>(ORDERS_FILE).map(derivePaymentMethod);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const redis = getRedis();
  if (redis) {
    const o = await redis.get(`order:${id}`);
    if (!o) return undefined;
    return derivePaymentMethod(parseRedisValue<Order>(o as Order | string)!);
  }
  const order = readJSON<Order>(ORDERS_FILE).find((o) => o.id === id);
  return order ? derivePaymentMethod(order) : undefined;
}

export async function createOrder(
  customer: CustomerInfo,
  items: CartItem[],
  total: number,
  razorpayOrderId?: string,
  razorpayPaymentId?: string
): Promise<Order> {
  const isOnline = razorpayOrderId && razorpayOrderId !== "COD";
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    date: now,
    customer,
    items,
    total,
    status: "Pending",
    paymentMethod: isOnline ? "Online" : "COD",
    paymentStatus: isOnline ? "Paid" : "Pending",
    razorpayOrderId,
    razorpayPaymentId,
    statusHistory: [{ status: "Pending", timestamp: now }],
  };

  const redis = getRedis();
  if (redis) {
    await redis.set(`order:${newOrder.id}`, JSON.stringify(newOrder));
    await redis.lpush("orders:ids", newOrder.id);
  } else {
    const orders = readJSON<Order>(ORDERS_FILE);
    orders.unshift(newOrder);
    writeJSON(ORDERS_FILE, orders);
  }

  // Record immutable line item cost snapshots at order creation event
  try {
    await recordOrderCostSnapshots(newOrder);
  } catch (err) {
    console.error("Error creating cost snapshot:", err);
  }

  return newOrder;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  note?: string
): Promise<Order | null> {
  const existing = await getOrderById(id);
  if (!existing) return null;

  const historyEntry: StatusHistoryEntry = {
    status,
    timestamp: new Date().toISOString(),
    ...(note ? { note } : {}),
  };

  const updated: Order = {
    ...existing,
    status,
    statusHistory: [...(existing.statusHistory || []), historyEntry],
  };

  const redis = getRedis();
  if (redis) {
    await redis.set(`order:${id}`, JSON.stringify(updated));
    return updated;
  }

  const orders = readJSON<Order>(ORDERS_FILE);
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx] = updated;
  writeJSON(ORDERS_FILE, orders);
  return updated;
}

/** Full patch of an order (shipping, notes, payment status, etc.) */
export async function updateOrder(
  id: string,
  patch: Partial<Omit<Order, "id" | "date" | "customer" | "items">>
): Promise<Order | null> {
  const existing = await getOrderById(id);
  if (!existing) return null;

  // If status is being changed, append to history
  let statusHistory = existing.statusHistory || [];
  if (patch.status && patch.status !== existing.status) {
    statusHistory = [
      ...statusHistory,
      { status: patch.status, timestamp: new Date().toISOString() },
    ];
    patch = { ...patch, statusHistory };
  }

  const updated: Order = { ...existing, ...patch };

  const redis = getRedis();
  if (redis) {
    await redis.set(`order:${id}`, JSON.stringify(updated));
    return updated;
  }

  const orders = readJSON<Order>(ORDERS_FILE);
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx] = updated;
  writeJSON(ORDERS_FILE, orders);
  return updated;
}

/** Bulk update status on multiple orders at once */
export async function bulkUpdateOrderStatus(
  ids: string[],
  status: OrderStatus
): Promise<{ updated: number; failed: string[] }> {
  let updated = 0;
  const failed: string[] = [];

  for (const id of ids) {
    const result = await updateOrderStatus(id, status);
    if (result) updated++;
    else failed.push(id);
  }

  return { updated, failed };
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const redis = getRedis();
  if (redis) {
    const ids: string[] = (await redis.lrange("products:ids", 0, -1)) || [];
    if (ids.length === 0) {
      for (const p of initialProducts as Product[]) {
        await redis.set(`product:${p.id}`, JSON.stringify(p));
        await redis.rpush("products:ids", p.id);
      }
      return initialProducts as Product[];
    }
    const results = (await redis.mget(
      ...ids.map((id: string) => `product:${id}`)
    )) as (Product | string | null)[];
    return results
      .filter((p): p is Product | string => p !== null && p !== undefined)
      .map((p) => parseRedisValue<Product>(p as Product | string)!);
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
    if (!p) return undefined;
    return parseRedisValue<Product>(p as Product | string)!;
  }
  return readJSON<Product>(PRODUCTS_FILE).find((p) => p.id === id);
}

export async function createProduct(
  data: Omit<Product, "id">
): Promise<Product> {
  const newProduct: Product = {
    ...data,
    id: `p${Date.now()}`,
    isActive: data.isActive !== false, // default active
    gstPercent: data.gstPercent ?? 5,  // default 5% for spices
  };
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
    const existing = parseRedisValue<Product>(p as Product | string)!;
    const updated = { ...existing, ...data };
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

export async function duplicateProduct(id: string): Promise<Product | null> {
  const original = await getProductById(id);
  if (!original) return null;
  const { id: _id, ...rest } = original;
  void _id;
  return createProduct({ ...rest, name: `${rest.name} (Copy)` });
}

// ── Phase 2: Coupons ──────────────────────────────────────────────────────────

export async function getCoupons(): Promise<Coupon[]> {
  const redis = getRedis();
  if (redis) {
    const ids: string[] = (await redis.lrange("coupons:ids", 0, -1)) || [];
    if (ids.length === 0) return [];
    const results = (await redis.mget(
      ...ids.map((id: string) => `coupon:${id}`)
    )) as (Coupon | string | null)[];
    return results
      .filter((c): c is Coupon | string => c !== null && c !== undefined)
      .map((c) => parseRedisValue<Coupon>(c)!)
      .filter(Boolean);
  }
  return readJSON<Coupon>(COUPONS_FILE);
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const cleaned = code.trim().toUpperCase();
  const redis = getRedis();
  if (redis) {
    const couponId = await redis.get(`coupon_code:${cleaned}`);
    if (!couponId) return null;
    const raw = await redis.get(`coupon:${couponId}`);
    return parseRedisValue<Coupon>(raw as Coupon | string);
  }
  const coupons = readJSON<Coupon>(COUPONS_FILE);
  return coupons.find((c) => c.code.toUpperCase() === cleaned) || null;
}

export async function createCoupon(data: Omit<Coupon, "id" | "createdAt" | "usedCount">): Promise<Coupon> {
  const coupon: Coupon = {
    ...data,
    id: `cpn_${Date.now()}`,
    code: data.code.trim().toUpperCase(),
    usedCount: 0,
    createdAt: new Date().toISOString(),
  };

  const redis = getRedis();
  if (redis) {
    await redis.set(`coupon:${coupon.id}`, JSON.stringify(coupon));
    await redis.set(`coupon_code:${coupon.code}`, coupon.id);
    await redis.rpush("coupons:ids", coupon.id);
    return coupon;
  }
  const coupons = readJSON<Coupon>(COUPONS_FILE);
  coupons.push(coupon);
  writeJSON(COUPONS_FILE, coupons);
  return coupon;
}

export async function updateCoupon(id: string, patch: Partial<Coupon>): Promise<Coupon | null> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(`coupon:${id}`);
    if (!raw) return null;
    const existing = parseRedisValue<Coupon>(raw as Coupon | string)!;
    const updated: Coupon = { ...existing, ...patch };
    await redis.set(`coupon:${id}`, JSON.stringify(updated));
    if (patch.code && patch.code !== existing.code) {
      await redis.del(`coupon_code:${existing.code}`);
      await redis.set(`coupon_code:${patch.code.toUpperCase()}`, id);
    }
    return updated;
  }
  const coupons = readJSON<Coupon>(COUPONS_FILE);
  const idx = coupons.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  coupons[idx] = { ...coupons[idx], ...patch };
  writeJSON(COUPONS_FILE, coupons);
  return coupons[idx];
}

export async function deleteCoupon(id: string): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(`coupon:${id}`);
    if (!raw) return false;
    const existing = parseRedisValue<Coupon>(raw as Coupon | string)!;
    await redis.del(`coupon:${id}`);
    await redis.del(`coupon_code:${existing.code}`);
    await redis.lrem("coupons:ids", 0, id);
    return true;
  }
  const coupons = readJSON<Coupon>(COUPONS_FILE);
  const filtered = coupons.filter((c) => c.id !== id);
  if (filtered.length === coupons.length) return false;
  writeJSON(COUPONS_FILE, filtered);
  return true;
}

export async function incrementCouponUsage(code: string): Promise<void> {
  const coupon = await getCouponByCode(code);
  if (!coupon) return;
  await updateCoupon(coupon.id, { usedCount: coupon.usedCount + 1 });
}

// ── Phase 2: Abandoned Carts ──────────────────────────────────────────────────

export async function getAbandonedCarts(): Promise<AbandonedCart[]> {
  const redis = getRedis();
  if (redis) {
    const ids: string[] = (await redis.lrange("abandoned_carts:ids", 0, 199)) || [];
    if (ids.length === 0) return [];
    const results = (await redis.mget(
      ...ids.map((id: string) => `abandoned_cart:${id}`)
    )) as (AbandonedCart | string | null)[];
    return results
      .filter((c): c is AbandonedCart | string => c !== null && c !== undefined)
      .map((c) => parseRedisValue<AbandonedCart>(c)!)
      .filter(Boolean);
  }
  return readJSON<AbandonedCart>(ABANDONED_CARTS_FILE);
}

export async function saveAbandonedCart(data: Omit<AbandonedCart, "id" | "date" | "recovered">): Promise<AbandonedCart> {
  const cart: AbandonedCart = {
    ...data,
    id: `ac_${Date.now()}`,
    date: new Date().toISOString(),
    recovered: false,
  };

  const redis = getRedis();
  if (redis) {
    await redis.set(`abandoned_cart:${cart.id}`, JSON.stringify(cart));
    await redis.lpush("abandoned_carts:ids", cart.id);
    return cart;
  }
  const carts = readJSON<AbandonedCart>(ABANDONED_CARTS_FILE);
  carts.unshift(cart);
  writeJSON(ABANDONED_CARTS_FILE, carts.slice(0, 200));
  return cart;
}

export async function markCartRecovered(id: string, note?: string): Promise<AbandonedCart | null> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(`abandoned_cart:${id}`);
    if (!raw) return null;
    const existing = parseRedisValue<AbandonedCart>(raw as AbandonedCart | string)!;
    const updated: AbandonedCart = { ...existing, recovered: true, recoveryNote: note || existing.recoveryNote };
    await redis.set(`abandoned_cart:${id}`, JSON.stringify(updated));
    return updated;
  }
  const carts = readJSON<AbandonedCart>(ABANDONED_CARTS_FILE);
  const idx = carts.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  carts[idx] = { ...carts[idx], recovered: true, recoveryNote: note || carts[idx].recoveryNote };
  writeJSON(ABANDONED_CARTS_FILE, carts);
  return carts[idx];
}

// ── Phase 2: Reviews ──────────────────────────────────────────────────────────

const SEED_REVIEWS: Review[] = [
  {
    id: "rev_1",
    productId: "p1",
    productName: "Red Chilli Powder (Lal Mirchi)",
    customerName: "Ananya Sharma",
    customerPhone: "9876543210",
    rating: 5,
    comment: "Bilkul gaon jaisi khushboo aur colour hai. Fresh and perfectly spicy!",
    status: "approved",
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    reply: "Thank you Ananya ji! Khushi hui sunkar ❤️",
  },
  {
    id: "rev_2",
    productId: "p2",
    productName: "Turmeric Powder (Haldi)",
    customerName: "Vikram Mehta",
    customerPhone: "9812345678",
    rating: 5,
    comment: "Natural golden yellow colour without any adulteration. Superb quality.",
    status: "approved",
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "rev_3",
    productId: "p3",
    productName: "Coriander Powder (Dhaniya)",
    customerName: "Rakesh Patel",
    customerPhone: "9898989898",
    rating: 4,
    comment: "Aroma is very fresh. Delivery took 4 days in Gujarat, otherwise 5 star.",
    status: "pending",
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export async function getReviews(productId?: string): Promise<Review[]> {
  const redis = getRedis();
  if (redis) {
    const ids: string[] = (await redis.lrange("reviews:ids", 0, -1)) || [];
    if (ids.length === 0) return SEED_REVIEWS;
    const results = (await redis.mget(
      ...ids.map((id: string) => `review:${id}`)
    )) as (Review | string | null)[];
    const parsed = results
      .filter((r): r is Review | string => r !== null && r !== undefined)
      .map((r) => parseRedisValue<Review>(r)!)
      .filter(Boolean);
    return productId ? parsed.filter((r) => r.productId === productId) : parsed;
  }
  const reviews = readJSON<Review>(REVIEWS_FILE);
  if (reviews.length === 0) {
    writeJSON(REVIEWS_FILE, SEED_REVIEWS);
    return productId ? SEED_REVIEWS.filter((r) => r.productId === productId) : SEED_REVIEWS;
  }
  return productId ? reviews.filter((r) => r.productId === productId) : reviews;
}

export async function createReview(data: Omit<Review, "id" | "date" | "status">): Promise<Review> {
  const review: Review = {
    ...data,
    id: `rev_${Date.now()}`,
    status: "pending",
    date: new Date().toISOString(),
  };

  const redis = getRedis();
  if (redis) {
    await redis.set(`review:${review.id}`, JSON.stringify(review));
    await redis.lpush("reviews:ids", review.id);
    return review;
  }
  const reviews = readJSON<Review>(REVIEWS_FILE);
  reviews.unshift(review);
  writeJSON(REVIEWS_FILE, reviews);
  return review;
}

export async function updateReviewStatus(
  id: string,
  status: ReviewStatus,
  reply?: string
): Promise<Review | null> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(`review:${id}`);
    if (!raw) return null;
    const existing = parseRedisValue<Review>(raw as Review | string)!;
    const updated: Review = {
      ...existing,
      status,
      reply: reply !== undefined ? reply : existing.reply,
    };
    await redis.set(`review:${id}`, JSON.stringify(updated));
    return updated;
  }
  const reviews = readJSON<Review>(REVIEWS_FILE);
  const idx = reviews.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  reviews[idx] = {
    ...reviews[idx],
    status,
    reply: reply !== undefined ? reply : reviews[idx].reply,
  };
  writeJSON(REVIEWS_FILE, reviews);
  return reviews[idx];
}

export async function deleteReview(id: string): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    const exists = await redis.exists(`review:${id}`);
    if (!exists) return false;
    await redis.del(`review:${id}`);
    await redis.lrem("reviews:ids", 0, id);
    return true;
  }
  const reviews = readJSON<Review>(REVIEWS_FILE);
  const filtered = reviews.filter((r) => r.id !== id);
  if (filtered.length === reviews.length) return false;
  writeJSON(REVIEWS_FILE, filtered);
  return true;
}

// ── Phase 2: Storefront Settings ──────────────────────────────────────────────

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Ghartika Pure Spices",
  gstin: "23AAAAA0000A1Z5",
  fssaiNumber: "10023043000123",
  registeredAddress: "Ghartika Spices, 12 Commercial Area, Indore, Madhya Pradesh — 452001",
  announcementText: "🌿 100% Shuddh & Taaza Masale — Free delivery on orders above ₹499!",
  announcementActive: true,
  announcementLink: "/shop",
  heroHeadline: "Ghar Ka Asli Swaad",
  heroSubheadline: "Stone ground, pesticide-free pure Indian spices delivered fresh to your doorstep.",
  contactPhone: "+91 98765 43210",
  contactEmail: "support@ghartika.in",
  freeShippingThreshold: 499,
  enableCod: true,
  enableOnlinePayment: true,
  maintenanceMode: false,
  instagramUrl: "https://instagram.com/ghartikaspices",
  whatsappSupport: "+91 98765 43210",
};

export async function getStoreSettings(): Promise<StoreSettings> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get("store:settings");
    if (!raw) return DEFAULT_SETTINGS;
    return parseRedisValue<StoreSettings>(raw as StoreSettings | string) || DEFAULT_SETTINGS;
  }
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), "utf-8");
      return DEFAULT_SETTINGS;
    }
    const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateStoreSettings(patch: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getStoreSettings();
  const updated: StoreSettings = { ...current, ...patch };
  const redis = getRedis();
  if (redis) {
    await redis.set("store:settings", JSON.stringify(updated));
    return updated;
  }
  writeJSON(SETTINGS_FILE, [updated]);
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}

// ── Phase 3: Inventory Audit Logs ─────────────────────────────────────────────

const SEED_INVENTORY_LOGS: InventoryLog[] = [
  {
    id: "inv_1",
    productId: "p1",
    productName: "Red Chilli Powder (Lal Mirchi)",
    change: 50,
    previousStock: 10,
    newStock: 60,
    reason: "Restock",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedBy: "Admin",
  },
  {
    id: "inv_2",
    productId: "p2",
    productName: "Turmeric Powder (Haldi)",
    change: -2,
    previousStock: 45,
    newStock: 43,
    reason: "Order Placed",
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedBy: "System",
  },
];

export async function getInventoryLogs(productId?: string): Promise<InventoryLog[]> {
  const redis = getRedis();
  if (redis) {
    const ids: string[] = (await redis.lrange("inventory_logs:ids", 0, 199)) || [];
    if (ids.length === 0) return SEED_INVENTORY_LOGS;
    const results = (await redis.mget(
      ...ids.map((id: string) => `inventory_log:${id}`)
    )) as (InventoryLog | string | null)[];
    const parsed = results
      .filter((r): r is InventoryLog | string => r !== null && r !== undefined)
      .map((r) => parseRedisValue<InventoryLog>(r)!)
      .filter(Boolean);
    return productId ? parsed.filter((l) => l.productId === productId) : parsed;
  }
  const logs = readJSON<InventoryLog>(INVENTORY_LOGS_FILE);
  if (logs.length === 0) {
    writeJSON(INVENTORY_LOGS_FILE, SEED_INVENTORY_LOGS);
    return productId ? SEED_INVENTORY_LOGS.filter((l) => l.productId === productId) : SEED_INVENTORY_LOGS;
  }
  return productId ? logs.filter((l) => l.productId === productId) : logs;
}

export async function addInventoryLog(data: Omit<InventoryLog, "id" | "date">): Promise<InventoryLog> {
  const log: InventoryLog = {
    ...data,
    id: `inv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    date: new Date().toISOString(),
  };

  const redis = getRedis();
  if (redis) {
    await redis.set(`inventory_log:${log.id}`, JSON.stringify(log));
    await redis.lpush("inventory_logs:ids", log.id);
    return log;
  }
  const logs = readJSON<InventoryLog>(INVENTORY_LOGS_FILE);
  logs.unshift(log);
  writeJSON(INVENTORY_LOGS_FILE, logs.slice(0, 300));
  return log;
}

// ── Phase 3: Activity Audit Logs ──────────────────────────────────────────────

export async function getActivityLogs(): Promise<ActivityLog[]> {
  const redis = getRedis();
  if (redis) {
    const ids: string[] = (await redis.lrange("activity_logs:ids", 0, 199)) || [];
    if (ids.length === 0) return [];
    const results = (await redis.mget(
      ...ids.map((id: string) => `activity_log:${id}`)
    )) as (ActivityLog | string | null)[];
    return results
      .filter((r): r is ActivityLog | string => r !== null && r !== undefined)
      .map((r) => parseRedisValue<ActivityLog>(r)!)
      .filter(Boolean);
  }
  return readJSON<ActivityLog>(ACTIVITY_LOGS_FILE);
}

export async function logActivity(action: string, details: string, role?: string): Promise<ActivityLog> {
  const log: ActivityLog = {
    id: `act_${Date.now()}`,
    action,
    details,
    timestamp: new Date().toISOString(),
    role: role || "Owner",
  };

  const redis = getRedis();
  if (redis) {
    await redis.set(`activity_log:${log.id}`, JSON.stringify(log));
    await redis.lpush("activity_logs:ids", log.id);
    return log;
  }
  const logs = readJSON<ActivityLog>(ACTIVITY_LOGS_FILE);
  logs.unshift(log);
  writeJSON(ACTIVITY_LOGS_FILE, logs.slice(0, 200));
  return log;
}

// ── Phase 3: Staff Management ─────────────────────────────────────────────────

const SEED_STAFF: StaffMember[] = [
  {
    id: "staff_1",
    name: "Pradeep Sharma",
    email: "pradeep@ghartika.in",
    role: "Owner",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "staff_2",
    name: "Ramesh Kumar",
    email: "ramesh@ghartika.in",
    role: "Packer",
    status: "active",
    createdAt: new Date().toISOString(),
  },
];

export async function getStaffMembers(): Promise<StaffMember[]> {
  const redis = getRedis();
  if (redis) {
    const ids: string[] = (await redis.lrange("staff:ids", 0, -1)) || [];
    if (ids.length === 0) return SEED_STAFF;
    const results = (await redis.mget(
      ...ids.map((id: string) => `staff:${id}`)
    )) as (StaffMember | string | null)[];
    return results
      .filter((r): r is StaffMember | string => r !== null && r !== undefined)
      .map((r) => parseRedisValue<StaffMember>(r)!)
      .filter(Boolean);
  }
  const staff = readJSON<StaffMember>(STAFF_FILE);
  if (staff.length === 0) {
    writeJSON(STAFF_FILE, SEED_STAFF);
    return SEED_STAFF;
  }
  return staff;
}

export async function createStaffMember(data: Omit<StaffMember, "id" | "createdAt">): Promise<StaffMember> {
  const member: StaffMember = {
    ...data,
    id: `staff_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const redis = getRedis();
  if (redis) {
    await redis.set(`staff:${member.id}`, JSON.stringify(member));
    await redis.rpush("staff:ids", member.id);
    return member;
  }
  const staff = readJSON<StaffMember>(STAFF_FILE);
  staff.push(member);
  writeJSON(STAFF_FILE, staff);
  return member;
}

export async function updateStaffMember(id: string, patch: Partial<StaffMember>): Promise<StaffMember | null> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(`staff:${id}`);
    if (!raw) return null;
    const existing = parseRedisValue<StaffMember>(raw as StaffMember | string)!;
    const updated: StaffMember = { ...existing, ...patch };
    await redis.set(`staff:${id}`, JSON.stringify(updated));
    return updated;
  }
  const staff = readJSON<StaffMember>(STAFF_FILE);
  const idx = staff.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  staff[idx] = { ...staff[idx], ...patch };
  writeJSON(STAFF_FILE, staff);
  return staff[idx];
}

export async function deleteStaffMember(id: string): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    const exists = await redis.exists(`staff:${id}`);
    if (!exists) return false;
    await redis.del(`staff:${id}`);
    await redis.lrem("staff:ids", 0, id);
    return true;
  }
  const staff = readJSON<StaffMember>(STAFF_FILE);
  const filtered = staff.filter((s) => s.id !== id);
  if (filtered.length === staff.length) return false;
  writeJSON(STAFF_FILE, filtered);
  return true;
}

// ── Phase 4: Categories ───────────────────────────────────────────────────────

const SEED_CATEGORIES: Category[] = [
  { id: "cat_1", name: "Everyday Essentials", slug: "everyday-essentials", description: "Must-have spices for daily cooking", isActive: true, sortOrder: 1, createdAt: new Date().toISOString() },
  { id: "cat_2", name: "Premium Blends", slug: "premium-blends", description: "Expertly crafted spice blends", isActive: true, sortOrder: 2, createdAt: new Date().toISOString() },
  { id: "cat_3", name: "Combos", slug: "combos", description: "Value packs and gift sets", isActive: true, sortOrder: 3, createdAt: new Date().toISOString() },
];

export async function getCategories(): Promise<Category[]> {
  const redis = getRedis();
  if (redis) {
    const ids: string[] = (await redis.lrange("categories:ids", 0, -1)) || [];
    if (ids.length === 0) {
      for (const c of SEED_CATEGORIES) {
        await redis.set(`category:${c.id}`, JSON.stringify(c));
        await redis.rpush("categories:ids", c.id);
      }
      return SEED_CATEGORIES;
    }
    const results = (await redis.mget(...ids.map((id: string) => `category:${id}`))) as (Category | string | null)[];
    return results.filter(Boolean).map((c) => parseRedisValue<Category>(c as Category | string)!);
  }
  const cats = readJSON<Category>(CATEGORIES_FILE);
  if (cats.length === 0) { writeJSON(CATEGORIES_FILE, SEED_CATEGORIES); return SEED_CATEGORIES; }
  return cats;
}

export async function createCategory(data: Omit<Category, "id" | "createdAt">): Promise<Category> {
  const cat: Category = { ...data, id: `cat_${Date.now()}`, createdAt: new Date().toISOString() };
  const redis = getRedis();
  if (redis) { await redis.set(`category:${cat.id}`, JSON.stringify(cat)); await redis.rpush("categories:ids", cat.id); return cat; }
  const cats = readJSON<Category>(CATEGORIES_FILE); cats.push(cat); writeJSON(CATEGORIES_FILE, cats); return cat;
}

export async function updateCategory(id: string, patch: Partial<Category>): Promise<Category | null> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(`category:${id}`); if (!raw) return null;
    const updated = { ...parseRedisValue<Category>(raw as Category | string)!, ...patch };
    await redis.set(`category:${id}`, JSON.stringify(updated)); return updated;
  }
  const cats = readJSON<Category>(CATEGORIES_FILE);
  const idx = cats.findIndex((c) => c.id === id); if (idx === -1) return null;
  cats[idx] = { ...cats[idx], ...patch }; writeJSON(CATEGORIES_FILE, cats); return cats[idx];
}

export async function deleteCategory(id: string): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    if (!(await redis.exists(`category:${id}`))) return false;
    await redis.del(`category:${id}`); await redis.lrem("categories:ids", 0, id); return true;
  }
  const cats = readJSON<Category>(CATEGORIES_FILE);
  const filtered = cats.filter((c) => c.id !== id);
  if (filtered.length === cats.length) return false;
  writeJSON(CATEGORIES_FILE, filtered); return true;
}

// ── Phase 4: Expenses ─────────────────────────────────────────────────────────

export async function getExpenses(): Promise<Expense[]> {
  const redis = getRedis();
  if (redis) {
    const ids: string[] = (await redis.lrange("expenses:ids", 0, -1)) || [];
    if (ids.length === 0) return [];
    const results = (await redis.mget(...ids.map((id: string) => `expense:${id}`))) as (Expense | string | null)[];
    return results.filter(Boolean).map((e) => parseRedisValue<Expense>(e as Expense | string)!);
  }
  return readJSON<Expense>(EXPENSES_FILE);
}

export async function createExpense(data: Omit<Expense, "id" | "createdAt">): Promise<Expense> {
  const expense: Expense = { ...data, id: `exp_${Date.now()}`, createdAt: new Date().toISOString() };
  const redis = getRedis();
  if (redis) { await redis.set(`expense:${expense.id}`, JSON.stringify(expense)); await redis.lpush("expenses:ids", expense.id); return expense; }
  const expenses = readJSON<Expense>(EXPENSES_FILE); expenses.unshift(expense); writeJSON(EXPENSES_FILE, expenses); return expense;
}

export async function updateExpense(id: string, patch: Partial<Expense>): Promise<Expense | null> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(`expense:${id}`); if (!raw) return null;
    const updated = { ...parseRedisValue<Expense>(raw as Expense | string)!, ...patch };
    await redis.set(`expense:${id}`, JSON.stringify(updated)); return updated;
  }
  const expenses = readJSON<Expense>(EXPENSES_FILE);
  const idx = expenses.findIndex((e) => e.id === id); if (idx === -1) return null;
  expenses[idx] = { ...expenses[idx], ...patch }; writeJSON(EXPENSES_FILE, expenses); return expenses[idx];
}

export async function deleteExpense(id: string): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    if (!(await redis.exists(`expense:${id}`))) return false;
    await redis.del(`expense:${id}`); await redis.lrem("expenses:ids", 0, id); return true;
  }
  const expenses = readJSON<Expense>(EXPENSES_FILE);
  const filtered = expenses.filter((e) => e.id !== id);
  if (filtered.length === expenses.length) return false;
  writeJSON(EXPENSES_FILE, filtered); return true;
}

// ── Phase 4: Suppliers ────────────────────────────────────────────────────────

export async function getSuppliers(): Promise<Supplier[]> {
  const redis = getRedis();
  if (redis) {
    const ids: string[] = (await redis.lrange("suppliers:ids", 0, -1)) || [];
    if (ids.length === 0) return [];
    const results = (await redis.mget(...ids.map((id: string) => `supplier:${id}`))) as (Supplier | string | null)[];
    return results.filter(Boolean).map((s) => parseRedisValue<Supplier>(s as Supplier | string)!);
  }
  return readJSON<Supplier>(SUPPLIERS_FILE);
}

export async function createSupplier(data: Omit<Supplier, "id" | "createdAt">): Promise<Supplier> {
  const supplier: Supplier = { ...data, id: `sup_${Date.now()}`, createdAt: new Date().toISOString() };
  const redis = getRedis();
  if (redis) { await redis.set(`supplier:${supplier.id}`, JSON.stringify(supplier)); await redis.rpush("suppliers:ids", supplier.id); return supplier; }
  const suppliers = readJSON<Supplier>(SUPPLIERS_FILE); suppliers.push(supplier); writeJSON(SUPPLIERS_FILE, suppliers); return supplier;
}

export async function updateSupplier(id: string, patch: Partial<Supplier>): Promise<Supplier | null> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(`supplier:${id}`); if (!raw) return null;
    const updated = { ...parseRedisValue<Supplier>(raw as Supplier | string)!, ...patch };
    await redis.set(`supplier:${id}`, JSON.stringify(updated)); return updated;
  }
  const suppliers = readJSON<Supplier>(SUPPLIERS_FILE);
  const idx = suppliers.findIndex((s) => s.id === id); if (idx === -1) return null;
  suppliers[idx] = { ...suppliers[idx], ...patch }; writeJSON(SUPPLIERS_FILE, suppliers); return suppliers[idx];
}

export async function deleteSupplier(id: string): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    if (!(await redis.exists(`supplier:${id}`))) return false;
    await redis.del(`supplier:${id}`); await redis.lrem("suppliers:ids", 0, id); return true;
  }
  const suppliers = readJSON<Supplier>(SUPPLIERS_FILE);
  const filtered = suppliers.filter((s) => s.id !== id);
  if (filtered.length === suppliers.length) return false;
  writeJSON(SUPPLIERS_FILE, filtered); return true;
}

// ── Phase 4: Purchase Orders ──────────────────────────────────────────────────

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const redis = getRedis();
  if (redis) {
    const ids: string[] = (await redis.lrange("purchase_orders:ids", 0, -1)) || [];
    if (ids.length === 0) return [];
    const results = (await redis.mget(...ids.map((id: string) => `purchase_order:${id}`))) as (PurchaseOrder | string | null)[];
    return results.filter(Boolean).map((p) => parseRedisValue<PurchaseOrder>(p as PurchaseOrder | string)!);
  }
  return readJSON<PurchaseOrder>(PURCHASE_ORDERS_FILE);
}

export async function createPurchaseOrder(data: Omit<PurchaseOrder, "id" | "createdAt">): Promise<PurchaseOrder> {
  const po: PurchaseOrder = { ...data, id: `po_${Date.now()}`, createdAt: new Date().toISOString() };
  const redis = getRedis();
  if (redis) { await redis.set(`purchase_order:${po.id}`, JSON.stringify(po)); await redis.lpush("purchase_orders:ids", po.id); return po; }
  const pos = readJSON<PurchaseOrder>(PURCHASE_ORDERS_FILE); pos.unshift(po); writeJSON(PURCHASE_ORDERS_FILE, pos); return po;
}

export async function updatePurchaseOrder(id: string, patch: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(`purchase_order:${id}`); if (!raw) return null;
    const updated = { ...parseRedisValue<PurchaseOrder>(raw as PurchaseOrder | string)!, ...patch };
    await redis.set(`purchase_order:${id}`, JSON.stringify(updated)); return updated;
  }
  const pos = readJSON<PurchaseOrder>(PURCHASE_ORDERS_FILE);
  const idx = pos.findIndex((p) => p.id === id); if (idx === -1) return null;
  pos[idx] = { ...pos[idx], ...patch }; writeJSON(PURCHASE_ORDERS_FILE, pos); return pos[idx];
}

// ── Phase 4: Media Library ────────────────────────────────────────────────────

export async function getMediaFiles(): Promise<MediaFile[]> {
  const redis = getRedis();
  if (redis) {
    const ids: string[] = (await redis.lrange("media:ids", 0, 499)) || [];
    if (ids.length === 0) return [];
    const results = (await redis.mget(...ids.map((id: string) => `media:${id}`))) as (MediaFile | string | null)[];
    return results.filter(Boolean).map((m) => parseRedisValue<MediaFile>(m as MediaFile | string)!);
  }
  return readJSON<MediaFile>(MEDIA_FILE);
}

export async function createMediaFile(data: Omit<MediaFile, "id" | "uploadedAt">): Promise<MediaFile> {
  const file: MediaFile = { ...data, id: `med_${Date.now()}_${Math.floor(Math.random() * 1000)}`, uploadedAt: new Date().toISOString() };
  const redis = getRedis();
  if (redis) { await redis.set(`media:${file.id}`, JSON.stringify(file)); await redis.lpush("media:ids", file.id); return file; }
  const files = readJSON<MediaFile>(MEDIA_FILE); files.unshift(file); writeJSON(MEDIA_FILE, files.slice(0, 500)); return file;
}

export async function updateMediaFile(id: string, patch: Partial<MediaFile>): Promise<MediaFile | null> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(`media:${id}`); if (!raw) return null;
    const updated = { ...parseRedisValue<MediaFile>(raw as MediaFile | string)!, ...patch };
    await redis.set(`media:${id}`, JSON.stringify(updated)); return updated;
  }
  const files = readJSON<MediaFile>(MEDIA_FILE);
  const idx = files.findIndex((f) => f.id === id); if (idx === -1) return null;
  files[idx] = { ...files[idx], ...patch }; writeJSON(MEDIA_FILE, files); return files[idx];
}

export async function deleteMediaFile(id: string): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    if (!(await redis.exists(`media:${id}`))) return false;
    await redis.del(`media:${id}`); await redis.lrem("media:ids", 0, id); return true;
  }
  const files = readJSON<MediaFile>(MEDIA_FILE);
  const filtered = files.filter((f) => f.id !== id);
  if (filtered.length === files.length) return false;
  writeJSON(MEDIA_FILE, filtered); return true;
}

// ── Phase 4: Admin Notifications ─────────────────────────────────────────────

export async function getNotifications(): Promise<AdminNotification[]> {
  const redis = getRedis();
  if (redis) {
    const ids: string[] = (await redis.lrange("notifications:ids", 0, 99)) || [];
    if (ids.length === 0) return [];
    const results = (await redis.mget(...ids.map((id: string) => `notification:${id}`))) as (AdminNotification | string | null)[];
    return results.filter(Boolean).map((n) => parseRedisValue<AdminNotification>(n as AdminNotification | string)!);
  }
  return readJSON<AdminNotification>(NOTIFICATIONS_FILE);
}

export async function createNotification(data: Omit<AdminNotification, "id" | "createdAt" | "isRead">): Promise<AdminNotification> {
  const notif: AdminNotification = { ...data, id: `notif_${Date.now()}`, isRead: false, createdAt: new Date().toISOString() };
  const redis = getRedis();
  if (redis) { await redis.set(`notification:${notif.id}`, JSON.stringify(notif)); await redis.lpush("notifications:ids", notif.id); return notif; }
  const notifs = readJSON<AdminNotification>(NOTIFICATIONS_FILE); notifs.unshift(notif); writeJSON(NOTIFICATIONS_FILE, notifs.slice(0, 100)); return notif;
}

export async function markNotificationRead(id: string): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(`notification:${id}`); if (!raw) return false;
    const updated = { ...parseRedisValue<AdminNotification>(raw as AdminNotification | string)!, isRead: true };
    await redis.set(`notification:${id}`, JSON.stringify(updated)); return true;
  }
  const notifs = readJSON<AdminNotification>(NOTIFICATIONS_FILE);
  const idx = notifs.findIndex((n) => n.id === id); if (idx === -1) return false;
  notifs[idx].isRead = true; writeJSON(NOTIFICATIONS_FILE, notifs); return true;
}

export async function markAllNotificationsRead(): Promise<void> {
  const redis = getRedis();
  if (redis) {
    const ids: string[] = (await redis.lrange("notifications:ids", 0, 99)) || [];
    for (const id of ids) {
      const raw = await redis.get(`notification:${id}`);
      if (raw) { const n = { ...parseRedisValue<AdminNotification>(raw as AdminNotification | string)!, isRead: true }; await redis.set(`notification:${id}`, JSON.stringify(n)); }
    }
    return;
  }
  const notifs = readJSON<AdminNotification>(NOTIFICATIONS_FILE);
  writeJSON(NOTIFICATIONS_FILE, notifs.map((n) => ({ ...n, isRead: true })));
}

// ── Phase 4: SEO Metadata ────────────────────────────────────────────────────

const SEED_SEO: SEOPageMeta[] = [
  {
    id: "home",
    path: "/",
    pageType: "static",
    seoTitle: "Ghartika Spices | 100% Pure & Authentic Indian Spices",
    seoDescription: "Buy authentic stone-ground spices online directly from farmers. Handcrafted Turmeric, Red Chilli, Garam Masala & signature spice blends.",
    canonicalUrl: "https://ghartika.com/",
    ogTitle: "Ghartika Spices - Pure, Authentic & Fragrant",
    ogDescription: "Experience real spice aroma with zero adulteration. Farm fresh spices delivered across India.",
    ogImage: "/images/og-banner.jpg",
    robotsDirective: "index,follow",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "shop",
    path: "/#shop",
    pageType: "static",
    seoTitle: "Shop Farm Fresh Indian Spices Online | GharTika",
    seoDescription: "Browse our hand-picked collection of unadulterated ground spices, whole seeds, and chef-curated blends. Free shipping across India.",
    canonicalUrl: "https://ghartika.com/#shop",
    ogTitle: "Shop Pure Spices - GharTika Store",
    ogDescription: "Handcrafted pure spices with doorstep delivery.",
    robotsDirective: "index,follow",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "about",
    path: "/#about",
    pageType: "static",
    seoTitle: "About GharTika Spices | Our Heritage & Quality Promise",
    seoDescription: "Discover how GharTika sources direct from organic farms in Rajasthan & Kerala, stone-grinding small batches for peak essential oil retention.",
    canonicalUrl: "https://ghartika.com/#about",
    robotsDirective: "index,follow",
    updatedAt: new Date().toISOString(),
  },
];

export async function getSEOPages(): Promise<SEOPageMeta[]> {
  const redis = getRedis();
  if (redis) {
    const ids: string[] = (await redis.lrange("seo:ids", 0, -1)) || [];
    if (ids.length === 0) {
      for (const s of SEED_SEO) {
        await redis.set(`seo:${s.id}`, JSON.stringify(s));
        await redis.rpush("seo:ids", s.id);
      }
      return SEED_SEO;
    }
    const results = (await redis.mget(...ids.map((id: string) => `seo:${id}`))) as (SEOPageMeta | string | null)[];
    return results.filter(Boolean).map((s) => parseRedisValue<SEOPageMeta>(s as SEOPageMeta | string)!);
  }
  const pages = readJSON<SEOPageMeta>(SEO_FILE);
  if (pages.length === 0) {
    writeJSON(SEO_FILE, SEED_SEO);
    return SEED_SEO;
  }
  return pages;
}

export async function saveSEOPages(pages: SEOPageMeta[]): Promise<void> {
  const redis = getRedis();
  if (redis) {
    for (const page of pages) {
      await redis.set(`seo:${page.id}`, JSON.stringify(page));
    }
    return;
  }
  writeJSON(SEO_FILE, pages);
}

export async function updateSEOPages(id: string, patch: Partial<SEOPageMeta>): Promise<SEOPageMeta | null> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(`seo:${id}`);
    if (!raw) return null;
    const existing = parseRedisValue<SEOPageMeta>(raw as SEOPageMeta | string)!;
    const updated: SEOPageMeta = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    await redis.set(`seo:${id}`, JSON.stringify(updated));
    return updated;
  }
  const pages = readJSON<SEOPageMeta>(SEO_FILE);
  const idx = pages.findIndex((p) => p.id === id);
  if (idx === -1) {
    const newPage: SEOPageMeta = {
      id,
      path: patch.path || `/${id}`,
      pageType: patch.pageType || "static",
      seoTitle: patch.seoTitle || "",
      seoDescription: patch.seoDescription || "",
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    pages.push(newPage);
    writeJSON(SEO_FILE, pages);
    return newPage;
  }
  pages[idx] = { ...pages[idx], ...patch, updatedAt: new Date().toISOString() };
  writeJSON(SEO_FILE, pages);
  return pages[idx];
}

// ── Phase 5: Product Cost & Profit Database Layer ────────────────────────────

const DEFAULT_COSTING_SETTINGS: CostingSettings = {
  defaultWastagePercent: 5,
  defaultGstPercent: 5,
  costRecognitionEvent: "on_order_placed",
  includePackagingInCOGS: true,
  paymentGatewayFeePercent: 2.0,
  avgShippingCostPerOrder: 45,
  currency: "INR",
};

export async function getCostingSettings(): Promise<CostingSettings> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get("costing:settings");
    if (raw) return parseRedisValue<CostingSettings>(raw as CostingSettings | string)!;
    await redis.set("costing:settings", JSON.stringify(DEFAULT_COSTING_SETTINGS));
    return DEFAULT_COSTING_SETTINGS;
  }
  const settings = readJSON<CostingSettings>(COSTING_SETTINGS_FILE);
  if (settings.length === 0) {
    writeJSON(COSTING_SETTINGS_FILE, [DEFAULT_COSTING_SETTINGS]);
    return DEFAULT_COSTING_SETTINGS;
  }
  return settings[0];
}

export async function updateCostingSettings(patch: Partial<CostingSettings>): Promise<CostingSettings> {
  const current = await getCostingSettings();
  const updated: CostingSettings = { ...current, ...patch };
  const redis = getRedis();
  if (redis) {
    await redis.set("costing:settings", JSON.stringify(updated));
    return updated;
  }
  writeJSON(COSTING_SETTINGS_FILE, [updated]);
  return updated;
}

// ── Raw Materials ──

const SEED_RAW_MATERIALS: RawMaterial[] = [
  {
    id: "rm_1",
    name: "Guntur Dry Red Chillies (Grade A)",
    sku: "RM-CHILLI-01",
    purchaseUnit: "kg",
    purchaseQuantity: 50,
    purchaseAmount: 11000,
    unitRate: 0.22, // ₹0.22 per gram
    supplier: "Andhra Spice Traders",
    purchaseDate: new Date().toISOString().slice(0, 10),
    stockQuantity: 42,
    stockUnit: "kg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "rm_2",
    name: "Salem Raw Turmeric Rhizomes (High Curcumin)",
    sku: "RM-TURMERIC-01",
    purchaseUnit: "kg",
    purchaseQuantity: 50,
    purchaseAmount: 8500,
    unitRate: 0.17, // ₹0.17 per gram
    supplier: "Tamil Nadu Agri Co-op",
    purchaseDate: new Date().toISOString().slice(0, 10),
    stockQuantity: 45,
    stockUnit: "kg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "rm_3",
    name: "Rajasthan Coriander Seeds (Whole)",
    sku: "RM-CORIANDER-01",
    purchaseUnit: "kg",
    purchaseQuantity: 40,
    purchaseAmount: 5200,
    unitRate: 0.13, // ₹0.13 per gram
    supplier: "Kota Agro Mandi",
    purchaseDate: new Date().toISOString().slice(0, 10),
    stockQuantity: 38,
    stockUnit: "kg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "rm_4",
    name: "Kerala Whole Spices Master Blend (Garam Masala Ingredients)",
    sku: "RM-GARAM-RAW",
    purchaseUnit: "kg",
    purchaseQuantity: 25,
    purchaseAmount: 16500,
    unitRate: 0.66, // ₹0.66 per gram
    supplier: "Idukki Farmers Collective",
    purchaseDate: new Date().toISOString().slice(0, 10),
    stockQuantity: 20,
    stockUnit: "kg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function getRawMaterials(): Promise<RawMaterial[]> {
  const redis = getRedis();
  if (redis) {
    const ids: string[] = (await redis.lrange("raw_materials:ids", 0, -1)) || [];
    if (ids.length === 0) {
      for (const rm of SEED_RAW_MATERIALS) {
        await redis.set(`raw_material:${rm.id}`, JSON.stringify(rm));
        await redis.rpush("raw_materials:ids", rm.id);
      }
      return SEED_RAW_MATERIALS;
    }
    const results = (await redis.mget(...ids.map((id: string) => `raw_material:${id}`))) as (RawMaterial | string | null)[];
    return results.filter(Boolean).map((r) => parseRedisValue<RawMaterial>(r as RawMaterial | string)!);
  }
  const items = readJSON<RawMaterial>(RAW_MATERIALS_FILE);
  if (items.length === 0) {
    writeJSON(RAW_MATERIALS_FILE, SEED_RAW_MATERIALS);
    return SEED_RAW_MATERIALS;
  }
  return items;
}

export async function createRawMaterial(data: Omit<RawMaterial, "id" | "createdAt" | "updatedAt">): Promise<RawMaterial> {
  const id = `rm_${Date.now()}`;
  const now = new Date().toISOString();
  // Calculate unit rate per gram or per unit
  let rate = data.purchaseQuantity > 0 ? data.purchaseAmount / data.purchaseQuantity : 0;
  if (data.purchaseUnit === "kg" || data.purchaseUnit === "l") {
    rate = rate / 1000; // rate per gram or ml
  }
  const item: RawMaterial = {
    ...data,
    id,
    unitRate: Math.round(rate * 10000) / 10000,
    createdAt: now,
    updatedAt: now,
  };
  const redis = getRedis();
  if (redis) {
    await redis.set(`raw_material:${id}`, JSON.stringify(item));
    await redis.rpush("raw_materials:ids", id);
    return item;
  }
  const items = readJSON<RawMaterial>(RAW_MATERIALS_FILE);
  items.push(item);
  writeJSON(RAW_MATERIALS_FILE, items);
  return item;
}

export async function updateRawMaterial(id: string, patch: Partial<RawMaterial>): Promise<RawMaterial | null> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(`raw_material:${id}`);
    if (!raw) return null;
    const existing = parseRedisValue<RawMaterial>(raw as RawMaterial | string)!;
    const updated: RawMaterial = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    await redis.set(`raw_material:${id}`, JSON.stringify(updated));
    return updated;
  }
  const items = readJSON<RawMaterial>(RAW_MATERIALS_FILE);
  const idx = items.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch, updatedAt: new Date().toISOString() };
  writeJSON(RAW_MATERIALS_FILE, items);
  return items[idx];
}

export async function deleteRawMaterial(id: string): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    if (!(await redis.exists(`raw_material:${id}`))) return false;
    await redis.del(`raw_material:${id}`);
    await redis.lrem("raw_materials:ids", 0, id);
    return true;
  }
  const items = readJSON<RawMaterial>(RAW_MATERIALS_FILE);
  const filtered = items.filter((r) => r.id !== id);
  if (filtered.length === items.length) return false;
  writeJSON(RAW_MATERIALS_FILE, filtered);
  return true;
}

// ── Product Recipes / BOM ──

export async function getProductRecipes(): Promise<ProductRecipe[]> {
  const redis = getRedis();
  if (redis) {
    const ids: string[] = (await redis.lrange("recipes:ids", 0, -1)) || [];
    if (ids.length === 0) return [];
    const results = (await redis.mget(...ids.map((id: string) => `recipe:${id}`))) as (ProductRecipe | string | null)[];
    return results.filter(Boolean).map((r) => parseRedisValue<ProductRecipe>(r as ProductRecipe | string)!);
  }
  return readJSON<ProductRecipe>(RECIPES_FILE);
}

export async function createProductRecipe(data: Omit<ProductRecipe, "id" | "createdAt" | "updatedAt">): Promise<ProductRecipe> {
  const id = `rec_${Date.now()}`;
  const now = new Date().toISOString();
  const recipe: ProductRecipe = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };
  const redis = getRedis();
  if (redis) {
    await redis.set(`recipe:${id}`, JSON.stringify(recipe));
    await redis.rpush("recipes:ids", id);
    return recipe;
  }
  const recipes = readJSON<ProductRecipe>(RECIPES_FILE);
  recipes.push(recipe);
  writeJSON(RECIPES_FILE, recipes);
  return recipe;
}

export async function updateProductRecipe(id: string, patch: Partial<ProductRecipe>): Promise<ProductRecipe | null> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(`recipe:${id}`);
    if (!raw) return null;
    const existing = parseRedisValue<ProductRecipe>(raw as ProductRecipe | string)!;
    const updated: ProductRecipe = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    await redis.set(`recipe:${id}`, JSON.stringify(updated));
    return updated;
  }
  const recipes = readJSON<ProductRecipe>(RECIPES_FILE);
  const idx = recipes.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  recipes[idx] = { ...recipes[idx], ...patch, updatedAt: new Date().toISOString() };
  writeJSON(RECIPES_FILE, recipes);
  return recipes[idx];
}

// ── Product Cost Configurations ──

const SEED_PRODUCT_COSTS: ProductCostConfig[] = [
  {
    id: "cost_p1",
    productId: "p1",
    productName: "Red Chilli Powder (Lal Mirchi)",
    variantSize: "250g",
    sku: "GT-CHILLI-250G",
    costingMethod: "ready_product",
    readyProductCost: {
      baseCost: 55,
      packagingCost: 12,
      directProcessingCost: 8,
      otherDirectCost: 3,
      variableCost: 2,
    },
    totalUnitCost: 80,
    sellingPrice: 150,
    mrp: 180,
    gstPercent: 5,
    effectiveDate: new Date().toISOString().slice(0, 10),
    costStatus: "configured",
    notes: "Direct procurement from Guntur with stone-grinding charges included",
    updatedAt: new Date().toISOString(),
    updatedBy: "Admin",
  },
  {
    id: "cost_p2",
    productId: "p2",
    productName: "Turmeric Powder (Haldi)",
    variantSize: "250g",
    sku: "GT-TURM-250G",
    costingMethod: "ready_product",
    readyProductCost: {
      baseCost: 45,
      packagingCost: 12,
      directProcessingCost: 6,
      otherDirectCost: 2,
      variableCost: 0,
    },
    totalUnitCost: 65,
    sellingPrice: 120,
    mrp: 140,
    gstPercent: 5,
    effectiveDate: new Date().toISOString().slice(0, 10),
    costStatus: "configured",
    notes: "Salem farm rhizomes, stone ground",
    updatedAt: new Date().toISOString(),
    updatedBy: "Admin",
  },
  {
    id: "cost_p3",
    productId: "p3",
    productName: "Coriander Powder (Dhaniya)",
    variantSize: "250g",
    sku: "GT-DHANIYA-250G",
    costingMethod: "ready_product",
    readyProductCost: {
      baseCost: 38,
      packagingCost: 12,
      directProcessingCost: 6,
      otherDirectCost: 2,
      variableCost: 0,
    },
    totalUnitCost: 58,
    sellingPrice: 110,
    mrp: 130,
    gstPercent: 5,
    effectiveDate: new Date().toISOString().slice(0, 10),
    costStatus: "configured",
    notes: "Kota whole coriander roasted and ground",
    updatedAt: new Date().toISOString(),
    updatedBy: "Admin",
  },
  {
    id: "cost_p4",
    productId: "p4",
    productName: "Special Garam Masala",
    variantSize: "200g",
    sku: "GT-GARAM-200G",
    costingMethod: "ready_product",
    readyProductCost: {
      baseCost: 115,
      packagingCost: 15,
      directProcessingCost: 12,
      otherDirectCost: 3,
      variableCost: 0,
    },
    totalUnitCost: 145,
    sellingPrice: 250,
    mrp: 290,
    gstPercent: 5,
    effectiveDate: new Date().toISOString().slice(0, 10),
    costStatus: "configured",
    notes: "15 artisanal spices blend with cardamom, mace, cinnamon",
    updatedAt: new Date().toISOString(),
    updatedBy: "Admin",
  },
  {
    id: "cost_p5",
    productId: "p5",
    productName: "Ghartika Spice Combo — Charo Masale",
    variantSize: "4 Products",
    sku: "GT-COMBO-4PK",
    costingMethod: "combo",
    comboComponents: [
      { productId: "p1", productName: "Red Chilli Powder", quantity: 1, unitCost: 80, totalCost: 80 },
      { productId: "p2", productName: "Turmeric Powder", quantity: 1, unitCost: 65, totalCost: 65 },
      { productId: "p3", productName: "Coriander Powder", quantity: 1, unitCost: 58, totalCost: 58 },
      { productId: "p4", productName: "Special Garam Masala", quantity: 1, unitCost: 145, totalCost: 145 },
    ],
    totalUnitCost: 348, // 80 + 65 + 58 + 145
    sellingPrice: 499,
    mrp: 630,
    gstPercent: 5,
    effectiveDate: new Date().toISOString().slice(0, 10),
    costStatus: "configured",
    notes: "Sum of 4 component product costs. Packaging is bundled in individual units.",
    updatedAt: new Date().toISOString(),
    updatedBy: "Admin",
  },
];

export async function getProductCosts(): Promise<ProductCostConfig[]> {
  const redis = getRedis();
  if (redis) {
    const ids: string[] = (await redis.lrange("product_costs:ids", 0, -1)) || [];
    if (ids.length === 0) {
      for (const pc of SEED_PRODUCT_COSTS) {
        await redis.set(`product_cost:${pc.productId}`, JSON.stringify(pc));
        await redis.rpush("product_costs:ids", pc.productId);
      }
      return SEED_PRODUCT_COSTS;
    }
    const results = (await redis.mget(...ids.map((id: string) => `product_cost:${id}`))) as (ProductCostConfig | string | null)[];
    return results.filter(Boolean).map((c) => parseRedisValue<ProductCostConfig>(c as ProductCostConfig | string)!);
  }
  const configs = readJSON<ProductCostConfig>(PRODUCT_COSTS_FILE);
  if (configs.length === 0) {
    writeJSON(PRODUCT_COSTS_FILE, SEED_PRODUCT_COSTS);
    return SEED_PRODUCT_COSTS;
  }
  return configs;
}

export async function getProductCostByProductId(productId: string): Promise<ProductCostConfig | null> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get(`product_cost:${productId}`);
    if (!raw) return null;
    return parseRedisValue<ProductCostConfig>(raw as ProductCostConfig | string);
  }
  const configs = await getProductCosts();
  return configs.find((c) => c.productId === productId) || null;
}

export async function saveProductCost(
  config: Omit<ProductCostConfig, "id" | "updatedAt" | "updatedBy">,
  changedBy = "Admin",
  reason = "Standard cost update"
): Promise<ProductCostConfig> {
  const existing = await getProductCostByProductId(config.productId);
  const prevCost = existing?.totalUnitCost || 0;
  const now = new Date().toISOString();
  const id = existing?.id || `cost_${config.productId}`;

  const saved: ProductCostConfig = {
    ...config,
    id,
    updatedAt: now,
    updatedBy: changedBy,
  };

  const redis = getRedis();
  if (redis) {
    await redis.set(`product_cost:${config.productId}`, JSON.stringify(saved));
    const ids: string[] = (await redis.lrange("product_costs:ids", 0, -1)) || [];
    if (!ids.includes(config.productId)) {
      await redis.rpush("product_costs:ids", config.productId);
    }
  } else {
    const configs = readJSON<ProductCostConfig>(PRODUCT_COSTS_FILE);
    const idx = configs.findIndex((c) => c.productId === config.productId);
    if (idx >= 0) configs[idx] = saved;
    else configs.push(saved);
    writeJSON(PRODUCT_COSTS_FILE, configs);
  }

  // Record in Cost History if cost or price changed
  if (!existing || prevCost !== config.totalUnitCost || existing.sellingPrice !== config.sellingPrice) {
    await addCostHistoryEntry({
      productId: config.productId,
      productName: config.productName,
      variantSize: config.variantSize,
      costingMethod: config.costingMethod,
      previousUnitCost: prevCost,
      newUnitCost: config.totalUnitCost,
      sellingPrice: config.sellingPrice,
      changeReason: reason,
      changedBy,
    });
  }

  return saved;
}

// ── Cost Revision History ──

export async function getCostHistory(productId?: string): Promise<CostHistoryRecord[]> {
  const redis = getRedis();
  let records: CostHistoryRecord[] = [];
  if (redis) {
    const ids: string[] = (await redis.lrange("cost_history:ids", 0, 499)) || [];
    if (ids.length > 0) {
      const results = (await redis.mget(...ids.map((id: string) => `cost_hist:${id}`))) as (CostHistoryRecord | string | null)[];
      records = results.filter(Boolean).map((r) => parseRedisValue<CostHistoryRecord>(r as CostHistoryRecord | string)!);
    }
  } else {
    records = readJSON<CostHistoryRecord>(COST_HISTORY_FILE);
  }
  if (productId) {
    return records.filter((r) => r.productId === productId);
  }
  return records;
}

export async function addCostHistoryEntry(entry: Omit<CostHistoryRecord, "id" | "timestamp">): Promise<CostHistoryRecord> {
  const record: CostHistoryRecord = {
    ...entry,
    id: `chist_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  };
  const redis = getRedis();
  if (redis) {
    await redis.set(`cost_hist:${record.id}`, JSON.stringify(record));
    await redis.lpush("cost_history:ids", record.id);
    return record;
  }
  const history = readJSON<CostHistoryRecord>(COST_HISTORY_FILE);
  history.unshift(record);
  writeJSON(COST_HISTORY_FILE, history.slice(0, 1000));
  return record;
}

// ── Order Cost Snapshots ──

export async function getOrderCostSnapshots(orderId?: string): Promise<OrderLineCostSnapshot[]> {
  const redis = getRedis();
  let snapshots: OrderLineCostSnapshot[] = [];
  if (redis) {
    const ids: string[] = (await redis.lrange("cost_snapshots:ids", 0, 999)) || [];
    if (ids.length > 0) {
      const results = (await redis.mget(...ids.map((id: string) => `cost_snap:${id}`))) as (OrderLineCostSnapshot | string | null)[];
      snapshots = results.filter(Boolean).map((s) => parseRedisValue<OrderLineCostSnapshot>(s as OrderLineCostSnapshot | string)!);
    }
  } else {
    snapshots = readJSON<OrderLineCostSnapshot>(COST_SNAPSHOTS_FILE);
  }
  if (orderId) {
    return snapshots.filter((s) => s.orderId === orderId);
  }
  return snapshots;
}

export async function saveOrderCostSnapshots(snapshots: OrderLineCostSnapshot[]): Promise<void> {
  if (!snapshots.length) return;
  const redis = getRedis();
  if (redis) {
    for (const snap of snapshots) {
      await redis.set(`cost_snap:${snap.id}`, JSON.stringify(snap));
      await redis.lpush("cost_snapshots:ids", snap.id);
    }
    return;
  }
  const all = readJSON<OrderLineCostSnapshot>(COST_SNAPSHOTS_FILE);
  all.unshift(...snapshots);
  writeJSON(COST_SNAPSHOTS_FILE, all.slice(0, 5000));
}

export async function recordOrderCostSnapshots(order: Order): Promise<OrderLineCostSnapshot[]> {
  const existingSnapshots = await getOrderCostSnapshots(order.id);
  if (existingSnapshots.length > 0) return existingSnapshots;

  const productCosts = await getProductCosts();
  const costMap = new Map(productCosts.map((c) => [c.productId, c]));

  const snapshots: OrderLineCostSnapshot[] = (order.items || []).map((item) => {
    const costConfig = costMap.get(item.id);
    return createLineItemCostSnapshot(order.id, order.date, item, costConfig);
  });

  await saveOrderCostSnapshots(snapshots);
  return snapshots;
}



