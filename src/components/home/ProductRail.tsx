"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type Product = {
  id: string | number;
  name: string;
  short_description: string | null;
  brand: string | null;
  product_type: string | null;
  base_price: number | string;
  currency: string;
  image_url: string | null;
};

type ProductResponse = {
  success: boolean;
  data?: { products: Product[] };
};

function formatPrice(price: number | string, currency: string) {
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice)) return `${currency} —`;
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(numericPrice);
}

export function ProductRail() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "empty" | "error">("loading");
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch("/api/products?featured=true", { signal: controller.signal });
        if (!response.ok) throw new Error("Product request failed");
        const payload = (await response.json()) as ProductResponse;
        const nextProducts = payload.success && payload.data?.products ? payload.data.products : [];
        setProducts(nextProducts);
        setStatus(nextProducts.length > 0 ? "success" : "empty");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
      }
    }

    loadProducts();
    return () => controller.abort();
  }, []);

  const visibleProducts = products.slice(offset, offset + 4);
  const canGoBack = offset > 0;
  const canGoForward = offset + 4 < products.length;

  return (
    <section className="container home-product-rail" aria-labelledby="product-rail-title">
      <div className="home-section__heading home-section__heading--rail">
        <div>
          <p className="eyebrow">The edit / 01</p>
          <h2 id="product-rail-title">Selected for the season.</h2>
        </div>
        {status === "success" && (
          <div className="home-product-rail__controls">
            <button type="button" aria-label="Previous products" disabled={!canGoBack} onClick={() => setOffset(Math.max(0, offset - 1))}><ChevronLeft size={18} /></button>
            <button type="button" aria-label="Next products" disabled={!canGoForward} onClick={() => setOffset(offset + 1)}><ChevronRight size={18} /></button>
          </div>
        )}
      </div>

      {status === "loading" && <p className="home-data-state">Curating the season...</p>}
      {status === "error" && <p className="home-data-state">The edit is momentarily offline. Return soon.</p>}
      {status === "empty" && <p className="home-data-state">The next collection is being considered.</p>}
      {status === "success" && (
        <div className="home-product-rail__grid">
          {visibleProducts.map((product) => (
            <article className="home-product-card" key={product.id}>
              <div className="home-product-card__image">
                {product.image_url ? <img src={product.image_url} alt={product.name} /> : <span>FALCON / OBJECT</span>}
              </div>
              <div className="home-product-card__details">
                <div><span>{product.product_type || product.brand || "FALCON"}</span><h3>{product.name}</h3></div>
                <strong>{formatPrice(product.base_price, product.currency)}</strong>
              </div>
              {product.short_description && <p>{product.short_description}</p>}
            </article>
          ))}
        </div>
      )}

      <div className="home-product-rail__footer">
        <span>{status === "success" ? `${products.length} considered pieces` : "FALCON / EDIT"}</span>
        <Link className="text-link" href="/shop">Enter the collection ↗</Link>
      </div>
    </section>
  );
}
