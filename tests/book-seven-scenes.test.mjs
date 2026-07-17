import assert from "node:assert/strict";
import test from "node:test";
import { BOOK_SEVEN_SCENES, validateBookSevenScenes } from "../app/data/book-7-figure-data.ts";

test("defines finite, proposition-specific number diagrams for Book VII.1-39", () => {
  assert.deepEqual(Object.keys(BOOK_SEVEN_SCENES), Array.from({ length: 39 }, (_, index) => `prop-${index + 1}`));
  assert.equal(validateBookSevenScenes(), true);
  for (const scene of Object.values(BOOK_SEVEN_SCENES)) {
    assert.ok(scene.description.length > 90, scene.id);
    assert.ok(scene.steps.length >= 3, scene.id);
    assert.equal(scene.control.kind, "steps");
  }
});
