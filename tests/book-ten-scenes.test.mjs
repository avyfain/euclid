import assert from "node:assert/strict";
import test from "node:test";
import { BOOK_TEN_SCENES, validateBookTenScenes } from "../app/data/book-10-figure-data.ts";

test("defines finite, proposition-specific irrational-magnitude diagrams for Book X.1-115", () => {
  assert.deepEqual(Object.keys(BOOK_TEN_SCENES), Array.from({ length: 115 }, (_, index) => `prop-${index + 1}`));
  assert.equal(validateBookTenScenes(), true);
  for (const scene of Object.values(BOOK_TEN_SCENES)) {
    assert.ok(scene.description.length > 100, scene.id);
    assert.equal(scene.steps.length, 3, scene.id);
    assert.ok(scene.build(0).length > 0, scene.id);
  }
});
