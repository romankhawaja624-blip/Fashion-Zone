import Link from "next/link";

export type Product = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  brand: string | null;
  gender: string | null;
  product_type: string | null;
  base_price: number | string;
  currency: string;
  image_url: string | null;
  category_name: string | null;
  category_slug: string | null;
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

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="commerce-product-card">
      <Link href={`/product/${product.slug}`} className="commerce-product-card__media">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <span>FALCON / OBJECT</span>
        )}
      </Link>
      <div className="commerce-product-card__details">
        <div>
          <span className="commerce-product-card__meta">
            {product.product_type || product.category_name || "FALCON"}
          </span>
          <h2>
            <Link href={`/product/${product.slug}`}>{product.name}</Link>
          </h2>
        </div>
        <strong>{formatPrice(product.base_price, product.currency)}</strong>
      </div>
      {product.gender && (
        <span className="commerce-product-card__gender">{product.gender}</span>
      )}
    </article>
  );
}
