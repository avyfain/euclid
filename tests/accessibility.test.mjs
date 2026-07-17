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
