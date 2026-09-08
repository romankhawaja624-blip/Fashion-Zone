"use client";

import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-black"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:text-black/40 focus:ring-2 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
            : "border-black/15 focus:border-black focus:ring-black/10"
        } ${className}`}
        {...props}
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}