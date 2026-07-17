import assert from "node:assert/strict";
import test from "node:test";
import { BOOK_EIGHT_SCENES, validateBookEightScenes } from "../app/data/book-8-figure-data.ts";
test("defines finite continued-proportion diagrams for Book VIII.1-27", () => {
  assert.deepEqual(Object.keys(BOOK_EIGHT_SCENES), Array.from({ length: 27 }, (_, index) => `prop-${index + 1}`));
  assert.equal(validateBookEightScenes(), true);
  for (const scene of Object.values(BOOK_EIGHT_SCENES)) { assert.ok(scene.description.length > 90, scene.id); assert.ok(scene.steps.length >= 3, scene.id); }
});
