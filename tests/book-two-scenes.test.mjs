import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BOOK_TWO_SCENES, validateBookTwoScenes } from "../app/data/book-2-figure-data.ts";

const approximatelyEqual = (actual, expected, message) => {
  assert.ok(Math.abs(actual - expected) < 1e-8, `${message}: expected ${expected}, received ${actual}`);
};

const pointNamed = (primitives, name) => {
  const match = primitives.find((primitive) => primitive.kind === "point" && primitive.label === name);
  assert.ok(match, `point ${name} exists`);
  return match;
};

test("defines a finite, mathematically valid scene for every Book II proposition", async () => {
  const book = JSON.parse(
    await readFile(new URL("../app/data/book-2.json", import.meta.url), "utf8"),
  );
  const propositionIds = book.sections
    .flatMap((section) => section.items)
    .filter((item) => item.id.startsWith("prop-"))
    .map((item) => item.id);

  assert.deepEqual(Object.keys(BOOK_TWO_SCENES), propositionIds);
  assert.equal(validateBookTwoScenes(), true);

  for (const scene of Object.values(BOOK_TWO_SCENES)) {
    assert.ok(scene.steps.length >= 3 && scene.steps.length <= 4, scene.id);
    const samples =
      scene.control.kind === "range"
        ? [scene.control.min, scene.control.initial, scene.control.max]
        : [0];
    for (const value of samples) {
      assert.equal(scene.invariant(value), true, `${scene.id} invariant at ${value}`);
      const primitives = scene.build(value);
      assert.ok(primitives.length >= 4, `${scene.id} has enough geometry`);
      assert.ok(
        primitives.every((primitive) =>
          Object.values(primitive).every((candidate) =>
            typeof candidate !== "number" || Number.isFinite(candidate),
          ),
        ),
        `${scene.id} contains only finite coordinates`,
      );
      assert.ok(scene.status(value, scene.steps.length - 1).length > 8, scene.id);
    }
  }
});

test("draws the revised Book II lengths and areas to one consistent scale", () => {
  for (const displacement of [0.15, 0.42, 0.76]) {
    const primitives = BOOK_TWO_SCENES["prop-5"].build(displacement);
    const a = pointNamed(primitives, "A"), c = pointNamed(primitives, "C");
    const d = pointNamed(primitives, "D"), b = pointNamed(primitives, "B");
    const squares = primitives.filter((primitive) => primitive.kind === "rect");
    approximatelyEqual(c.x - a.x, b.x - c.x, "II.5 C bisects AB");
    approximatelyEqual(d.x - c.x, (b.x - c.x) * displacement, "II.5 CD follows the control");
    approximatelyEqual(squares[0].width, b.x - c.x, "II.5 square is on CB");
    approximatelyEqual(squares[1].width, d.x - c.x, "II.5 inner square is on CD");
  }

  for (const added of [0.16, 0.38, 0.68]) {
    const primitives = BOOK_TWO_SCENES["prop-6"].build(added);
    const a = pointNamed(primitives, "A"), c = pointNamed(primitives, "C");
    const b = pointNamed(primitives, "B"), d = pointNamed(primitives, "D");
    const squares = primitives.filter((primitive) => primitive.kind === "rect");
    approximatelyEqual(c.x - a.x, b.x - c.x, "II.6 C bisects AB");
    approximatelyEqual(d.x - b.x, (b.x - c.x) * added, "II.6 DB follows the control");
    approximatelyEqual(squares[0].width, d.x - c.x, "II.6 outer square is on CD");
    approximatelyEqual(squares[1].width, b.x - c.x, "II.6 inner square is on CB");
  }

  for (const bcRatio of [0.16, 0.34, 0.62]) {
    const primitives = BOOK_TWO_SCENES["prop-8"].build(bcRatio);
    const a = pointNamed(primitives, "A"), c = pointNamed(primitives, "C");
    const b = pointNamed(primitives, "B"), d = pointNamed(primitives, "D");
    const [outer, inner] = primitives.filter((primitive) => primitive.kind === "rect");
    approximatelyEqual(b.x - c.x, d.x - b.x, "II.8 BD copies BC");
    approximatelyEqual(outer.width, d.x - a.x, "II.8 outer square is on AD");
    approximatelyEqual(inner.width, c.x - a.x, "II.8 inner square is on AC");
    approximatelyEqual(
      outer.width ** 2 - inner.width ** 2,
      4 * (b.x - a.x) * (b.x - c.x),
      "II.8 gnomon is four AB by BC",
    );
  }

  for (const split of [0.24, 0.46, 0.72]) {
    const primitives = BOOK_TWO_SCENES["prop-14"].build(split);
    const [rectangle, square] = primitives.filter((primitive) => primitive.kind === "rect");
    const e = pointNamed(primitives, "E"), h = pointNamed(primitives, "H");
    approximatelyEqual(rectangle.width * rectangle.height, square.width ** 2, "II.14 target areas agree");
    approximatelyEqual(e.y - h.y, square.width, "II.14 EH is the target square's side");
  }
});
