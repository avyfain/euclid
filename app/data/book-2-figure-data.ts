export type SceneTone =
  | "line"
  | "given"
  | "construction"
  | "result"
  | "area"
  | "area-secondary"
  | "muted";

export type ScenePrimitive =
  | { kind: "line"; x1: number; y1: number; x2: number; y2: number; tone?: SceneTone; stage?: number }
  | { kind: "rect"; x: number; y: number; width: number; height: number; tone?: SceneTone; stage?: number }
  | { kind: "circle"; cx: number; cy: number; r: number; tone?: SceneTone; stage?: number }
  | { kind: "arc"; cx: number; cy: number; r: number; start: number; end: number; tone?: SceneTone; stage?: number }
  | { kind: "polygon"; points: Array<[number, number]>; tone?: SceneTone; stage?: number }
  | { kind: "point"; x: number; y: number; label: string; dx?: number; dy?: number; stage?: number }
  | { kind: "label"; x: number; y: number; text: string; tone?: SceneTone; anchor?: "start" | "middle" | "end"; stage?: number }
  | { kind: "right-angle"; x: number; y: number; size?: number; flipX?: boolean; flipY?: boolean; stage?: number };

export type EuclidSceneSpec = {
  id: string;
  family?: boolean;
  title: string;
  description: string;
  viewBox?: string;
  steps: string[];
  control:
    | { kind: "range"; label: string; min: number; max: number; step: number; initial: number }
    | { kind: "steps" };
  build: (value: number) => ScenePrimitive[];
  status: (value: number, stage: number) => string;
  invariant: (value: number) => boolean;
};

const EPSILON = 1e-8;
const close = (a: number, b: number) => Math.abs(a - b) < EPSILON;
const line = (x1: number, y1: number, x2: number, y2: number, tone: SceneTone = "line", stage = 0): ScenePrimitive => ({ kind: "line", x1, y1, x2, y2, tone, stage });
const rect = (x: number, y: number, width: number, height: number, tone: SceneTone = "area", stage = 0): ScenePrimitive => ({ kind: "rect", x, y, width, height, tone, stage });
const label = (x: number, y: number, text: string, tone: SceneTone = "line", anchor: "start" | "middle" | "end" = "middle", stage = 0): ScenePrimitive => ({ kind: "label", x, y, text, tone, anchor, stage });
const point = (x: number, y: number, text: string, dx = 0, dy = -10, stage = 0): ScenePrimitive => ({ kind: "point", x, y, label: text, dx, dy, stage });
const square = (x: number, y: number, side: number, text: string, tone: SceneTone = "area", stage = 0): ScenePrimitive[] => [rect(x, y, side, side, tone, stage), label(x + side / 2, y + side / 2 + 5, text, "line", "middle", stage)];
const fixed = (value: number) => value.toFixed(2).replace(/\.00$/, "");

const scene1: EuclidSceneSpec = {
  id: "book-2-prop-1",
  title: "One rectangle partitioned by the arbitrary cuts D and E.",
  description: "The height A is common to all three smaller rectangles, so their areas add to the area A by BC.",
  steps: ["Draw the rectangle contained by A and BC", "Carry the cuts at D and E through the rectangle", "The three component rectangles exactly fill the original"],
  control: { kind: "range", label: "Move the cuts D and E", min: 0.18, max: 0.62, step: 0.01, initial: 0.34 },
  build: (t) => {
    const x = 100, y = 95, width = 440, height = 170;
    const d = x + width * t;
    const e = x + width * (0.72 + t * 0.18);
    return [
      rect(x, y, d - x, height, "area"), rect(d, y, e - d, height, "area-secondary"), rect(e, y, x + width - e, height, "area"),
      line(d, y, d, y + height, "construction"), line(e, y, e, y + height, "construction"),
      point(x, y + height, "B", -12, 18), point(d, y + height, "D", 0, 18), point(e, y + height, "E", 0, 18), point(x + width, y + height, "C", 12, 18),
      label(x - 28, y + height / 2, "A", "given"),
      label((x + d) / 2, y + height / 2, "A·BD"), label((d + e) / 2, y + height / 2, "A·DE"), label((e + x + width) / 2, y + height / 2, "A·EC"),
    ];
  },
  status: (t) => {
    const d = t, e = 0.72 + t * 0.18;
    return `A·BC = ${fixed(d)} + ${fixed(e - d)} + ${fixed(1 - e)} = 1`;
  },
  invariant: (t) => close(t + (0.72 + t * 0.18 - t) + (1 - (0.72 + t * 0.18)), 1),
};

