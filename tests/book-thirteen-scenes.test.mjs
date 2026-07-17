import assert from "node:assert/strict";
import test from "node:test";
import { BOOK_THIRTEEN_SCENES, validateBookThirteenScenes } from "../app/data/book-13-figure-data.ts";

test("adds proposition-specific regular-figure and regular-solid diagrams for Book XIII.7-18", () => {
  assert.deepEqual(Object.keys(BOOK_THIRTEEN_SCENES), Array.from({ length: 12 }, (_, index) => `prop-${index + 7}`));
  assert.equal(validateBookThirteenScenes(), true);
  for (const scene of Object.values(BOOK_THIRTEEN_SCENES)) {
    assert.ok(scene.description.length > 90, scene.id);
    assert.equal(scene.steps.length, 3, scene.id);
  }
});
