export const publicNavigation = {
  primary: [
    {
      label: "Shop",
      href: "/shop",
      items: [
        { label: "New arrivals", href: "/shop" },
        { label: "Collections", href: "/shop" },
        { label: "All pieces", href: "/shop" },
      ],
    },
    {
      label: "Discover",
      href: "/ai",
      items: [
        { label: "Falcon AI", href: "/ai" },
        { label: "Your wardrobe", href: "/wardrobe" },
        { label: "Saved pieces", href: "/wishlist" },
      ],
    },
    {
      label: "Styling",
      href: "/ai",
      items: [
        { label: "Style with Falcon", href: "/ai" },
        { label: "Wardrobe", href: "/wardrobe" },
        { label: "Profile", href: "/profile" },
      ],
    },
  ],
  utility: [
    { label: "Search", href: "/shop" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Bag", href: "/shop" },
    { label: "Account", href: "/auth/login" },
  ],
} as const;