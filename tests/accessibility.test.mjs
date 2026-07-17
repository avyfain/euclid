import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";

const clientRoot = fileURLToPath(new URL("../dist/client/", import.meta.url));
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
};

let baseUrl;
let browser;
let server;

before(async () => {
  server = createServer(async (request, response) => {
    const requestUrl = new URL(request.url ?? "/", "http://localhost");
    const pathname = decodeURIComponent(requestUrl.pathname);
    const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
    const filePath = join(clientRoot, relativePath);
    if (!filePath.startsWith(clientRoot)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    try {
      const body = await readFile(filePath);
      response.writeHead(200, {
        "content-type": contentTypes[extname(filePath)] ?? "application/octet-stream",
      });
      response.end(body);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  baseUrl = `http://127.0.0.1:${address.port}`;
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  await new Promise((resolve, reject) => {
    server?.close((error) => (error ? reject(error) : resolve()));
  });
});

async function assertNoWcagViolations(page, state) {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => animation.playState === "finished"),
  );
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  assert.deepEqual(
    results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      targets: violation.nodes.map((node) => node.target),
    })),
    [],
    `${state} has WCAG violations`,
  );
}

test("has no automated WCAG A/AA violations in the cover and core reader states", async () => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(baseUrl);
  await page.waitForSelector("h1");
  await assertNoWcagViolations(page, "cover");

  await page.goto(`${baseUrl}/#prop-1`);
  await page.getByRole("heading", { level: 1 }).waitFor();
  await assertNoWcagViolations(page, "proposition reader");

  await page.getByRole("searchbox", { name: "Search Book I" }).fill("equilateral");
  await page.locator("#search-results-status").waitFor();
  await assertNoWcagViolations(page, "search results");

  await page.goto(`${baseUrl}/#book-2-prop-1`);
  await page.getByRole("heading", { name: "Construction" }).waitFor();
  await assertNoWcagViolations(page, "Book II construction");
  await context.close();
});

