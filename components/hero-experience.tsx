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

      <div className="hero__visual" aria-label="A cinematic close-up of pasta, prepared to be shared">
        <div className="hero__photo" />
        <div className="hero__photo-shade" />
        <div className="hero__visual-top">
          <span>FRESHLY MADE</span>
          <span>EST. WITH APPETITE</span>
        </div>

        <svg className="pasta-gesture" viewBox="0 0 560 720" role="img" aria-label="Illustrated pasta strands curling from a fork">
          <defs>
            <linearGradient id="noodleGold" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#fff0c9" />
              <stop offset="48%" stopColor="#e6bd76" />
              <stop offset="100%" stopColor="#fff0c9" />
            </linearGradient>
          </defs>
          <g className="pasta-gesture__fork">
            <path d="M284 42 L284 202 M267 42 L267 125 Q267 145 284 145 Q301 145 301 125 L301 42 M250 42 L250 112 Q250 145 284 145 Q318 145 318 112 L318 42" />
            <path d="M284 202 L284 284" />
          </g>
          <g className="pasta-gesture__strands">
            <path className="strand strand--one" d="M284 190 C210 205 190 278 238 319 C287 360 360 318 346 265 C333 217 262 227 244 274 C222 331 290 388 355 364 C425 337 397 262 347 255" />
            <path className="strand strand--two" d="M284 194 C335 225 390 255 378 312 C367 365 299 384 257 353 C210 319 232 255 279 251 C326 247 347 304 318 332 C287 362 240 337 244 300" />
            <path className="strand strand--three" d="M278 198 C183 243 180 351 258 391 C337 432 423 374 401 303 C385 252 326 232 287 263 C250 294 274 344 311 350" />
          </g>
          <ellipse className="pasta-gesture__plate" cx="284" cy="572" rx="205" ry="46" />
          <ellipse className="pasta-gesture__plate-inner" cx="284" cy="572" rx="166" ry="29" />
        </svg>

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
