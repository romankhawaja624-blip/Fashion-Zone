import Link from "next/link";

const audiences = [
  {
    label: "Women",
    note: "Fluid silhouettes",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    label: "Men",
    note: "Architectural tailoring",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85",
  },
  {
    label: "Young adults",
    note: "New perspectives",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    label: "Kids",
    note: "Future classics",
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1000&q=85",
  },
  {
    label: "Adults",
    note: "Considered essentials",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85",
  },
] as const;

export function AudienceGateway() {
  return (
    <section className="home-section home-audience" aria-labelledby="audience-title">
      <div className="container">
        <div className="home-section__heading">
          <p className="eyebrow">Find your expression</p>
          <h2 id="audience-title">Made for every version of you.</h2>
          <p>Curated perspectives for the way you move through the world.</p>
        </div>

        <div className="home-audience__grid">
          {audiences.map((audience, index) => (
            <Link key={audience.label} href="/shop" className={`home-audience__card home-audience__card--${index + 1}`}>
              <img src={audience.image} alt={`${audience.label} collection`} />
              <span className="home-audience__index">0{index + 1}</span>
              <span className="home-audience__copy">
                <small>{audience.note}</small>
                <strong>{audience.label}</strong>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