test("renders and exercises every Book II construction", async () => {
  const context = await browser.newContext({ viewport: { width: 1100, height: 820 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  for (let proposition = 1; proposition <= 14; proposition += 1) {
    await page.goto(`${baseUrl}/#book-2-prop-${proposition}`);
    const scene = page.locator(`[data-scene="book-2-prop-${proposition}"]`);
    await scene.waitFor();
    const range = scene.getByRole("slider");
    if (await range.count()) {
      const before = await range.inputValue();
      const status = scene.getByRole("status");
      const statusBefore = await status.innerText();
      const svgBefore = await scene.locator("svg").innerHTML();
      await range.evaluate((element) => {
        const input = element;
        input.value = input.max;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
      assert.notEqual(await range.inputValue(), before, `II.${proposition} slider moves`);
      await assert.doesNotReject(
        status.waitFor({ state: "visible" }),
        `II.${proposition} status remains visible`,
      );
      const svgAfter = await scene.locator("svg").innerHTML();
      assert.notEqual(svgAfter, svgBefore, `II.${proposition} geometry updates`);
      assert.ok((await status.innerText()).length >= statusBefore.length / 2, `II.${proposition} explanation remains readable`);
    } else {
      await scene.getByRole("button", { name: "Show construction" }).click();
      await scene.getByRole("button", { name: "Show next step" }).waitFor();
    }
    await scene.locator("svg").waitFor();
  }

  assert.deepEqual(errors, []);
  await context.close();
});

test("keeps every Book II construction accessible and contained on a phone viewport", async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  for (let proposition = 1; proposition <= 14; proposition += 1) {
    await page.goto(`${baseUrl}/#book-2-prop-${proposition}`);
    const scene = page.locator(`[data-scene="book-2-prop-${proposition}"]`);
    await scene.waitFor();
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      scene: document.querySelector(".proposition-figure")?.scrollWidth,
    }));
    assert.ok(dimensions.document <= dimensions.viewport, `II.${proposition} does not create page overflow`);
    assert.ok(dimensions.scene <= dimensions.viewport, `II.${proposition} figure fits its viewport`);
    const controls = await scene.locator(".proposition-figure-controls").boundingBox();
    assert.ok(controls && controls.height >= 43, `II.${proposition} has a 44px control row`);
    await assertNoWcagViolations(page, `II.${proposition} on mobile`);
  }

  await context.close();
});

test("every specialized Book III.1-37 interaction changes the construction", async () => {
  const context = await browser.newContext({ viewport: { width: 1100, height: 820 } });
  const page = await context.newPage();

  for (let proposition = 1; proposition <= 37; proposition += 1) {
    await page.goto(`${baseUrl}/#book-3-prop-${proposition}`);
    const scene = page.locator(`[data-scene="book-3-prop-${proposition}"]`);
    await scene.waitFor();
    const svg = scene.locator("svg");
    const slider = scene.getByRole("slider");
    if (await slider.count()) {
      const before = await svg.innerHTML();
      await slider.fill(await slider.getAttribute("max"));
      assert.notEqual(await svg.innerHTML(), before, `III.${proposition} slider changes the construction`);
      continue;
    }

    const action = scene.locator("button.geometry-action");
    let before = await svg.innerHTML();
    let stagesSeen = 0;
    do {
      await action.click();
      const after = await svg.innerHTML();
      assert.notEqual(after, before, `III.${proposition} step ${stagesSeen + 1} changes the drawing`);
      before = after;
      stagesSeen += 1;
    } while (!(await action.innerText()).includes("Show construction"));
    assert.ok(stagesSeen >= 3, `III.${proposition} has a meaningful multi-step construction`);
  }

  await context.close();
});

test("specialized Book III.1-37 constructions remain accessible and contained on a phone viewport", async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  for (let proposition = 1; proposition <= 37; proposition += 1) {
    await page.goto(`${baseUrl}/#book-3-prop-${proposition}`);
    const scene = page.locator(`[data-scene="book-3-prop-${proposition}"]`);
    await scene.waitFor();
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      scene: document.querySelector(".proposition-figure")?.scrollWidth,
    }));
    assert.ok(dimensions.document <= dimensions.viewport, `III.${proposition} does not create page overflow`);
    assert.ok(dimensions.scene <= dimensions.viewport, `III.${proposition} figure fits its viewport`);
    await assertNoWcagViolations(page, `III.${proposition} on mobile`);
  }

  await context.close();
});

test("every specialized Book IV.1-16 interaction changes the construction", async () => {
  const context = await browser.newContext({ viewport: { width: 1100, height: 820 } });
  const page = await context.newPage();

  for (let proposition = 1; proposition <= 16; proposition += 1) {
    await page.goto(`${baseUrl}/#book-4-prop-${proposition}`);
    const scene = page.locator(`[data-scene="book-4-prop-${proposition}"]`);
    await scene.waitFor();
    const svg = scene.locator("svg");
    const slider = scene.getByRole("slider");
    if (await slider.count()) {
      const before = await svg.innerHTML();
      await slider.fill(await slider.getAttribute("max"));
      assert.notEqual(await svg.innerHTML(), before, `IV.${proposition} slider changes the construction`);
      continue;
    }

    const action = scene.locator("button.geometry-action");
    let before = await svg.innerHTML();
    let stagesSeen = 0;
    do {
      await action.click();
      const after = await svg.innerHTML();
      assert.notEqual(after, before, `IV.${proposition} step ${stagesSeen + 1} changes the drawing`);
      before = after;
      stagesSeen += 1;
    } while (!(await action.innerText()).includes("Show construction"));
    assert.ok(stagesSeen >= 3, `IV.${proposition} has a meaningful multi-step construction`);
  }

  await context.close();
});

