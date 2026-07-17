import assert from "node:assert/strict";
import test from "node:test";
import { BOOK_TWELVE_SCENES, validateBookTwelveScenes } from "../app/data/book-12-figure-data.ts";

test("defines finite, proposition-specific exhaustion and solid diagrams for Book XII.1-18", () => {
  assert.deepEqual(Object.keys(BOOK_TWELVE_SCENES), Array.from({ length: 18 }, (_, index) => `prop-${index + 1}`));
  assert.equal(validateBookTwelveScenes(), true);
  for (const scene of Object.values(BOOK_TWELVE_SCENES)) {
    assert.ok(scene.description.length > 90, scene.id);
    assert.equal(scene.steps.length, 3, scene.id);
  }
});
