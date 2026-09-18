"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  return shippingMethods.find((entry) => entry.value === value)?.label || "Delivery";
}

function getShippingCost(method: string, subtotal: number) {
  const match = shippingMethods.find((option) => option.value === method);

  if (!match) {
    return 0;
  }

  if (match.cost === 0 && subtotal > 25000) {
    return 0;
  }

  return match.cost;
}

export default function CheckoutReviewPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState<CheckoutReviewForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const savedCart = readCartItems();
      const savedForm = window.localStorage.getItem(CHECKOUT_FORM_STORAGE_KEY);

      setItems(savedCart);

      if (!savedForm) {
        setError("Checkout details could not be found. Please complete the form again.");
        setForm(null);
        setIsLoading(false);
        return;
      }

      const parsedForm = JSON.parse(savedForm) as Partial<CheckoutReviewForm>;
      const hasRequiredFields =
        typeof parsedForm.fullName === "string" &&
        typeof parsedForm.email === "string" &&
        typeof parsedForm.phone === "string" &&
        typeof parsedForm.address === "string" &&
        typeof parsedForm.city === "string" &&
        typeof parsedForm.province === "string" &&
        typeof parsedForm.postalCode === "string" &&
        typeof parsedForm.shippingMethod === "string";

      if (!hasRequiredFields) {
        setError("Required checkout information is missing. Please return to checkout.");
        setForm(null);
        setIsLoading(false);
        return;
      }

      setForm({
        fullName: parsedForm.fullName || "",
        email: parsedForm.email || "",
        phone: parsedForm.phone || "",
        address: parsedForm.address || "",
        city: parsedForm.city || "",
        province: parsedForm.province || "",
        postalCode: parsedForm.postalCode || "",
        shippingMethod: parsedForm.shippingMethod || "standard",
      });
    } catch {
      setError("The review details could not be loaded. Please return to checkout.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + Number(item.price) * Number(item.quantity || 0), 0),
    [items]
  );

  const shippingCost = useMemo(
    () => getShippingCost(form?.shippingMethod || "standard", subtotal),
    [form, subtotal]
  );

  const grandTotal = subtotal + shippingCost;
  const totalItems = useMemo(
    () => items.reduce((total, item) => total + Number(item.quantity || 0), 0),
    [items]
  );

  if (isLoading) {
    return (
      <>
        <PublicHeader />
        <main className="flow-page min-h-screen">
          <div className="container">
            <div className="empty-cart">
              <p className="eyebrow">FALCON / Review</p>
              <h2>Preparing your order review…</h2>
              <p>Loading your cart and checkout details.</p>
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
              <p className="eyebrow">FALCON / Review</p>
              <h2>Your cart is empty.</h2>
              <p>Add pieces to your cart before reviewing the order.</p>
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

  if (error || !form) {
    return (
      <>
        <PublicHeader />
        <main className="error-page min-h-screen">
          <div className="container">
            <p className="eyebrow">FALCON / Review</p>
            <h1>Missing checkout details.</h1>
            <p>{error || "Please return to the checkout form and complete the required information."}</p>
            <div className="error-page__actions">
              <Link href="/checkout" className="button button--primary">
                Back to checkout
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
          <div className="flow-heading">
            <p className="eyebrow">FALCON / Review</p>
            <h1>Confirm your order.</h1>
          </div>

          <div className="checkout-layout">
            <section className="checkout-main" aria-label="Order review">
              <div className="review-panel" style={{ maxWidth: "100%" }}>
                <div style={{ display: "grid", gap: "24px" }}>
                  <div>
                    <p className="eyebrow">Contact</p>
                    <p>{form.fullName}</p>
                    <p>{form.email}</p>
                    <p>{form.phone}</p>
                  </div>

                  <div>
                    <p className="eyebrow">Shipping</p>
                    <p>{form.address}</p>
                    <p>
                      {form.city}, {form.province} {form.postalCode}
                    </p>
                    <p>{getShippingMethodLabel(form.shippingMethod)}</p>
                  </div>

                  <div>
                    <p className="eyebrow">Items</p>
                    <div style={{ display: "grid", gap: "20px" }}>
                      {items.map((item) => (
                        <div key={`${item.productId}-${item.variantId}-${item.size}`} style={{ display: "grid", gridTemplateColumns: "72px minmax(0, 1fr) auto", gap: "16px", alignItems: "center" }}>
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.productName} style={{ width: "72px", height: "96px", objectFit: "cover" }} />
                          ) : (
                            <div className="image-fallback flex h-full w-full items-center justify-center font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]" style={{ width: "72px", height: "96px" }}>
                              FALCON
                            </div>
                          )}

                          <div>
                            <p style={{ margin: "0 0 4px", fontFamily: "var(--font-display)", fontSize: "22px" }}>{item.productName}</p>
                            <p style={{ margin: 0, color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", fontSize: "11px", textTransform: "uppercase" }}>
                              {item.variant} · {item.size} · Qty {item.quantity}
                            </p>
                          </div>

                          <strong style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 400 }}>
                            {formatPrice(Number(item.price) * Number(item.quantity), item.currency)}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <aside className="order-summary" aria-label="Review summary">
              <div className="order-summary__heading">
                <h2>Summary</h2>
                <span>{totalItems} item{totalItems === 1 ? "" : "s"}</span>
              </div>

              <div className="order-summary__totals">
                <p>
                  <span>Subtotal</span>
                  <strong>{formatPrice(subtotal, items[0]?.currency || "PKR")}</strong>
                </p>
                <p>
                  <span>Shipping</span>
                  <strong>{formatPrice(shippingCost, items[0]?.currency || "PKR")}</strong>
                </p>
                <p className="order-summary__total">
                  <span>Grand total</span>
                  <strong>{formatPrice(grandTotal, items[0]?.currency || "PKR")}</strong>
                </p>
              </div>

              <button
                type="button"
                className="button button--primary"
                onClick={() => router.push("/order-confirmed")}
              >
                Confirm order
              </button>
            </aside>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
