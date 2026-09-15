import Link from "next/link";

const footerGroups = [
  {
    title: "Collection",
    links: [
      ["Shop", "/shop"],
      ["New arrivals", "/shop"],
      ["Wishlist", "/wishlist"],
    ],
  },
  {
    title: "Intelligence",
    links: [
      ["Falcon AI", "/ai"],
      ["Wardrobe", "/wardrobe"],
      ["Profile", "/profile"],
    ],
  },
  {
    title: "Client services",
    links: [
      ["Orders", "/orders"],
      ["Account", "/auth/login"],
      ["Sign in", "/auth/login"],
    ],
  },
] as const;

export default function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="container public-footer__grid">
        <div className="public-footer__brand">
          <Link href="/" className="wordmark">FALCON</Link>
          <p>AI-first fashion, tailored to you.</p>
          <span>Intelligence / 01</span>
        </div>

        {footerGroups.map((group) => (
          <nav key={group.title} aria-label={group.title} className="public-footer__group">
            <h2>{group.title}</h2>
            {group.links.map(([label, href]) => (
              <Link key={label} href={href}>{label}</Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="container public-footer__bottom">
        <span>© 2026 FALCON</span>
        <div>
          <Link href="/">Privacy</Link>
          <Link href="/">Terms</Link>
          <span>USD / US</span>
        </div>
      </div>
    </footer>
  );
}