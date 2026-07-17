import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BOOK_TWO_SCENES, validateBookTwoScenes } from "../app/data/book-2-figure-data.ts";

test("defines a finite, mathematically valid scene for every Book II proposition", async () => {
  const book = JSON.parse(
    await readFile(new URL("../app/data/book-2.json", import.meta.url), "utf8"),
  );
  const propositionIds = book.sections
    .flatMap((section) => section.items)
    .filter((item) => item.id.startsWith("prop-"))
    .map((item) => item.id);

  assert.deepEqual(Object.keys(BOOK_TWO_SCENES), propositionIds);
  assert.equal(validateBookTwoScenes(), true);

  for (const scene of Object.values(BOOK_TWO_SCENES)) {
    assert.ok(scene.steps.length >= 3 && scene.steps.length <= 4, scene.id);
    const samples =
      scene.control.kind === "range"
        ? [scene.control.min, scene.control.initial, scene.control.max]
        : [0];
    for (const value of samples) {
      assert.equal(scene.invariant(value), true, `${scene.id} invariant at ${value}`);
      const primitives = scene.build(value);
      assert.ok(primitives.length >= 4, `${scene.id} has enough geometry`);
      assert.ok(
        primitives.every((primitive) =>
          Object.values(primitive).every((candidate) =>
            typeof candidate !== "number" || Number.isFinite(candidate),
          ),
        ),
        `${scene.id} contains only finite coordinates`,
      );
      assert.ok(scene.status(value, scene.steps.length - 1).length > 8, scene.id);
    }
  }
});
