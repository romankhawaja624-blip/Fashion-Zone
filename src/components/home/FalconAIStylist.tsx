import Link from "next/link";

const intelligenceCards = [
  ["01", "Personal recommendations", "A point of view tuned to your wardrobe and your world."],
  ["02", "Outfit discovery", "New combinations found in the pieces you already love."],
  ["03", "An intelligent companion", "A calmer, more considered way to decide what comes next."],
] as const;

export function FalconAIStylist() {
  return (
    <section className="container home-ai-section" aria-labelledby="ai-stylist-title">
      <div className="home-ai-section__inner">
        <div className="home-ai-section__content">
          <p className="eyebrow">FALCON intelligence</p>
          <h2 id="ai-stylist-title">A stylist that learns your language.</h2>
          <p>
            FALCON AI brings editorial instinct and personal context together, helping you discover outfits that feel like you.
          </p>
          <Link className="button button--primary" href="/ai">Enter the atelier</Link>
        </div>
        <div className="home-ai-section__cards">
          {intelligenceCards.map(([index, title, description]) => (
            <div className="home-ai-card" key={index}>
              <div>
                <span>{index}</span>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
              <span aria-hidden="true">↗</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
