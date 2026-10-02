"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrderContext";
import { CheckCircle2, ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition";

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (paymentMethod === "cod") {
      try {
        const newOrderId = await placeOrder(
          formData,
          cart,
          totalPrice,
          "COD",
          "COD"
        );
        clearCart();
        setOrderId(newOrderId);
        setIsSuccess(true);
      } catch (error) {
        console.error("COD error:", error);
        alert("Error placing COD order. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      // Step 1: Create Razorpay order on server
      const createRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrice }),
      });

      if (!createRes.ok) throw new Error("Failed to create Razorpay order");

      const razorpayOrder = await createRes.json();

      // Step 2: Open Razorpay payment modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder_key",
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Ghartika Spices",
        description: "Premium Spice Order",
        order_id: razorpayOrder.id,
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            // Step 3: Verify payment on server
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyData.verified) {
              alert("Payment verification failed. Please contact support.");
              setIsSubmitting(false);
              return;
            }

            // Step 4: Save order to server database
            const newOrderId = await placeOrder(
              formData,
              cart,
              totalPrice,
              response.razorpay_order_id,
              response.razorpay_payment_id
            );

            clearCart();
            setOrderId(newOrderId);
            setIsSuccess(true);
          } catch (err) {
            console.error("Post-payment error:", err);
            alert("Order saving failed. Please contact support with your payment ID: " + response.razorpay_payment_id);
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#A01C2C",
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      };

      // @ts-ignore - Razorpay is injected via <Script> tag in layout.tsx
      const rzp1 = new window.Razorpay(options);

      rzp1.on("payment.failed", function (response: { error: { description: string } }) {
        alert("Payment Failed: " + response.error.description);
        setIsSubmitting(false);
      });

      rzp1.open();
    } catch (error) {
      console.error(error);
      alert("Error initializing payment. Please try again.");
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    borderColor: "var(--border)",
    backgroundColor: "var(--surface-muted)",
    color: "var(--text-primary)",
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--background)" }}>
        <Header />
        <div className="flex-1 flex items-center justify-center pt-24 pb-12">
          <div
            className="p-12 rounded-3xl shadow-lg max-w-lg w-full text-center border"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: "#F1F8F1" }}
            >
              <CheckCircle2 className="w-14 h-14" style={{ color: "var(--brand-green)" }} />
            </div>
            <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              Order Placed! 🎉
            </h1>
            <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>
              Order ID:{" "}
              <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>
                {orderId}
              </span>
            </p>
            <p className="mb-8 mt-4" style={{ color: "var(--text-secondary)" }}>
              Thank you,{" "}
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {formData.name}
              </span>
              ! Your order has been received and is being processed. We&apos;ll update you on{" "}
              <span className="font-semibold">{formData.phone}</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/shop"
                className="inline-block text-white px-8 py-3 rounded-full font-bold transition-colors"
                style={{ backgroundColor: "var(--brand-red)" }}
              >
                Continue Shopping
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center gap-2 border px-8 py-3 rounded-full font-medium transition-colors"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                <Package className="w-4 h-4" />
                Track Order
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--background)" }}>
        <Header />
        <div className="flex-1 flex items-center justify-center pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Your cart is empty
            </h1>
            <Link
              href="/shop"
              className="font-semibold hover:underline"
              style={{ color: "var(--brand-red)" }}
            >
              Return to Shop
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--background)" }}>
      <Header />

      <div className="flex-1 pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <button
          onClick={() => router.back()}
          className="flex items-center mb-8 transition-colors font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Cart
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Checkout Form */}
          <div className="lg:w-2/3">
            <div
              className="rounded-3xl shadow-sm border p-8"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
                Delivery Details
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Full Name
                    </label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Rahul Sharma"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Phone Number
                    </label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="rahul@example.com"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>

                <div className="mb-6">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Complete Address
                  </label>
                  <textarea
                    required
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House no., Street, Locality..."
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      City
                    </label>
                    <input
                      required
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Indore"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      State
                    </label>
                    <input
                      required
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Madhya Pradesh"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      PIN Code
                    </label>
                    <input
                      required
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="452001"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Payment Method Selection */}
                <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                  Payment Method
                </h3>
                <div className="flex flex-col gap-3 mb-8">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === "online" ? "bg-[#FDF2F3] border-[var(--brand-red)]" : "bg-[var(--surface-muted)] border-[var(--border)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={(e) => setPaymentMethod(e.target.value as "online" | "cod")}
                      className="w-4 h-4 text-[var(--brand-red)] focus:ring-[var(--brand-red)]"
                    />
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        Pay Online (Razorpay)
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        100% Secure. UPI, Cards & NetBanking.
                      </p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === "cod" ? "bg-[#F1F8F1] border-[var(--brand-green)]" : "bg-[var(--surface-muted)] border-[var(--border)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value as "online" | "cod")}
                      className="w-4 h-4 text-[var(--brand-green)] focus:ring-[var(--brand-green)]"
                    />
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        Cash on Delivery (COD)
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Pay when you receive your order.
                      </p>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-white py-4 rounded-full font-bold flex items-center justify-center transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                  style={{ backgroundColor: "var(--brand-red)" }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Placing Order...
                    </span>
                  ) : paymentMethod === "online" ? (
                    `Pay ₹${totalPrice} Securely`
                  ) : (
                    `Place COD Order (₹${totalPrice})`
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-1/3">
            <div
              className="rounded-3xl shadow-sm border p-8 sticky top-24"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-light)" }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
                Order Summary
              </h2>

              <ul className="mb-6 divide-y" style={{ borderColor: "var(--border-light)" }}>
                {cart.map((item) => (
                  <li key={item.id} className="py-3 flex justify-between items-start gap-2">
                    <div>
                      <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                        {item.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {item.weight} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
                      ₹{item.price * item.quantity}
                    </span>
                  </li>
                ))}
              </ul>

              <hr className="my-4" style={{ borderColor: "var(--border-light)" }} />

              <div className="flex justify-between items-center mb-2">
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Subtotal
                </span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  ₹{totalPrice}
                </span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Delivery
                </span>
                <span className="font-medium text-sm" style={{ color: "var(--brand-green)" }}>
                  FREE
                </span>
              </div>

              <hr className="my-4" style={{ borderColor: "var(--border-light)" }} />

              <div className="flex justify-between items-center">
                <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Total
                </span>
                <span className="text-2xl font-black" style={{ color: "var(--brand-red)" }}>
                  ₹{totalPrice}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
