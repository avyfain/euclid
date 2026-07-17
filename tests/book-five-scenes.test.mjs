import assert from "node:assert/strict";
import test from "node:test";
import { BOOK_FIVE_SCENES, validateBookFiveScenes } from "../app/data/book-5-figure-data.ts";

test("defines finite, proposition-specific ratio constructions for Book V.1-25", () => {
  assert.deepEqual(
    Object.keys(BOOK_FIVE_SCENES),
    Array.from({ length: 25 }, (_, index) => `prop-${index + 1}`),
  );
  assert.equal(validateBookFiveScenes(), true);

  for (const scene of Object.values(BOOK_FIVE_SCENES)) {
    assert.ok(scene.description.length > 100, scene.id);
    assert.ok(scene.steps.length >= 3, scene.id);
    assert.equal(scene.control.kind, "steps", `${scene.id} has a proof sequence rather than a decorative slider`);
    const primitives = scene.build(0);
    assert.ok(primitives.length >= 7, scene.id);
    assert.ok(
      primitives.every((primitive) => Object.values(primitive).every((candidate) => typeof candidate !== "number" || Number.isFinite(candidate))),
      `${scene.id} has finite geometry`,
    );
  }
});

test("Book V examples encode their stated arithmetic relations", () => {
  const relations = [
    [1, "A is 3·B exactly when C is 3·D"],
    [2, "A + E is to B as C + F is to D"],
    [12, "A + C + E : B + D + F = 12:18 = 2:3"],
    [16, "A:B = C:D implies A:C = B:D"],
    [17, "(A+B):B = (C+D):D and (A−B):B = (C−D):D"],
    [23, "A:C = D:F = 4:1"],
    [25, "A + D = 11 > 10 = B + C"],
  ];
  for (const [proposition, conclusion] of relations) {
    const scene = BOOK_FIVE_SCENES[`prop-${proposition}`];
    assert.ok(scene.build(0).some((primitive) => primitive.kind === "label" && primitive.text === conclusion), `V.${proposition} conclusion is rendered`);
    assert.equal(scene.invariant(0), true, `V.${proposition} arithmetic invariant`);
  }
});