const scene2: EuclidSceneSpec = {
  id: "book-2-prop-2",
  title: "The square on AB divided at C into two rectangles.",
  description: "Both rectangles have height AB; their widths AC and CB sum to AB.",
  steps: ["Describe the square on AB", "Draw through C parallel to the sides", "AB·AC and AB·CB exhaust AB²"],
  control: { kind: "range", label: "Move C along AB", min: 0.18, max: 0.82, step: 0.01, initial: 0.43 },
  build: (t) => {
    const x = 190, y = 55, side = 270, cut = x + side * t;
    return [rect(x, y, side * t, side, "area"), rect(cut, y, side * (1 - t), side, "area-secondary"), line(cut, y, cut, y + side, "construction"), point(x, y + side, "A", -10, 20), point(cut, y + side, "C", 0, 20), point(x + side, y + side, "B", 10, 20), label(x + side * t / 2, y + side / 2, "AB·AC"), label(cut + side * (1 - t) / 2, y + side / 2, "AB·CB")];
  },
  status: (t) => `AB·AC + AB·CB = ${fixed(t)} + ${fixed(1 - t)} = AB²`,
  invariant: (t) => close(t + (1 - t), 1),
};

const scene3: EuclidSceneSpec = {
  id: "book-2-prop-3",
  title: "The rectangle AB by BC divided at C.",
  description: "The right-hand part is the square on BC; the left is AC by CB.",
  steps: ["Construct the rectangle AB by BC", "Draw through C parallel to its height", "The two parts are AC·CB and CB²"],
  control: { kind: "range", label: "Move C along AB", min: 0.25, max: 0.72, step: 0.01, initial: 0.58 },
  build: (t) => {
    const scale = 300, x = 170, y = 75, ac = scale * t, bc = scale * (1 - t);
    return [rect(x, y, ac, bc, "area"), rect(x + ac, y, bc, bc, "area-secondary"), point(x, y + bc, "A", -10, 20), point(x + ac, y + bc, "C", 0, 20), point(x + scale, y + bc, "B", 10, 20), label(x + ac / 2, y + bc / 2, "AC·CB"), label(x + ac + bc / 2, y + bc / 2, "CB²")];
  },
  status: (t) => `AB·BC = ${fixed(t * (1 - t))} + ${fixed((1 - t) ** 2)}`,
  invariant: (t) => close(1 * (1 - t), t * (1 - t) + (1 - t) ** 2),
};

const scene4: EuclidSceneSpec = {
  id: "book-2-prop-4",
  title: "The square on AB cut in both directions at C.",
  description: "Two segment-squares and two congruent AC by CB rectangles tile the square on AB.",
  steps: ["Describe the square on AB", "Carry the cut at C across both dimensions", "Read AC², CB², and two equal rectangles"],
  control: { kind: "range", label: "Move C along AB", min: 0.24, max: 0.76, step: 0.01, initial: 0.44 },
  build: (t) => {
    const x = 185, y = 50, side = 280, a = side * t, b = side - a;
    return [rect(x, y, a, a, "area"), rect(x + a, y, b, a, "area-secondary"), rect(x, y + a, a, b, "area-secondary"), rect(x + a, y + a, b, b, "area"), label(x + a / 2, y + a / 2, "AC²"), label(x + a + b / 2, y + a / 2, "AC·CB"), label(x + a / 2, y + a + b / 2, "AC·CB"), label(x + a + b / 2, y + a + b / 2, "CB²"), point(x, y + side, "A", -10, 20), point(x + a, y + side, "C", 0, 20), point(x + side, y + side, "B", 10, 20)];
  },
  status: () => "AB² = AC² + 2AC·CB + CB²",
  invariant: (t) => close(1, t ** 2 + 2 * t * (1 - t) + (1 - t) ** 2),
};

