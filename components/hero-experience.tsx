"use client";

import { useEffect, useState } from "react";

export function HeroExperience() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <section className={`hero hero--${ready ? "ready" : "loading"}`} id="top" aria-labelledby="hero-title">
      <div className="hero__texture" aria-hidden="true" />
      <div className="hero__copy">
        <p className="eyebrow hero__eyebrow"><span className="eyebrow__dot" /> AN AFFAIR WITH GOOD FOOD</p>
        <div className="hero__headline-wrap">
          <p className="hero__kicker">NOT JUST A MEAL. A MOOD.</p>
          <h1 id="hero-title">A LITTLE<br />MORE THAN<br /><em>PASTA.</em></h1>
        </div>
        <div className="hero__bottom">
          <p className="hero__manifesto">For the slow lunches,<br />the long talks, the one-more-bite.</p>
          <a className="hero__discover" href="#first-course">
            <span>DISCOVER PÃTISSÖ</span>
            <span className="hero__discover-icon" aria-hidden="true">↓</span>
          </a>
        </div>
      </div>

      <div className="hero__visual" aria-label="Animated close-up of pasta being twirled and lifted on a fork">
        <img
          className="hero__video"
          src="/pasta-hero.webp"
          alt="Sauce-coated pasta strands winding around a fork and lifting above a plate"
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero__photo-shade" aria-hidden="true" />
        <div className="hero__visual-top">
          <span>FRESHLY MADE</span>
          <span>EST. WITH APPETITE</span>
        </div>
        <div className="hero__visual-bottom">
          <span className="hero__index">01 <i /> 06</span>
          <span className="hero__visual-title">THE PASTA<br />COLLECTION</span>
        </div>
      </div>
      <div className="hero__bottom-rule" aria-hidden="true"><span /></div>
    </section>
  );
}
