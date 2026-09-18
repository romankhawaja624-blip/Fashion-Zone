"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import PublicFooter from "@/components/navigation/PublicFooter";
import PublicHeader from "@/components/navigation/PublicHeader";
import { readCartItems, type CartItem } from "@/lib/cart";

const CHECKOUT_FORM_STORAGE_KEY = "falcon_checkout_review";

type CheckoutReviewForm = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  shippingMethod: string;
};

const shippingMethods = [
  { value: "standard", label: "Standard delivery", cost: 0 },
  { value: "express", label: "Express delivery", cost: 1200 },
  { value: "priority", label: "Priority delivery", cost: 2500 },
] as const;

function formatPrice(price: number | string, currency: string) {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return `${currency} -`;

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getShippingMethodLabel(value: string) {
  return shippingMethods.find((method) => method.value === value)?.label || "Delivery";
}

function getShippingCost(method: string, subtotal: number) {
  const selectedMethod = shippingMethods.find((option) => option.value === method);
  if (!selectedMethod) return 0;
  if (selectedMethod.cost === 0 && subtotal > 25000) return 0;
  return selectedMethod.cost;
}

function readCheckoutForm(): CheckoutReviewForm | null {
  if (typeof window === "undefined") return null;

  try {
    const savedForm = window.localStorage.getItem(CHECKOUT_FORM_STORAGE_KEY);
    if (!savedForm) return null;

    const parsed = JSON.parse(savedForm) as Partial<CheckoutReviewForm>;
    const fields: Array<keyof CheckoutReviewForm> = [
      "fullName",
      "email",
      "phone",
      "address",
      "city",
      "province",
      "postalCode",
      "shippingMethod",
    ];

    if (fields.some((field) => typeof parsed[field] !== "string" || !parsed[field]?.trim())) {
      return null;
    }

    return parsed as CheckoutReviewForm;
  } catch {
    return null;
  }
}

export default function OrderConfirmedPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState<CheckoutReviewForm | null>(null);

  useEffect(() => {
    setItems(readCartItems());
    setForm(readCheckoutForm());
    setIsLoading(false);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + Number(item.price) * Number(item.quantity || 0), 0),
    [items]
  );
  const shippingCost = getShippingCost(form?.shippingMethod || "standard", subtotal);
  const grandTotal = subtotal + shippingCost;
  const totalItems = items.reduce((total, item) => total + Number(item.quantity || 0), 0);
  const currency = items[0]?.currency || "PKR";

  if (isLoading) {
    return (
      <>
        <PublicHeader />
        <main className="flow-page min-h-screen">
          <div className="container">
            <div className="empty-cart">
              <p className="eyebrow">FALCON / Order confirmed</p>
              <h2>Preparing your confirmation…</h2>
              <p>Loading your order details.</p>
            </div>
          </div>
        </main>
        <PublicFooter />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <PublicHeader />
        <main className="flow-page min-h-screen">
          <div className="container">
            <div className="empty-cart">
              <p className="eyebrow">FALCON / Order confirmed</p>
              <h2>No order items found.</h2>
              <p>Your cart is empty. Begin with a considered piece from the collection.</p>
              <Link href="/shop" className="button button--primary">
                Continue shopping
              </Link>
            </div>
          </div>
        </main>
        <PublicFooter />
      </>
    );
  }

  if (!form) {
    return (
      <>
        <PublicHeader />
        <main className="error-page min-h-screen">
          <div className="container">
            <p className="eyebrow">FALCON / Order confirmed</p>
            <h1>Confirmation details are missing.</h1>
            <p>We still have your cart, but the checkout information could not be loaded.</p>
            <div className="error-page__actions">
              <Link href="/checkout" className="button button--primary">
                Return to checkout
              </Link>
              <Link href="/shop" className="button button--secondary">
                Continue shopping
              </Link>
            </div>
          </div>
        </main>
        <PublicFooter />
      </>
    );
  }

  return (
    <>
      <PublicHeader />
      <main className="flow-page min-h-screen">
        <div className="container">
          <section className="flow-heading" aria-labelledby="confirmation-title">
            <p className="eyebrow">FALCON / Order confirmed</p>
            <h1 id="confirmation-title">Your order is reserved.</h1>
            <p>Thank you, {form.fullName}. Your selection has been recorded for the next step.</p>
          </section>

          <div className="confirmation-grid">
            <section aria-labelledby="confirmation-reference">
              <p className="eyebrow">Confirmation reference</p>
              <h2 id="confirmation-reference">FALCON-PENDING</h2>
              <p>This placeholder reference will be replaced by the order ID after backend integration.</p>
            </section>

            <section aria-labelledby="customer-details">
              <p className="eyebrow">Customer</p>
              <h2 id="customer-details">{form.fullName}</h2>
              <p>{form.email}</p>
              <p>{form.phone}</p>
            </section>

            <section aria-labelledby="shipping-details">
              <p className="eyebrow">Shipping</p>
              <h2 id="shipping-details">{getShippingMethodLabel(form.shippingMethod)}</h2>
              <p>{form.address}</p>
              <p>{form.city}, {form.province} {form.postalCode}</p>
            </section>

            <section aria-labelledby="order-items">
              <p className="eyebrow">Ordered items</p>
              <h2 id="order-items">{totalItems} item{totalItems === 1 ? "" : "s"}</h2>
              <div className="order-summary__items">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId}-${item.size}`} className="order-summary__item">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} />
                    ) : (
                      <div className="image-fallback flex h-full w-full items-center justify-center font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                        FALCON
                      </div>
                    )}
                    <div>
                      <p>{item.productName}</p>
                      <span>{item.variant} · {item.size} · Qty {item.quantity}</span>
                    </div>
                    <strong>{formatPrice(item.price, item.currency)}</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="order-summary" aria-label="Order totals">
            <div className="order-summary__heading">
              <h2>Order summary</h2>
              <span>{totalItems} item{totalItems === 1 ? "" : "s"}</span>
            </div>
            <div className="order-summary__totals">
              <p><span>Subtotal</span><strong>{formatPrice(subtotal, currency)}</strong></p>
              <p><span>Shipping</span><strong>{formatPrice(shippingCost, currency)}</strong></p>
              <p className="order-summary__total"><span>Grand total</span><strong>{formatPrice(grandTotal, currency)}</strong></p>
            </div>
          </section>

          <div className="error-page__actions">
            <Link href="/shop" className="button button--primary">Continue shopping</Link>
            <Link href="/atelier/orders" className="button button--secondary">View orders</Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
