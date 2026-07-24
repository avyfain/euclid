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

test("Book VI.8 puts the right angle at A and drops AD perpendicular to BC", () => {
  const primitives = BOOK_SIX_SCENES["prop-8"].build(0);
  const points = Object.fromEntries(
    primitives
      .filter(({ kind }) => kind === "point")
      .map(({ label, x, y }) => [label, [x, y]]),
  );
  const [a, b, c, d] = ["A", "B", "C", "D"].map((name) => points[name]);
  const vector = ([x1, y1], [x2, y2]) => [x2 - x1, y2 - y1];
  const dot = ([x1, y1], [x2, y2]) => x1 * x2 + y1 * y2;
  const squaredLength = ([x, y]) => x ** 2 + y ** 2;

  assert.equal(dot(vector(a, b), vector(a, c)), 0);
  assert.equal(dot(vector(a, d), vector(b, c)), 0);
  assert.equal(d[1], b[1]);
  assert.ok(d[0] > b[0] && d[0] < c[0]);
  assert.equal(
    squaredLength(vector(a, d)),
    Math.sqrt(squaredLength(vector(b, d)) * squaredLength(vector(d, c))),
  );
});

test("Book VI.31 keeps its three attached squares inside the scene", () => {
  const primitives = BOOK_SIX_SCENES["prop-31"].build(0);
  const figures = primitives.filter(({ kind }) => kind === "polygon");
  assert.equal(figures.length, 4);

  for (const figure of figures) {
    for (const [x, y] of figure.points) {
      assert.ok(x >= 0 && x <= 640);
      assert.ok(y >= 0 && y <= 380);
    }
  }

  const [triangle, legOne, legTwo, hypotenuse] = figures;
  assert.deepEqual(legOne.points.slice(0, 2), [triangle.points[1], triangle.points[0]]);
  assert.deepEqual(legTwo.points.slice(0, 2), [triangle.points[0], triangle.points[2]]);
  assert.deepEqual(hypotenuse.points.slice(0, 2), [triangle.points[1], triangle.points[2]]);

  const squaredLength = ([x1, y1], [x2, y2]) => (x2 - x1) ** 2 + (y2 - y1) ** 2;
  assert.equal(
    squaredLength(...hypotenuse.points),
    squaredLength(...legOne.points) + squaredLength(...legTwo.points),
  );

  const points = Object.fromEntries(
    primitives
      .filter(({ kind }) => kind === "point")
      .map(({ label, x, y }) => [label, [x, y]]),
  );
  assert.deepEqual(Object.keys(points), ["A", "B", "C", "D"]);

  const [a, b, c, d] = ["A", "B", "C", "D"].map((name) => points[name]);
  const ad = [d[0] - a[0], d[1] - a[1]];
  const bc = [c[0] - b[0], c[1] - b[1]];
  assert.ok(Math.abs(ad[0] * bc[0] + ad[1] * bc[1]) < 1e-8);
});