test("specialized Book IV.1-16 constructions remain accessible and contained on a phone viewport", async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  for (let proposition = 1; proposition <= 16; proposition += 1) {
    await page.goto(`${baseUrl}/#book-4-prop-${proposition}`);
    const scene = page.locator(`[data-scene="book-4-prop-${proposition}"]`);
    await scene.waitFor();
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      scene: document.querySelector(".proposition-figure")?.scrollWidth,
    }));
    assert.ok(dimensions.document <= dimensions.viewport, `IV.${proposition} does not create page overflow`);
    assert.ok(dimensions.scene <= dimensions.viewport, `IV.${proposition} figure fits its viewport`);
    await assertNoWcagViolations(page, `IV.${proposition} on mobile`);
  }

  await context.close();
});

test("every specialized Book V.1-25 interaction changes the proof diagram", async () => {
  const context = await browser.newContext({ viewport: { width: 1100, height: 820 } });
  const page = await context.newPage();

  for (let proposition = 1; proposition <= 25; proposition += 1) {
    await page.goto(`${baseUrl}/#book-5-prop-${proposition}`);
    const scene = page.locator(`[data-scene="book-5-prop-${proposition}"]`);
    await scene.waitFor();
    const svg = scene.locator("svg");
    const action = scene.locator("button.geometry-action");
    let before = await svg.innerHTML();
    let stagesSeen = 0;
    do {
      await action.click();
      const after = await svg.innerHTML();
      assert.notEqual(after, before, `V.${proposition} step ${stagesSeen + 1} changes the drawing`);
      before = after;
      stagesSeen += 1;
    } while (!(await action.innerText()).includes("Show construction"));
    assert.ok(stagesSeen >= 3, `V.${proposition} has a meaningful proof sequence`);
  }

  await context.close();
});

test("specialized Book V.1-25 proof diagrams remain accessible and contained on a phone viewport", async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  for (let proposition = 1; proposition <= 25; proposition += 1) {
    await page.goto(`${baseUrl}/#book-5-prop-${proposition}`);
    const scene = page.locator(`[data-scene="book-5-prop-${proposition}"]`);
    await scene.waitFor();
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      scene: document.querySelector(".proposition-figure")?.scrollWidth,
    }));
    assert.ok(dimensions.document <= dimensions.viewport, `V.${proposition} does not create page overflow`);
    assert.ok(dimensions.scene <= dimensions.viewport, `V.${proposition} figure fits its viewport`);
    await assertNoWcagViolations(page, `V.${proposition} on mobile`);
  }

  await context.close();
});

test("every specialized Book VI.1-33 interaction changes the construction", async () => {
  const context = await browser.newContext({ viewport: { width: 1100, height: 820 } });
  const page = await context.newPage();

  for (let proposition = 1; proposition <= 33; proposition += 1) {
    await page.goto(`${baseUrl}/#book-6-prop-${proposition}`);
    const scene = page.locator(`[data-scene="book-6-prop-${proposition}"]`);
    await scene.waitFor();
    const svg = scene.locator("svg");
    const slider = scene.getByRole("slider");
    if (await slider.count()) {
      const before = await svg.innerHTML();
      await slider.fill(await slider.getAttribute("max"));
      assert.notEqual(await svg.innerHTML(), before, `VI.${proposition} slider changes the construction`);
      continue;
    }
    const action = scene.locator("button.geometry-action");
    let before = await svg.innerHTML();
    let stagesSeen = 0;
    do {
      await action.click();
      const after = await svg.innerHTML();
      assert.notEqual(after, before, `VI.${proposition} step ${stagesSeen + 1} changes the drawing`);
      before = after;
      stagesSeen += 1;
    } while (!(await action.innerText()).includes("Show construction"));
    assert.ok(stagesSeen >= 3, `VI.${proposition} has a meaningful construction sequence`);
  }

  await context.close();
});

