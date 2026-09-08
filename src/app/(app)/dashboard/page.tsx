"use client";

import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";

const dashboardItems = [
  {
    title: "Shop",
    description: "Explore curated collections and discover your next look.",
    href: "/shop",
  },
  {
    title: "AI Styling",
    description: "Get personalized outfit ideas powered by FALCON AI.",
    href: "/ai",
  },
  {
    title: "Wardrobe",
    description: "Manage your digital wardrobe and build better outfits.",
    href: "/wardrobe",
  },
  {
    title: "Wishlist",
    description: "Access the fashion pieces and looks you have saved.",
    href: "/wishlist",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const firstName = user?.profile?.first_name || "there";

  return (
    <div className="min-h-screen">
      <header className="border-b border-black/10 bg-white">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-black/40">
              FALCON EXPERIENCE
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-black">
              Dashboard
            </h1>
          </div>

          <p className="hidden text-sm text-black/50 sm:block">
            AI-first fashion, personalized for you.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10">
        <div className="rounded-3xl border border-black/10 bg-white p-8 sm:p-12">
          <p className="text-sm font-medium tracking-wide text-black/50">
            YOUR PERSONAL SPACE
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
            Welcome back, {firstName}.
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-black/60">
            Your personalized FALCON ecosystem is ready. Discover fashion,
            explore intelligent styling, organize your wardrobe, and build
            looks that feel uniquely yours.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-black/10 bg-white p-6 transition hover:-translate-y-1 hover:border-black/30 hover:shadow-sm"
            >
              <h3 className="text-lg font-semibold text-black">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-black/60">
                {item.description}
              </p>

              <p className="mt-6 text-sm font-semibold text-black transition group-hover:translate-x-1">
                Explore →
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-black/40">
            ACCOUNT OVERVIEW
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs text-black/50">
                Email address
              </p>

              <p className="mt-2 font-medium text-black">
                {user?.email}
              </p>
            </div>

            <div>
              <p className="text-xs text-black/50">
                Account role
              </p>

              <p className="mt-2 font-medium capitalize text-black">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}