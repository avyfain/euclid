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

test("server-renders a cover before entering the reader", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Euclid(?:&#x27;|')s Elements<\/title>/i);
  assert.match(html, /Euclid(?:&#x27;|')s Elements/);
  assert.match(html, /Thomas L\. Heath(?:&#x27;|')s translation/);
  assert.match(html, /See how geometry was built\./);
  assert.match(html, /Begin with Proposition I\.1/);
  assert.match(html, /465 propositions/);
  assert.match(html, /Searchable across all 13 books/);
  assert.match(
    html,
    /Built in SF by(?:<!-- -->)? <a href="https:\/\/faingezicht\.com\/"[^>]*>Avy Faingezicht<\/a>/,
  );
  assert.match(html, /Construction of an equilateral triangle/);
  assert.doesNotMatch(html, />Definitions</);
  assert.match(
    html,
    /https:\/\/raw\.githubusercontent\.com\/avyfain\/euclid\/main\/public\/og\.png/,
  );
  assert.doesNotMatch(html, /https?:\/\/localhost|\/Users\//);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("licenses the original reader code under MIT", async () => {
  const [license, packageJson, readme, styles] = await Promise.all([
    readFile(new URL("../LICENSE", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(license, /^MIT License/);
  assert.match(license, /Copyright \(c\) 2026 Avy Faingezicht/);
  assert.equal(packageJson.license, "MIT");
  assert.match(readme, /original code is available under the \[MIT License\]\(LICENSE\)/);
  assert.match(readme, /source material retain their[\s\S]*not relicensed by the MIT License/);
  assert.match(styles, /\.source-note-project p \+ p \{[\s\S]*?margin-top: 14px;/);
});

test("emits a public static export without local metadata", async () => {
  const html = await readFile(
    new URL("../dist/client/index.html", import.meta.url),
    "utf8",
  );

  assert.match(html, /<title>Euclid(?:&#x27;|')s Elements<\/title>/i);
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

test("ships all thirteen books and their visualization contracts", async () => {
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
  const books = await Promise.all(
    Array.from({ length: 13 }, (_, index) =>
      readFile(
        new URL(`../app/data/book-${index + 1}.json`, import.meta.url),
        "utf8",
      ).then(JSON.parse),
    ),
  );
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const [sceneRenderer, bookTwoFigures, bookThreeFigures, bookFourFigures, bookFiveFigures, bookSixFigures, bookSevenFigures, bookEightFigures, bookNineFigures, bookTenFigures, bookElevenFigures, bookTwelveFigures, bookThirteenFigures, bookFamilyFigures, experience] = await Promise.all([
    readFile(new URL("../app/EuclidScene.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data/book-2-figure-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/book-3-figure-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/book-4-figure-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/book-5-figure-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/book-6-figure-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/book-7-figure-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/book-8-figure-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/book-9-figure-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/book-10-figure-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/book-11-figure-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/book-12-figure-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/book-13-figure-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/book-family-scenes.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/EuclidExperience.tsx", import.meta.url), "utf8"),
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
  assert.equal(
    books.flatMap((candidate) => candidate.sections.flatMap((section) => section.items)).length,
    607,
  );
  assert.deepEqual(
    books.map((candidate) =>
      candidate.sections
        .flatMap((section) => section.items)
        .filter((item) => item.id.startsWith("prop-"))
        .length,
    ),
    [48, 14, 37, 16, 25, 33, 39, 27, 36, 115, 39, 18, 18],
  );
  for (const candidate of books) {
    const candidateItems = candidate.sections.flatMap((section) => section.items);
    assert.equal(new Set(candidateItems.map((item) => item.id)).size, candidateItems.length);
    assert.equal(
      new Set(candidate.sections.map((section) => section.id)).size,
      candidate.sections.length,
    );
  }
  const sourceHtmlByBook = books.map((candidate) =>
    candidate.sections
      .flatMap((section) => section.items)
      .flatMap((item) => [
        ...item.parts.flatMap((part) => part.blocks),
        ...item.notes.flatMap((note) => note.blocks),
      ])
      .join(" "),
  );
  assert.deepEqual(
    sourceHtmlByBook.map((html) => (html.match(/class="segment"/g) ?? []).length),
    [997, 764, 892, 448, 515, 1134, 494, 0, 233, 5792, 1553, 559, 794],
  );
  assert.doesNotMatch(
    sourceHtmlByBook.slice(6).join(" "),
    /class="source-italic">[A-Z]{2}<\/span>/,
  );
  assert.match(
    sourceHtmlByBook[12],
    /<span class="segment" aria-label="line segment A D">AD<\/span>/,
  );

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
  const localTargets = [...sourceHtml.matchAll(/href="#((?!book-)[^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.ok(localTargets.length > 100);
  assert.ok(localTargets.every((target) => itemIds.has(target)));
  assert.ok((sourceHtml.match(/href="#book-6-prop-3"/g) ?? []).length >= 1);

  const greekSpans = [...sourceHtml.matchAll(
    /<span class="foreign" lang="grc">([^<]+)<\/span>/g,
  )].map((match) => match[1]);
  assert.equal(greekSpans.length, 126);
  assert.ok(greekSpans.every((value) => /[\u0370-\u03ff\u1f00-\u1fff]/u.test(value)));
  assert.doesNotMatch(sourceHtml, /lang="greek"/);
  assert.match(sourceHtml, /ἐκβεβλήσθωσαν/);
  assert.match(sourceHtml, /πρὸς τῷ δοθέντι σημείῳ/);

  assert.equal((sourceHtml.match(/class="segment"/g) ?? []).length, 997);
  assert.equal((sourceHtml.match(/class="source-line-number"/g) ?? []).length, 229);
  assert.match(
    sourceHtml,
    /<span class="segment" aria-label="line segment A B">AB<\/span>/,
  );
  const citationTags = [...sourceHtml.matchAll(/<a class="citation-link"[^>]+>/g)].map(
    (match) => match[0],
  );
  assert.ok(citationTags.length > 100);
  assert.ok(citationTags.every((tag) => /aria-label="Book \d+, /.test(tag)));
  assert.match(sourceHtml, /aria-label="Book 1, Proposition 1"/);
  assert.match(sourceHtml, /aria-label="Book 6, Proposition 3"/);
  assert.doesNotMatch(sourceHtml, /<em>AB<\/em>/);

  assert.match(catalog, /"XIII"/);
  assert.match(catalog, /available: true/);
  assert.match(extractor, /choices=range\(1, 14\)/);
  assert.match(extractor, /selection\.add_argument\("--all"/);
  assert.match(extractor, /rendition in \{"ital", "italic"\}/);
  assert.match(page, /bookThirteen/);
  assert.match(page, /<EuclidExperience books=\{books\} \/>/);
  assert.match(experience, /FIRST_PROPOSITION_HASH = "#book-1-prop-1"/);
  assert.match(experience, /window\.addEventListener\("popstate", syncFromLocation\)/);
  assert.match(experience, /window\.history\.pushState\(null, "", "\/"\)/);
  assert.match(reader, /!\["qed", "conclusion"\]\.includes\(part\.kind\)/);
  const conclusionStyles = styles.match(
    /\.source-part-qed,[\s\S]*?\.source-part-conclusion \{[\s\S]*?\}/,
  )?.[0] ?? "";
  assert.doesNotMatch(conclusionStyles, /border-top|padding-top/);
  assert.match(styles, /--faint: #796960;/);
  assert.match(styles, /\.euclid-scene-label \{[\s\S]*?stroke: none;/);
  assert.ok(reader.indexOf("source-note") < reader.indexOf('className="reading-pane"'));
  assert.match(reader, /Perseus, a digital library at Tufts University/);
  assert.doesNotMatch(reader, /activeItem\.sourceUrl/);
  assert.match(reader, /COLLAPSED_FOUNDATION_SECTION_IDS/);
  assert.match(reader, /collapsed \? section\.id : item\.id/);
  assert.match(reader, /articleRef\.current\?\.scrollIntoView/);
  assert.match(reader, /<Link[\s\S]*?className="brand"[\s\S]*?href="\/"/);
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
  assert.match(reader, /document\.title = `\$\{active\.item\.label\} \| Euclid's Elements`/);
  assert.match(reader, /articleHeadingRef\.current\?\.focus\(\{ preventScroll: true \}\)/);
  assert.equal((reader.match(/tabIndex=\{-1\}/g) ?? []).length, 3);
  assert.match(reader, /window\.matchMedia\("\(max-width: 900px\)"\)/);
  assert.match(reader, /element\.inert = true/);
  assert.match(reader, /element\.getClientRects\(\)\.length > 0/);
  assert.match(reader, /element\.closest\("details:not\(\[open\]\)"\)/);
  assert.match(reader, /event\.key === "Escape" && navOpen && isCompact/);
  assert.match(reader, /role=\{isCompact \? "dialog" : undefined\}/);
  assert.match(reader, /aria-modal=\{isCompact && navOpen \? true : undefined\}/);
  assert.doesNotMatch(reader, /euclid-announce-source-line-numbers/);
  assert.doesNotMatch(reader, /Announce source line numbers/);
  assert.match(reader, /Source line \$1\./);
  assert.match(reader, /addAccessibleLineNumbers\(block\)/);
  assert.match(reader, /className="contents-search" role="search"/);
  assert.match(reader, /id="search-results-status"[\s\S]*?role="status"/);
  assert.match(reader, /<ul className="search-result-list">/);
  assert.match(reader, /aria-current=\{section\.id === activeSection\.id \? "page" : undefined\}/);
  assert.match(reader, /bookNumber=\{book\.number\}/);
  assert.match(reader, /references=\{proofReferences\}/);
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
  assert.match(figure, /bookNumber === 2 && BOOK_TWO_SCENES\[propositionId\]/);
  assert.match(figure, /bookNumber === 3 && BOOK_THREE_SCENES\[propositionId\]/);
  assert.match(figure, /bookNumber === 4 && BOOK_FOUR_SCENES\[propositionId\]/);
  assert.match(figure, /bookNumber === 5 && BOOK_FIVE_SCENES\[propositionId\]/);
  assert.match(figure, /bookNumber === 6 && BOOK_SIX_SCENES\[propositionId\]/);
  assert.match(figure, /bookNumber === 7 && BOOK_SEVEN_SCENES\[propositionId\]/);
  assert.match(figure, /bookNumber === 8 && BOOK_EIGHT_SCENES\[propositionId\]/);
  assert.match(figure, /bookNumber === 9 && BOOK_NINE_SCENES\[propositionId\]/);
  assert.match(figure, /bookNumber === 10 && BOOK_TEN_SCENES\[propositionId\]/);
  assert.match(figure, /bookNumber === 11 && BOOK_ELEVEN_SCENES\[propositionId\]/);
  assert.match(figure, /bookNumber === 12 && BOOK_TWELVE_SCENES\[propositionId\]/);
  assert.match(figure, /bookNumber === 13 && BOOK_THIRTEEN_SCENES\[propositionId\]/);
  assert.match(figure, /bookNumber >= 3/);
  assert.match(figure, /createBookFamilyScene/);
  assert.match(sceneRenderer, /data-scene=\{scene\.id\}/);
  assert.match(sceneRenderer, /type="range"/);
  assert.equal(
    (bookTwoFigures.match(/id: "book-2-prop-\d+"/g) ?? []).length,
    14,
  );
  assert.match(bookTwoFigures, /validateBookTwoScenes/);
  assert.equal((bookThreeFigures.match(/id: "book-3-prop-\d+"/g) ?? []).length, 37);
  assert.match(bookThreeFigures, /validateBookThreeScenes/);
  assert.match(bookThreeFigures, /perpendicular bisectors meet at O/);
  assert.match(bookThreeFigures, /PB greatest; PA least/);
  assert.match(bookThreeFigures, /A and B are the only common points/);
  assert.match(bookThreeFigures, /OT ⟂ PT, therefore PT touches the circle/);
  assert.match(bookThreeFigures, /∠AOB = 2∠ACB/);
  assert.match(bookThreeFigures, /∠ACB = ∠ADB/);
  assert.match(bookThreeFigures, /OA = OB completes the given segment's circle/);
  assert.match(bookThreeFigures, /arc AB = arc CD, therefore chord AB = CD/);
  assert.match(bookThreeFigures, /arc AC = arc CB/);
  assert.match(bookThreeFigures, /∠DFE < right < ∠DGE/);
  assert.match(bookThreeFigures, /PT² = PA·PB/);
  assert.match(bookThreeFigures, /OT ⟂ PT, therefore PT is tangent/);
  assert.equal((bookFourFigures.match(/id: "book-4-prop-\d+"/g) ?? []).length, 16);
  assert.match(bookFourFigures, /validateBookFourScenes/);
  assert.match(bookFourFigures, /AB = DE/);
  assert.match(bookFourFigures, /IE = IF = IG/);
  assert.match(bookFourFigures, /∠B = ∠C = 72° = 2∠A/);
  assert.match(bookFourFigures, /120° − 72° = 48°; bisect to 24°/);
  assert.equal((bookFiveFigures.match(/makeScene\(\d+/g) ?? []).length, 25);
  assert.match(bookFiveFigures, /validateBookFiveScenes/);
  assert.match(bookFiveFigures, /A is 3·B exactly when C is 3·D/);
  assert.match(bookFiveFigures, /A:C = D:F = 4:1/);
  assert.match(bookFiveFigures, /A \+ D = 11 > 10 = B \+ C/);
  assert.equal((bookSixFigures.match(/id: "book-6-prop-\d+"/g) ?? []).length, 33);
  assert.match(bookSixFigures, /validateBookSixScenes/);
  assert.match(bookSixFigures, /AC : CD = CD : CB/);
  assert.match(bookSixFigures, /AB : AC = AC : CB = φ/);
  assert.match(bookSixFigures, /figure\(hypotenuse\) = figure\(leg 1\) \+ figure\(leg 2\)/);
  assert.match(bookSevenFigures, /scene39/);
  assert.match(bookSevenFigures, /validateBookSevenScenes/);
  assert.match(bookSevenFigures, /gcd\(19,12\) = 1/);
  assert.match(bookSevenFigures, /lcm\(4,6,9\)=36/);
  assert.match(bookEightFigures, /validateBookEightScenes/);
  assert.match(bookEightFigures, /4:9 = \(2:3\)²/);
  assert.match(bookEightFigures, /8:27 = \(2:3\)³/);
  assert.match(bookNineFigures, /validateBookNineScenes/);
  assert.match(bookNineFigures, /2·3·5 \+ 1 = 31/);
  assert.match(bookNineFigures, /7·4=28 perfect/);
  assert.match(bookTenFigures, /validateBookTenScenes/);
  assert.match(bookTenFigures, /1,⁴√2: square also/);
  assert.match(bookTenFigures, /apotome is a difference, not a binomial sum/);
  assert.match(bookElevenFigures, /validateBookElevenScenes/);
  assert.match(bookElevenFigures, /a·b·c = b³/);
  assert.match(bookElevenFigures, /common section is one straight line/);
  assert.match(bookTwelveFigures, /validateBookTwelveScenes/);
  assert.match(bookTwelveFigures, /cone = ⅓ cylinder/);
  assert.match(bookTwelveFigures, /sphere ratio k³ : 1/);
  assert.match(bookThirteenFigures, /validateBookThirteenScenes/);
  assert.match(bookThirteenFigures, /D² = 3s²/);
  assert.match(bookThirteenFigures, /hexagon side \+ decagon side/);
  assert.match(bookFamilyFigures, /const BOOK_STEPS: Record<number, string\[]>/);
  assert.match(bookFamilyFigures, /validateBookFamilyScene/);
  assert.equal((bookFamilyFigures.match(/^\s+\d+: \(value\)/gm) ?? []).length, 7);
  assert.match(bookFamilyFigures, /3: \(value\) => circleScene/);
  assert.match(bookFamilyFigures, /bookThirteenOpeningScene/);
  assert.match(bookFamilyFigures, /control: \{ kind: "steps" \}/);
  assert.match(bookFamilyFigures, /CD² = 5·AD²/);
  assert.match(bookFamilyFigures, /AD = AE = EB; AB = 2·AD/);
  assert.match(bookFamilyFigures, /AB² \+ BC² = 3·AC²/);
  assert.match(bookFamilyFigures, /DB : AB = AB : AD/);
  assert.match(bookFamilyFigures, /both are irrational apotomes/);
  assert.doesNotMatch(bookFamilyFigures, /Move the golden cut/);
  assert.match(bookFamilyFigures, /fiveFiguresScene/);
  assert.match(figure, /function ParallelMark/);
  assert.match(figure, /function RightAngleMark/);
  assert.match(figure, /Show construction/);
  assert.match(figure, /Text description of \{heading\.toLowerCase\(\)\}/);
  assert.match(figure, /<desc id=\{descriptionId\}>\{title\} Current view: \{status\}\.<\/desc>/);
  assert.match(figure, /aria-current=\{index === currentStep \? "step" : undefined\}/);
  assert.equal((figure.match(/type="range"/g) ?? []).length, 3);
  assert.match(figure, /prefers-reduced-motion|geometry-reveal/);
  assert.match(styles, /\.geometry-parallel line/);
  assert.match(styles, /\.geometry-right-angle/);
  assert.match(styles, /\.geometry-area-secondary/);
  assert.match(styles, /\.euclid-scene-area-secondary/);
  assert.match(styles, /\.euclid-scene-range/);
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
  assert.match(extractor, /line_numbers=section_id\.startswith\("propositions"\)/);
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
