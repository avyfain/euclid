import type { EuclidSceneSpec, ScenePrimitive, SceneTone } from "./book-2-figure-data";

const line = (x1: number, y1: number, x2: number, y2: number, tone: SceneTone = "line"): ScenePrimitive => ({ kind: "line", x1, y1, x2, y2, tone });
const rect = (x: number, y: number, width: number, height: number, tone: SceneTone = "area"): ScenePrimitive => ({ kind: "rect", x, y, width, height, tone });
const label = (x: number, y: number, text: string, tone: SceneTone = "line"): ScenePrimitive => ({ kind: "label", x, y, text, tone });
const point = (x: number, y: number, text: string, dx = 0, dy = -10): ScenePrimitive => ({ kind: "point", x, y, label: text, dx, dy });
const circle = (cx: number, cy: number, r: number, tone: SceneTone = "construction"): ScenePrimitive => ({ kind: "circle", cx, cy, r, tone });
const polygon = (points: Array<[number, number]>, tone: SceneTone = "area"): ScenePrimitive => ({ kind: "polygon", points, tone });
const fixed = (value: number) => value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
const finite = (value: number) => Number.isFinite(value);

function regularPoints(cx: number, cy: number, radius: number, sides: number, rotation = -Math.PI / 2) {
  return Array.from({ length: sides }, (_, index): [number, number] => {
    const angle = rotation + index * Math.PI * 2 / sides;
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
  });
}

function relationFor(book: number, title: string) {
  const text = title.toLowerCase();
  if (book === 3) {
    if (text.includes("centre of a given circle")) return "A chord's perpendicular bisector passes through the circle's centre";
    if (text.includes("two circles") && text.includes("touch")) return "The centres and point of contact lie on one straight line";
    if (text.includes("tangent")) return "The radius to the contact point is perpendicular to the tangent";
    if (text.includes("angle")) return "Equal arcs and chords determine the corresponding angles";
    return "The circle's equal radii constrain the chord relation";
  }
  if (book === 4) return text.includes("straight line equal") ? "A chord of the required length is fixed by equal-radius intersections" : text.includes("circle") ? "Equal radii organize the inscribed or circumscribed figure" : "The construction preserves equal sides and angles";
  if (book === 5) return "Corresponding multiples preserve the comparison of the original magnitudes";
  if (book === 6) return text.includes("area") || text.includes("figure") ? "Similar figures follow the duplicate ratio of corresponding sides" : "Parallel lines preserve corresponding side ratios";
  if (book === 7) return text.includes("subtracted") || text.includes("greatest common measure") || text.includes("prime to one another") ? "Repeated subtraction preserves common measures; the last remainder decides the gcd" : "Common measures turn the number claim into counted units";
  if (book === 8) return "A continued proportion makes each term the same multiple of the preceding term";
  if (book === 9) return text.includes("prime") ? "The factor array tests whether any non-unit measure remains" : "The generated sequence makes the number pattern visible";
  if (book === 10 && text.includes("greater than its half")) return "Each subtraction leaves less than half the preceding magnitude";
  if (book === 10) return text.includes("commensurable") ? "A common measure exhausts both magnitudes exactly" : "Repeated measurement exposes the defining rational or irrational remainder";
  if (book === 11) return "Rotating the view separates spatial incidence from the drawing's perspective";
  if (book === 12) return text.includes("pyramid") || text.includes("prism") || text.includes("cone") || text.includes("cylinder") ? "Equal-height slices reduce the solid comparison to its bases" : "Finer inscribed figures squeeze the remaining difference toward zero";
  if (book === 13 && text.includes("extreme and mean ratio")) return "The golden cut preserves whole-to-greater as greater-to-lesser";
  return "The canonical ratio fixes the regular figure's equal edges and symmetries";
}

