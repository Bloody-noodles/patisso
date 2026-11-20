const menuNotes = [
  { number: "01", title: "Pasta, with intention.", detail: "The heart of our table." },
  { number: "02", title: "Comfort, reimagined.", detail: "Familiar favourites, beautifully done." },
  { number: "03", title: "A little something sweet.", detail: "Save room. Always." },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="pãtissö home">pãtissö<span>®</span></a>
        <nav aria-label="Main navigation">
          <a href="#menu">THE MENU</a>
          <a href="#story">OUR STORY</a>
          <a href="#contact">FIND US</a>
        </nav>
        <a className="header-cta" href="#menu">ORDER SOMETHING <span>↗</span></a>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-grain" />
        <div className="hero-copy">
          <p className="eyebrow"><span /> MADE FOR THE LOVE OF GOOD FOOD</p>
          <h1 id="hero-title">A LITTLE<br />MORE THAN<br /><em>PASTA.</em></h1>
          <div className="hero-bottom">
            <p>Good things take time.<br />Great pasta takes a little more.</p>
            <a href="#menu" className="round-link" aria-label="Explore the menu">↓</a>
          </div>
        </div>
        <div className="hero-image" role="img" aria-label="A close-up of freshly prepared pasta">
          <div className="hero-image-label"><span>01 / 06</span><span>THE PASTA COLLECTION</span></div>
        </div>
        <div className="hero-side-note">FRESHLY MADE. ALWAYS WORTH IT.</div>
      </section>

      <section className="intro-band" id="menu">
        <p className="eyebrow">A TABLE FULL OF GOOD IDEAS</p>
        <h2>OUR KIND OF<br /><em>COMFORT FOOD.</em></h2>
        <p className="intro-description">A menu made for long lunches, late cravings, familiar favourites and the joy of trying something new.</p>
      </section>

      <section className="menu-preview" aria-label="What you will find at pãtissö">
        {menuNotes.map((item) => (
          <article className="menu-note" key={item.number}>
            <span>{item.number}</span>
            <div><h3>{item.title}</h3><p>{item.detail}</p></div>
            <span className="note-arrow">↗</span>
          </article>
        ))}
      </section>

      <section className="story-section" id="story">
        <p className="eyebrow">A GOOD PLACE TO GATHER</p>
        <h2>FOOD IS BETTER<br />WHEN IT <em>BRINGS US</em><br /><em>TOGETHER.</em></h2>
        <p>We believe the best meals are never just about what is on the plate. They are about the people around it, the stories shared and the little moments that stay with you.</p>
      </section>

      <footer id="contact">
        <div className="footer-top"><a className="wordmark" href="#top">pãtissö<span>®</span></a><p>COME HUNGRY.<br /><em>LEAVE HAPPY.</em></p></div>
        <div className="footer-bottom"><span>© 2026 PÃTISSÖ. MADE WITH APPETITE.</span><a href="mailto:hello@patisso.example">SAY HELLO ↗</a><a href="#top">BACK TO TOP ↑</a></div>
      </footer>
    </main>
  );
}