import test from "node:test";
import assert from "node:assert/strict";
import { PROPOSITION_FIGURES } from "../app/data/proposition-figure-data.ts";

const bearing = (from, to) =>
  (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;

const approximatelyEqual = (actual, expected, message) => {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${message}: expected ${expected}, got ${actual}`);
};

test("Book I.32 angle arcs terminate on their defining rays", () => {
  const { points, elements } = PROPOSITION_FIGURES["prop-32"];
  const angles = elements.filter((element) => element.kind === "angle");

  assert.equal(angles.length, 4);

  const expectedRays = [
    ["c", "a", "e"],
    ["c", "e", "d"],
    ["a", "c", "b"],
    ["b", "a", "c"],
  ];

  angles.forEach((angle, index) => {
    const [center, start, end] = expectedRays[index];
    assert.equal(angle.center, center);
    approximatelyEqual(angle.start, bearing(points[center], points[start]), `angle ${index + 1} start`);
    approximatelyEqual(angle.end, bearing(points[center], points[end]), `angle ${index + 1} end`);
  });
});
