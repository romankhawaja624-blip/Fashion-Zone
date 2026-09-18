"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import PublicFooter from "@/components/navigation/PublicFooter";
import PublicHeader from "@/components/navigation/PublicHeader";
import { readCartItems, type CartItem } from "@/lib/cart";

const CHECKOUT_FORM_STORAGE_KEY = "falcon_checkout_review";

type CheckoutFormState = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  shippingMethod: string;
};

type FieldErrors = Partial<Record<keyof CheckoutFormState, string>>;

const emptyForm: CheckoutFormState = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  shippingMethod: "standard",
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

export default function CheckoutPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<"loading" | "ready">(
    () => (typeof window === "undefined" ? "loading" : "ready")
  );
  const [items, setItems] = useState<CartItem[]>(() => readCartItems());
  const [form, setForm] = useState<CheckoutFormState>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "valid">("idle");

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + Number(item.price) * Number(item.quantity || 0), 0),
    [items]
  );

  const shippingCost = useMemo(
    () => getShippingCost(form.shippingMethod, subtotal),
    [form.shippingMethod, subtotal]
  );

  const grandTotal = subtotal + shippingCost;
  const totalItems = useMemo(
    () => items.reduce((total, item) => total + Number(item.quantity || 0), 0),
    [items]
  );

  function handleFieldChange(field: keyof CheckoutFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validateForm() {
    const nextErrors: FieldErrors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    }

    if (!form.address.trim()) {
      nextErrors.address = "Address is required.";
    }

    if (!form.city.trim()) {
      nextErrors.city = "City is required.";
    }

    if (!form.province.trim()) {
      nextErrors.province = "Province is required.";
    }

    if (!form.postalCode.trim()) {
      nextErrors.postalCode = "Postal code is required.";
    }

    if (!form.shippingMethod) {
      nextErrors.shippingMethod = "Choose a delivery method.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      setSubmitState("idle");
      setCheckoutError("Please review the highlighted fields before continuing.");
      return;
    }

    setCheckoutError(null);
    setSubmitState("valid");

    if (typeof window !== "undefined") {
      window.localStorage.setItem(CHECKOUT_FORM_STORAGE_KEY, JSON.stringify(form));
    }

    router.push("/checkout/review");
  }

  if (pageState === "loading") {
    return (
      <>
        <PublicHeader />
        <main className="flow-page min-h-screen">
          <div className="container">
            <div className="empty-cart">
              <p className="eyebrow">FALCON / Checkout</p>
              <h2>Loading checkout…</h2>
              <p>Preparing your order details.</p>
            </div>
          </div>
        </main>
        <PublicFooter />
      </>
    );
  }

  if (checkoutError) {
    return (
      <>
        <PublicHeader />
        <main className="error-page min-h-screen">
          <div className="container">
            <p className="eyebrow">FALCON / Checkout</p>
            <h1>Something went wrong.</h1>
            <p>{checkoutError}</p>
            <div className="error-page__actions">
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

  if (items.length === 0) {
    return (
      <>
        <PublicHeader />
        <main className="flow-page min-h-screen">
          <div className="container">
            <div className="empty-cart">
              <p className="eyebrow">FALCON / Checkout</p>
              <h2>Your cart is empty.</h2>
              <p>Add pieces to your cart before continuing to checkout.</p>
              <Link href="/shop" className="button button--primary">
                Continue Shopping
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
      <main className="checkout-page min-h-screen">
        <div className="container">
          <div className="checkout-header">
            <p className="eyebrow">FALCON / Secure checkout</p>
            <span className="secure-label">Encrypted</span>
          </div>

          <div className="checkout-progress" aria-label="Checkout progress">
            <span className="checkout-progress__step checkout-progress__step--active">
              <b>1</b> Cart
            </span>
            <span className="checkout-progress__step checkout-progress__step--active">
              <b>2</b> Details
            </span>
            <span className="checkout-progress__step">
              <b>3</b> Review
            </span>
          </div>

          <div className="checkout-layout">
            <section className="checkout-main" aria-label="Checkout form">
              <form className="checkout-form" onSubmit={handleSubmit} noValidate>
                <div className="security-note">
                  Delivery and account details are reviewed locally before any backend handoff.
                </div>

                <div className="form-grid">
                  <div className="form-field form-field--wide">
                    <span>Contact information</span>
                  </div>

                  <label className="form-field">
                    <span>Full name</span>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(event) => handleFieldChange("fullName", event.target.value)}
                      aria-invalid={Boolean(errors.fullName)}
                    />
                    {errors.fullName && <small>{errors.fullName}</small>}
                  </label>

                  <label className="form-field">
                    <span>Email</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => handleFieldChange("email", event.target.value)}
                      aria-invalid={Boolean(errors.email)}
                    />
                    {errors.email && <small>{errors.email}</small>}
                  </label>

                  <label className="form-field">
                    <span>Phone</span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(event) => handleFieldChange("phone", event.target.value)}
                      aria-invalid={Boolean(errors.phone)}
                    />
                    {errors.phone && <small>{errors.phone}</small>}
                  </label>

                  <div className="form-field form-field--wide">
                    <span>Shipping address</span>
                  </div>

                  <label className="form-field form-field--wide">
                    <span>Address line</span>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(event) => handleFieldChange("address", event.target.value)}
                      aria-invalid={Boolean(errors.address)}
                    />
                    {errors.address && <small>{errors.address}</small>}
                  </label>

                  <label className="form-field">
                    <span>City</span>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(event) => handleFieldChange("city", event.target.value)}
                      aria-invalid={Boolean(errors.city)}
                    />
                    {errors.city && <small>{errors.city}</small>}
                  </label>

                  <label className="form-field">
                    <span>Province</span>
                    <input
                      type="text"
                      value={form.province}
                      onChange={(event) => handleFieldChange("province", event.target.value)}
                      aria-invalid={Boolean(errors.province)}
                    />
                    {errors.province && <small>{errors.province}</small>}
                  </label>

                  <label className="form-field">
                    <span>Postal code</span>
                    <input
                      type="text"
                      value={form.postalCode}
                      onChange={(event) => handleFieldChange("postalCode", event.target.value)}
                      aria-invalid={Boolean(errors.postalCode)}
                    />
                    {errors.postalCode && <small>{errors.postalCode}</small>}
                  </label>

                  <label className="form-field form-field--wide">
                    <span>Delivery / shipping method</span>
                    <select
                      value={form.shippingMethod}
                      onChange={(event) => handleFieldChange("shippingMethod", event.target.value)}
                      aria-invalid={Boolean(errors.shippingMethod)}
                      className="field__input"
                    >
                      {shippingMethods.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label} ({formatPrice(option.cost, "PKR")})
                        </option>
                      ))}
                    </select>
                    {errors.shippingMethod && <small>{errors.shippingMethod}</small>}
                  </label>
                </div>

                {submitState === "valid" && (
                  <div className="review-panel" aria-live="polite">
                    <p>
                      Order details look complete and are ready for the next backend integration step.
                    </p>
                  </div>
                )}

                <button type="submit" className="button button--primary">
                  Place order
                </button>
              </form>
            </section>

            <aside className="order-summary" aria-label="Order summary">
              <div className="order-summary__heading">
                <h2>Summary</h2>
                <span>{totalItems} item{totalItems === 1 ? "" : "s"}</span>
              </div>

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
                      <strong>
                        {item.variant} · {item.size} · Qty {item.quantity}
                      </strong>
                    </div>
                    <span>{formatPrice(Number(item.price) * Number(item.quantity), item.currency)}</span>
                  </div>
                ))}
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
            </aside>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
