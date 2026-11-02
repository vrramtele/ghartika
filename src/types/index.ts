/**
 * @file src/types/index.ts
 * Single source of truth for all shared types.
 * Import from here — never redeclare these types elsewhere.
 */

// ── Order Status ──────────────────────────────────────────────────────────────

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Returned";

export const ALL_ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
];

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

// ── Status History Entry ──────────────────────────────────────────────────────

export type StatusHistoryEntry = {
  status: OrderStatus;
  timestamp: string;  // ISO string
  note?: string;      // optional reason/note for the status change
};

// ── Product ───────────────────────────────────────────────────────────────────

export type ProductStatus = "published" | "draft" | "hidden" | "out_of_stock";

export type Product = {
  id: string;
  name: string;
  slug?: string;            // URL slug (e.g. "red-chilli-powder")
  price: number;
  originalPrice?: number;
  costPrice?: number;       // cost/procurement price for margin calculation
  weight: string;
  category: string;
  categoryId?: string;      // FK to Category
  tags?: string[];          // e.g. ["hot", "organic", "best-seller"]
  image: string;
  images?: string[];        // multiple images (first = main)
  imageAlt?: string;        // alt text for main image
  badge?: string;
  description: string;
  ingredients?: string;     // e.g. "100% Red Chilli"
  usageInstructions?: string;
  storageInfo?: string;
  isCombo?: boolean;
  comboItems?: string[];
  // Inventory
  sku?: string;             // Stock Keeping Unit code
  barcode?: string;         // EAN/UPC barcode
  stock?: number;           // current stock count
  lowStockThreshold?: number; // alert when stock <= this
  // Tax & Finance
  gstPercent?: number;      // GST % (default 5 for spices, HSN 0910)
  hsnCode?: string;         // HSN code (default 0910 for spices)
  // Status
  isActive?: boolean;       // false = hidden from store
  status?: ProductStatus;   // published | draft | hidden | out_of_stock
  isFeatured?: boolean;     // show in featured products section
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
};

// ── Order ─────────────────────────────────────────────────────────────────────

export type Order = {
  id: string;
  date: string;             // ISO string
  customer: CustomerInfo;
  items: CartItem[];
  total: number;
  subtotal?: number;        // pre-tax, pre-shipping
  shippingCharge?: number;
  discountAmount?: number;
  couponCode?: string;
  taxAmount?: number;
  status: OrderStatus;
  // Payment
  paymentMethod?: "COD" | "Online";   // explicit field (derived from razorpay fields if missing)
  paymentStatus?: "Pending" | "Paid" | "Failed" | "Refunded";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  codVerifiedAt?: string;   // ISO — when COD payment was verified/collected
  codVerifiedBy?: string;   // who verified
  refundAmount?: number;    // total refunded
  refundedAt?: string;      // ISO — when refund was issued
  refundNote?: string;      // reason for refund
  // Shipping
  courierName?: string;     // e.g. "Delhivery", "India Post"
  trackingId?: string;
  trackingUrl?: string;
  dispatchedAt?: string;    // ISO
  deliveredAt?: string;     // ISO
  // Cancellation / Return
  cancellationReason?: string;
  returnReason?: string;
  returnItems?: CartItem[];  // partial return items
  // Admin
  adminNote?: string;       // internal notes, not visible to customer
  statusHistory?: StatusHistoryEntry[];  // timeline of all status changes
};

// ── Phase 2: Coupons ──────────────────────────────────────────────────────────

export type CouponType = "percentage" | "flat" | "free_shipping";

export type Coupon = {
  id: string;
  code: string;               // e.g. "GHARTIKA10"
  type: CouponType;
  value: number;              // 10 for 10%, 100 for ₹100 flat, 0 for free shipping
  minCartValue: number;       // min order value required
  maxDiscount?: number;       // cap for percentage discount (e.g. max ₹200 off)
  usageLimit?: number;        // total times coupon can be used
  usedCount: number;          // times currently used
  expiresAt?: string;         // ISO date string
  isActive: boolean;
  firstOrderOnly?: boolean;   // valid only for new customers
  createdAt: string;
};

// ── Phase 2: Abandoned Carts ──────────────────────────────────────────────────

export type AbandonedCart = {
  id: string;
  date: string;
  customer: {
    name?: string;
    phone: string;
    email?: string;
    city?: string;
    state?: string;
    pincode?: string;
    address?: string;
  };
  items: CartItem[];
  total: number;
  recovered: boolean;
  recoveryNote?: string;
};

