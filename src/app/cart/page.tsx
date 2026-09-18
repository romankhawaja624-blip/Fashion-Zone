"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import PublicFooter from "@/components/navigation/PublicFooter";
import PublicHeader from "@/components/navigation/PublicHeader";
import {
  readCartItems,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
} from "@/lib/cart";

function formatPrice(price: number | string, currency: string) {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return `${currency} -`;

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCartItems());
  }, []);

  const subtotal = useMemo(
    () => items.reduce(
      (total, item) => total + Number(item.price) * Number(item.quantity || 0),
      0
    ),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((total, item) => total + Number(item.quantity || 0), 0),
    [items]
  );

  function updateQuantity(productId: string, variantId: string, size: string, nextQuantity: number) {
    const nextItems = updateCartItemQuantity(productId, variantId, size, nextQuantity);
    setItems(nextItems);
  }

  function removeItem(productId: string, variantId: string, size: string) {
    const nextItems = removeCartItem(productId, variantId, size);
    setItems(nextItems);
  }

  if (items.length === 0) {
    return (
      <>
        <PublicHeader />
        <main className="flow-page min-h-screen">
          <div className="container">
            <div className="empty-cart">
              <p className="eyebrow">FALCON / Cart</p>
              <h2>Your cart is empty.</h2>
              <p>Curated pieces are waiting for you in the collection.</p>
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
      <main className="flow-page min-h-screen">
        <div className="container">
          <div className="flow-heading">
            <p className="eyebrow">FALCON / Cart</p>
            <h1>Your selection.</h1>
          </div>

          <div className="cart-layout">
            <div className="cart-items" aria-label="Shopping cart items">
              {items.map((item) => (
                <article key={`${item.productId}-${item.variantId}-${item.size}`} className="cart-item">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} />
                  ) : (
                    <div className="image-fallback flex h-full w-full items-center justify-center font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                      FALCON / OBJECT
                    </div>
                  )}

                  <div className="cart-item__details">
                    <p className="eyebrow">{item.variant || "FALCON"}</p>
                    <h2>{item.productName}</h2>
                    <p>
                      {item.size} · {item.currency}
                    </p>
                    <div className="quantity-control" aria-label={`Quantity for ${item.productName}`}>
                      <button
                        type="button"
                        aria-label={`Decrease quantity for ${item.productName}`}
                        onClick={() =>
                          updateQuantity(item.productId, item.variantId, item.size, Math.max(1, Number(item.quantity) - 1))
                        }
                      >
                        −
                      </button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity for ${item.productName}`}
                        onClick={() =>
                          updateQuantity(item.productId, item.variantId, item.size, Number(item.quantity) + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-item__price">
                    {formatPrice(item.price, item.currency)}
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                      {formatPrice(Number(item.price) * Number(item.quantity), item.currency)}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="cart-item__remove button button--secondary"
                    onClick={() => removeItem(item.productId, item.variantId, item.size)}
                  >
                    Remove
                  </button>
                </article>
              ))}
            </div>

            <aside className="cart-summary" aria-label="Cart summary">
              <div className="order-summary">
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
                    <strong>Calculated at checkout</strong>
                  </p>
                  <p className="order-summary__total">
                    <span>Total</span>
                    <strong>{formatPrice(subtotal, items[0]?.currency || "PKR")}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => router.push("/checkout")}
                >
                  Proceed to checkout
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