test("specialized Book VI.1-33 constructions remain accessible and contained on a phone viewport", async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  for (let proposition = 1; proposition <= 33; proposition += 1) {
    await page.goto(`${baseUrl}/#book-6-prop-${proposition}`);
    const scene = page.locator(`[data-scene="book-6-prop-${proposition}"]`);
    await scene.waitFor();
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      scene: document.querySelector(".proposition-figure")?.scrollWidth,
    }));
    assert.ok(dimensions.document <= dimensions.viewport, `VI.${proposition} does not create page overflow`);
    assert.ok(dimensions.scene <= dimensions.viewport, `VI.${proposition} figure fits its viewport`);
    await assertNoWcagViolations(page, `VI.${proposition} on mobile`);
  }

  await context.close();
});

test("every specialized Book VII.1-39 interaction changes the number diagram", async () => {
  const context = await browser.newContext({ viewport: { width: 1100, height: 820 } });
  const page = await context.newPage();
  for (let proposition = 1; proposition <= 39; proposition += 1) {
    await page.goto(`${baseUrl}/#book-7-prop-${proposition}`);
    const scene = page.locator(`[data-scene="book-7-prop-${proposition}"]`);
    await scene.waitFor();
    const svg = scene.locator("svg"), action = scene.locator("button.geometry-action");
    let before = await svg.innerHTML(), stagesSeen = 0;
    do {
      await action.click();
      const after = await svg.innerHTML();
      assert.notEqual(after, before, `VII.${proposition} step ${stagesSeen + 1} changes the drawing`);
      before = after;
      stagesSeen += 1;
    } while (!(await action.innerText()).includes("Show construction"));
    assert.ok(stagesSeen >= 3, `VII.${proposition} has a meaningful proof sequence`);
  }
  await context.close();
});

test("specialized Book VII.1-39 diagrams remain accessible and contained on a phone viewport", async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  for (let proposition = 1; proposition <= 39; proposition += 1) {
    await page.goto(`${baseUrl}/#book-7-prop-${proposition}`);
    const scene = page.locator(`[data-scene="book-7-prop-${proposition}"]`);
    await scene.waitFor();
    const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth, scene: document.querySelector(".proposition-figure")?.scrollWidth }));
    assert.ok(dimensions.document <= dimensions.viewport, `VII.${proposition} does not create page overflow`);
    assert.ok(dimensions.scene <= dimensions.viewport, `VII.${proposition} figure fits its viewport`);
    await assertNoWcagViolations(page, `VII.${proposition} on mobile`);
  }
  await context.close();
});

test("every specialized Book VIII.1-27 interaction changes the continued-proportion diagram", async () => {
  const context = await browser.newContext({ viewport: { width: 1100, height: 820 } }); const page = await context.newPage();
  for (let proposition = 1; proposition <= 27; proposition += 1) {
    await page.goto(`${baseUrl}/#book-8-prop-${proposition}`); const scene = page.locator(`[data-scene="book-8-prop-${proposition}"]`); await scene.waitFor();
    const svg = scene.locator("svg"), action = scene.locator("button.geometry-action"); let before = await svg.innerHTML(), stages = 0;
    do { await action.click(); const after = await svg.innerHTML(); assert.notEqual(after, before, `VIII.${proposition} step ${stages + 1} changes drawing`); before = after; stages += 1; } while (!(await action.innerText()).includes("Show construction"));
    assert.ok(stages >= 3, `VIII.${proposition} has a meaningful sequence`);
  }
  await context.close();
});

test("specialized Book VIII.1-27 diagrams remain accessible and contained on a phone viewport", async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await context.newPage();
  for (let proposition = 1; proposition <= 27; proposition += 1) {
    await page.goto(`${baseUrl}/#book-8-prop-${proposition}`); const scene = page.locator(`[data-scene="book-8-prop-${proposition}"]`); await scene.waitFor();
    const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth, scene: document.querySelector(".proposition-figure")?.scrollWidth }));
    assert.ok(dimensions.document <= dimensions.viewport, `VIII.${proposition} no page overflow`); assert.ok(dimensions.scene <= dimensions.viewport, `VIII.${proposition} fits viewport`); await assertNoWcagViolations(page, `VIII.${proposition} on mobile`);
  }
  await context.close();
});

