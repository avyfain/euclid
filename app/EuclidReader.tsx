"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BOOK_CATALOG } from "./data/catalog";
import { EDITORIAL_NOTES } from "./data/editorial-notes";
import { PropositionFigure } from "./PropositionFigure";
import type { EuclidBook, EuclidItem, EuclidSection, SourceNote } from "./data/types";

type IndexedItem = {
  item: EuclidItem;
  section: EuclidSection;
};

const COLLAPSED_FOUNDATION_SECTION_IDS = new Set([
  "definitions",
  "postulates",
  "common-notions",
]);

function collapseFoundationSection(section: EuclidSection): EuclidSection {
  if (!COLLAPSED_FOUNDATION_SECTION_IDS.has(section.id)) {
    return section;
  }

  const item: EuclidItem = {
    id: section.id,
    number: "",
    sourceHeading: section.label,
    label: section.label,
    headline: section.label,
    parts: section.items.map((sourceItem) => ({
      id: sourceItem.id,
      kind: "foundation-entry",
      label: sourceItem.label,
      blocks: sourceItem.parts.flatMap((part) => part.blocks),
    })),
    notes: section.items.flatMap((sourceItem) => sourceItem.notes),
    searchText: section.items.map((sourceItem) => sourceItem.searchText).join(" "),
    sourceUrl: section.items[0]?.sourceUrl ?? "",
  };

  return { ...section, items: [item] };
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return <span aria-hidden="true">{direction === "left" ? "←" : "→"}</span>;
}

function NotesList({ notes, editorial = false }: { notes: SourceNote[]; editorial?: boolean }) {
  return (
    <div className="notes-list">
      {notes.map((note) => (
        <section
          className={`note-card${editorial ? " is-editorial" : ""}`}
          id={note.id}
          key={note.id}
        >
          <h3>{note.label}</h3>
          {note.blocks.map((block, index) => (
            <div
              className="note-copy"
              dangerouslySetInnerHTML={{ __html: block }}
              key={index}
            />
          ))}
        </section>
      ))}
    </div>
  );
}

function EntryPagination({
  previous,
  next,
  position,
  onSelect,
}: {
  previous?: IndexedItem;
  next?: IndexedItem;
  position: "top" | "bottom";
  onSelect: (id: string) => void;
}) {
  return (
    <nav
      className={`entry-pagination entry-pagination-${position}`}
      aria-label="Previous and next entries"
    >
      {previous ? (
        <button
          type="button"
          aria-label={`Previous: ${previous.item.label}`}
          onClick={() => onSelect(previous.item.id)}
        >
          <Arrow direction="left" />
          <span>
            <small>Previous</small>
            <strong>{previous.item.label}</strong>
          </span>
        </button>
      ) : (
        <span className="pagination-spacer" aria-hidden="true" />
      )}
      {next ? (
        <button
          className="next"
          type="button"
          aria-label={`Next: ${next.item.label}`}
          onClick={() => onSelect(next.item.id)}
        >
          <span>
            <small>Next</small>
            <strong>{next.item.label}</strong>
          </span>
          <Arrow direction="right" />
        </button>
      ) : (
        <span className="pagination-spacer" aria-hidden="true" />
      )}
    </nav>
  );
}

