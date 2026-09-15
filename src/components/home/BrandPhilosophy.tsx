export function BrandPhilosophy() {
  return (
    <section className="container home-editorial" aria-labelledby="philosophy-title">
      <div className="home-editorial__visual">
        <img
          src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1200&q=85"
          alt="Architectural black tailoring in soft studio light"
        />
        <span className="home-editorial__tag">02 / Philosophy</span>
      </div>
      <div className="home-editorial__content">
        <p className="eyebrow">The FALCON point of view</p>
        <h2 id="philosophy-title">Clothing should adapt to the individual — not the other way around.</h2>
        <p className="home-editorial__lead">
          We design an intelligent wardrobe around your life: precise enough to feel personal, open enough to keep evolving.
        </p>
        <div className="home-editorial__pillars">
          <div className="home-editorial__pillar">
            <strong>Considered form</strong>
            <p>Proportion, material and movement in quiet balance.</p>
          </div>
          <div className="home-editorial__pillar">
            <strong>Personal intelligence</strong>
            <p>Recommendations shaped by your taste, context and rhythm.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
