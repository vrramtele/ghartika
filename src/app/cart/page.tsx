"use client";

import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--background)" }}>
      <Header />

      <div className="flex-1 pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h1
          className="text-3xl font-bold mb-8 flex items-center gap-3"
          style={{ color: "var(--text-primary)" }}
        >
          <ShoppingBag className="w-8 h-8" style={{ color: "var(--brand-red)" }} />
          Your Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <div
            className="rounded-3xl p-12 text-center shadow-sm border"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: "var(--surface-muted)" }}
            >
              <ShoppingBag className="w-12 h-12" style={{ color: "var(--text-muted)" }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Your cart is empty
            </h2>
            <p className="mb-8" style={{ color: "var(--text-muted)" }}>
              Looks like you haven&apos;t added any spices to your cart yet.
            </p>
            <Link
              href="/shop"
              className="inline-block text-white px-8 py-3 rounded-full font-bold transition-colors"
              style={{ backgroundColor: "var(--brand-red)" }}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div
                className="rounded-3xl shadow-sm border overflow-hidden"
                style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}
              >
                <div
                  className="p-6 border-b hidden sm:grid grid-cols-12 gap-4 text-sm font-semibold uppercase"
                  style={{ borderColor: "var(--border-light)", color: "var(--text-muted)" }}
                >
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                <ul style={{ borderColor: "var(--border-light)" }} className="divide-y">
                  {cart.map((item) => (
                    <li
                      key={item.id}
                      className="p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center"
                      style={{ borderColor: "var(--border-light)" }}
                    >
                      <div className="col-span-1 sm:col-span-6 flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-xl"
                        />
                        <div>
                          <Link
                            href={`/product/${item.id}`}
                            className="font-bold text-lg line-clamp-1 transition-colors hover:opacity-70"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            {item.weight}
                          </p>
                        </div>
                      </div>

                      <div
                        className="col-span-1 sm:col-span-2 text-center font-bold text-lg"
                        style={{ color: "var(--text-primary)" }}
                      >
                        ₹{item.price}
                      </div>

                      <div className="col-span-1 sm:col-span-3 flex items-center justify-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                          style={{ backgroundColor: "var(--surface-muted)" }}
                        >
                          <Minus className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                        </button>
                        <span className="font-bold w-4 text-center" style={{ color: "var(--text-primary)" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                          style={{ backgroundColor: "var(--surface-muted)" }}
                        >
                          <Plus className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                        </button>
                      </div>

                      <div className="col-span-1 sm:col-span-1 flex justify-center">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 transition-colors hover:opacity-70"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div
                className="rounded-3xl shadow-sm border p-8 sticky top-24"
                style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}
              >
                <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
                  Order Summary
                </h2>

                <div className="flex justify-between mb-4" style={{ color: "var(--text-secondary)" }}>
                  <span>Items ({totalItems})</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between mb-4" style={{ color: "var(--text-secondary)" }}>
                  <span>Shipping</span>
                  <span className="font-medium" style={{ color: "var(--brand-green)" }}>Free</span>
                </div>

                <hr className="my-6" style={{ borderColor: "var(--border-light)" }} />

                <div className="flex justify-between mb-8">
                  <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Total</span>
                  <span className="text-2xl font-black" style={{ color: "var(--brand-red)" }}>
                    ₹{totalPrice}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full text-white py-4 rounded-full font-bold flex items-center justify-center transition-colors shadow-md hover:shadow-lg"
                  style={{ backgroundColor: "var(--brand-red)" }}
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