const scene5: EuclidSceneSpec = {
  id: "book-2-prop-5",
  title: "The square on the half split into CD² and a gnomon.",
  description: "As D moves away from the midpoint C, CD² grows by exactly the area lost from AD by DB.",
  steps: ["Bisect AB at C and choose an unequal cut D", "Place CD² inside the square on CB", "The remaining gnomon has area AD·DB"],
  control: { kind: "range", label: "Move the unequal cut D", min: 0.15, max: 0.76, step: 0.01, initial: 0.42 },
  build: (xValue) => {
    const x = 205, y = 55, side = 260, inner = side * xValue;
    return [rect(x, y, side, side, "area"), rect(x + side - inner, y + side - inner, inner, inner, "area-secondary"), label(x + side * 0.38, y + side * 0.45, "AD·DB"), label(x + side - inner / 2, y + side - inner / 2, "CD²"), line(x, y + side + 25, x + side, y + side + 25, "given"), point(x, y + side + 25, "A", 0, 20), point(x + side / 2, y + side + 25, "C", 0, 20), point(x + side / 2 + inner / 2, y + side + 25, "D", 0, 20), point(x + side, y + side + 25, "B", 0, 20)];
  },
  status: (x) => `AD·DB + CD² = ${fixed(1 - x ** 2)} + ${fixed(x ** 2)} = CB²`,
  invariant: (x) => close((1 + x) * (1 - x) + x ** 2, 1),
};

const scene6: EuclidSceneSpec = {
  id: "book-2-prop-6",
  title: "The square on CD decomposed into CB² and the gnomon AD by DB.",
  description: "Adding DB to a bisected line turns the surrounding gnomon into the rectangle AD by DB.",
  steps: ["Bisect AB at C and extend to D", "Describe the square on CD", "Its unit square is CB²; the gnomon is AD·DB"],
  control: { kind: "range", label: "Change the added length DB", min: 0.16, max: 0.68, step: 0.01, initial: 0.38 },
  build: (xValue) => {
    const unit = 170, side = unit * (1 + xValue), x = 195, y = 45, extra = unit * xValue;
    return [rect(x, y, unit, unit, "area"), rect(x + unit, y, extra, unit, "area-secondary"), rect(x, y + unit, unit, extra, "area-secondary"), rect(x + unit, y + unit, extra, extra, "area-secondary"), label(x + unit / 2, y + unit / 2, "CB²"), label(x + unit + extra / 2, y + side / 2, "AD·DB", "line"), line(x - 35, y + side + 28, x + side, y + side + 28, "given"), point(x - 35, y + side + 28, "A", 0, 20), point(x + unit - 35, y + side + 28, "B", 0, 20), point(x + unit / 2 - 35, y + side + 28, "C", 0, 20), point(x + side, y + side + 28, "D", 0, 20)];
  },
  status: (x) => `AD·DB + CB² = ${fixed((2 + x) * x)} + 1 = CD²`,
  invariant: (x) => close((2 + x) * x + 1, (1 + x) ** 2),
};

const scene7: EuclidSceneSpec = {
  id: "book-2-prop-7",
  title: "Two equal-area arrangements for the cut AB = AC + CB.",
  description: "The square on AB together with BC² equals two AB by BC rectangles and the remaining square AC².",
  steps: ["Cut AB at C", "Compare the two area arrangements", "Both sides cover the same total area"],
  control: { kind: "range", label: "Move C along AB", min: 0.18, max: 0.68, step: 0.01, initial: 0.4 },
  build: (xValue) => {
    const base = 135, small = base * xValue, remain = base * (1 - xValue);
    return [...square(55, 70, base, "AB²", "area"), ...square(215, 70, small, "BC²", "area-secondary"), label(150, 45, "+"), ...square(410, 70, remain, "AC²", "area"), rect(365, 235, base, small, "area-secondary"), rect(365, 235 + small + 8, base, small, "area-secondary"), label(432, 235 + small / 2, "AB·BC"), label(432, 243 + small * 1.5, "AB·BC"), label(320, 170, "=", "given")];
  },
  status: () => "AB² + BC² = 2AB·BC + AC²",
  invariant: (x) => close(1 + x ** 2, 2 * x + (1 - x) ** 2),
};

