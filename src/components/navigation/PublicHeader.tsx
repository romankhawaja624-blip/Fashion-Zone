"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";

import { publicNavigation } from "@/components/navigation/publicNavigation";

type MenuLabel = (typeof publicNavigation.primary)[number]["label"];

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function PublicHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [openMenu, setOpenMenu] = useState<MenuLabel | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState<MenuLabel | null>(null);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenu(null);
        setMobileMenu(null);
        setMobileOpen(false);
      }
    }

    function closeOnOutsideClick(event: MouseEvent) {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, []);

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
    setMobileMenu(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header ref={headerRef} className="public-header">
      <div className="container public-header__inner">
        <Link href="/" className="wordmark" aria-label="FALCON home">
          FALCON
        </Link>

        <nav className="public-header__links" aria-label="Primary navigation">
          {publicNavigation.primary.map((item) => {
            const active = isCurrentPath(pathname, item.href);
            const expanded = openMenu === item.label;

            return (
              <div key={item.label} className="public-nav-item">
                <button
                  type="button"
                  className={`public-nav-trigger${active ? " active" : ""}`}
                  aria-expanded={expanded}
                  onClick={() => setOpenMenu(expanded ? null : item.label)}
                >
                  {item.label}
                  <ChevronDown size={14} aria-hidden="true" />
                </button>

                {expanded && (
                  <div
                    className={`public-dropdown${item.label === "Shop" ? " public-dropdown--wide" : ""}`}
                    role="menu"
                  >
                    {item.items.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        role="menuitem"
                        onClick={() => setOpenMenu(null)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <nav className="public-header__actions" aria-label="Utility navigation">
          <Link href="/shop" className="header-action" aria-label="Search">
            <Search size={18} aria-hidden="true" />
          </Link>
          <Link href="/wishlist" className="header-action header-action--wishlist" aria-label="Wishlist">
            <Heart size={18} aria-hidden="true" />
          </Link>
          <Link href="/shop" className="header-action header-action--bag" aria-label="Shopping bag">
            <ShoppingBag size={18} aria-hidden="true" />
          </Link>
          <Link href="/auth/login" className="header-action header-action--account" aria-label="Account">
            <UserRound size={18} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="menu-trigger"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </div>

      {mobileOpen && (
        <nav className="mobile-navigation mobile-navigation--open" aria-label="Mobile navigation">
          {publicNavigation.primary.map((item) => {
            const expanded = mobileMenu === item.label;

            return (
              <div key={item.label} className="mobile-navigation__group">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setMobileMenu(expanded ? null : item.label)}
                >
                  {item.label}
                  <ChevronDown size={18} aria-hidden="true" />
                </button>
                {expanded && (
                  <div className="mobile-navigation__items">
                    {item.items.map((child) => (
                      <Link key={child.label} href={child.href}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div className="mobile-navigation__utility">
            {publicNavigation.utility.map((item) => (
              <Link key={item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}