const BOOK_STEPS: Record<number, string[]> = {
  3: ["Establish the circle and its equal radii", "Introduce the chord, secant, or tangent", "Compare the resulting segments and angles"],
  4: ["Place the required points on or about the circle", "Join the equal-radius construction", "Read the regularity forced by the construction"],
  5: ["Set out the four magnitudes", "Take corresponding multiples", "Compare the multiples to establish the ratio"],
  6: ["Construct the related triangles or figures", "Use parallels to match corresponding angles", "Read the proportional sides or areas"],
  7: ["Resolve each number into counted units", "Expose the common measure or multiple", "Read the divisibility claim from the array"],
  8: ["Set out a continued proportion", "Apply the same ratio successively", "Compare extremes, means, and powers"],
  9: ["Generate the number sequence", "Arrange its factors or partial sums", "Read the general numerical property"],
  10: ["Set out the two magnitudes", "Attempt repeated common measurement", "Read exact exhaustion or the persistent remainder"],
  11: ["Establish the relevant lines and planes", "Rotate the spatial construction", "Read perpendicularity, parallelism, or incidence"],
  12: ["Inscribe a simpler figure", "Increase the number of pieces", "Use exhaustion to establish the limiting ratio"],
  13: ["Construct the governing segment ratio", "Form the regular figure or solid", "Read the equality and symmetry of its edges"],
};

function circleScene(value: number, proposition: number, title: string): ScenePrimitive[] {
  const center = { x: 320, y: 190 }, radius = 125;
  const shift = (value - 0.5) * 1.25;
  const aAngle = -2.55 + shift;
  const bAngle = 0.45 + shift * 0.35 + (proposition % 4) * 0.08;
  const a = { x: center.x + Math.cos(aAngle) * radius, y: center.y + Math.sin(aAngle) * radius };
  const b = { x: center.x + Math.cos(bAngle) * radius, y: center.y + Math.sin(bAngle) * radius };
  const lower = title.toLowerCase();
  if (lower.includes("centre of a given circle")) {
    const chordY = 115 + value * 135;
    const half = Math.sqrt(radius ** 2 - (chordY - center.y) ** 2);
    const left = center.x - half, right = center.x + half;
    return [circle(center.x, center.y, radius), line(left, chordY, right, chordY, "given"), line(center.x, 42, center.x, 338, "result"), { kind: "right-angle", x: center.x, y: chordY, size: 14, flipX: true, flipY: chordY < center.y }, point(left, chordY, "A", -14, -8), point(right, chordY, "B", 10, -8), point(center.x, chordY, "D", 8, 18), point(center.x, center.y, "O", 9, -8), label(320, 350, "AD = DB; OD ⟂ AB", "result")];
  }
  const primitives: ScenePrimitive[] = [circle(center.x, center.y, radius), line(center.x, center.y, a.x, a.y, "construction"), line(center.x, center.y, b.x, b.y, "construction"), line(a.x, a.y, b.x, b.y, "given"), point(center.x, center.y, "O", 9, -8), point(a.x, a.y, "A", -14, -8), point(b.x, b.y, "B", 10, -8)];
  if (title.toLowerCase().includes("tangent")) {
    const tx = -Math.sin(bAngle), ty = Math.cos(bAngle);
    primitives.push(line(b.x - tx * 115, b.y - ty * 115, b.x + tx * 115, b.y + ty * 115, "result"), { kind: "right-angle", x: b.x, y: b.y, size: 13, flipX: Math.cos(bAngle) < 0, flipY: Math.sin(bAngle) < 0 });
  } else {
    primitives.push(label(320, 345, "OA = OB; chord AB varies", "result"));
  }
  return primitives;
}

function polygonScene(value: number, proposition: number, title = "") {
  const lower = title.toLowerCase();
  if (lower.includes("straight line equal")) {
    const half = 55 + value * 70, y = 190 - Math.sqrt(Math.max(0, 130 ** 2 - half ** 2));
    return [circle(320, 190, 130), line(320 - half, y, 320 + half, y, "result"), point(320 - half, y, "A", -12, -8), point(320 + half, y, "B", 10, -8), label(320, 350, `required chord = ${fixed(half * 2)}`, "result")];
  }
  const sides = lower.includes("fifteen") ? 15 : lower.includes("hexagon") ? 6 : lower.includes("pentagon") ? 5 : lower.includes("square") ? 4 : lower.includes("triangle") ? 3 : 3 + proposition % 6;
  const circum = lower.startsWith("about") || lower.includes("about a given");
  const radius = circum ? 130 / Math.cos(Math.PI / sides) : 130;
  const points = regularPoints(320, 190, radius, sides, -Math.PI / 2 + value * 0.8);
  return [circle(320, 190, 130), polygon(points, "area"), ...points.slice(0, 8).map(([x, y], index) => point(x, y, String.fromCharCode(65 + index), 7, -7)), label(320, 350, `${sides} equal chords determine the figure`, "result")];
}

