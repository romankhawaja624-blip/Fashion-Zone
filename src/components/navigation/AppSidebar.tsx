"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "⌂",
  },
  {
    label: "Shop",
    href: "/shop",
    icon: "◈",
  },
  {
    label: "AI Styling",
    href: "/ai",
    icon: "✦",
  },
  {
    label: "Wardrobe",
    href: "/wardrobe",
    icon: "▣",
  },
  {
    label: "Wishlist",
    href: "/wishlist",
    icon: "♡",
  },
  {
    label: "Orders",
    href: "/orders",
    icon: "□",
  },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/auth/login");
  }

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-black/10 bg-white">
      {/* Brand */}
      <div className="border-b border-black/10 px-7 py-7">
        <Link
          href="/dashboard"
          className="text-lg font-semibold tracking-[0.28em] text-black"
        >
          FALCON
        </Link>

        <p className="mt-2 text-xs text-black/50">
          AI-first fashion platform
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <p className="mb-3 px-3 text-[10px] font-semibold tracking-[0.2em] text-black/40">
          EXPERIENCE
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-black text-white"
                    : "text-black/60 hover:bg-black/[0.04] hover:text-black"
                }`}
              >
                <span className="flex h-6 w-6 items-center justify-center text-base">
                  {item.icon}
                </span>

                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-black/10 p-4">
        <Link
          href="/profile"
          className={`mb-3 flex items-center gap-3 rounded-xl p-3 transition ${
            pathname === "/profile"
              ? "bg-black/[0.05]"
              : "hover:bg-black/[0.04]"
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
            {(user?.profile?.first_name?.[0] ||
              user?.email?.[0] ||
              "F"
            ).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-black">
              {user?.profile?.first_name
                ? `${user.profile.first_name} ${user.profile.last_name || ""}`
                : "FALCON Member"}
            </p>

            <p className="truncate text-xs text-black/50">
              {user?.email}
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-black/60 transition hover:bg-red-50 hover:text-red-600"
        >
          <span className="flex h-6 w-6 items-center justify-center">
            →
          </span>

          Sign out
        </button>
      </div>
    </aside>
  );
}