import { ProductCard, type Product } from "@/components/commerce/ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="commerce-product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
