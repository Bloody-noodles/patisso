"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";

const dishes = [
  { name: "Roman Carbonara", category: "Pasta", description: "Silky parmesan, crisp pancetta and a little black-pepper attitude.", image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=900&q=88", tag: "THE CLASSIC" },
  { name: "Penne Arrabbiata", category: "Pasta", description: "Tomato, garlic, olive oil and a slow-building chilli warmth.", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=88", tag: "A LITTLE FIRE" },
  { name: "Fettuccine Alfredo", category: "Pasta", description: "Wide ribbons folded through a velvety parmesan cream.", image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=88", tag: "CREAMY COMFORT" },
  { name: "House Lasagna", category: "Pasta", description: "Tender layers, slow-cooked ragù and a golden top.", image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=900&q=88", tag: "LAYER BY LAYER" },
  { name: "Basil Pesto Fusilli", category: "Pasta", description: "Corkscrew pasta tossed in fragrant basil pesto and parmesan.", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=88", tag: "FRESH & FRAGRANT" },
  { name: "Creamy Mushroom Tagliatelle", category: "Pasta", description: "Silky ribbons with golden mushrooms, herbs and parmesan.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=88", tag: "A RICHER RIBBON" },
  { name: "Tomato Basil Spaghetti", category: "Pasta", description: "A bright tomato sauce, fresh basil and a generous twirl.", image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0e?auto=format&fit=crop&w=900&q=88", tag: "SIMPLE. BEAUTIFUL." },
  { name: "Creamy Garlic Penne", category: "Pasta", description: "Penne in a mellow garlic cream with a parmesan finish.", image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=88", tag: "COMFORT IN EVERY BITE" },
  { name: "Cheeseburger", category: "Savoury", description: "A juicy, satisfying classic with all the right things.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=88", tag: "THE CROWD-PLEASER" },
  { name: "Golden Fries", category: "Savoury", description: "Crisp edges, fluffy centres, made for sharing.", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=88", tag: "GOLDEN & CRISP" },
  { name: "Macaroni & Cheese", category: "Savoury", description: "Comforting macaroni tucked into a rich, creamy cheese sauce.", image: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=900&q=88", tag: "CHEESY COMFORT" },
  { name: "Garden Salad", category: "Savoury", description: "Fresh greens, colour and a bright, lively finish.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=88", tag: "FRESH THINKING" },
  { name: "Chocolate Cake", category: "Bakery", description: "A soft, rich slice for the sweet-toothed.", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=88", tag: "SAVE ROOM" },
  { name: "Doughnuts", category: "Bakery", description: "Little rings of happiness, finished with a sweet touch.", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=88", tag: "SOMETHING SWEET" },
  { name: "Golden Meat Pie", category: "Bakery", description: "A flaky, golden pastry with a savoury, comforting centre.", image: "https://images.unsplash.com/photo-1608198093002-ad4e005484df?auto=format&fit=crop&w=900&q=88", tag: "BAKED WITH LOVE" },
  { name: "Soft Buns", category: "Bakery", description: "Soft, pillowy bakery favourites for any time of day.", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=88", tag: "FRESH FROM THE OVEN" },
];

const categories = ["All", "Pasta", "Savoury", "Bakery"];

export function ReferenceHome() {
  const [category, setCategory] = useState("All");
  const [offset, setOffset] = useState(0);
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  const filtered = useMemo(
    () => dishes.filter((dish) => category === "All" || dish.category === category),
    [category],
  );
  const visible = useMemo(() => {
    if (filtered.length <= 3) return filtered;
    return [0, 1, 2].map((step) => filtered[(offset + step) % filtered.length]);
  }, [filtered, offset]);

  function changeCategory(next: string) {
    setCategory(next);
    setOffset(0);
  }

  function submitNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setNewsletterMessage("Thanks — the pitãssö mailing list is coming soon.");
    setEmail("");
  }

  return (
    <main className="reference-site" id="top">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="pitãssö home">pitãssö<span>®</span></a>
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#menu">Our menu</a>
          <a href="#story">Our story</a>
          <a href="#newsletter">Stay in the loop</a>
        </nav>
        <a className="header-cta" href="#menu">Explore menu <span aria-hidden="true">↗</span></a>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> A LITTLE TASTE OF THE GOOD LIFE</p>
          <h1 id="hero-title">Take a taste.<br />Come join us.</h1>
          <p className="hero-description">Life is so endlessly delicious. Find your favourite forkful, make a little mess, and stay for one more bite.</p>
          <a className="primary-button" href="#menu">Explore the menu <span aria-hidden="true">↗</span></a>
          <div className="hero-footnote"><span>PASTA FIRST. ALWAYS ROOM FOR MORE.</span><span>01 / 04</span></div>
        </div>
        <div className="hero-food">
          <div className="hero-food-image" role="img" aria-label="A generous bowl of pasta with fresh herbs" />
          <span className="food-caption food-caption--top">FRESHLY MADE<br />WITH APPETITE</span>
          <span className="food-caption food-caption--bottom">THE PASTA<br />IS CALLING</span>
        </div>
        <span className="floating-garnish garnish-tomato" aria-hidden="true">✳</span>
        <span className="floating-garnish garnish-leaf" aria-hidden="true">✿</span>
        <span className="floating-garnish garnish-pepper" aria-hidden="true">✳</span>
        <div className="hero-scroll">SCROLL TO GET A TASTE <span>↓</span></div>
      </section>

      <section className="pasta-gallery" aria-label="A closer look at our pasta">
        <div className="pasta-gallery-heading">
          <p className="eyebrow"><span className="eyebrow-dot" /> OUR MAIN CHARACTER</p>
          <h2>Made for the <em>pasta</em> people.</h2>
          <p>Eight pasta favourites. Countless reasons to twirl.</p>
        </div>
        <div className="pasta-gallery-grid">
          <figure className="pasta-gallery-card pasta-gallery-card--wide">
            <img src="https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1100&q=90" alt="Fresh pasta served with herbs" loading="lazy" />
            <figcaption>THE PERFECT TWIRL</figcaption>
          </figure>
          <figure className="pasta-gallery-card">
            <img src="https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=90" alt="Penne pasta with tomato and herbs" loading="lazy" />
            <figcaption>A LITTLE FIRE</figcaption>
          </figure>
          <figure className="pasta-gallery-card">
            <img src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=90" alt="Creamy pasta in a bowl" loading="lazy" />
            <figcaption>CREAMY COMFORT</figcaption>
          </figure>
        </div>
      </section>

      <section className="menu-section" id="menu" aria-labelledby="menu-title">
        <div className="section-decor section-decor--left" aria-hidden="true">✳</div>
        <div className="section-decor section-decor--right" aria-hidden="true">✿</div>
        <div className="section-heading">
          <p className="eyebrow"><span className="eyebrow-dot" /> GOOD THINGS ARE ON THE WAY</p>
          <h2 id="menu-title">What&apos;s on our <em>plate</em></h2>
          <p className="section-subtitle">A little something for every appetite.</p>
          <div className="category-tabs" role="group" aria-label="Filter menu">
            {categories.map((item) => (
              <button key={item} className={category === item ? "category-tab is-active" : "category-tab"} onClick={() => changeCategory(item)}>{item}</button>
            ))}
          </div>
        </div>
        <div className="dish-carousel">
          <button className="carousel-arrow carousel-arrow--prev" onClick={() => setOffset((value) => (value - 1 + filtered.length) % filtered.length)} aria-label="Previous dishes">←</button>
          <div className="dish-grid">
            {visible.map((dish, index) => (
              <article className="dish-card" key={dish.name}>
                <div className="dish-image-wrap">
                  <img src={dish.image} alt={dish.name} className="dish-image" loading="lazy" />
                  <span className="dish-index">0{index + 1}</span>
                </div>
                <p className="dish-tag">{dish.tag}</p>
                <h3>{dish.name}</h3>
                <p className="dish-description">{dish.description}</p>
              </article>
            ))}
          </div>
          <button className="carousel-arrow carousel-arrow--next" onClick={() => setOffset((value) => (value + 1) % filtered.length)} aria-label="Next dishes">→</button>
        </div>
        <div className="carousel-progress"><span>{String(offset + 1).padStart(2, "0")}</span><i><b style={{ width: `${((offset + 1) / Math.max(filtered.length, 1)) * 100}%` }} /></i><span>{String(filtered.length).padStart(2, "0")}</span></div>
        <p className="menu-footnote">PASTA TAKES THE LEAD. THE REST JUST MAKES THE TABLE BETTER.</p>
      </section>

      <section className="story-section" id="story">
        <div className="story-image">
          <img src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=90" alt="A plate of creamy pasta finished with fresh herbs" loading="lazy" />
          <span className="story-image-note">MADE TO BE<br />SHARED</span>
        </div>
        <div className="story-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> THE PITÃSSÖ FEELING</p>
          <h2>Let&apos;s see<br />what <em>good</em><br />food can do.</h2>
          <p className="story-quote">“The best moments have a way of happening around the table.”</p>
          <p className="story-description">A plate passed across the table. One more forkful. A conversation that runs a little longer than planned. That&apos;s the kind of good time we make room for.</p>
          <a className="text-link" href="#newsletter">A seat is waiting <span aria-hidden="true">↗</span></a>
          <div className="story-markers" aria-hidden="true"><span>✳</span><span>✿</span><span>✳</span></div>
        </div>
      </section>

      <section className="newsletter-section" id="newsletter">
        <span className="newsletter-decor newsletter-decor--one" aria-hidden="true">✿</span>
        <span className="newsletter-decor newsletter-decor--two" aria-hidden="true">✳</span>
        <span className="newsletter-decor newsletter-decor--three" aria-hidden="true">✦</span>
        <p className="eyebrow"><span className="eyebrow-dot" /> A LITTLE NOTE FROM US</p>
        <h2>Easy recipes will<br />send to your inbox</h2>
        <p className="newsletter-copy">Good food, fresh updates and a little inspiration. Straight to you.</p>
        <form className="newsletter-form" onSubmit={submitNewsletter}>
          <label className="sr-only" htmlFor="newsletter-email">Your email address</label>
          <input id="newsletter-email" type="email" placeholder="Your email address" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <button type="submit">Count me in <span aria-hidden="true">↗</span></button>
        </form>
        <p className="newsletter-message" aria-live="polite">{newsletterMessage}</p>
      </section>

      <footer className="site-footer">
        <div className="footer-brand">
          <a className="wordmark wordmark--footer" href="#top">pitãssö<span>®</span></a>
          <p>GOOD FOOD.<br /><em>GOOD MOOD.</em></p>
        </div>
        <div className="footer-column"><h3>Explore</h3><a href="#menu">The menu</a><a href="#story">Our story</a><a href="#newsletter">Newsletter</a></div>
        <div className="footer-column"><h3>Find us</h3><span>Made with appetite</span><span>Made for sharing</span></div>
        <div className="footer-column"><h3>Follow along</h3><a href="#top">Instagram ↗</a><a href="#top">TikTok ↗</a></div>
        <div className="footer-bottom"><span>© 2026 PITÃSSÖ. ALL RIGHTS RESERVED.</span><a href="#top">BACK TO TOP ↑</a></div>
      </footer>
    </main>
  );
}
