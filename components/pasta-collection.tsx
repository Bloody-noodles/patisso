"use client";

const pastaDishes = [
  {
    number: "01",
    name: "Roman\nCarbonara",
    style: "THE CLASSIC, REIMAGINED",
    description:
      "Silky egg-and-pecorino sauce, crisp pancetta and a generous snowfall of black pepper. Comfort, with a little Roman attitude.",
    note: "RICH · SILKY · CLASSIC",
    image:
      "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1800&q=88",
    alt: "A close-up of spaghetti pasta served in a bowl",
    layout: "featured",
  },
  {
    number: "02",
    name: "Penne\nArrabbiata",
    style: "A LITTLE FIRE",
    description:
      "Penne wrapped in a bright tomato sauce with garlic, olive oil and a slow-building chilli warmth.",
    note: "TOMATO · GARLIC · HEAT",
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1400&q=88",
    alt: "Fresh pasta with tomato sauce and herbs",
    layout: "portrait",
  },
  {
    number: "03",
    name: "Fettuccine\nAlfredo",
    style: "CREAMY BY NATURE",
    description:
      "Wide ribbons of fettuccine folded through a velvety parmesan cream. Simple ingredients, unapologetic indulgence.",
    note: "CREAMY · PARMESAN · COMFORT",
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1400&q=88",
    alt: "Creamy pasta presented on a ceramic plate",
    layout: "portrait",
  },
  {
    number: "04",
    name: "House\nLasagna",
    style: "LAYER UPON LAYER",
    description:
      "Tender pasta sheets, slow-cooked tomato ragù and a golden, bubbling top. The kind of dish that makes the table go quiet.",
    note: "SLOW-BAKED · HEARTY · GOLDEN",
    image:
      "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=1800&q=88",
    alt: "A baked lasagna dish with a golden cheese topping",
    layout: "wide",
  },
];

function DishImage({
  image,
  alt,
  className = "",
}: {
  image: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`pasta-dish__image ${className}`}
      role="img"
      aria-label={alt}
      style={{ backgroundImage: `url("${image}")` }}
    >
      <span className="pasta-dish__image-grain" aria-hidden="true" />
    </div>
  );
}

export function PastaCollection() {
  const featured = pastaDishes[0];
  const supporting = pastaDishes.slice(1, 3);
  const finalDish = pastaDishes[3];

  return (
    <section className="pasta-collection" id="pasta-collection" aria-labelledby="pasta-title">
      <div className="pasta-collection__topline">
        <span>02 / THE MAIN EVENT</span>
        <span>MADE FOR THE LOVE OF PASTA</span>
      </div>

      <header className="pasta-collection__intro">
        <p className="eyebrow"><span className="eyebrow__dot" /> A LOVE LETTER TO THE LONG NOODLE</p>
        <h2 id="pasta-title">OUR PASTA<br /><em>COLLECTION.</em></h2>
        <div className="pasta-collection__intro-bottom">
          <p>Four good reasons to twirl your fork a little slower. From timeless comfort to a little kick of heat, every plate deserves its moment.</p>
          <span className="pasta-collection__count">01—04 <i /> PASTA, WITH FEELING</span>
        </div>
      </header>

      <article className="pasta-dish pasta-dish--featured">
        <DishImage image={featured.image} alt={featured.alt} className="pasta-dish__image--featured" />
        <div className="pasta-dish__copy pasta-dish__copy--featured">
          <div className="pasta-dish__meta"><span>{featured.number} / 04</span><span>{featured.style}</span></div>
          <p className="pasta-dish__overline">A ROMAN LOVE AFFAIR</p>
          <h3>{featured.name.split("\n").map((line) => <span key={line}>{line}</span>)}</h3>
          <p className="pasta-dish__description">{featured.description}</p>
          <span className="pasta-dish__note">{featured.note}</span>
          <span className="pasta-dish__signature" aria-hidden="true">P.</span>
        </div>
      </article>

      <div className="pasta-collection__pair">
        {supporting.map((dish) => (
          <article className={`pasta-dish pasta-dish--${dish.layout}`} key={dish.number}>
            <div className="pasta-dish__meta"><span>{dish.number} / 04</span><span>{dish.style}</span></div>
            <DishImage image={dish.image} alt={dish.alt} />
            <div className="pasta-dish__copy">
              <h3>{dish.name.split("\n").map((line) => <span key={line}>{line}</span>)}</h3>
              <p className="pasta-dish__description">{dish.description}</p>
              <span className="pasta-dish__note">{dish.note}</span>
            </div>
          </article>
        ))}
      </div>

      <article className="pasta-dish pasta-dish--wide">
        <DishImage image={finalDish.image} alt={finalDish.alt} className="pasta-dish__image--wide" />
        <div className="pasta-dish__copy pasta-dish__copy--wide">
          <div className="pasta-dish__meta"><span>{finalDish.number} / 04</span><span>{finalDish.style}</span></div>
          <p className="pasta-dish__overline">SUNDAY LUNCH ENERGY</p>
          <h3>{finalDish.name.split("\n").map((line) => <span key={line}>{line}</span>)}</h3>
          <p className="pasta-dish__description">{finalDish.description}</p>
          <span className="pasta-dish__note">{finalDish.note}</span>
        </div>
      </article>

      <div className="pasta-collection__outro">
        <span>AND THAT'S JUST THE BEGINNING.</span>
        <span aria-hidden="true">✳</span>
        <span>GOOD THINGS TAKE A LITTLE TWIRLING.</span>
      </div>
    </section>
  );
}
