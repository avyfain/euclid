import assert from "node:assert/strict";
import test from "node:test";
import { BOOK_NINE_SCENES, validateBookNineScenes } from "../app/data/book-9-figure-data.ts";
test("defines finite power, factor, and parity diagrams for Book IX.1-36", () => { assert.deepEqual(Object.keys(BOOK_NINE_SCENES), Array.from({ length: 36 }, (_, index) => `prop-${index + 1}`)); assert.equal(validateBookNineScenes(), true); for (const scene of Object.values(BOOK_NINE_SCENES)) { assert.ok(scene.description.length > 80, scene.id); assert.ok(scene.steps.length >= 3, scene.id); } });
