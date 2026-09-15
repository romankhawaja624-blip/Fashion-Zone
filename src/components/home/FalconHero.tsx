"use client";

import Link from "next/link";

export function FalconHero() {
  return (
    <section className="hero home-hero container" aria-labelledby="hero-title">
      <div className="hero__copy">
        <p className="eyebrow">Autumn / Winter 2026</p>

        <h1 id="hero-title">
          The future of fashion, tailored to you.
        </h1>

        <p className="hero__description">
          An intelligent fashion experience where editorial instinct meets the details that make your style yours.
        </p>

        <div className="hero__actions">
          <Link
            className="button button--primary"
            href="/shop"
          >
            Shop FALCON
          </Link>

          <Link
            className="button button--secondary"
            href="/ai"
          >
            Discover FALCON
          </Link>
        </div>
        <div className="home-hero__metadata">
          <span>Paris · Tokyo · Lahore</span>
          <span>Architectural tailoring</span>
          <span>Edition 2026.01</span>
        </div>
      </div>

      <div className="hero__visual">
        <img
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=90"
          alt="Editorial fashion portrait in architectural tailoring"
        />
        <div className="home-hero__image-wash" aria-hidden="true" />
        <p className="hero__visual-label">01 / Editorial lookbook</p>
      </div>
    </section>
  );
}