const scene8: EuclidSceneSpec = {
  id: "book-2-prop-8",
  title: "A larger square surrounding the square on AC.",
  description: "The area between side 1 + BC and side 1 - BC is four rectangles AB by BC.",
  steps: ["Extend AB by a copy of BC", "Describe the square on AB + BC", "Remove AC²; the surrounding gnomon is four AB·BC"],
  control: { kind: "range", label: "Move C along AB", min: 0.16, max: 0.62, step: 0.01, initial: 0.34 },
  build: (xValue) => {
    const unit = 175, outer = unit * (1 + xValue), inner = unit * (1 - xValue), x = 190, y = 40, inset = (outer - inner) / 2;
    return [rect(x, y, outer, outer, "area-secondary"), rect(x + inset, y + inset, inner, inner, "area"), label(x + outer / 2, y + 22, "4(AB·BC)"), label(x + outer / 2, y + outer / 2 + 5, "AC²")];
  },
  status: (x) => `4AB·BC + AC² = ${fixed(4 * x)} + ${fixed((1 - x) ** 2)} = (AB + BC)²`,
  invariant: (x) => close(4 * x + (1 - x) ** 2, (1 + x) ** 2),
};

type SquareGroup = { side: number; label: string; tone: SceneTone; count?: number };

const squareRun = (startX: number, bottom: number, groups: SquareGroup[]): ScenePrimitive[] => {
  const primitives: ScenePrimitive[] = [];
  let x = startX;
  groups.forEach((group, groupIndex) => {
    const count = group.count ?? 1;
    const groupStart = x;
    for (let copy = 0; copy < count; copy += 1) {
      primitives.push(rect(x, bottom - group.side, group.side, group.side, group.tone));
      x += group.side + 10;
    }
    x -= 10;
    primitives.push(label((groupStart + x) / 2, bottom + 25, count > 1 ? `${count} × ${group.label}` : group.label));
    if (groupIndex < groups.length - 1) {
      primitives.push(label(x + 19, bottom - 32, "+", "given"));
      x += 38;
    }
  });
  return primitives;
};

const scene9: EuclidSceneSpec = {
  id: "book-2-prop-9",
  title: "Squares on the unequal segments balanced against two copies of the half and displacement squares.",
  description: "Moving D equally enlarges one unequal segment and shrinks the other; the paired square sum changes by twice CD².",
  steps: ["Bisect AB at C and choose D", "Compare the squares on AD and DB", "They equal two AC² plus two CD²"],
  control: { kind: "range", label: "Move D away from the midpoint", min: 0.14, max: 0.58, step: 0.01, initial: 0.32 },
  build: (x) => [
    ...squareRun(40, 235, [{ side: 72 * (1 + x), label: "AD²", tone: "area" }, { side: 72 * (1 - x), label: "DB²", tone: "area-secondary" }]),
    label(316, 170, "=", "given"),
    ...squareRun(352, 235, [{ side: 66, label: "AC²", tone: "area", count: 2 }, { side: 66 * x, label: "CD²", tone: "area-secondary", count: 2 }]),
  ],
  status: () => "AD² + DB² = 2AC² + 2CD²",
  invariant: (x) => close((1 + x) ** 2 + (1 - x) ** 2, 2 + 2 * x ** 2),
};

const scene10: EuclidSceneSpec = {
  id: "book-2-prop-10",
  title: "Squares after extending a bisected line.",
  description: "The squares on the whole-plus-extension and the extension balance two copies of the half and half-plus-extension squares.",
  steps: ["Bisect AB and add BD", "Compare the squares on AD and DB", "Resolve both through AC and CD"],
  control: { kind: "range", label: "Change the added length BD", min: 0.12, max: 0.52, step: 0.01, initial: 0.28 },
  build: (x) => [
    ...squareRun(36, 235, [{ side: 53 * (2 + x), label: "AD²", tone: "area" }, { side: 53 * x, label: "DB²", tone: "area-secondary" }]),
    label(310, 170, "=", "given"),
    ...squareRun(338, 235, [{ side: 52, label: "AC²", tone: "area", count: 2 }, { side: 52 * (1 + x), label: "CD²", tone: "area-secondary", count: 2 }]),
  ],
  status: () => "AD² + DB² = 2AC² + 2CD²",
  invariant: (x) => close((2 + x) ** 2 + x ** 2, 2 + 2 * (1 + x) ** 2),
};

