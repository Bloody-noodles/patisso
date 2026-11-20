import { HeroExperience } from "@/components/hero-experience";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="pãtissö home">pãtissö<span>®</span></a>
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#first-course">THE EXPERIENCE</a>
          <a href="#philosophy">OUR PHILOSOPHY</a>
        </nav>
        <a className="header-cta" href="#first-course">
          <span>COME ON IN</span><span aria-hidden="true">↗</span>
        </a>
      </header>

      <HeroExperience />

      <section className="first-course" id="first-course">
        <div className="first-course__meta">
          <span>01 / THE BEGINNING</span>
          <span>GOOD FOOD. NO RUSH.</span>
        </div>
        <div className="first-course__body" id="philosophy">
          <p className="eyebrow"><span className="eyebrow__dot" /> A TABLE WORTH GATHERING AROUND</p>
          <h2>COME FOR THE<br /><em>PASTA.</em> STAY FOR<br />THE FEELING.</h2>
          <p className="first-course__description">A little indulgence. A lot of flavour. And always, always room for one more at the table.</p>
        </div>
        <div className="first-course__stamp" aria-hidden="true">PÃ<br />TIS<br />SÖ</div>
      </section>

      <footer className="site-footer">
        <a className="wordmark wordmark--footer" href="#top">pãtissö<span>®</span></a>
        <p>GOOD THINGS<br /><em>ARE WORTH SHARING.</em></p>
        <span className="site-footer__legal">© 2026 PÃTISSÖ. MADE WITH APPETITE.</span>
      </footer>
    </main>
  );
}
