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

const LINE_NUMBER_PREFERENCE_KEY = "euclid-announce-source-line-numbers";

function addAccessibleLineNumbers(html: string, enabled: boolean) {
  if (!enabled) return html;
  return html.replace(
    /<span class="source-line-number" aria-hidden="true" data-line="([^"]+)"><\/span>/g,
    '<span class="source-line-number" data-line="$1"><span class="sr-only">Source line $1.</span></span>',
  );
}

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
  const [isCompact, setIsCompact] = useState(false);
  const [announceLineNumbers, setAnnounceLineNumbers] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const articleHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusArticleOnChangeRef = useRef(false);
  const contentsPanelRef = useRef<HTMLElement>(null);
  const contentsHeadingRef = useRef<HTMLHeadingElement>(null);
  const navInvokerRef = useRef<HTMLElement | null>(null);

  const activeIndex = Math.max(
    0,
    allItems.findIndex(({ item }) => item.id === activeItemId),
  );
  const active = allItems[activeIndex] ?? allItems[0];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setAnnounceLineNumbers(
        window.localStorage.getItem(LINE_NUMBER_PREFERENCE_KEY) === "true",
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const syncFromLocation = (focusArticle = false) => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const resolvedItemId = targetToItemId.get(id);
      if (resolvedItemId) {
        focusArticleOnChangeRef.current = focusArticle;
        setActiveItemId(resolvedItemId);
        setAnchorTarget(id === resolvedItemId ? null : id);
      }
    };

    syncFromLocation();
    const syncAndFocusFromLocation = () => syncFromLocation(true);
    window.addEventListener("hashchange", syncAndFocusFromLocation);
    window.addEventListener("popstate", syncAndFocusFromLocation);
    return () => {
      window.removeEventListener("hashchange", syncAndFocusFromLocation);
      window.removeEventListener("popstate", syncAndFocusFromLocation);
    };
  }, [targetToItemId]);

  useEffect(() => {
    if (!active) return;
    document.title = `${active.item.label} | Euclid's Elements`;
    if (!focusArticleOnChangeRef.current) return;
    focusArticleOnChangeRef.current = false;
    const frame = window.requestAnimationFrame(() => {
      articleHeadingRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [active]);

  useEffect(() => {
    if (!anchorTarget) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(anchorTarget)?.scrollIntoView({ block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeItemId, anchorTarget]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const syncCompactLayout = () => setIsCompact(media.matches);
    syncCompactLayout();
    media.addEventListener("change", syncCompactLayout);
    return () => media.removeEventListener("change", syncCompactLayout);
  }, []);

  useEffect(() => {
    if (!isCompact || !navOpen) return;
    const background = document.querySelectorAll<HTMLElement>(
      ".topbar, .reading-pane, .notes-panel",
    );
    background.forEach((element) => {
      element.inert = true;
    });

    const containFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        contentsPanelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), summary, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter(
        (element) =>
          element.getClientRects().length > 0 &&
          (!element.closest("details:not([open])") || element.tagName === "SUMMARY"),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", containFocus);
    return () => {
      document.removeEventListener("keydown", containFocus);
      background.forEach((element) => {
        element.inert = false;
      });
    };
  }, [isCompact, navOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if ((event.key === "/" && !isTyping) || (event.key === "k" && (event.metaKey || event.ctrlKey))) {
        event.preventDefault();
        navInvokerRef.current = document.activeElement as HTMLElement | null;
        setNavOpen(true);
        window.setTimeout(() => searchRef.current?.focus(), 0);
      }
      if (event.key === "Escape" && navOpen && isCompact) {
        event.preventDefault();
        setQuery("");
        setNavOpen(false);
        window.setTimeout(() => navInvokerRef.current?.focus(), 0);
        return;
      }
      if (event.key === "Escape" && query) {
        setQuery("");
        searchRef.current?.blur();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isCompact, navOpen, query]);

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
    focusArticleOnChangeRef.current = true;
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

  const closeNavigation = (restoreFocus = true) => {
    setNavOpen(false);
    if (restoreFocus) {
      window.setTimeout(() => navInvokerRef.current?.focus(), 0);
    }
  };

  const openNavigation = (invoker: HTMLElement, focusSearch = false) => {
    navInvokerRef.current = invoker;
    setNavOpen(true);
    window.setTimeout(() => {
      if (focusSearch) {
        searchRef.current?.focus();
      } else {
        contentsHeadingRef.current?.focus();
      }
    }, 0);
  };

  return (
    <div className="reader-shell">
      <header className="topbar">
        <button
          className="nav-toggle"
          type="button"
          aria-label={navOpen ? "Close table of contents" : "Open table of contents"}
          aria-controls="book-contents"
          aria-expanded={navOpen}
          onClick={(event) => {
            if (navOpen) {
              closeNavigation(false);
            } else {
              openNavigation(event.currentTarget);
            }
          }}
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

        <button
          className="search-trigger"
          type="button"
          aria-controls="book-contents"
          aria-expanded={navOpen}
          onClick={(event) => openNavigation(event.currentTarget, true)}
        >
          <span aria-hidden="true">⌕</span>
          <span>Search</span>
          <kbd>⌘ K</kbd>
        </button>
      </header>

      <div className="reader-workspace">
        {navOpen && (
          <div
            className="nav-scrim"
            aria-hidden="true"
            onClick={() => closeNavigation()}
          />
        )}

        <aside
          className={`contents-panel${navOpen ? " is-open" : ""}`}
          id="book-contents"
          ref={contentsPanelRef}
          role={isCompact ? "dialog" : undefined}
          aria-label={isCompact ? undefined : "Book I contents"}
          aria-labelledby={isCompact ? "contents-title" : undefined}
          aria-modal={isCompact && navOpen ? true : undefined}
          inert={isCompact && !navOpen ? true : undefined}
        >
          <div className="contents-heading">
            <div>
              <span className="eyebrow">Now reading</span>
              <h2 id="contents-title" ref={contentsHeadingRef} tabIndex={-1}>{book.title}</h2>
            </div>
            <button
              className="contents-close"
              type="button"
              aria-label="Close table of contents"
              onClick={() => closeNavigation()}
            >
              <span aria-hidden="true">×</span>
            </button>
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

          <div className="contents-search" role="search">
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <span className="sr-only">Search Book I</span>
              <input
                ref={searchRef}
                type="search"
                value={query}
                aria-controls={normalizedQuery.length >= 2 ? "search-results" : undefined}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Book I"
              />
              <kbd>/</kbd>
            </label>

            {normalizedQuery.length >= 2 && (
              <div className="search-results" id="search-results">
                <div
                  className="results-meta"
                  id="search-results-status"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {searchResults.length ? `${searchResults.length} results` : "No results"}
                </div>
                <ul className="search-result-list">
                  {searchResults.map(({ item, section }) => (
                    <li key={item.id}>
                      <button
                        className="search-result"
                        type="button"
                        onClick={() => selectItem(item.id)}
                      >
                        <span>{section.abbreviation} {item.number}</span>
                        <strong>{item.headline}</strong>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {normalizedQuery.length < 2 && (
            <>
              <nav className="section-list" aria-label="Book I sections">
                {readerSections.map((section) => (
                  <button
                    className={section.id === activeSection.id ? "is-active" : ""}
                    type="button"
                    key={section.id}
                    aria-current={section.id === activeSection.id ? "page" : undefined}
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

          <label className="line-number-option">
            <input
              type="checkbox"
              checked={announceLineNumbers}
              onChange={(event) => {
                setAnnounceLineNumbers(event.target.checked);
                window.localStorage.setItem(
                  LINE_NUMBER_PREFERENCE_KEY,
                  String(event.target.checked),
                );
              }}
            />
            <span>
              Announce source line numbers
              <small>Read the numbered markers in propositions.</small>
            </span>
          </label>

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
              <>
                {announceLineNumbers && <span className="sr-only">Source line 1.</span>}
                <h1
                  className="proposition-title"
                  data-line="1"
                  ref={articleHeadingRef}
                  tabIndex={-1}
                  dangerouslySetInnerHTML={{ __html: propositionHeadlineHtml ?? activeItem.headline }}
                />
              </>
            ) : (
              <h1 ref={articleHeadingRef} tabIndex={-1}>{activeItem.label}</h1>
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
                      dangerouslySetInnerHTML={{
                        __html: addAccessibleLineNumbers(block, announceLineNumbers),
                      }}
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