function euclideanScene(value: number): ScenePrimitive[] {
  const steps: Array<[number, number]> = [[13, 8], [8, 5], [5, 3], [3, 2], [2, 1]];
  const index = Math.min(steps.length - 1, Math.floor(value * steps.length));
  const [whole, part] = steps[index];
  const remainder = whole - part;
  const scale = 25;
  return [rect(80, 105, whole * scale, 44, "area"), rect(80, 205, part * scale, 44, "area-secondary"), rect(80 + part * scale, 205, remainder * scale, 44, "area"), label(52, 134, String(whole)), label(52, 234, String(part)), label(320, 305, `${whole} = ${part} + ${remainder}; continue with ${part}, ${remainder}`, "result")];
}

function ratioScene(value: number): ScenePrimitive[] {
  const ratio = 0.65 + value * 0.7;
  const unit = 150;
  const rows: Array<[string, number, number, SceneTone]> = [["A", unit * ratio, 72, "area"], ["B", unit, 132, "area-secondary"], ["C", unit * ratio * 0.72, 222, "area"], ["D", unit * 0.72, 282, "area-secondary"]];
  return [...rows.flatMap(([name, width, y, tone]) => [rect(120, y, width, 30, tone), label(90, y + 20, name), label(120 + width + 34, y + 20, fixed(width / unit))]), label(490, 195, "A : B = C : D", "result")];
}

function similarScene(value: number): ScenePrimitive[] {
  const scale = 0.62 + value * 0.58;
  const first: Array<[number, number]> = [[80, 285], [275, 285], [155, 95]];
  const second: Array<[number, number]> = [[355, 285], [355 + 195 * scale, 285], [355 + 75 * scale, 285 - 190 * scale]];
  return [polygon(first, "area"), polygon(second, "area-secondary"), line(155, 95, 155, 285, "construction"), line(second[2][0], second[2][1], second[2][0], 285, "construction"), label(178, 325, "triangle ABC"), label(455, 325, `scale ${fixed(scale)}`), label(320, 55, "corresponding sides remain proportional", "result")];
}

function unitArrayScene(value: number, proposition: number, primeMode = false): ScenePrimitive[] {
  const columns = 3 + proposition % 6;
  const rows = primeMode ? 1 + Math.round(value * 3) : 2 + Math.round(value * 2);
  const size = Math.min(42, 320 / columns);
  const x0 = 320 - columns * size / 2, y0 = 190 - rows * size / 2;
  const cells = Array.from({ length: rows * columns }, (_, index) => rect(x0 + (index % columns) * size, y0 + Math.floor(index / columns) * size, size - 4, size - 4, index % 2 ? "area-secondary" : "area"));
  return [...cells, label(320, y0 - 28, `${rows} × ${columns} = ${rows * columns} units`, "result"), line(x0, y0 + rows * size + 20, x0 + columns * size, y0 + rows * size + 20, "given")];
}

function progressionScene(value: number): ScenePrimitive[] {
  const ratio = 1.08 + value * 0.25;
  const values = [1, ratio, ratio ** 2, ratio ** 3];
  const max = values.at(-1) ?? 1;
  return [...values.flatMap((amount, index) => {
    const height = 205 * amount / max;
    const x = 115 + index * 110;
    return [rect(x, 300 - height, 62, height, index % 2 ? "area-secondary" : "area"), label(x + 31, 328, index === 0 ? "A" : `${fixed(ratio)}${index > 1 ? `^${index}` : ""}`)];
  }), label(320, 55, `common ratio = ${fixed(ratio)}`, "result")];
}

