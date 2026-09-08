"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import AppSidebar from "@/components/navigation/AppSidebar";
import { useAuth } from "@/hooks/useAuth";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5]">
        <p className="text-sm text-black/60">
          Loading your FALCON experience...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5]">
        <p className="text-sm text-black/60">
          Redirecting to sign in...
        </p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f7f7f5]">
      <AppSidebar />

      <main className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}