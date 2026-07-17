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

test("has no automated WCAG A/AA violations in core reader states", async () => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(baseUrl);
  await page.waitForSelector("h1");
  await assertNoWcagViolations(page, "initial reader");

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
      assert.equal(await range.count(), 1, `Book ${book}, proposition ${proposition.number} has one control`);
      const svg = scene.locator("svg");
      const before = await svg.innerHTML();
      await range.evaluate((element) => {
        const input = element;
        input.value = input.max;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
      assert.notEqual(await svg.innerHTML(), before, `Book ${book}, proposition ${proposition.number} geometry updates`);
    }
  }

  assert.deepEqual(errors, []);
  await context.close();
});

test("has no automated WCAG A/AA violations in the mobile contents dialog", async () => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto(baseUrl);
  await page.getByRole("button", { name: "Open table of contents" }).click();
  await page.getByRole("dialog", { name: "Book I" }).waitFor();
  await assertNoWcagViolations(page, "mobile contents dialog");
  await context.close();
});
