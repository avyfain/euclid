import assert from "node:assert/strict";
import test from "node:test";
import { BOOK_FOUR_SCENES, validateBookFourScenes } from "../app/data/book-4-figure-data.ts";

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

test("defines finite, proposition-specific constructions for Book IV.1-16", () => {
  assert.deepEqual(
    Object.keys(BOOK_FOUR_SCENES),
    Array.from({ length: 16 }, (_, index) => `prop-${index + 1}`),
  );
  assert.equal(validateBookFourScenes(), true);

  for (const scene of Object.values(BOOK_FOUR_SCENES)) {
    assert.ok(scene.description.length > 80, scene.id);
    assert.ok(scene.steps.length >= 3, scene.id);
    for (const value of scene.control.kind === "range" ? [scene.control.min, scene.control.initial, scene.control.max] : [0]) {
      const primitives = scene.build(value);
      assert.ok(primitives.length >= 7, scene.id);
      assert.ok(
        primitives.every((primitive) => Object.values(primitive).every((candidate) => {
          if (typeof candidate === "number") return Number.isFinite(candidate);
          if (Array.isArray(candidate)) return candidate.flat().every((coordinate) => Number.isFinite(coordinate));
          return true;
        })),
        `${scene.id} has finite geometry at ${value}`,
      );
    }
  }
});

test("Book IV construction equalities are literal geometry, not labels", () => {
  for (const value of [0.16, 0.56, 0.88]) {
    const named = points(BOOK_FOUR_SCENES["prop-1"], value);
    assert.ok(Math.abs(distance(named.D, named.E) - distance(named.A, named.B)) < 1e-8, "IV.1 chord equals the given line");
  }

  const incircle = points(BOOK_FOUR_SCENES["prop-4"]);
  assert.ok(Math.abs(distance(incircle.I, incircle.E) - distance(incircle.I, incircle.F)) < 1e-8);
  assert.ok(Math.abs(distance(incircle.I, incircle.E) - distance(incircle.I, incircle.G)) < 1e-8);

  const circumcircle = points(BOOK_FOUR_SCENES["prop-5"]);
  assert.ok(Math.abs(distance(circumcircle.O, circumcircle.A) - distance(circumcircle.O, circumcircle.B)) < 1e-8);
  assert.ok(Math.abs(distance(circumcircle.O, circumcircle.A) - distance(circumcircle.O, circumcircle.C)) < 1e-8);

  for (const value of [0.12, 0.5, 0.86]) {
    const named = points(BOOK_FOUR_SCENES["prop-10"], value);
    assert.ok(Math.abs(distance(named.A, named.B) - distance(named.A, named.C)) < 1e-8);
    assert.ok(Math.abs(opening(named.B, named.A, named.C) - 2 * opening(named.A, named.B, named.C)) < 1e-8);
  }

  const hexagon = points(BOOK_FOUR_SCENES["prop-15"]);
  assert.ok(Math.abs(distance(hexagon.O, hexagon.A) - distance(hexagon.A, hexagon.B)) < 1e-8, "IV.15 side equals radius");
});
