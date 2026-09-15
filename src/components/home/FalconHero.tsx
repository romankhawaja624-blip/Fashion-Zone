"use client";

import Link from "next/link";

import { ShaderCanvas } from "@/components/effects/ShaderCanvas";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function FalconHero() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      className="hero container"
      aria-labelledby="hero-title"
    >
      <div className="hero__copy">
        <p className="eyebrow">AI-first fashion</p>

        <h1 id="hero-title">
          The future of fashion, tailored to you.
        </h1>

        <p className="hero__description">
          Discover clothing, build your wardrobe, and find
          your style through a smarter fashion experience
          designed around you.
        </p>

        <div className="hero__actions">
          <Link
            className="button button--primary"
            href="/shop"
          >
            Shop the collection
          </Link>

          <Link
            className="button button--secondary"
            href="/ai"
          >
            Explore Falcon AI
          </Link>
        </div>
      </div>

      <div className="hero__visual">
        <ShaderCanvas reducedMotion={reducedMotion} />

        <div
          className="hero__visual-overlay"
          aria-hidden="true"
        />

        <p className="hero__visual-label">
          Intelligence / 01
        </p>
      </div>
    </section>
  );
}