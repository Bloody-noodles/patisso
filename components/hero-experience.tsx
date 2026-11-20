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

      <div className="hero__visual" aria-label="Slow-motion pasta being twirled and lifted on a fork">
        <video
          className="hero__video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1600&q=85"
          aria-hidden="true"
        >
          <source src="https://videos.pexels.com/video-files/10059770/10059770-uhd_2160_4096_25fps.mp4" type="video/mp4" />
        </video>
        <div className="hero__photo-shade" />
        <div className="hero__visual-top">
          <span>FRESHLY MADE</span>
          <span>EST. WITH APPETITE</span>
        </div>
        <div className="hero__visual-bottom">
          <span className="hero__index">01 <i /> 06</span>
          <span className="hero__visual-title">THE PASTA<br />COLLECTION</span>
        </div>
        <span className="hero__vertical-note">MADE TO BE REMEMBERED</span>
      </div>
      <div className="hero__bottom-rule" aria-hidden="true"><span /></div>
    </section>
  );
}
