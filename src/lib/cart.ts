export const FALCON_CART_STORAGE_KEY = "falcon_cart";

export type CartItem = {
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variant: string;
  size: string;
  price: number | string;
  currency: string;
  imageUrl: string | null;
  quantity: number;
};

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<CartItem>;

  return (
    typeof item.productId === "string" &&
    typeof item.productSlug === "string" &&
    typeof item.productName === "string" &&
    typeof item.variantId === "string" &&
    typeof item.variant === "string" &&
    typeof item.size === "string" &&
    (typeof item.price === "number" || typeof item.price === "string") &&
    typeof item.currency === "string" &&
    (typeof item.imageUrl === "string" || item.imageUrl === null) &&
    typeof item.quantity === "number"
  );
}

export function readCartItems(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawItems = window.localStorage.getItem(FALCON_CART_STORAGE_KEY);
    if (!rawItems) {
      return [];
    }

    const parsed = JSON.parse(rawItems);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is CartItem => isCartItem(item));
  } catch {
    return [];
  }
}

export function emitCartChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent("falcon-cart-change"));
}

export function subscribeToCartChanges(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = () => listener();
  window.addEventListener("falcon-cart-change", handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener("falcon-cart-change", handler);
    window.removeEventListener("storage", handler);
  };
}

export function writeCartItems(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(FALCON_CART_STORAGE_KEY, JSON.stringify(items));
    emitCartChange();
  } catch {
    // Ignore localStorage write issues in restricted browser contexts.
  }
}

export function addCartItem(item: CartItem): CartItem[] {
  const items = readCartItems();
  const existingIndex = items.findIndex(
    (existingItem) =>
      existingItem.productId === item.productId &&
      existingItem.variantId === item.variantId &&
      existingItem.size === item.size
  );

  if (existingIndex >= 0) {
    const currentItem = items[existingIndex];
    const nextQuantity = Number(currentItem.quantity) + Number(item.quantity);

    items[existingIndex] = {
      ...currentItem,
      ...item,
      quantity: nextQuantity,
    };
  } else {
    items.push(item);
  }

  writeCartItems(items);
  return items;
}

export function updateCartItemQuantity(
  productId: string,
  variantId: string,
  size: string,
  quantity: number
): CartItem[] {
  const nextQuantity = Math.max(1, Number(quantity) || 1);
  const items = readCartItems();
  const index = items.findIndex(
    (item) =>
      item.productId === productId &&
      item.variantId === variantId &&
      item.size === size
  );

  if (index === -1) {
    return items;
  }

  items[index] = {
    ...items[index],
    quantity: nextQuantity,
  };

  writeCartItems(items);
  return items;
}

export function removeCartItem(productId: string, variantId: string, size: string): CartItem[] {
  const items = readCartItems().filter(
    (item) =>
      !(item.productId === productId && item.variantId === variantId && item.size === size)
  );

  writeCartItems(items);
  return items;
}

export function getCartCount(): number {
  return readCartItems().reduce((total, item) => total + Number(item.quantity || 0), 0);
}
