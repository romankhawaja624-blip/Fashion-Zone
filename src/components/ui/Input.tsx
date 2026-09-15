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
          className="block font-mono text-xs uppercase tracking-[0.1em] text-[var(--color-text-muted)]"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        className={`w-full border-0 border-b bg-transparent px-0 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:font-mono placeholder:text-[var(--color-text-subtle)] focus:ring-0 ${
          error
            ? "border-[var(--color-error)] focus:border-[var(--color-error)]"
            : "border-[var(--color-outline-muted)] focus:border-[var(--color-champagne)]"
        } ${className}`}
        {...props}
      />

      {error && (
        <p className="font-mono text-xs text-[var(--color-error)]">{error}</p>
      )}
    </div>
  );
}