// ── Phase 2: Product Reviews ──────────────────────────────────────────────────

export type ReviewStatus = "pending" | "approved" | "rejected";

export type Review = {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  customerPhone?: string;
  rating: number;             // 1 to 5
  comment: string;
  status: ReviewStatus;
  date: string;
  reply?: string;
};

// ── Phase 2 & 3: Storefront Settings ──────────────────────────────────────────

export type StoreSettings = {
  storeName: string;
  gstin?: string;             // GST Number (e.g. 23AAAAA0000A1Z5)
  fssaiNumber?: string;       // FSSAI License Number (e.g. 10012345678901)
  registeredAddress?: string;
  announcementText: string;
  announcementActive: boolean;
  announcementLink?: string;
  heroHeadline: string;
  heroSubheadline: string;
  contactPhone: string;
  contactEmail: string;
  freeShippingThreshold: number;
  enableCod: boolean;
  enableOnlinePayment: boolean;
  maintenanceMode: boolean;
  instagramUrl?: string;
  whatsappSupport?: string;
};

// ── Phase 3: Inventory Audit Log ──────────────────────────────────────────────

export type InventoryReason =
  | "Restock"
  | "Order Placed"
  | "Damaged / Waste"
  | "Manual Correction"
  | "Return Restocked";

export type InventoryLog = {
  id: string;
  productId: string;
  productName: string;
  change: number;             // +10, -2, etc.
  previousStock: number;
  newStock: number;
  reason: InventoryReason;
  date: string;               // ISO date
  updatedBy: string;          // admin or system
};

// ── Phase 3: Staff & Activity Audit Log ───────────────────────────────────────

export type StaffRole = "Owner" | "Manager" | "Packer" | "Support";

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  status: "active" | "inactive";
  createdAt: string;
};

export type ActivityLog = {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  role?: string;
  ip?: string;
  userId?: string;
};

// ── Phase 4: Categories ────────────────────────────────────────────────────────

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;        // for sub-categories
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  productCount?: number;    // derived, not stored
};

// ── Phase 4: Finance & Expenses ───────────────────────────────────────────────

export type ExpenseCategory =
  | "Procurement"
  | "Packaging"
  | "Shipping / Logistics"
  | "Advertising"
  | "Platform Fees"
  | "Payment Gateway Fees"
  | "Refunds"
  | "Salaries"
  | "Utilities"
  | "Other";

export type Expense = {
  id: string;
  date: string;             // ISO
  category: ExpenseCategory;
  description: string;
  amount: number;           // INR
  vendor?: string;          // supplier or vendor name
  invoiceNumber?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
};

// ── Phase 4: Suppliers & Purchases ────────────────────────────────────────────

export type Supplier = {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
};

export type PurchaseOrderStatus = "draft" | "ordered" | "partially_received" | "received" | "cancelled";

export type PurchaseOrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: string;      // best-before / expiry ISO date
  receivedQuantity?: number;
};

export type PurchaseOrder = {
  id: string;
  supplierId: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  totalAmount: number;
  orderDate: string;        // ISO
  expectedDate?: string;    // ISO
  receivedDate?: string;    // ISO
  invoiceNumber?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
};

// ── Phase 4: Media Library ────────────────────────────────────────────────────

export type MediaFile = {
  id: string;
  url: string;              // public CDN URL
  publicId?: string;        // Cloudinary public_id
  filename: string;
  altText?: string;
  mimeType: string;         // image/jpeg, image/png, etc.
  sizeBytes: number;
  width?: number;
  height?: number;
  uploadedBy: string;
  uploadedAt: string;
  tags?: string[];          // e.g. ["product", "banner", "logo"]
};

// ── Phase 4: Notifications ────────────────────────────────────────────────────

export type NotificationType =
  | "new_order"
  | "low_stock"
  | "new_review"
  | "abandoned_cart"
  | "coupon_expired"
  | "system_alert";

export type AdminNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;            // deeplink to relevant admin section
  createdAt: string;
};

// ── Phase 4: SEO Manager ─────────────────────────────────────────────────────

export type SEOPageMeta = {
  id: string;               // path or page identifier e.g. "/" or "product:p1"
  path: string;             // URL path
  pageType: "static" | "product" | "category" | "blog";
  seoTitle: string;
  seoDescription: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robotsDirective?: string; // "index,follow" | "noindex,nofollow"
  updatedAt: string;
};

