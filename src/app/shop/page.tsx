"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ProductGrid } from "@/components/commerce/ProductGrid";
import type { Product } from "@/components/commerce/ProductCard";
import PublicFooter from "@/components/navigation/PublicFooter";
import PublicHeader from "@/components/navigation/PublicHeader";

type ProductsResponse = {
  success: boolean;
  data?: {
    products: Product[];
  };
};

type Category = {
  name: string;
  slug: string;
};

type CategoriesResponse = {
  success: boolean;
  data?: {
    categories: Array<Category & { children: Category[] }>;
  };
};

type ViewState = "loading" | "success" | "empty" | "error";

function ShopPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [state, setState] = useState<ViewState>("loading");
  const [categories, setCategories] = useState<Category[]>([]);

  const searchValue = searchParams.get("search") || "";
  const categoryValue = searchParams.get("category") || "";
  const genderValue = searchParams.get("gender") || "";

  function updateQuery(key: string, value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }

    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setState("loading");
        const params = new URLSearchParams();
        if (searchValue) params.set("search", searchValue);
        if (categoryValue) params.set("category", categoryValue);
        if (genderValue) params.set("gender", genderValue);

        const response = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load the collection.");
        }

        const payload = (await response.json()) as ProductsResponse;
        const nextProducts = payload.success && payload.data?.products
          ? payload.data.products
          : [];

        setProducts(nextProducts);
        setState(nextProducts.length > 0 ? "success" : "empty");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setState("error");
      }
    }

    loadProducts();
    return () => controller.abort();
  }, [categoryValue, genderValue, searchValue]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await fetch("/api/categories", {
          signal: controller.signal,
        });
        if (!response.ok) return;

        const payload = (await response.json()) as CategoriesResponse;
        if (payload.success && payload.data?.categories) {
          setCategories(payload.data.categories);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    loadCategories();
    return () => controller.abort();
  }, []);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateQuery("search", String(formData.get("search") || "").trim());
  }

  function clearFilters() {
    router.replace(pathname);
  }

  return (
    <>
      <PublicHeader />
      <main className="commerce-page min-h-screen">
        <section className="container" aria-labelledby="shop-title">
          <div className="commerce-intro">
            <p className="eyebrow">FALCON / The collection</p>
            <h1 id="shop-title">A considered wardrobe for what comes next.</h1>
            <p className="max-w-xl text-base leading-7 text-[var(--color-text-muted)] sm:text-lg">
              Discover architectural essentials and intelligent pieces designed
              to move with your life.
            </p>
          </div>

          <div className="mt-16 flex items-end justify-between gap-6 border-b border-[var(--color-outline-muted)] pb-5 max-md:mt-12 max-md:items-start max-md:flex-col">
            <div className="w-full">
              <p className="eyebrow mb-0">Selected pieces</p>
              <form key={searchValue} className="mt-6 grid gap-4 md:grid-cols-[minmax(220px,1fr)_180px_180px_auto]" onSubmit={handleSearchSubmit}>
                <label className="grid gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Search the collection</span>
                  <input
                    type="search"
                    name="search"
                    defaultValue={searchValue}
                    placeholder="Search by name, brand, or type"
                    className="border-0 border-b border-[var(--color-outline-muted)] bg-transparent px-0 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-champagne)]"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Category</span>
                  <select value={categoryValue} onChange={(event) => updateQuery("category", event.target.value)} className="border-0 border-b border-[var(--color-outline-muted)] bg-transparent px-0 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-champagne)]">
                    <option value="">All categories</option>
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>{category.name}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Audience</span>
                  <select value={genderValue} onChange={(event) => updateQuery("gender", event.target.value)} className="border-0 border-b border-[var(--color-outline-muted)] bg-transparent px-0 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-champagne)]">
                    <option value="">All audiences</option>
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="unisex">Unisex</option>
                    <option value="kids">Kids</option>
                  </select>
                </label>
                <div className="flex items-end gap-3 pb-2">
                  <button type="submit" className="button button--primary min-h-10 px-4 text-xs">Search</button>
                  {(searchValue || categoryValue || genderValue) && <button type="button" onClick={clearFilters} className="button button--secondary min-h-10 px-4 text-xs">Clear</button>}
                </div>
              </form>
              {state === "success" && (
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                  {products.length} {products.length === 1 ? "piece" : "pieces"}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 [&_.commerce-product-grid]:grid [&_.commerce-product-grid]:grid-cols-1 [&_.commerce-product-grid]:gap-x-6 [&_.commerce-product-grid]:gap-y-12 sm:[&_.commerce-product-grid]:grid-cols-2 lg:[&_.commerce-product-grid]:grid-cols-3 xl:[&_.commerce-product-grid]:grid-cols-4 [&_.commerce-product-card__media]:block [&_.commerce-product-card__media]:aspect-[3/4] [&_.commerce-product-card__media]:overflow-hidden [&_.commerce-product-card__media]:bg-[var(--color-surface-high)] [&_.commerce-product-card__media_img]:h-full [&_.commerce-product-card__media_img]:w-full [&_.commerce-product-card__media_img]:object-cover [&_.commerce-product-card__media_img]:transition-transform [&_.commerce-product-card__media_img]:duration-700 [&_.commerce-product-card__media:hover_img]:scale-105 [&_.commerce-product-card__details]:flex [&_.commerce-product-card__details]:items-start [&_.commerce-product-card__details]:justify-between [&_.commerce-product-card__details]:gap-4 [&_.commerce-product-card__details]:py-4 [&_.commerce-product-card__details_span]:font-mono [&_.commerce-product-card__details_span]:text-[10px] [&_.commerce-product-card__details_span]:uppercase [&_.commerce-product-card__details_span]:tracking-[0.08em] [&_.commerce-product-card__details_span]:text-[var(--color-text-muted)] [&_.commerce-product-card__details_h2]:mt-2 [&_.commerce-product-card__details_h2]:font-display [&_.commerce-product-card__details_h2]:text-xl [&_.commerce-product-card__details_h2]:font-normal [&_.commerce-product-card__details_h2_a]:no-underline [&_.commerce-product-card__details_h2_a:hover]:text-[var(--color-champagne)] [&_.commerce-product-card__details_strong]:font-mono [&_.commerce-product-card__details_strong]:text-xs [&_.commerce-product-card__details_strong]:font-normal [&_.commerce-product-card__details_strong]:text-[var(--color-text-muted)] [&_.commerce-product-card__gender]:font-mono [&_.commerce-product-card__gender]:text-[10px] [&_.commerce-product-card__gender]:uppercase [&_.commerce-product-card__gender]:tracking-[0.08em] [&_.commerce-product-card__gender]:text-[var(--color-text-subtle)]">
            {state === "loading" && (
              <p className="home-data-state">Curating the collection...</p>
            )}
            {state === "error" && (
              <p className="home-data-state">
                The collection is momentarily unavailable. Please return soon.
              </p>
            )}
            {state === "empty" && (
              <p className="home-data-state">
                The next collection is being considered.
              </p>
            )}
            {state === "success" && <ProductGrid products={products} />}
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopPageContent />
    </Suspense>
  );
}
