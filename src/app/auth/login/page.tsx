"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result?.error?.message || "Unable to sign in"
        );
      }

      localStorage.setItem(
        "falcon_auth_token",
        result.data.token
      );

      await refreshUser();

      router.push("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
        <div className="w-full rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <Link
              href="/"
              className="text-sm font-semibold tracking-[0.2em] text-black"
            >
              FALCON
            </Link>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-black">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-6 text-black/60">
              Sign in to continue your personalized FALCON experience.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={loading}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-black/60">
            New to FALCON?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-black underline underline-offset-4"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}