export function EuclidReader({ book }: { book: EuclidBook }) {
  const readerSections = useMemo(
    () => book.sections.map(collapseFoundationSection),
    [book.sections],
  );
  const allItems = useMemo<IndexedItem[]>(
    () =>
      readerSections.flatMap((section) =>
        section.items.map((item) => ({ item, section })),
      ),
    [readerSections],
  );
  const searchIndex = useMemo<IndexedItem[]>(
    () =>
      book.sections.flatMap((section) =>
        section.items.map((item) => ({ item, section })),
      ),
    [book.sections],
  );
  const targetToItemId = useMemo(() => {
    const targets = new Map<string, string>();
    for (const section of book.sections) {
      const collapsed = COLLAPSED_FOUNDATION_SECTION_IDS.has(section.id);
      if (collapsed) {
        targets.set(section.id, section.id);
      }
      for (const item of section.items) {
        targets.set(item.id, collapsed ? section.id : item.id);
      }
    }
    return targets;
  }, [book.sections]);
  const initialItemId = allItems[0]?.item.id ?? "";
  const [activeItemId, setActiveItemId] = useState(initialItemId);
  const [anchorTarget, setAnchorTarget] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const articleRef = useRef<HTMLElement>(null);

  const activeIndex = Math.max(
    0,
    allItems.findIndex(({ item }) => item.id === activeItemId),
  );
  const active = allItems[activeIndex] ?? allItems[0];

  useEffect(() => {
    const syncFromLocation = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const resolvedItemId = targetToItemId.get(id);
      if (resolvedItemId) {
        setActiveItemId(resolvedItemId);
        setAnchorTarget(id === resolvedItemId ? null : id);
      }
    };

    syncFromLocation();
    window.addEventListener("hashchange", syncFromLocation);
    window.addEventListener("popstate", syncFromLocation);
    return () => {
      window.removeEventListener("hashchange", syncFromLocation);
      window.removeEventListener("popstate", syncFromLocation);
    };
  }, [targetToItemId]);

  useEffect(() => {
    if (!anchorTarget) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(anchorTarget)?.scrollIntoView({ block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeItemId, anchorTarget]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if ((event.key === "/" && !isTyping) || (event.key === "k" && (event.metaKey || event.ctrlKey))) {
        event.preventDefault();
        setNavOpen(true);
        window.setTimeout(() => searchRef.current?.focus(), 0);
      }
      if (event.key === "Escape" && query) {
        setQuery("");
        searchRef.current?.blur();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [query]);

  const normalizedQuery = query.trim().toLowerCase();
  const searchResults = useMemo(
    () =>
      normalizedQuery.length < 2
        ? []
        : searchIndex
            .filter(({ item }) => item.searchText.toLowerCase().includes(normalizedQuery))
            .slice(0, 24),
    [searchIndex, normalizedQuery],
  );

  if (!active) {
    return null;
  }

  const { item: activeItem, section: activeSection } = active;
  const editorialNotes = EDITORIAL_NOTES[activeItem.id] ?? [];
  const showingEditorialNotes = editorialNotes.length > 0;
  const primaryNotes = showingEditorialNotes ? editorialNotes : activeItem.notes;
  const previous = allItems[activeIndex - 1];
  const next = allItems[activeIndex + 1];
  const visibleParts =
    activeSection.id === "propositions"
      ? activeItem.parts.filter((part) => part.kind !== "enunc")
      : activeItem.parts;
  const propositionHeadlineHtml = activeItem.parts
    .find((part) => part.kind === "enunc")
    ?.blocks[0]?.replace(/^<p>/, "")
    .replace(/<\/p>$/, "")
    .replace(
      '<span class="source-line-number" aria-hidden="true" data-line="1"></span>',
      "",
    );

  const selectItem = (id: string, push = true) => {
    const resolvedItemId = targetToItemId.get(id);
    if (!resolvedItemId) return;
    setActiveItemId(resolvedItemId);
    setAnchorTarget(id === resolvedItemId ? null : id);
    setQuery("");
    setNavOpen(false);
    if (push) {
      window.history.pushState(null, "", `#${id}`);
    }
    if (id === resolvedItemId) {
      articleRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const openSearch = () => {
    setNavOpen(true);
    window.setTimeout(() => searchRef.current?.focus(), 0);
  };

  return (
    <div className="reader-shell">
      <header className="topbar">
        <button
          className="nav-toggle"
          type="button"
          aria-label="Open table of contents"
          aria-expanded={navOpen}
          onClick={() => setNavOpen((value) => !value)}
        >
          <span aria-hidden="true">☰</span>
        </button>

        <a className="brand" href="#definitions" onClick={() => selectItem("definitions")}>
          <span className="brand-mark" aria-hidden="true">E</span>
          <span>
            <strong>Euclid&apos;s Elements</strong>
            <small>Heath&apos;s translation</small>
          </span>
        </a>

        <nav className="book-shelf" aria-label="Books of the Elements">
          <span className="shelf-label">Books</span>
          <div className="book-list">
            {BOOK_CATALOG.map((entry) =>
              entry.available ? (
                <button
                  className="book-button is-active"
                  type="button"
                  aria-current="page"
                  key={entry.number}
                  title={`${entry.title}, available now`}
                >
                  {entry.roman}
                </button>
              ) : (
                <button
                  className="book-button"
                  type="button"
                  disabled
                  key={entry.number}
                  title={`${entry.title}, forthcoming`}
                  aria-label={`${entry.title}, forthcoming`}
                >
                  {entry.roman}
                </button>
              ),
            )}
          </div>
        </nav>

        <button className="search-trigger" type="button" onClick={openSearch}>
          <span aria-hidden="true">⌕</span>
          <span>Search</span>
          <kbd>⌘ K</kbd>
        </button>
      </header>

      <div className="reader-workspace">
        {navOpen && (
          <button
            className="nav-scrim"
            aria-label="Close table of contents"
            type="button"
            onClick={() => setNavOpen(false)}
          />
        )}

        <aside className={`contents-panel${navOpen ? " is-open" : ""}`} aria-label="Book I contents">
          <div className="contents-heading">
            <div>
              <span className="eyebrow">Now reading</span>
              <h2>{book.title}</h2>
            </div>
          </div>

          <nav className="mobile-book-shelf" aria-label="Books of the Elements">
            <span className="eyebrow">Books</span>
            <div>
              {BOOK_CATALOG.map((entry) => (
                <button
                  className={entry.available ? "is-active" : ""}
                  type="button"
                  disabled={!entry.available}
                  aria-current={entry.available ? "page" : undefined}
                  aria-label={entry.available ? entry.title : `${entry.title}, forthcoming`}
                  key={entry.number}
                >
                  {entry.roman}
                </button>
              ))}
            </div>
          </nav>

          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <span className="sr-only">Search Book I</span>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Book I"
            />
            <kbd>/</kbd>
          </label>

          {normalizedQuery.length >= 2 ? (
            <div className="search-results" aria-live="polite">
              <div className="results-meta">
                {searchResults.length ? `${searchResults.length} results` : "No results"}
              </div>
              {searchResults.map(({ item, section }) => (
                <button
                  className="search-result"
                  key={item.id}
                  type="button"
                  onClick={() => selectItem(item.id)}
                >
                  <span>{section.abbreviation} {item.number}</span>
                  <strong>{item.headline}</strong>
                </button>
              ))}
            </div>
          ) : (
            <>
              <nav className="section-list" aria-label="Book I sections">
                {readerSections.map((section) => (
                  <button
                    className={section.id === activeSection.id ? "is-active" : ""}
                    type="button"
                    key={section.id}
                    onClick={() => selectItem(section.items[0].id)}
                  >
                    <span>{section.label}</span>
                  </button>
                ))}
              </nav>

              {activeSection.id === "propositions" && (
                <div className="item-index">
                  <div className="index-label">
                    <span>{activeSection.label}</span>
                  </div>
                  <div className="number-grid">
                    {activeSection.items.map((item) => (
                      <button
                        className={item.id === activeItem.id ? "is-active" : ""}
                        type="button"
                        key={item.id}
                        aria-label={`Proposition ${item.number}: ${item.headline}`}
                        aria-current={item.id === activeItem.id ? "page" : undefined}
                        onClick={() => selectItem(item.id)}
                      >
                        {item.number}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <details className="source-note">
            <summary>
              <span>About this text</span>
              <span aria-hidden="true">+</span>
            </summary>
            <div className="source-note-copy">
              <strong>{book.edition}</strong>
              <p>
                Perseus, a digital library at Tufts University, hosts the original
                digitized version of Heath&apos;s text used by this reader.
              </p>
              <p>
                <a href={book.source.textUrl} target="_blank" rel="noreferrer">
                  Read Heath&apos;s translation at Perseus
                </a>
                .
              </p>
              <p>{book.source.credit}</p>
              <p>{book.source.citation}</p>
              <p>
                Reproduced under the{" "}
                <a href={book.source.licenseUrl} target="_blank" rel="noreferrer">
                  {book.source.license}
                </a>
                .
              </p>
              <p>{book.source.availabilityNotice}</p>
            </div>
          </details>

          <details className="source-note">
            <summary>
              <span>About this project</span>
              <span aria-hidden="true">+</span>
            </summary>
            <div className="source-note-copy">
              <p>
                I was inspired to build this reader while taking the{" "}
                <a
                  href="https://catherineproject.org/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Catherine Project
                </a>
                &apos;s <em>Ancient Greek Writings on Knowledge and Mathematics</em>
                course. I&apos;m a software engineer in San Francisco interested in
                understanding things deeply. You can find more of my work at{" "}
                <a href="https://www.faingezicht.com/" target="_blank" rel="noreferrer">
                  faingezicht.com
                </a>
                .
              </p>
              <p>
                This project was built using Codex on Sol 5.6. Everything is open
                source, and suggestions are welcome on the{" "}
                <a
                  href="https://github.com/avyfain/euclid"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub repository
                </a>
                .
              </p>
            </div>
          </details>
        </aside>

        <main
          className="reading-pane"
          ref={articleRef}
          onClick={(event) => {
            const target = event.target as HTMLElement;
            const link = target.closest<HTMLAnchorElement>('a[href^="#"]');
            if (!link) return;
            const id = link.getAttribute("href")?.slice(1);
            if (id && targetToItemId.has(id)) {
              event.preventDefault();
              selectItem(id);
            }
          }}
        >
          <article className="source-article" key={activeItem.id}>
            <div className="article-kicker">
              <span>{book.title}</span>
              <span aria-hidden="true">/</span>
              <span>{activeSection.label}</span>
            </div>

            {activeSection.id === "propositions" && (
              <p className="article-number">{activeItem.label}</p>
            )}
            {activeSection.id === "propositions" ? (
              <h1
                className="proposition-title"
                data-line="1"
                dangerouslySetInnerHTML={{ __html: propositionHeadlineHtml ?? activeItem.headline }}
              />
            ) : (
              <h1>{activeItem.label}</h1>
            )}

            <PropositionFigure propositionId={activeItem.id} />

            <div className="source-copy">
              {visibleParts.map((part, partIndex) => (
                <section
                  className={`source-part source-part-${part.kind}`}
                  id={part.id}
                  key={`${part.id ?? part.kind}-${partIndex}`}
                >
                  {part.label && !["qed", "conclusion"].includes(part.kind) && (
                    <h2>{part.label}</h2>
                  )}
                  {part.blocks.map((block, blockIndex) => (
                    <div
                      className="source-block"
                      // The extraction script emits only a small, explicit TEI tag allowlist.
                      dangerouslySetInnerHTML={{ __html: block }}
                      key={blockIndex}
                    />
                  ))}
                </section>
              ))}
            </div>

            <EntryPagination
              previous={previous}
              next={next}
              position="bottom"
              onSelect={selectItem}
            />
          </article>
        </main>

        <aside className="notes-panel" aria-label="Commentary">
          <div className="notes-heading">
            <div>
              <span className="eyebrow">Commentary</span>
              <h2>{showingEditorialNotes ? "Our notes" : "Heath's notes"}</h2>
            </div>
            <span>{primaryNotes.length}</span>
          </div>
          {primaryNotes.length ? (
            <NotesList notes={primaryNotes} editorial={showingEditorialNotes} />
          ) : (
            <p className="empty-notes">Heath supplies no commentary for this entry.</p>
          )}
          {showingEditorialNotes && activeItem.notes.length > 0 && (
            <section className="secondary-notes" aria-label="Heath's notes">
              <div className="secondary-notes-heading">
                <h2>Heath&apos;s notes</h2>
                <span>{activeItem.notes.length}</span>
              </div>
              <NotesList notes={activeItem.notes} />
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