const scene11: EuclidSceneSpec = {
  id: "book-2-prop-11",
  title: "Euclid's construction of the golden section.",
  description: "The midpoint-and-diagonal construction cuts AB at H so that AB by BH equals AH squared.",
  steps: ["Describe square ABDC on AB", "Bisect AC at E and join EB", "Extend CA to F with EF = EB", "Describe the square on AF; its side meets AB at H"],
  control: { kind: "steps" },
  build: () => {
    const a = { x: 190, y: 220 }, b = { x: 390, y: 220 }, c = { x: 190, y: 20 }, d = { x: 390, y: 20 }, e = { x: 190, y: 120 };
    const eb = Math.hypot(b.x - e.x, b.y - e.y);
    const af = eb - 100;
    const f = { x: a.x, y: a.y + af }, h = { x: a.x + af, y: a.y }, g = { x: h.x, y: f.y };
    return [rect(a.x, d.y, 200, 200, "area", 0), point(a.x, a.y, "A", -12, 16), point(b.x, b.y, "B", 12, 16), point(c.x, c.y, "C", -12, -8), point(d.x, d.y, "D", 12, -8), point(e.x, e.y, "E", -12, 4, 1), line(e.x, e.y, b.x, b.y, "construction", 1), line(c.x, c.y, f.x, f.y, "construction", 2), point(f.x, f.y, "F", -12, 18, 2), line(e.x, e.y, f.x, f.y, "construction", 2), rect(a.x, a.y, af, af, "area-secondary", 3), point(h.x, h.y, "H", 0, -12, 3), point(g.x, g.y, "G", 10, 16, 3), label(475, 305, "AB·BH = AH²", "result", "middle", 3)];
  },
  status: (_value, stage) => ["Square ABDC on AB", "E is the midpoint; join EB", "Extend to F with EF = EB", "H gives AB·BH = AH²"][stage],
  invariant: () => { const ah = Math.sqrt(1.25) - 0.5; return close(1 * (1 - ah), ah ** 2); },
};

const scene12: EuclidSceneSpec = {
  id: "book-2-prop-12",
  title: "An obtuse triangle with the perpendicular landing outside the opposite side.",
  description: "The external offset AD produces the excess twice-rectangle term in the obtuse cosine relation.",
  steps: ["Drop BD perpendicular to CA produced", "Apply II.4 to CD = CA + AD", "Use the two right triangles to replace CD² + DB² by CB²"],
  control: { kind: "range", label: "Move the external foot D", min: 0.16, max: 0.54, step: 0.01, initial: 0.34 },
  build: (offset) => {
    const a = { x: 245, y: 235 }, c = { x: 500, y: 235 }, d = { x: 245 - 210 * offset, y: 235 }, b = { x: d.x, y: 65 };
    return [{ kind: "polygon", points: [[a.x, a.y], [b.x, b.y], [c.x, c.y]], tone: "area" }, line(d.x, d.y, b.x, b.y, "construction"), line(d.x - 22, d.y, c.x, c.y, "given"), { kind: "right-angle", x: d.x, y: d.y, size: 16, flipY: true }, point(a.x, a.y, "A", 0, 20), point(b.x, b.y, "B", -12, -8), point(c.x, c.y, "C", 12, 18), point(d.x, d.y, "D", -12, 20), label(320, 315, "BC² = BA² + AC² + 2(CA·AD)", "result")];
  },
  status: () => "The external offset AD creates the positive excess term",
  invariant: (o) => { const ca = 1, ad = o, db = 0.7; return close((ca + ad) ** 2 + db ** 2, ad ** 2 + db ** 2 + ca ** 2 + 2 * ca * ad); },
};

