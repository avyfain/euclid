import assert from "node:assert/strict";
import test from "node:test";
import { BOOK_THREE_SCENES, validateBookThreeScenes } from "../app/data/book-3-figure-data.ts";

function points(scene, value = 0.5) {
  return Object.fromEntries(
    scene.build(value)
      .filter((primitive) => primitive.kind === "point")
      .map((primitive) => [primitive.label, primitive]),
  );
}

function distance(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function opening(vertex, first, second) {
  const one = { x: first.x - vertex.x, y: first.y - vertex.y };
  const two = { x: second.x - vertex.x, y: second.y - vertex.y };
  return Math.acos((one.x * two.x + one.y * two.y) / (Math.hypot(one.x, one.y) * Math.hypot(two.x, two.y)));
}

test("defines finite and proposition-specific constructions for Book III.1-37", () => {
  assert.deepEqual(
    Object.keys(BOOK_THREE_SCENES),
    Array.from({ length: 37 }, (_, index) => `prop-${index + 1}`),
  );
  assert.equal(validateBookThreeScenes(), true);

  for (const scene of Object.values(BOOK_THREE_SCENES)) {
    assert.ok(scene.description.length > 60, scene.id);
    assert.ok(scene.steps.length >= 3, scene.id);
    for (const value of [0.12, 0.5, 0.88]) {
      const primitives = scene.build(value);
      assert.ok(primitives.length >= 7, scene.id);
      assert.ok(
        primitives.every((primitive) =>
          Object.values(primitive).every((candidate) =>
            typeof candidate !== "number" || Number.isFinite(candidate),
          ),
        ),
        `${scene.id} has finite geometry at ${value}`,
      );
    }
  }
});

test("Book III.33 and III.34 copy the stated inscribed angle exactly", () => {
  for (const proposition of ["prop-33", "prop-34"]) {
    const scene = BOOK_THREE_SCENES[proposition];
    const named = points(scene);
    const givenLines = scene.build(0).filter((primitive) => primitive.kind === "line" && primitive.x1 === named.V.x && primitive.y1 === named.V.y);
    assert.equal(givenLines.length, 2, `${proposition} has one given angle`);
    const givenOpening = opening(named.V, { x: givenLines[0].x2, y: givenLines[0].y2 }, { x: givenLines[1].x2, y: givenLines[1].y2 });
    assert.ok(Math.abs(givenOpening - opening(named.C, named.A, named.B)) < 1e-9, `${proposition} copies its angle`);
  }
});

test("Book III.35-37 draw the exact power-of-a-point relation", () => {
  for (const value of [0.14, 0.5, 0.86]) {
    const named = points(BOOK_THREE_SCENES["prop-35"], value);
    assert.ok(Math.abs(distance(named.P, named.A) * distance(named.P, named.B) - distance(named.P, named.C) * distance(named.P, named.D)) < 1e-8);
  }

  for (const proposition of ["prop-36", "prop-37"]) {
    const named = points(BOOK_THREE_SCENES[proposition]);
    assert.ok(Math.abs(distance(named.P, named.T) ** 2 - distance(named.P, named.A) * distance(named.P, named.B)) < 1e-8, `${proposition} power equality`);
    const radius = { x: named.O.x - named.T.x, y: named.O.y - named.T.y };
    const tangent = { x: named.P.x - named.T.x, y: named.P.y - named.T.y };
    assert.ok(Math.abs(radius.x * tangent.x + radius.y * tangent.y) < 1e-8, `${proposition} radius is perpendicular to tangent`);
  }
});