function magnitudeScene(value: number, proposition: number): ScenePrimitive[] {
  const radicand = 2 + proposition % 8;
  const denominator = 3 + Math.round(value * 9);
  const irrational = Math.sqrt(radicand);
  const numerator = Math.round(irrational * denominator);
  const scale = 190;
  const firstEnd = 110 + scale;
  const secondEnd = 110 + scale * irrational / 2.9;
  const ticks: ScenePrimitive[] = [];
  for (let index = 0; index <= denominator; index += 1) ticks.push(line(110 + (secondEnd - 110) * index / denominator, 278, 110 + (secondEnd - 110) * index / denominator, 294, "muted"));
  return [line(110, 120, firstEnd, 120, "given"), label(80, 125, "unit"), line(110, 286, secondEnd, 286, "result"), ...ticks, label(80, 291, `√${radicand}`), label(430, 205, `${numerator}/${denominator} ≈ ${fixed(irrational)}`, "result")];
}

function shrinkingRemainderScene(value: number): ScenePrimitive[] {
  const steps = 1 + Math.round(value * 5);
  const primitives: ScenePrimitive[] = [];
  for (let index = 0; index < steps; index += 1) {
    const denominator = 2 ** (index + 1);
    const width = 360 / denominator;
    primitives.push(rect(120, 70 + index * 46, width, 24, index % 2 ? "area-secondary" : "area"), label(550, 88 + index * 46, `remainder < 1/${denominator}`));
  }
  primitives.push(label(320, 350, "successive remainders pass below any fixed lesser magnitude", "result"));
  return primitives;
}

function solidScene(value: number): ScenePrimitive[] {
  const skew = 55 + value * 55, lift = 48 + value * 38;
  const front: Array<[number, number]> = [[165, 125], [390, 125], [390, 300], [165, 300]];
  const back = front.map(([x, y]): [number, number] => [x + skew, y - lift]);
  const edges: ScenePrimitive[] = [];
  for (let index = 0; index < 4; index += 1) {
    const next = (index + 1) % 4;
    edges.push(line(front[index][0], front[index][1], front[next][0], front[next][1], "given"), line(back[index][0], back[index][1], back[next][0], back[next][1], "construction"), line(front[index][0], front[index][1], back[index][0], back[index][1], "result"));
  }
  return [polygon(front, "area"), polygon(back, "area-secondary"), ...edges, label(320, 345, "parallel faces; corresponding edges remain parallel", "result")];
}

function exhaustionScene(value: number, title: string): ScenePrimitive[] {
  const sides = 4 + Math.round(value * 6) * 2;
  const points = regularPoints(320, 190, 128, sides);
  const lower = title.toLowerCase();
  if (lower.includes("pyramid") || lower.includes("prism")) {
    const solid = solidScene(value);
    return [...solid.slice(0, -1), line(210, 215, 445, 160, "result"), label(320, 350, `${sides / 2} equal-height slices compare the bases`, "result")];
  }
  if (lower.includes("cone") || lower.includes("cylinder")) {
    const topY = 76 + value * 42, baseY = 285, left = 125, middle = 315, right = 520;
    return [circle(left, baseY, 58, "construction"), line(left, topY, left - 58, baseY, "given"), line(left, topY, left + 58, baseY, "given"), rect(middle, topY, 116, baseY - topY, "area-secondary"), circle(middle + 58, baseY, 58, "construction"), label(right, 185, lower.includes("third part") ? "cone = ⅓ cylinder" : "same base ratio", "result")];
  }
  if (lower.includes("sphere")) {
    return [circle(320, 190, 128), circle(320, 190, 72 + value * 30, "construction"), line(192, 190, 448, 190, "result"), label(320, 350, "diameter controls the triplicate volume ratio", "result")];
  }
  return [circle(320, 190, 128), polygon(points, "area"), label(320, 350, `${sides}-sided inscribed approximation`, "result")];
}

function regularSolidScene(value: number, proposition: number): ScenePrimitive[] {
  const sides = 3 + proposition % 5;
  const outer = regularPoints(320, 190, 135, sides, -Math.PI / 2 + value);
  const inner = regularPoints(320, 190, 58, sides, Math.PI / 2 - value * 0.7);
  const spokes = outer.map(([x, y], index) => line(x, y, inner[index][0], inner[index][1], "construction"));
  return [polygon(outer, "area"), polygon(inner, "area-secondary"), ...spokes, ...outer.map(([x, y], index) => point(x, y, String(index + 1), 6, -6)), label(320, 350, "equal radii preserve the regular symmetry", "result")];
}

