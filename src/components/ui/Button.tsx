"use client";

import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
};

export default function Button({
  children,
  variant = "primary",
  fullWidth = false,
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] border px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em] transition-colors duration-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary:
      "border-transparent bg-[var(--color-champagne)] text-[var(--color-deep-ink)] hover:bg-[var(--color-champagne-light)]",
    secondary:
      "border-[var(--color-outline)] bg-transparent text-[var(--color-text)] hover:border-[var(--color-champagne)] hover:text-[var(--color-champagne)]",
    ghost:
      "border-transparent bg-transparent text-[var(--color-text)] hover:text-[var(--color-champagne)]",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}