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
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary:
      "bg-black text-white hover:opacity-90 focus:ring-black",
    secondary:
      "border border-black/15 bg-white text-black hover:bg-black/5 focus:ring-black",
    ghost:
      "bg-transparent text-black hover:bg-black/5 focus:ring-black",
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