function goldenRatioScene(value: number): ScenePrimitive[] {
  const whole = 400, greater = whole * (Math.sqrt(5) - 1) / 2;
  const x = 110, y = 205, lift = (value - 0.5) * 35;
  return [line(x, y, x + whole, y, "given"), line(x, y + lift, x + greater, y + lift, "result"), point(x, y, "A", -12, 20), point(x + greater, y, "C", 0, 20), point(x + whole, y, "B", 10, 20), rect(x, 65, greater, 82, "area"), rect(x + greater, 65, whole - greater, 82, "area-secondary"), label(320, 330, "AB : AC = AC : CB", "result")];
}

function fiveFiguresScene(value: number): ScenePrimitive[] {
  const primitives: ScenePrimitive[] = [];
  for (let index = 0; index < 5; index += 1) {
    const sides = index + 3, cx = 90 + index * 115, radius = 38 + value * 10;
    primitives.push(polygon(regularPoints(cx, 190, radius, sides, value), index % 2 ? "area-secondary" : "area"), label(cx, 270, ["pyramid", "octahedron", "cube", "icosahedron", "dodecahedron"][index]));
  }
  primitives.push(label(320, 340, "one sphere supplies the common scale", "result"));
  return primitives;
}

export function createBookFamilyScene(book: number, propositionNumber: number | string, title: string, referenceCount: number): EuclidSceneSpec {
  const proposition = Number.parseInt(String(propositionNumber), 10) || 1;
  const relation = relationFor(book, title);
  const builders: Record<number, (value: number) => ScenePrimitive[]> = {
    3: (value) => circleScene(value, proposition, title),
    4: (value) => polygonScene(value, proposition, title),
    5: ratioScene,
    6: similarScene,
    7: (value) => /subtracted|greatest common measure|prime to one another/i.test(title) ? euclideanScene(value) : unitArrayScene(value, proposition),
    8: progressionScene,
    9: (value) => unitArrayScene(value, proposition, title.toLowerCase().includes("prime")),
    10: (value) => proposition === 1 ? shrinkingRemainderScene(value) : magnitudeScene(value, proposition),
    11: solidScene,
    12: (value) => exhaustionScene(value, title),
    13: (value) => proposition <= 6 ? goldenRatioScene(value) : proposition <= 12 ? polygonScene(value, proposition, title) : proposition === 18 ? fiveFiguresScene(value) : regularSolidScene(value, proposition),
  };
  const labels: Record<number, string> = {
    3: "Move the point on the circle", 4: "Rotate the regular construction", 5: "Change the common ratio", 6: "Scale the similar figure", 7: "Change the counted multiple", 8: "Change the continued ratio", 9: "Change the generated number", 10: "Refine the rational approximation", 11: "Rotate the spatial view", 12: "Refine the exhaustion", 13: "Rotate the regular figure",
  };
  const lowerTitle = title.toLowerCase();
  const controlLabel = book === 3 && lowerTitle.includes("centre of a given circle")
    ? "Move the bisected chord"
    : book === 4 && lowerTitle.includes("straight line equal")
      ? "Change the required chord"
      : book === 7 && /subtracted|greatest common measure|prime to one another/i.test(title)
        ? "Continue repeated subtraction"
        : book === 10 && proposition === 1
          ? "Continue the subtraction"
          : book === 12 && /cone|cylinder/i.test(title)
            ? "Change the common height"
            : book === 13 && proposition <= 6
              ? "Move the golden cut"
              : labels[book] ?? "Explore the construction";
  return {
    id: `book-${book}-prop-${proposition}`,
    family: true,
    title,
    description: `${relation}. The proof explicitly cites ${referenceCount} earlier ${referenceCount === 1 ? "result" : "results"}.`,
    steps: BOOK_STEPS[book] ?? ["Set out the givens", "Apply the cited results", "Read the conclusion"],
    control: { kind: "range", label: controlLabel, min: 0.08, max: 0.92, step: 0.01, initial: 0.5 },
    build: builders[book],
    status: () => relation,
    invariant: (value) => finite(value) && value >= 0 && value <= 1,
  };
}

export function validateBookFamilyScene(scene: EuclidSceneSpec) {
  return [0.08, 0.5, 0.92].every((value) => scene.invariant(value) && scene.build(value).every((primitive) => Object.entries(primitive).every(([key, item]) => key === "points" || typeof item !== "number" || finite(item))));
}