test("every specialized Book IX.1-36 interaction changes the number diagram", async () => {
  const context = await browser.newContext({ viewport: { width: 1100, height: 820 } }); const page = await context.newPage();
  for (let proposition = 1; proposition <= 36; proposition += 1) { await page.goto(`${baseUrl}/#book-9-prop-${proposition}`); const scene = page.locator(`[data-scene="book-9-prop-${proposition}"]`); await scene.waitFor(); const svg = scene.locator("svg"), action = scene.locator("button.geometry-action"); let before = await svg.innerHTML(), stages = 0; do { await action.click(); const after = await svg.innerHTML(); assert.notEqual(after, before, `IX.${proposition} step ${stages + 1} changes drawing`); before = after; stages += 1; } while (!(await action.innerText()).includes("Show construction")); assert.ok(stages >= 3, `IX.${proposition} sequence`); }
  await context.close();
});

test("specialized Book IX.1-36 diagrams remain accessible and contained on a phone viewport", async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await context.newPage();
  for (let proposition = 1; proposition <= 36; proposition += 1) { await page.goto(`${baseUrl}/#book-9-prop-${proposition}`); const scene = page.locator(`[data-scene="book-9-prop-${proposition}"]`); await scene.waitFor(); const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth, scene: document.querySelector(".proposition-figure")?.scrollWidth })); assert.ok(dimensions.document <= dimensions.viewport, `IX.${proposition} no overflow`); assert.ok(dimensions.scene <= dimensions.viewport, `IX.${proposition} fits`); await assertNoWcagViolations(page, `IX.${proposition} mobile`); }
  await context.close();
});

test("every specialized Book X.1-115 interaction changes the irrational-magnitude diagram", async () => {
  const context = await browser.newContext({ viewport: { width: 1100, height: 820 } }); const page = await context.newPage();
  for (let proposition = 1; proposition <= 115; proposition += 1) { await page.goto(`${baseUrl}/#book-10-prop-${proposition}`); const scene = page.locator(`[data-scene="book-10-prop-${proposition}"]`); await scene.waitFor(); const svg = scene.locator("svg"), action = scene.locator("button.geometry-action"); let before = await svg.innerHTML(), stages = 0; do { await action.click(); const after = await svg.innerHTML(); assert.notEqual(after, before, `X.${proposition} step ${stages + 1} changes drawing`); before = after; stages += 1; } while (!(await action.innerText()).includes("Show construction")); assert.ok(stages >= 3, `X.${proposition} sequence`); }
  await context.close();
});

test("specialized Book X.1-115 diagrams remain accessible and contained on a phone viewport", async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await context.newPage();
  for (let proposition = 1; proposition <= 115; proposition += 1) { await page.goto(`${baseUrl}/#book-10-prop-${proposition}`); const scene = page.locator(`[data-scene="book-10-prop-${proposition}"]`); await scene.waitFor(); const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth, scene: document.querySelector(".proposition-figure")?.scrollWidth })); assert.ok(dimensions.document <= dimensions.viewport, `X.${proposition} no overflow`); assert.ok(dimensions.scene <= dimensions.viewport, `X.${proposition} fits`); await assertNoWcagViolations(page, `X.${proposition} mobile`); }
  await context.close();
});

