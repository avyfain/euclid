"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EuclidReader } from "./EuclidReader";
import type { EuclidBook } from "./data/types";

const FIRST_PROPOSITION_HASH = "#book-1-prop-1";

function EuclidCover({ onEnter }: { onEnter: () => void }) {
  return (
    <main className="cover-page">
      <header className="cover-header">
        <Link className="cover-wordmark" href="/" aria-label="Euclid's Elements home">
          <span className="brand-mark" aria-hidden="true">E</span>
          <span>Euclid&apos;s Elements</span>
        </Link>
        <span className="cover-edition">Thomas L. Heath&apos;s translation</span>
      </header>

      <section className="cover-hero" aria-labelledby="cover-title">
        <div className="cover-introduction">
          <p className="cover-declaration">Thirteen books. One long argument.</p>
          <h1 id="cover-title">See how geometry builds up.</h1>
          <p className="cover-summary">
            A close-reading edition of the <em>Elements</em>, pairing Heath&apos;s
            translation with figures that reveal each construction one step at a time.
          </p>
          <a
            className="cover-enter"
            href={FIRST_PROPOSITION_HASH}
            onClick={(event) => {
              event.preventDefault();
              onEnter();
            }}
          >
            <span>Begin with Proposition I.1</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <figure className="cover-figure">
          <svg
            className="cover-geometry"
            viewBox="0 0 640 560"
            role="img"
            aria-labelledby="cover-figure-title cover-figure-description"
          >
            <title id="cover-figure-title">Construction of an equilateral triangle</title>
            <desc id="cover-figure-description">
              Two intersecting circles centered on the endpoints of a line determine
              the third point of an equilateral triangle.
            </desc>
            <circle className="cover-circle cover-circle-a" cx="206" cy="365" r="228" />
            <circle className="cover-circle cover-circle-b" cx="434" cy="365" r="228" />
            <path className="cover-triangle" d="M206 365 L320 168 L434 365 Z" />
            <path className="cover-base" d="M206 365 L434 365" />
            <g className="cover-point">
              <circle cx="206" cy="365" r="5" />
              <text x="181" y="397">A</text>
            </g>
            <g className="cover-point">
              <circle cx="434" cy="365" r="5" />
              <text x="449" y="397">B</text>
            </g>
            <g className="cover-point cover-point-c">
              <circle cx="320" cy="168" r="5" />
              <text x="311" y="140">C</text>
            </g>
          </svg>
          <figcaption>
            <span>Book I, Proposition 1</span>
            <span>On a given finite straight line, construct an equilateral triangle.</span>
          </figcaption>
        </figure>
      </section>

      <footer className="cover-footer">
        <span>465 propositions</span>
        <span>Searchable across all 13 books</span>
        <span>
          Built in SF by{" "}
          <a href="https://faingezicht.com/" target="_blank" rel="noreferrer">
            Avy Faingezicht
          </a>
        </span>
      </footer>
    </main>
  );
}

export function EuclidExperience({ books }: { books: EuclidBook[] }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const syncFromLocation = () => setEntered(Boolean(window.location.hash));
    syncFromLocation();
    window.addEventListener("hashchange", syncFromLocation);
    window.addEventListener("popstate", syncFromLocation);
    return () => {
      window.removeEventListener("hashchange", syncFromLocation);
      window.removeEventListener("popstate", syncFromLocation);
    };
  }, []);

  useEffect(() => {
    if (!entered) {
      document.title = "Euclid's Elements";
    }
  }, [entered]);

  if (entered) {
    return (
      <EuclidReader
        books={books}
        onHome={() => {
          window.history.pushState(null, "", "/");
          setEntered(false);
        }}
      />
    );
  }

  return (
    <EuclidCover
      onEnter={() => {
        window.history.pushState(null, "", FIRST_PROPOSITION_HASH);
        setEntered(true);
      }}
    />
  );
}