const scene13: EuclidSceneSpec = {
  id: "book-2-prop-13",
  title: "An acute triangle with the perpendicular landing inside BC.",
  description: "The internal projection BD produces the twice-rectangle amount by which AC² falls short.",
  steps: ["Drop AD perpendicular inside BC", "Apply II.7 to CB cut at D", "Use the two right triangles to obtain the deficit"],
  control: { kind: "range", label: "Move the perpendicular foot D", min: 0.22, max: 0.72, step: 0.01, initial: 0.45 },
  build: (t) => {
    const b = { x: 110, y: 245 }, c = { x: 520, y: 245 }, d = { x: b.x + (c.x - b.x) * t, y: 245 }, a = { x: d.x, y: 55 };
    return [{ kind: "polygon", points: [[a.x, a.y], [b.x, b.y], [c.x, c.y]], tone: "area" }, line(a.x, a.y, d.x, d.y, "construction"), { kind: "right-angle", x: d.x, y: d.y, size: 16, flipX: true, flipY: true }, point(a.x, a.y, "A", 0, -10), point(b.x, b.y, "B", -12, 18), point(c.x, c.y, "C", 12, 18), point(d.x, d.y, "D", 0, 20), label(320, 315, "AC² = BA² + BC² − 2(CB·BD)", "result")];
  },
  status: () => "The internal projection BD creates the deficit term",
  invariant: (t) => { const bc = 1, bd = t, ad = 0.7; return close((1 - t) ** 2 + ad ** 2, bd ** 2 + ad ** 2 + bc ** 2 - 2 * bc * bd); },
};

const scene14: EuclidSceneSpec = {
  id: "book-2-prop-14",
  title: "A semicircle converts a rectangle into an equal square.",
  description: "The altitude EH is the geometric mean of BE and EF, so the square on EH equals the given rectangle.",
  viewBox: "0 0 700 380",
  steps: ["Replace the figure by rectangle BE by ED", "Set EF equal to ED and draw the semicircle on BF", "Raise EH perpendicular to BF", "By the right-triangle mean, EH² = BE·EF = area BD"],
  control: { kind: "range", label: "Change the rectangle's proportions", min: 0.24, max: 0.72, step: 0.01, initial: 0.46 },
  build: (t) => {
    const bx = 55, fx = 395, gy = 255, gx = (bx + fx) / 2, radius = (fx - bx) / 2, ex = bx + (fx - bx) * t;
    const height = Math.sqrt(Math.max(0, radius ** 2 - (ex - gx) ** 2));
    const hy = gy - height;
    return [rect(55, 275, (fx - bx) * t, 60, "area"), label(55 + (fx - bx) * t / 2, 309, "given rectangle"), { kind: "arc", cx: gx, cy: gy, r: radius, start: 180, end: 360, tone: "construction" }, line(bx, gy, fx, gy, "given"), line(ex, gy, ex, hy, "result"), point(bx, gy, "B", 0, 20), point(ex, gy, "E", -9, 20), point(gx, gy, "G", 8, 20), point(fx, gy, "F", 0, 20), point(ex, hy, "H", 0, -10), ...square(465, gy - height, height, "EH²", "area-secondary"), label(550, 345, "EH² = BE·EF", "result")];
  },
  status: (t) => `EH² = BE·EF = ${fixed(t * (1 - t))} of BF²`,
  invariant: (t) => close(t * (1 - t), 0.25 - (t - 0.5) ** 2),
};

export const BOOK_TWO_SCENES: Record<string, EuclidSceneSpec> = Object.fromEntries(
  [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9, scene10, scene11, scene12, scene13, scene14]
    .map((scene) => [scene.id.replace("book-2-", ""), scene]),
);

export function validateBookTwoScenes() {
  const samples = [0.2, 0.35, 0.5, 0.65];
  return Object.values(BOOK_TWO_SCENES).every((scene) =>
    samples.every((sample) => scene.invariant(Math.min(scene.control.kind === "range" ? scene.control.max : sample, Math.max(scene.control.kind === "range" ? scene.control.min : sample, sample)))),
  );
}