test("every specialized Book XI.1-39 interaction changes the spatial diagram", async () => {
  const context = await browser.newContext({ viewport: { width: 1100, height: 820 } }); const page = await context.newPage();
  for (let proposition = 1; proposition <= 39; proposition += 1) { await page.goto(`${baseUrl}/#book-11-prop-${proposition}`); const scene = page.locator(`[data-scene="book-11-prop-${proposition}"]`); await scene.waitFor(); const svg = scene.locator("svg"), action = scene.locator("button.geometry-action"); let before = await svg.innerHTML(), stages = 0; do { await action.click(); const after = await svg.innerHTML(); assert.notEqual(after, before, `XI.${proposition} step ${stages + 1} changes drawing`); before = after; stages += 1; } while (!(await action.innerText()).includes("Show construction")); assert.ok(stages >= 3, `XI.${proposition} sequence`); }
  await context.close();
});

test("specialized Book XI.1-39 diagrams remain accessible and contained on a phone viewport", async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await context.newPage();
  for (let proposition = 1; proposition <= 39; proposition += 1) { await page.goto(`${baseUrl}/#book-11-prop-${proposition}`); const scene = page.locator(`[data-scene="book-11-prop-${proposition}"]`); await scene.waitFor(); const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth, scene: document.querySelector(".proposition-figure")?.scrollWidth })); assert.ok(dimensions.document <= dimensions.viewport, `XI.${proposition} no overflow`); assert.ok(dimensions.scene <= dimensions.viewport, `XI.${proposition} fits`); await assertNoWcagViolations(page, `XI.${proposition} mobile`); }
  await context.close();
});

test("every specialized Book XII.1-18 interaction changes the exhaustion or solid diagram", async () => {
  const context = await browser.newContext({ viewport: { width: 1100, height: 820 } }); const page = await context.newPage();
  for (let proposition = 1; proposition <= 18; proposition += 1) { await page.goto(`${baseUrl}/#book-12-prop-${proposition}`); const scene = page.locator(`[data-scene="book-12-prop-${proposition}"]`); await scene.waitFor(); const svg = scene.locator("svg"), action = scene.locator("button.geometry-action"); let before = await svg.innerHTML(), stages = 0; do { await action.click(); const after = await svg.innerHTML(); assert.notEqual(after, before, `XII.${proposition} step ${stages + 1} changes drawing`); before = after; stages += 1; } while (!(await action.innerText()).includes("Show construction")); assert.ok(stages >= 3, `XII.${proposition} sequence`); }
  await context.close();
});

test("specialized Book XII.1-18 diagrams remain accessible and contained on a phone viewport", async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await context.newPage();
  for (let proposition = 1; proposition <= 18; proposition += 1) { await page.goto(`${baseUrl}/#book-12-prop-${proposition}`); const scene = page.locator(`[data-scene="book-12-prop-${proposition}"]`); await scene.waitFor(); const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth, scene: document.querySelector(".proposition-figure")?.scrollWidth })); assert.ok(dimensions.document <= dimensions.viewport, `XII.${proposition} no overflow`); assert.ok(dimensions.scene <= dimensions.viewport, `XII.${proposition} fits`); await assertNoWcagViolations(page, `XII.${proposition} mobile`); }
  await context.close();
});

test("every Book XIII.1-18 interaction changes its golden-ratio or regular-solid diagram", async () => {
  const context = await browser.newContext({ viewport: { width: 1100, height: 820 } }); const page = await context.newPage();
  for (let proposition = 1; proposition <= 18; proposition += 1) { await page.goto(`${baseUrl}/#book-13-prop-${proposition}`); const scene = page.locator(`[data-scene="book-13-prop-${proposition}"]`); await scene.waitFor(); const svg = scene.locator("svg"), action = scene.locator("button.geometry-action"); let before = await svg.innerHTML(), stages = 0; do { await action.click(); const after = await svg.innerHTML(); assert.notEqual(after, before, `XIII.${proposition} step ${stages + 1} changes drawing`); before = after; stages += 1; } while (!(await action.innerText()).includes("Show construction")); assert.ok(stages >= 3, `XIII.${proposition} sequence`); }
  await context.close();
});

