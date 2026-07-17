import assert from "node:assert/strict";
import test from "node:test";
import { addGeometricNotation } from "../app/geometric-notation.ts";

test("prefixes named angles and triangles with distinct notation", () => {
  const html =
    '<p>Let <em>ABC</em> be a triangle having the angles <em>ABC</em>, <em>BCA</em> equal to the angle <em>DEF</em>.</p>';

  assert.equal(
    addGeometricNotation(html),
    '<p>Let <span class="triangle" aria-label="triangle A B C">ABC</span> be a triangle having the angles <span class="angle" aria-label="angle A B C">ABC</span>, <span class="angle" aria-label="angle B C A">BCA</span> equal to the angle <span class="angle" aria-label="angle D E F">DEF</span>.</p>',
  );
});

test("prefixes triangle lists without touching other three-letter labels", () => {
  const html =
    '<p>The triangles <em>ABC</em>, <em>DEF</em> lie in the circle <em>ABC</em>.</p>';

  assert.equal(
    addGeometricNotation(html),
    '<p>The triangles <span class="triangle" aria-label="triangle A B C">ABC</span>, <span class="triangle" aria-label="triangle D E F">DEF</span> lie in the circle <em>ABC</em>.</p>',
  );
});

test("supports angles named at one point and later-book italic markup", () => {
  const html =
    '<p>The angle at <span class="source-italic">A</span> equals the angle <span class="source-line-number" aria-hidden="true" data-line="10"></span><span class="source-italic">BCD</span>.</p>';

  assert.equal(
    addGeometricNotation(html),
    '<p>The angle at <span class="angle" aria-label="angle A">A</span> equals the angle <span class="source-line-number" aria-hidden="true" data-line="10"></span><span class="angle" aria-label="angle B C D">BCD</span>.</p>',
  );
});
