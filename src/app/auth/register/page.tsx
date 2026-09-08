"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result?.error?.message ||
            "Unable to create your account"
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
              Create your account
            </h1>

            <p className="mt-2 text-sm leading-6 text-black/60">
              Join FALCON and unlock a personalized fashion experience.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                id="firstName"
                label="First name"
                type="text"
                autoComplete="given-name"
                placeholder="First name"
                value={firstName}
                onChange={(event) =>
                  setFirstName(event.target.value)
                }
                required
              />

              <Input
                id="lastName"
                label="Last name"
                type="text"
                autoComplete="family-name"
                placeholder="Last name"
                value={lastName}
                onChange={(event) =>
                  setLastName(event.target.value)
                }
                required
              />
            </div>

            <Input
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />

            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              minLength={8}
              required
            />

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              loading={loading}
            >
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-black/60">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-black underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}