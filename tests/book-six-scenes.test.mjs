import assert from "node:assert/strict";
import test from "node:test";
import { BOOK_SIX_SCENES, validateBookSixScenes } from "../app/data/book-6-figure-data.ts";

test("defines finite, proposition-specific constructions for Book VI.1-33", () => {
  assert.deepEqual(Object.keys(BOOK_SIX_SCENES), Array.from({ length: 33 }, (_, index) => `prop-${index + 1}`));
  assert.equal(validateBookSixScenes(), true);
  for (const scene of Object.values(BOOK_SIX_SCENES)) {
    assert.ok(scene.description.length > 90, scene.id);
    assert.ok(scene.steps.length >= 3, scene.id);
    const values = scene.control.kind === "range" ? [scene.control.min, scene.control.initial, scene.control.max] : [0];
    for (const value of values) {
      assert.ok(scene.build(value).length >= 4, scene.id);
    }
  }
});

test("Book VI's key proportional constructions satisfy their claimed equalities", () => {
  assert.equal(BOOK_SIX_SCENES["prop-11"].invariant(0), true);
  assert.equal(BOOK_SIX_SCENES["prop-12"].invariant(0), true);
  assert.equal(BOOK_SIX_SCENES["prop-13"].invariant(0), true);
  assert.equal(BOOK_SIX_SCENES["prop-16"].invariant(0), true);
  assert.equal(BOOK_SIX_SCENES["prop-17"].invariant(0), true);
  assert.equal(BOOK_SIX_SCENES["prop-19"].invariant(0), true);
  assert.equal(BOOK_SIX_SCENES["prop-23"].invariant(0), true);
  assert.equal(BOOK_SIX_SCENES["prop-30"].invariant(0), true);
  assert.equal(BOOK_SIX_SCENES["prop-33"].invariant(0), true);
});
