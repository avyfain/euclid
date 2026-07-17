import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html", host: "localhost" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the finished Book I reader", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Euclid(?:&#x27;|')s Elements - Book I<\/title>/i);
  assert.match(html, /Euclid(?:&#x27;|')s Elements/);
  assert.match(html, /Heath(?:&#x27;|')s translation/);
  assert.match(html, />Definitions</);
  assert.doesNotMatch(html, /entry-total|51 entries/);
  assert.match(html, />Propositions</);
  assert.match(html, /A point is that which has no part\./);
  assert.match(html, /id="def-23"/);
  assert.match(html, /Definition 23/);
  assert.equal(
    (html.match(/aria-label="Previous and next entries"/g) ?? []).length,
    1,
  );
  assert.match(html, /class="source-note"/);
  assert.match(html, /About this text/);
  assert.match(html, /About this project/);
  assert.equal((html.match(/class="source-note"/g) ?? []).length, 2);
  assert.match(
    html,
    /href="https:\/\/www\.perseus\.tufts\.edu\/hopper\/text\?doc=Euc\.\+1"[^>]*>Read Heath&#x27;s translation at Perseus<\/a>/,
  );
  assert.match(
    html,
    /href="https:\/\/catherineproject\.org\/"[^>]*>Catherine Project<\/a>/,
  );
  assert.match(html, /I was inspired to build this reader while taking the/);
  assert.match(html, /Ancient Greek Writings on Knowledge and Mathematics/);
  assert.match(
    html,
    /Built by(?:<!-- -->)? <a href="https:\/\/www\.faingezicht\.com\/"[^>]*>Avy Faingezicht<\/a>, a software engineer in San Francisco\./,
  );
  assert.match(
    html,
    /Building projects like this is how I teach myself about difficult subjects and understand the world more deeply\./,
  );
  assert.match(html, /Built with Codex on Sol 5\.6\. It&#x27;s open source;/);
  assert.match(
    html,
    /href="https:\/\/github\.com\/avyfain\/euclid"[^>]*>GitHub repository<\/a>/,
  );
  assert.match(html, /suggestions are welcome/);
  assert.doesNotMatch(html, /View this entry at Perseus/);
  assert.doesNotMatch(html, /class="article-meta"/);
  assert.match(html, /Text provided by Perseus Digital Library/);
  assert.match(html, /Creative Commons Attribution-ShareAlike 3\.0 United States/);
  assert.match(
    html,
    /https:\/\/raw\.githubusercontent\.com\/avyfain\/euclid\/main\/public\/og\.png/,
  );
  assert.doesNotMatch(html, /https?:\/\/localhost|\/Users\//);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("emits a public static export without local metadata", async () => {
  const html = await readFile(
    new URL("../dist/client/index.html", import.meta.url),
    "utf8",
  );

  assert.match(html, /<title>Euclid(?:&#x27;|')s Elements - Book I<\/title>/i);
  assert.match(
    html,
    /https:\/\/raw\.githubusercontent\.com\/avyfain\/euclid\/main\/public\/og\.png/,
  );
  assert.doesNotMatch(html, /https?:\/\/localhost|\/Users\/|appgprj_/);
});

test("keeps Cloudflare Workers Builds as the sole deployment owner", async () => {
  const [wrangler, workflow] = await Promise.all([
    readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8"),
  ]);

  assert.equal(wrangler.name, "euclid");
  assert.equal(wrangler.preview_urls, true);
  assert.doesNotMatch(workflow, /wrangler deploy|CLOUDFLARE_API_TOKEN/);
});

test("ships complete Book I data and an extensible book catalog", async () => {
  const [book, catalog, editorialNotes, extractor, reader, figure, figureData, styles] = await Promise.all([
    readFile(new URL("../app/data/book-1.json", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../app/data/catalog.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/editorial-notes.ts", import.meta.url), "utf8"),
    readFile(new URL("../scripts/extract_perseus_book.py", import.meta.url), "utf8"),
    readFile(new URL("../app/EuclidReader.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/PropositionFigure.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data/proposition-figure-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  const counts = Object.fromEntries(
    book.sections.map((section) => [section.id, section.items.length]),
  );
  assert.deepEqual(counts, {
    definitions: 23,
    postulates: 5,
    "common-notions": 5,
    propositions: 48,
  });

  const items = book.sections.flatMap((section) => section.items);
  assert.equal(items.length, 81);
  const itemIds = new Set(items.map((item) => item.id));
  assert.equal(itemIds.size, 81);
  assert.equal(items.reduce((sum, item) => sum + item.notes.length, 0), 73);

  const propositions = book.sections.find(
    (section) => section.id === "propositions",
  ).items;
  const propositionFour = propositions.find((item) => item.id === "prop-4");
  assert.ok(
    propositions.every((item) => item.parts.some((part) => part.kind === "enunc")),
  );
  assert.ok(
    propositions.every((item) => item.parts.some((part) => part.kind === "proof")),
  );
  const propositionFourHtml = propositionFour.parts
    .flatMap((part) => part.blocks)
    .join(" ");
  assert.match(propositionFourHtml, /data-line="1"/);
  assert.match(propositionFourHtml, /data-line="5"/);
  assert.match(propositionFourHtml, /data-line="10"/);
  assert.doesNotMatch(propositionFourHtml, /data-line="2"/);
  assert.match(
    propositionFour.parts.find((part) => part.kind === "qed").blocks[0],
    /^<p><span class="source-line-number"[^>]*data-line="45"><\/span>/,
  );

  const sourceHtml = items
    .flatMap((item) => [
      ...item.parts.flatMap((part) => part.blocks),
      ...item.notes.flatMap((note) => note.blocks),
    ])
    .join(" ");
  const localTargets = [...sourceHtml.matchAll(/href="#([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.ok(localTargets.length > 100);
  assert.ok(localTargets.every((target) => itemIds.has(target)));
  assert.equal((sourceHtml.match(/book%3D6/g) ?? []).length, 2);

  const greekSpans = [...sourceHtml.matchAll(
    /<span class="foreign" lang="greek">([^<]+)<\/span>/g,
  )].map((match) => match[1]);
  assert.equal(greekSpans.length, 126);
  assert.ok(greekSpans.every((value) => /[\u0370-\u03ff\u1f00-\u1fff]/u.test(value)));
  assert.match(sourceHtml, /ἐκβεβλήσθωσαν/);
  assert.match(sourceHtml, /πρὸς τῷ δοθέντι σημείῳ/);

  assert.equal((sourceHtml.match(/class="segment"/g) ?? []).length, 997);
  assert.equal((sourceHtml.match(/class="source-line-number"/g) ?? []).length, 229);
  assert.match(
    sourceHtml,
    /<span class="segment" aria-label="line segment AB">AB<\/span>/,
  );
  assert.doesNotMatch(sourceHtml, /<em>AB<\/em>/);

  assert.match(catalog, /"XIII"/);
  assert.match(catalog, /available: index === 0/);
  assert.match(extractor, /choices=range\(1, 14\)/);
  assert.match(reader, /!\["qed", "conclusion"\]\.includes\(part\.kind\)/);
  const conclusionStyles = styles.match(
    /\.source-part-qed,[\s\S]*?\.source-part-conclusion \{[\s\S]*?\}/,
  )?.[0] ?? "";
  assert.doesNotMatch(conclusionStyles, /border-top|padding-top/);
  assert.ok(reader.indexOf("source-note") < reader.indexOf('className="reading-pane"'));
  assert.match(reader, /Perseus, a digital library at Tufts University/);
  assert.doesNotMatch(reader, /activeItem\.sourceUrl/);
  assert.match(reader, /COLLAPSED_FOUNDATION_SECTION_IDS/);
  assert.match(reader, /targets\.set\(item\.id, collapsed \? section\.id : item\.id\)/);
  assert.match(reader, /articleRef\.current\?\.scrollIntoView/);
  assert.match(reader, /id=\{part\.id\}/);
  const articleMarkup = reader.slice(
    reader.indexOf('<article className="source-article"'),
    reader.indexOf('</article>'),
  );
  assert.doesNotMatch(articleMarkup, /position="top"/);
  assert.equal((articleMarkup.match(/<EntryPagination/g) ?? []).length, 1);
  assert.match(articleMarkup, /position="bottom"/);
  assert.match(reader, /dangerouslySetInnerHTML=\{\{ __html: propositionHeadlineHtml/);
  assert.match(reader, /className="proposition-title"[\s\S]*?data-line="1"/);
  assert.match(reader, /<PropositionFigure propositionId=\{activeItem\.id\} \/>/);
  for (const id of ["prop-1", "prop-2", "prop-3", "prop-4"]) {
    assert.match(figure, new RegExp(`case "${id}"`));
  }
  const dataDrivenFigureIds = [...figureData.matchAll(/^\s+"(prop-\d+)": \{/gm)].map(
    (match) => match[1],
  );
  assert.deepEqual(
    dataDrivenFigureIds,
    Array.from({ length: 44 }, (_, index) => `prop-${index + 5}`),
  );
  assert.match(figure, /PROPOSITION_FIGURES\[propositionId\]/);
  assert.match(figure, /function ParallelMark/);
  assert.match(figure, /function RightAngleMark/);
  assert.match(figure, /Replay construction/);
  assert.equal((figure.match(/type="range"/g) ?? []).length, 3);
  assert.match(figure, /prefers-reduced-motion|geometry-reveal/);
  assert.match(styles, /\.geometry-parallel line/);
  assert.match(styles, /\.geometry-right-angle/);
  assert.match(styles, /\.geometry-area-secondary/);
  assert.match(reader, /showingEditorialNotes \? "Our notes" : "Heath's notes"/);
  assert.match(editorialNotes, /The two numbering systems/);
  assert.match(editorialNotes, /Heiberg's numbering from the transmitted Greek sequence/);
  assert.match(editorialNotes, /Axioms 8 and 9/);
  assert.doesNotMatch(reader, /className="entry-total"/);
  const sectionListStyles = styles.match(/\.section-list \{[^}]*\}/)?.[0] ?? "";
  const sourceNoteStyles = styles.match(/\.source-note \{[^}]*\}/)?.[0] ?? "";
  assert.doesNotMatch(sectionListStyles, /border-bottom/);
  assert.doesNotMatch(sourceNoteStyles, /border-top/);
  assert.match(
    styles,
    /\.source-part-foundation-entry \{[^}]*margin: 0 0 20px;[^}]*\}/,
  );
  assert.match(
    styles,
    /\.source-part\.source-part-foundation-entry > h2 \{[^}]*margin-bottom: 5px;/,
  );
  assert.match(
    styles,
    /\.source-article > h1\.proposition-title \{[^}]*display: flow-root;[^}]*font-size: clamp\(19px, 1\.5vw, 22px\);/,
  );
  assert.match(styles, /\.source-article > h1\.proposition-title::first-letter/);
  assert.match(styles, /\.source-article > h1\.proposition-title::after/);
  assert.match(
    styles,
    /\.source-article > h1\.proposition-title::after \{[^}]*font-size: 10px;/,
  );
  assert.match(
    styles,
    /\.source-line-number::after \{[^}]*left: calc\(100% \+ 10px\);[^}]*content: attr\(data-line\);/,
  );
  assert.match(styles, /\.source-line-number::after \{[^}]*font-size: 10px;/);
  assert.match(extractor, /line_numbers=section_id == "propositions"/);
  assert.match(styles, /\.source-note \{[^}]*padding-inline: 11px;/);
  assert.match(styles, /\.source-note \{[^}]*font-size: 12px;/);
  assert.match(styles, /\.source-note summary \{[^}]*font-size: 13px;/);
  assert.match(styles, /\.source-note-copy > strong \{[^}]*font-size: 12px;/);
  assert.match(
    styles,
    /@media \(max-width: 1240px\)[\s\S]*?\.reader-workspace \{[^}]*grid-auto-rows: max-content;[^}]*align-content: start;/,
  );
  assert.match(styles, /\.search-trigger \{[\s\S]*?display: none;/);
  assert.match(
    styles,
    /@media \(max-width: 900px\)[\s\S]*?\.search-trigger \{[\s\S]*?display: flex;/,
  );
});
