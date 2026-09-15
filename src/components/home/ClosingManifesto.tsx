import Link from "next/link";

export function ClosingManifesto() {
  return (
    <section className="home-manifesto" aria-labelledby="manifesto-title">
      <p className="eyebrow">FALCON / 2026</p>
      <h2 id="manifesto-title">Dress the life you are becoming.</h2>
      <p>Intelligent fashion for a more personal future.</p>
      <div className="home-manifesto__actions">
        <Link className="button button--primary" href="/auth/register">Begin your profile</Link>
        <Link className="button button--secondary" href="/">Return to the collection</Link>
      </div>
    </section>
  );
}
