"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import type { Product } from "@/components/commerce/ProductCard";
import { addCartItem } from "@/lib/cart";
import PublicFooter from "@/components/navigation/PublicFooter";
import PublicHeader from "@/components/navigation/PublicHeader";

type ProductsResponse = {
  success: boolean;
  data?: {
    products: ProductWithGallery[];
  };
};

type DetailState = "loading" | "success" | "not-found" | "error";
type ProductImage = string | { image_url?: string | null; url?: string | null };
type ProductInventory = number | {
  quantity?: number | null;
  reserved_quantity?: number | null;
} | null;
type ProductVariant = {
  id?: string | null;
  name?: string | null;
  size?: string | null;
  color?: string | null;
  is_active?: boolean | null;
  available?: boolean | null;
  in_stock?: boolean | null;
  quantity?: number | null;
  stock?: number | null;
  inventory?: ProductInventory;
};
type ProductWithGallery = Product & {
  images?: ProductImage[] | null;
  image_urls?: string[] | null;
  variants?: ProductVariant[] | null;
  sizes?: string[] | null;
};

function formatPrice(price: number | string, currency: string) {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return `${currency} -`;

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getProductImages(product: ProductWithGallery) {
  const additionalImages = [
    ...(product.images || []).map((image) =>
      typeof image === "string" ? image : image.image_url || image.url || ""
    ),
    ...(product.image_urls || []),
  ].filter(Boolean);

  return Array.from(
    new Set([product.image_url || "", ...additionalImages].filter(Boolean))
  );
}

function isVariantAvailable(variant: ProductVariant) {
  if (variant.is_active === false || variant.available === false || variant.in_stock === false) {
    return false;
  }

  const quantity = typeof variant.inventory === "number"
    ? variant.inventory
    : variant.inventory?.quantity ?? variant.quantity ?? variant.stock;

  return quantity === undefined || quantity === null || quantity > 0;
}

function ProductOptions({ product }: { product: ProductWithGallery }) {
  const variants = product.variants || [];
  const variantLabels = Array.from(
    new Set(
      variants
        .map((variant) => variant.color || variant.name)
        .filter((label): label is string => Boolean(label))
    )
  );
  const sizeLabels = Array.from(
    new Set([
      ...(product.sizes || []),
      ...variants
        .map((variant) => variant.size)
        .filter((size): size is string => Boolean(size)),
    ])
  );
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (variantLabels.length === 1 && !selectedVariant) {
      setSelectedVariant(variantLabels[0]);
    }

    if (sizeLabels.length === 1 && !selectedSize) {
      setSelectedSize(sizeLabels[0]);
    }
  }, [selectedSize, selectedVariant, sizeLabels, variantLabels]);

  if (variantLabels.length === 0 && sizeLabels.length === 0) return null;

  function isVariantLabelAvailable(label: string) {
    return variants
      .filter((variant) => (variant.color || variant.name) === label)
      .some(isVariantAvailable);
  }

  function isSizeAvailable(size: string) {
    const matchingVariants = variants.filter((variant) => variant.size === size);
    return matchingVariants.length === 0 || matchingVariants.some(isVariantAvailable);
  }

  const selectedVariants = variants.filter((variant) => {
    const matchesVariant = !selectedVariant || (variant.color || variant.name) === selectedVariant;
    const matchesSize = !selectedSize || variant.size === selectedSize;
    return matchesVariant && matchesSize;
  });
  const selectionRequired = variantLabels.length > 0 || sizeLabels.length > 0;
  const selectionComplete =
    (!variantLabels.length || Boolean(selectedVariant)) &&
    (!sizeLabels.length || Boolean(selectedSize));
  const selectionAvailable = selectedVariants.length === 0 || selectedVariants.some(isVariantAvailable);
  const canAddToCart = (!selectionRequired || selectionComplete) && selectionAvailable;

  return (
    <div className="grid gap-6 border-block border-[var(--color-outline-muted)] py-6">
      {variantLabels.length > 0 && (
        <fieldset className="grid gap-3 border-0 p-0">
          <legend className="product-info__note">Variant</legend>
          <div className="flex flex-wrap gap-2">
            {variantLabels.map((label) => {
              const unavailable = !isVariantLabelAvailable(label);
              return (
                <button
                  key={label}
                  type="button"
                  disabled={unavailable}
                  aria-pressed={selectedVariant === label}
                  className={`border px-4 py-3 text-xs uppercase tracking-[0.08em] transition-colors ${selectedVariant === label ? "border-[var(--color-champagne)] text-[var(--color-champagne)]" : "border-[var(--color-outline-muted)] text-[var(--color-text)]"} ${unavailable ? "cursor-not-allowed opacity-35" : "hover:border-[var(--color-champagne)]"}`}
                  onClick={() => setSelectedVariant(label)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
      {sizeLabels.length > 0 && (
        <fieldset className="grid gap-3 border-0 p-0">
          <legend className="product-info__note">Size</legend>
          <div className="flex flex-wrap gap-2">
            {sizeLabels.map((size) => {
              const unavailable = !isSizeAvailable(size);
              return (
                <button
                  key={size}
                  type="button"
                  disabled={unavailable}
                  aria-pressed={selectedSize === size}
                  className={`min-w-12 border px-4 py-3 text-xs uppercase tracking-[0.08em] transition-colors ${selectedSize === size ? "border-[var(--color-champagne)] text-[var(--color-champagne)]" : "border-[var(--color-outline-muted)] text-[var(--color-text)]"} ${unavailable ? "cursor-not-allowed opacity-35" : "hover:border-[var(--color-champagne)]"}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
      <div className="grid gap-3">
        <span className="product-info__note">Quantity</span>
        <div className="flex w-fit items-center border border-[var(--color-outline-muted)]">
          <button
            type="button"
            aria-label="Decrease quantity"
            className="icon-button"
            disabled={quantity === 1}
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            −
          </button>
          <span className="min-w-10 text-center font-mono text-xs" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            className="icon-button"
            onClick={() => setQuantity((value) => value + 1)}
          >
            +
          </button>
        </div>
      </div>
      <button
        type="button"
        className="button button--primary product-info__cta"
        disabled={!canAddToCart}
        aria-disabled={!canAddToCart}
        onClick={() => {
          if (!canAddToCart) {
            return;
          }

          const resolvedVariant = selectedVariant || variantLabels[0] || "Default";
          const resolvedSize = selectedSize || sizeLabels[0] || "One Size";
          const matchedVariant = product.variants?.find((variant) => {
            const variantLabel = variant.color || variant.name || "";
            return variantLabel === resolvedVariant && variant.size === resolvedSize;
          });

          const normalisedImage = typeof product.image_url === "string"
            ? product.image_url
            : Array.isArray(product.images)
              ? (() => {
                  const firstImage = product.images[0];
                  if (typeof firstImage === "string") {
                    return firstImage;
                  }

                  return firstImage?.image_url || firstImage?.url || null;
                })()
              : null;

          const nextItem = {
            productId: product.id,
            productSlug: product.slug,
            productName: product.name,
            variantId: matchedVariant?.id || `${product.id}-${resolvedVariant}-${resolvedSize}`,
            variant: resolvedVariant,
            size: resolvedSize,
            price: product.base_price,
            currency: product.currency,
            imageUrl: normalisedImage,
            quantity,
          };

          addCartItem(nextItem);
        }}
      >
        Add to Cart
      </button>
    </div>
  );
}

function ProductGallery({ product }: { product: ProductWithGallery }) {
  const images = getProductImages(product);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] || images[0];

  return (
    <div className="product-gallery">
      <div className="product-gallery__main">
        {selectedImage ? (
          <img src={selectedImage} alt={product.name} />
        ) : (
          <div className="image-fallback flex h-full items-center justify-center font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            FALCON / OBJECT
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="product-gallery__thumbs" aria-label="Product images">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              className={`product-gallery__thumb${index === selectedIndex ? " product-gallery__thumb--active" : ""}`}
              aria-label={`View product image ${index + 1}`}
              aria-pressed={index === selectedIndex}
              onClick={() => setSelectedIndex(index)}
            >
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const [product, setProduct] = useState<ProductWithGallery | null>(null);
  const [state, setState] = useState<DetailState>("loading");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      setState("loading");

      try {
        const response = await fetch("/api/products", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load the product.");
        }

        const payload = (await response.json()) as ProductsResponse;
        const match = payload.success
          ? payload.data?.products.find((item) => item.slug === slug)
          : undefined;

        setProduct(match || null);
        setState(match ? "success" : "not-found");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setState("error");
      }
    }

    loadProduct();
    return () => controller.abort();
  }, [slug]);

  return (
    <>
      <PublicHeader />
      <main className="product-detail min-h-screen">
        <div className="container">
          {state === "loading" && (
            <p className="home-data-state">Loading product...</p>
          )}
          {state === "error" && (
            <p className="home-data-state">The product is momentarily unavailable.</p>
          )}
          {state === "not-found" && (
            <p className="home-data-state">This product could not be found.</p>
          )}
          {state === "success" && product && (
            <section className="product-detail__layout" aria-labelledby="product-title">
              <ProductGallery key={product.slug} product={product} />
              <div className="product-info">
                <p className="eyebrow">
                  {product.product_type || product.category_name || "FALCON"}
                </p>
                <h1 id="product-title">{product.name}</h1>
                {product.brand && <p className="product-info__note">{product.brand}</p>}
                <p className="product-info__note">
                  {product.category_name || product.product_type || "Collection piece"}
                </p>
                <p className="product-info__price">
                  {formatPrice(product.base_price, product.currency)}
                </p>
                {product.short_description && (
                  <p className="product-info__description">{product.short_description}</p>
                )}
                <ProductOptions product={product} />
              </div>
            </section>
          )}
        </div>
      </main>
      <PublicFooter />
    </>
  );
}