// ── Phase 5: Product Cost & Profit Management ────────────────────────────────

export type MeasurementUnit = "g" | "kg" | "ml" | "l" | "pcs";

export type CostingMethod = "ready_product" | "raw_material" | "combo";

export type RawMaterialPurchaseEntry = {
  id: string;
  date: string;
  quantity: number;
  unit: MeasurementUnit;
  amount: number;
  unitRate: number;
  supplier?: string;
  batchNumber?: string;
  notes?: string;
};

export type RawMaterial = {
  id: string;
  name: string;
  sku: string;
  purchaseUnit: MeasurementUnit;
  purchaseQuantity: number;
  purchaseAmount: number;     // INR
  unitRate: number;           // INR per base unit (e.g. per gram or per piece)
  supplier?: string;
  purchaseDate?: string;
  additionalProcurementCosts?: number;
  batchNumber?: string;
  stockQuantity: number;
  stockUnit: MeasurementUnit;
  expiryDate?: string;
  history?: RawMaterialPurchaseEntry[];
  createdAt: string;
  updatedAt: string;
};

export type RecipeIngredient = {
  rawMaterialId: string;
  rawMaterialName: string;
  quantity: number;
  unit: MeasurementUnit;
  unitCost: number;           // calculated cost for this specific ingredient quantity
};

export type PackagingItem = {
  name: string;
  unitCost: number;
  quantity: number;
};

export type ProductRecipe = {
  id: string;
  productId: string;
  productName: string;
  variantSize: string;         // e.g. "250g", "200g"
  ingredients: RecipeIngredient[];
  processingCharges: number;   // grinding, roasting, processing fees
  laborOverhead: number;
  packagingItems: PackagingItem[];
  packagingCost: number;
  otherDirectCosts: number;
  batchInputQuantity: number;  // total batch quantity (e.g. 100 kg)
  batchInputUnit: MeasurementUnit;
  expectedWastagePercent: number; // e.g. 5%
  actualSaleableOutputUnits: number; // finished saleable units produced (e.g. 380 packets)
  totalBatchCost: number;
  calculatedCostPerUnit: number; // totalBatchCost / actualSaleableOutputUnits
  version: number;
  isActive: boolean;
  approvedAt?: string;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type ReadyProductCostDetails = {
  baseCost: number;             // purchase or direct packet production cost
  packagingCost: number;
  directProcessingCost: number;
  otherDirectCost: number;
  variableCost: number;
};

export type ComboItemComponentCost = {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
};

export type ProductCostConfig = {
  id: string;
  productId: string;
  productName: string;
  variantSize: string;
  sku: string;
  costingMethod: CostingMethod;
  readyProductCost?: ReadyProductCostDetails;
  recipeId?: string;
  comboComponents?: ComboItemComponentCost[];
  totalUnitCost: number;       // authoritative unit cost
  sellingPrice: number;
  mrp?: number;
  gstPercent: number;          // default 5%
  effectiveDate: string;
  costStatus: "configured" | "cost_missing" | "review_needed";
  notes?: string;
  updatedAt: string;
  updatedBy: string;
};

export type CostHistoryRecord = {
  id: string;
  productId: string;
  productName: string;
  variantSize: string;
  costingMethod: CostingMethod;
  previousUnitCost: number;
  newUnitCost: number;
  sellingPrice: number;
  changeReason: string;
  changedBy: string;
  timestamp: string;
};

export type OrderLineCostSnapshot = {
  id: string;
  orderId: string;
  orderDate: string;
  productId: string;
  productName: string;
  variantSize: string;
  sku: string;
  quantity: number;
  unitCost: number;            // historical unit COGS at purchase/recognition
  totalCOGS: number;
  costingMethod: CostingMethod;
  recipeId?: string;
  unitSellingPrice: number;
  totalSale: number;
  allocatedDiscount: number;
  netSale: number;
  unitProfit: number;
  grossProfit: number;
  marginPercent: number;
  markupPercent: number;
  costStatus: "exact" | "estimated" | "cost_missing";
  snapshotTimestamp: string;
};

export type CostingSettings = {
  defaultWastagePercent: number;
  defaultGstPercent: number;
  costRecognitionEvent: "on_order_placed" | "on_order_confirmed" | "on_order_shipped" | "on_order_delivered";
  includePackagingInCOGS: boolean;
  paymentGatewayFeePercent: number; // e.g. 2.0%
  avgShippingCostPerOrder: number;   // e.g. 50
  currency: string;                 // "INR"
};


