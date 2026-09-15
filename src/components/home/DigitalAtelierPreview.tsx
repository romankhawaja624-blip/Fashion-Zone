import Link from "next/link";

const wardrobePieces = [
  {
    label: "Outerwear",
    name: "Obsidian trench",
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=85",
  },
  {
    label: "Tailoring",
    name: "Structured blazer",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=85",
  },
  {
    label: "Essentials",
    name: "Tapered trousers",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=85",
  },
] as const;

export function DigitalAtelierPreview() {
  return (
    <section className="container home-atelier-preview" aria-labelledby="atelier-title">
      <div className="home-section__heading home-section__heading--split">
        <div>
          <p className="eyebrow">Your digital atelier</p>
          <h2 id="atelier-title">A wardrobe with a point of view.</h2>
        </div>
        <p>Save what speaks to you. Build looks that move with you. Let FALCON remember the details.</p>
      </div>
      <div className="home-atelier-preview__grid">
        <div className="home-atelier-preview__metrics">
          <div className="home-atelier__metric"><span>Wardrobe intelligence</span><strong>01</strong><p>Your evolving style profile.</p></div>
          <div className="home-atelier__metric"><span>Outfit direction</span><strong>24/7</strong><p>Ideas for every context.</p></div>
          <Link className="text-link" href="/wardrobe">Open your wardrobe ↗</Link>
        </div>
        <div className="home-atelier-preview__cards">
          {wardrobePieces.map((piece) => (
            <article className="home-atelier__card" key={piece.name}>
              <div className="home-atelier__card-image"><img src={piece.image} alt={piece.name} /></div>
              <span>{piece.label}</span>
              <h3>{piece.name}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
