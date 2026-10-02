import mongoose, { Schema, Document, Model } from "mongoose";

// ── Order Model ────────────────────────────────────────────────

export interface IOrder extends Document {
  id: string;
  date: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    weight: string;
    image: string;
  }[];
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    id: { type: String, required: true, unique: true },
    date: { type: String, required: true },
    customer: {
      name: String,
      phone: String,
      email: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    items: [
      {
        id: String,
        name: String,
        price: Number,
        quantity: Number,
        weight: String,
        image: String,
      },
    ],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  { timestamps: true }
);

export const OrderModel: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

// ── Product Model ──────────────────────────────────────────────

export interface IProduct extends Document {
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
}

const ProductSchema = new Schema<IProduct>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: Number,
  weight: String,
  category: String,
  image: String,
  badge: String,
  description: String,
  isCombo: Boolean,
  comboItems: [String],
});

export const ProductModel: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
