import assert from "node:assert/strict";
import test from "node:test";
import { BOOK_ELEVEN_SCENES, validateBookElevenScenes } from "../app/data/book-11-figure-data.ts";

test("defines finite, proposition-specific spatial diagrams for Book XI.1-39", () => {
  assert.deepEqual(Object.keys(BOOK_ELEVEN_SCENES), Array.from({ length: 39 }, (_, index) => `prop-${index + 1}`));
  assert.equal(validateBookElevenScenes(), true);
  for (const scene of Object.values(BOOK_ELEVEN_SCENES)) {
    assert.ok(scene.description.length > 90, scene.id);
    assert.equal(scene.steps.length, 3, scene.id);
  }
});