test("Book XIII.1-18 diagrams remain accessible and contained on a phone viewport", async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await context.newPage();
  for (let proposition = 1; proposition <= 18; proposition += 1) { await page.goto(`${baseUrl}/#book-13-prop-${proposition}`); const scene = page.locator(`[data-scene="book-13-prop-${proposition}"]`); await scene.waitFor(); const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth, scene: document.querySelector(".proposition-figure")?.scrollWidth })); assert.ok(dimensions.document <= dimensions.viewport, `XIII.${proposition} no overflow`); assert.ok(dimensions.scene <= dimensions.viewport, `XIII.${proposition} fits`); await assertNoWcagViolations(page, `XIII.${proposition} mobile`); }
  await context.close();
});

test("every Book I interaction changes the geometry at every step", async () => {
  const context = await browser.newContext({ viewport: { width: 1100, height: 820 } });
  const page = await context.newPage();

  for (let proposition = 1; proposition <= 48; proposition += 1) {
    await page.goto(`${baseUrl}/#book-1-prop-${proposition}`);
    const figure = page.locator(".proposition-figure");
    await figure.waitFor();
    const svg = figure.locator("svg");
    const slider = figure.getByRole("slider");
    if (await slider.count()) {
      const before = await svg.innerHTML();
      await slider.fill(await slider.getAttribute("max"));
      assert.notEqual(await svg.innerHTML(), before, `I.${proposition} slider changes the construction`);
      continue;
    }

    const action = figure.locator("button.geometry-action");
    const finished = await svg.innerHTML();
    await action.click();
    const given = await svg.innerHTML();
    assert.notEqual(given, finished, `I.${proposition} can return to its given state`);
    await action.click();
    const construction = await svg.innerHTML();
    assert.notEqual(construction, given, `I.${proposition} construction step changes the drawing`);
    await action.click();
    assert.notEqual(await svg.innerHTML(), construction, `I.${proposition} result step changes the drawing`);
  }

  await context.close();
});

test("renders and exercises every Book III-XIII construction", async () => {
  const context = await browser.newContext({ viewport: { width: 1100, height: 820 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  for (let book = 3; book <= 13; book += 1) {
    const data = JSON.parse(await readFile(new URL(`../app/data/book-${book}.json`, import.meta.url), "utf8"));
    const propositions = data.sections
      .filter((section) => section.id.startsWith("propositions"))
      .flatMap((section) => section.items);
    for (const proposition of propositions) {
      await page.goto(`${baseUrl}/#book-${book}-${proposition.id}`);
      const scene = page.locator(`[data-scene="book-${book}-prop-${proposition.number}"]`);
      await scene.waitFor();
      const range = scene.getByRole("slider");
      const svg = scene.locator("svg");
      const before = await svg.innerHTML();
      if (await range.count()) {
        assert.equal(await range.count(), 1, `Book ${book}, proposition ${proposition.number} has one control`);
        await range.evaluate((element) => {
          const input = element;
          input.value = input.max;
          input.dispatchEvent(new Event("input", { bubbles: true }));
        });
      } else {
        const action = scene.getByRole("button", { name: "Show construction" });
        assert.equal(await action.count(), 1, `Book ${book}, proposition ${proposition.number} has one step control`);
        await action.click();
        await scene.getByRole("button", { name: "Show next step" }).waitFor();
      }
      assert.notEqual(await svg.innerHTML(), before, `Book ${book}, proposition ${proposition.number} geometry updates`);
    }
  }

  assert.deepEqual(errors, []);
  await context.close();
});

test("has no automated WCAG A/AA violations in the mobile contents dialog", async () => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/#book-1-prop-1`);
  await page.getByRole("button", { name: "Open table of contents" }).click();
  await page.getByRole("dialog", { name: "Book I" }).waitFor();
  await assertNoWcagViolations(page, "mobile contents dialog");
  await context.close();
});
