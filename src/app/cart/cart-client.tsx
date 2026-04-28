"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider";
import { useSession } from "next-auth/react";
import { DEFAULT_PRODUCT_IMAGE, getSafeProductImage } from "@/lib/image";
import {
  SHIPPING_FEE_INR,
  isValidEmail,
  type CheckoutDeliveryAddress,
} from "@/lib/checkout";

type PaymentMethod = "razorpay" | "cod";
type CheckoutForm = CheckoutDeliveryAddress;

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

const emptyCheckoutForm: CheckoutForm = {
  firstName: "",
  lastName: "",
  email: "",
  addressLine1: "",
  city: "",
  state: "",
  zipCode: "",
  country: "India",
  phone: "",
};
const loadRazorpayScript = async () => {
  if (typeof window === "undefined") return false;
  if (window.Razorpay) return true;

  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CartPageClient() {
  const { items, total, updateQty, removeItem, clear } = useCart();
  const { data: session } = useSession();
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | "info" | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>(emptyCheckoutForm);

  useEffect(() => {
    const sessionName = session?.user?.name?.trim() || "";
    const [firstName = "", ...rest] = sessionName.split(" ").filter(Boolean);
    const lastName = rest.join(" ");

    setCheckoutForm((current) => ({
      ...current,
      firstName: current.firstName || firstName,
      lastName: current.lastName || lastName,
      email: current.email || session?.user?.email || "",
    }));
  }, [session?.user?.email, session?.user?.name]);

  const grandTotal = useMemo(() => total + SHIPPING_FEE_INR, [total]);

  const handleFieldChange =
    (field: keyof CheckoutForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setCheckoutForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const validateCheckout = () => {
    if (!session) {
      setMessage("Please login to continue to checkout.");
      setMessageType("error");
      return false;
    }

    if (!items.length) {
      setMessage("Your cart is empty.");
      setMessageType("error");
      return false;
    }

    const requiredFields: Array<[keyof CheckoutForm, string]> = [
      ["firstName", "First name"],
      ["lastName", "Last name"],
      ["email", "Email address"],
      ["addressLine1", "Address"],
      ["city", "City"],
      ["state", "State"],
      ["zipCode", "Zipcode"],
      ["country", "Country"],
      ["phone", "Phone number"],
    ];

    for (const [field, label] of requiredFields) {
      if (!checkoutForm[field].trim()) {
        setMessage(`${label} is required.`);
        setMessageType("error");
        return false;
      }
    }

    if (!isValidEmail(checkoutForm.email.trim())) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return false;
    }

    return true;
  };

  const placeOrder = async () => {
    if (!validateCheckout()) return;

    setPlacing(true);
    setMessage(paymentMethod === "razorpay" ? "Opening Razorpay test checkout..." : null);
    setMessageType(paymentMethod === "razorpay" ? "info" : null);

    try {
      if (paymentMethod === "razorpay") {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded || !window.Razorpay) {
          setMessage("Unable to load Razorpay checkout.");
          setMessageType("error");
          return;
        }

        const createOrderRes = await fetch("/api/payments/razorpay/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            deliveryAddress: checkoutForm,
          }),
        });

        const createOrderData = await createOrderRes.json().catch(() => null);
        if (!createOrderRes.ok) {
          setMessage(createOrderData?.message || "Unable to start Razorpay checkout.");
          setMessageType("error");
          return;
        }

        const paid = await new Promise<boolean>((resolve) => {
          const razorpay = new window.Razorpay({
            key: createOrderData.keyId,
            amount: createOrderData.amountInINR * 100,
            currency: createOrderData.currency,
            name: "Casual Wear",
            description: "Order payment",
            order_id: createOrderData.razorpayOrderId,
            prefill: {
              name: `${checkoutForm.firstName} ${checkoutForm.lastName}`.trim(),
              email: checkoutForm.email,
              contact: checkoutForm.phone,
            },
            theme: {
              color: "#1f3a5f",
            },
            modal: {
              ondismiss: () => resolve(false),
            },
            handler: async (response: Record<string, string>) => {
              try {
                const verifyRes = await fetch("/api/payments/razorpay/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    items,
                    deliveryAddress: checkoutForm,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  }),
                });

                const verifyData = await verifyRes.json().catch(() => null);
                if (!verifyRes.ok) {
                  setMessage(verifyData?.message || "Payment verification failed.");
                  setMessageType("error");
                  resolve(false);
                  return;
                }

                clear();
                setMessage(
                  verifyData?.emailSent
                    ? "Payment successful. Your order is placed and confirmation email has been sent."
                    : "Payment successful. Your order is placed, but email is not configured yet."
                );
                setMessageType("success");
                setCheckoutForm((current) => ({
                  ...emptyCheckoutForm,
                  firstName: current.firstName,
                  lastName: current.lastName,
                  email: current.email,
                  country: current.country || "India",
                }));
                resolve(true);
              } catch {
                setMessage("Payment completed, but we could not verify it.");
                setMessageType("error");
                resolve(false);
              }
            },
          });

          razorpay.open();
        });

        if (!paid && !message) {
          setMessage("Razorpay checkout was cancelled.");
          setMessageType("error");
        }
        return;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          deliveryAddress: checkoutForm,
          paymentMethod,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        clear();
        setMessage(
          data?.emailSent
            ? "Your order has been placed and a confirmation email has been sent."
            : "Your order has been placed. Email sending is not configured yet."
        );
        setMessageType("success");
        setCheckoutForm((current) => ({
          ...emptyCheckoutForm,
          firstName: current.firstName,
          lastName: current.lastName,
          email: current.email,
          country: current.country || "India",
        }));
      } else {
        setMessage(data?.message || "Could not place order.");
        setMessageType("error");
      }
    } catch {
      setMessage("Something went wrong.");
      setMessageType("error");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <main className="section-shell py-10 sm:py-12 space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-ink/50">Checkout</p>
        <h1 className="text-3xl sm:text-4xl font-bold">Delivery and payment</h1>
      </div>
      {message && (
        <p
          className={`rounded-xl border px-4 py-3 text-base font-semibold ${
            messageType === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : messageType === "info"
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </p>
      )}
      {items.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 sm:p-8 text-center shadow-soft">
          <p className="text-base sm:text-lg font-medium text-ink/70">Your cart is empty.</p>
          <Link href="/shop" className="mt-4 inline-block rounded-full bg-ink px-4 py-2 text-base font-bold text-white">
            Shop products
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-soft">
              <div className="flex items-center justify-between gap-3 border-b border-ink/10 pb-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-ink/50">Delivery information</p>
                  <h2 className="mt-1 text-2xl font-bold">Where should we ship it?</h2>
                </div>
                {!session && (
                  <Link href="/login" className="text-sm font-bold text-accent">
                    Login
                  </Link>
                )}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <input
                  placeholder="First Name"
                  value={checkoutForm.firstName}
                  onChange={handleFieldChange("firstName")}
                  className="rounded-xl border border-ink/10 px-4 py-3 text-base"
                />
                <input
                  placeholder="Last Name"
                  value={checkoutForm.lastName}
                  onChange={handleFieldChange("lastName")}
                  className="rounded-xl border border-ink/10 px-4 py-3 text-base"
                />
                <input
                  type="email"
                  placeholder="E-mail address"
                  value={checkoutForm.email}
                  onChange={handleFieldChange("email")}
                  className="sm:col-span-2 rounded-xl border border-ink/10 px-4 py-3 text-base"
                />
                <input
                  placeholder="Door No, House Name, Street Name"
                  value={checkoutForm.addressLine1}
                  onChange={handleFieldChange("addressLine1")}
                  className="sm:col-span-2 rounded-xl border border-ink/10 px-4 py-3 text-base"
                />
                <input
                  placeholder="City"
                  value={checkoutForm.city}
                  onChange={handleFieldChange("city")}
                  className="rounded-xl border border-ink/10 px-4 py-3 text-base"
                />
                <input
                  placeholder="State"
                  value={checkoutForm.state}
                  onChange={handleFieldChange("state")}
                  className="rounded-xl border border-ink/10 px-4 py-3 text-base"
                />
                <input
                  placeholder="Zipcode"
                  value={checkoutForm.zipCode}
                  onChange={handleFieldChange("zipCode")}
                  className="rounded-xl border border-ink/10 px-4 py-3 text-base"
                />
                <input
                  placeholder="Country"
                  value={checkoutForm.country}
                  onChange={handleFieldChange("country")}
                  className="rounded-xl border border-ink/10 px-4 py-3 text-base"
                />
                <input
                  placeholder="Phone number"
                  value={checkoutForm.phone}
                  onChange={handleFieldChange("phone")}
                  className="sm:col-span-2 rounded-xl border border-ink/10 px-4 py-3 text-base"
                />
              </div>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="rounded-2xl bg-white p-4 shadow-soft flex flex-col gap-4 sm:flex-row"
                >
                  <div className="relative h-24 w-full sm:w-24 sm:min-w-24 overflow-hidden rounded-xl bg-sand">
                    <Image
                      src={getSafeProductImage(item.image, DEFAULT_PRODUCT_IMAGE)}
                      alt={item.name}
                      fill
                      sizes="(max-width:639px) 100vw, 96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold line-clamp-2">{item.name}</h3>
                        <p className="text-base text-ink/60">
                          {item.size && `Size ${item.size}`}
                          {item.size && item.color ? " | " : ""}
                          {item.color && item.color}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.size, item.color)}
                        className="text-sm font-semibold text-ink/50 hover:text-accent"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <label className="text-base font-medium text-ink/60">Qty</label>
                        <input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={(e) =>
                            updateQty(item.productId, Number(e.target.value), item.size, item.color)
                          }
                          className="w-16 rounded-lg border border-ink/10 px-2 py-1 text-center"
                        />
                      </div>
                      <div className="text-lg font-bold">Rs {(item.priceInINR * item.qty).toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-soft space-y-5 h-fit lg:sticky lg:top-24">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-ink/50">Cart totals</p>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-base font-medium text-ink/70">
                  <span>Subtotal</span>
                  <span>Rs {total.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-base font-medium text-ink/70">
                  <span>Shipping Fee</span>
                  <span>Rs {SHIPPING_FEE_INR.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between border-t border-ink/10 pt-3 text-xl font-bold">
                  <span>Total</span>
                  <span>Rs {grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-ink/50">Payment method</p>
              <button
                type="button"
                onClick={() => setPaymentMethod("razorpay")}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${
                  paymentMethod === "razorpay"
                    ? "border-accent bg-accent/10"
                    : "border-ink/10 hover:border-accent/40"
                }`}
              >
                <span className="font-bold text-[#1c4a8c]">Razorpay</span>
                <span className="text-sm font-semibold text-ink/60">Test mode</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${
                  paymentMethod === "cod"
                    ? "border-accent bg-accent/10"
                    : "border-ink/10 hover:border-accent/40"
                }`}
              >
                <span className="font-bold text-ink">Cash on Delivery</span>
                <span className="text-sm font-semibold text-ink/60">Pay at your door</span>
              </button>
            </div>

            {!session && (
              <p className="text-base text-ink/60">
                Please login to continue with checkout and receive your order confirmation.
              </p>
            )}

            <button
              onClick={placeOrder}
              disabled={placing || items.length === 0}
              className="w-full rounded-full bg-ink text-white py-3 text-base font-bold hover:bg-coal disabled:opacity-50"
            >
              {placing ? "Placing order..." : "Place order"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
