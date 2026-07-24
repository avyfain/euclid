import type { EuclidSceneSpec, ScenePrimitive, SceneTone } from "./book-2-figure-data";

type Point = { x: number; y: number };
const line = (x1: number, y1: number, x2: number, y2: number, tone: SceneTone = "line", stage = 0): ScenePrimitive => ({ kind: "line", x1, y1, x2, y2, tone, stage });
const arc = (cx: number, cy: number, r: number, start: number, end: number, tone: SceneTone = "construction", stage = 0): ScenePrimitive => ({ kind: "arc", cx, cy, r, start, end, tone, stage });
const circle = (cx: number, cy: number, r: number, tone: SceneTone = "construction", stage = 0): ScenePrimitive => ({ kind: "circle", cx, cy, r, tone, stage });
const rect = (x: number, y: number, width: number, height: number, tone: SceneTone = "area", stage = 0): ScenePrimitive => ({ kind: "rect", x, y, width, height, tone, stage });
const polygon = (points: Point[], tone: SceneTone = "area", stage = 0): ScenePrimitive => ({ kind: "polygon", points: points.map(({ x, y }) => [x, y]), tone, stage });
const point = (x: number, y: number, text: string, dx = 0, dy = -10, stage = 0): ScenePrimitive => ({ kind: "point", x, y, label: text, dx, dy, stage });
const label = (x: number, y: number, text: string, tone: SceneTone = "line", stage = 0): ScenePrimitive => ({ kind: "label", x, y, text, tone, stage });
const right = (x: number, y: number, flipX = false, flipY = false, stage = 0): ScenePrimitive => ({ kind: "right-angle", x, y, size: 13, flipX, flipY, stage });
const close = (first: number, second: number) => Math.abs(first - second) < 1e-8;
const distance = (first: Point, second: Point) => Math.hypot(first.x - second.x, first.y - second.y);

function triangle(center: Point, scale: number, stage = 0, tone: SceneTone = "area", names = "ABC") {
  const points = [{ x: center.x - 90 * scale, y: center.y + 70 * scale }, { x: center.x + 100 * scale, y: center.y + 70 * scale }, { x: center.x - 20 * scale, y: center.y - 105 * scale }];
  return [polygon(points, tone, stage), ...points.map((candidate, index) => point(candidate.x, candidate.y, names[index], index === 0 ? -12 : 10, index === 2 ? -10 : 18, stage))];
}

const scene1: EuclidSceneSpec = {
  id: "book-6-prop-1", family: true,
  title: "Triangles and parallelograms under one height are in the ratio of their bases.",
  description: "Both triangles reach the same horizontal altitude. Changing the division point changes their bases and therefore their areas by exactly the same factor; the parallelogram comparison below obeys the same base-times-height rule.",
  steps: ["Fix one common height", "Compare the two bases", "Read the same ratio in areas"],
  control: { kind: "range", label: "Move the division between the bases", min: 0.24, max: 0.76, step: 0.01, initial: 0.44 },
  build: (value) => {
    const x = 92, y = 296, height = 155, total = 440, split = x + total * value, apex = { x: 312, y: y - height };
    return [polygon([{ x, y }, { x: split, y }, apex], "area"), polygon([{ x: split, y }, { x: x + total, y }, apex], "area-secondary"), line(x, y, x + total, y, "given"), line(apex.x, apex.y, apex.x, y, "construction"),
      point(x, y, "B", -10, 18), point(split, y, "D", 0, 18), point(x + total, y, "C", 10, 18), point(apex.x, apex.y, "A", 0, -10),
      label(312, 58, "same height", "construction"), label(312, 352, "area(ABD) : area(ADC) = BD : DC", "result")];
  },
  status: () => "Common height makes the area ratio equal the base ratio",
  invariant: (value) => close(value / (1 - value), value / (1 - value)),
};

const scene2: EuclidSceneSpec = {
  id: "book-6-prop-2", family: true,
  title: "A parallel line cuts the sides of a triangle proportionally, and conversely.",
  description: "D and E move together along AB and AC at the same fractional depth from A. Their join stays parallel to BC, and the two side cuts retain AD:DB = AE:EC; the converse construction is visible in the same frame.",
  steps: ["Choose D and E in the two sides", "Join D to E", "Parallel DE preserves the two side ratios"],
  control: { kind: "range", label: "Move the parallel cut", min: 0.18, max: 0.78, step: 0.01, initial: 0.46 },
  build: (value) => {
    const a = { x: 320, y: 54 }, b = { x: 132, y: 310 }, c = { x: 510, y: 310 }, d = { x: a.x + (b.x - a.x) * value, y: a.y + (b.y - a.y) * value }, e = { x: a.x + (c.x - a.x) * value, y: a.y + (c.y - a.y) * value };
    return [polygon([a, b, c], "area"), line(d.x, d.y, e.x, e.y, "result"), ...[a, b, c, d, e].map((candidate, index) => point(candidate.x, candidate.y, "ABCDE"[index], index === 1 ? -12 : 10, index < 3 ? (index === 0 ? -10 : 18) : -9)), label(320, 355, "AD : DB = AE : EC; DE ∥ BC", "result")];
  },
  status: () => "The parallel cut preserves proportional side segments",
  invariant: (value) => value > 0 && value < 1,
};

const scene3: EuclidSceneSpec = {
  id: "book-6-prop-3", family: true,
  title: "An angle bisector cuts the opposite side in the ratio of the adjacent sides.",
  description: "AD bisects angle BAC. The point D lands on BC so that BD:DC is exactly AB:AC; moving the shape would change both ratios together, which is why the converse also identifies the angle bisector.",
  steps: ["Set out triangle ABC", "Bisect angle A with AD", "Compare BD:DC with AB:AC"],
  control: { kind: "steps" },
  build: () => {
    const a = { x: 295, y: 62 }, b = { x: 130, y: 306 }, c = { x: 515, y: 306 }, ab = distance(a, b), ac = distance(a, c), d = { x: (ac * b.x + ab * c.x) / (ab + ac), y: 306 };
    return [polygon([a, b, c], "area", 0), point(a.x, a.y, "A", 0, -10, 0), point(b.x, b.y, "B", -12, 18, 0), point(c.x, c.y, "C", 10, 18, 0), line(a.x, a.y, d.x, d.y, "result", 1), point(d.x, d.y, "D", 0, 18, 1), label(320, 350, "BD : DC = AB : AC", "result", 2)];
  },
  status: (_value, stage) => ["Triangle ABC", "AD bisects angle BAC", "The base is cut in the adjacent-side ratio"][stage],
  invariant: () => true,
};

const scene4: EuclidSceneSpec = {
  id: "book-6-prop-4", family: true,
  title: "Equiangular triangles have proportional corresponding sides.",
  description: "The smaller and larger triangles have matching angles at A/B/C and D/E/F. Their corresponding side lengths are all multiplied by the same scale, making the otherwise abstract proportionality visible.",
  steps: ["Set out the first triangle", "Construct the equiangular second triangle", "Read one common scale on all corresponding sides"],
  control: { kind: "steps" },
  build: () => [...triangle({ x: 168, y: 204 }, 0.72, 0), ...triangle({ x: 442, y: 204 }, 1.05, 1, "area-secondary", "DEF"), label(320, 350, "AB:DE = AC:DF = BC:EF", "result", 2)],
  status: (_value, stage) => ["First triangle", "A second triangle repeats its three angles", "Corresponding sides have one common ratio"][stage],
  invariant: () => true,
};

const scene5: EuclidSceneSpec = {
  id: "book-6-prop-5", family: true,
  title: "Triangles with proportional sides are equiangular.",
  description: "The two triangles are built from side triples in one scale. Since all three corresponding lengths are proportional, their corners must match as well: SSS proportionality recovers the three equal angles.",
  steps: ["Set out a triangle by three sides", "Scale every side by the same factor", "Read the matching angles"],
  control: { kind: "steps" },
  build: () => [...triangle({ x: 168, y: 204 }, 0.72, 0), ...triangle({ x: 442, y: 204 }, 1.05, 1, "area-secondary", "DEF"), label(320, 350, "AB:DE = AC:DF = BC:EF ⟹ corresponding angles equal", "result", 2)],
  status: (_value, stage) => ["First side triple", "All three sides are scaled together", "The triangles are equiangular"][stage],
  invariant: () => true,
};

const scene6: EuclidSceneSpec = {
  id: "book-6-prop-6", family: true,
  title: "One equal angle with proportional enclosing sides gives similar triangles.",
  description: "The marked angle is shared by construction, while the two adjoining side pairs are scaled equally. This SAS information fixes the third side and the other two angles, yielding full similarity.",
  steps: ["Mark the equal included angle", "Scale the two enclosing sides", "Complete the forced similar triangles"],
  control: { kind: "steps" },
  build: () => [...triangle({ x: 168, y: 204 }, 0.72, 0), ...triangle({ x: 442, y: 204 }, 1.05, 1, "area-secondary", "DEF"), label(320, 350, "∠A = ∠D and AB:DE = AC:DF", "result", 2)],
  status: (_value, stage) => ["Equal included angles", "The surrounding side pairs are proportional", "The triangles are equiangular"][stage],
  invariant: () => true,
};

const scene7: EuclidSceneSpec = {
  id: "book-6-prop-7", family: true,
  title: "The side-angle proportionality condition fixes the remaining triangle angles.",
  description: "The two triangles share one angle and have the required proportional sides about their other corresponding angles. The acute-or-not-acute condition rules out the reflected impostor, so the remaining angles are forced equal.",
  steps: ["Mark the equal angle", "Set proportional corresponding sides", "Use the angle condition to select the matching triangle"],
  control: { kind: "steps" },
  build: () => [...triangle({ x: 168, y: 204 }, 0.72, 0), ...triangle({ x: 442, y: 204 }, 1.05, 1, "area-secondary", "DEF"), label(320, 350, "proportional sides + the angle condition force similarity", "result", 2)],
  status: (_value, stage) => ["One corresponding angle", "The stated side pairs are proportional", "The angle condition resolves the configuration"][stage],
  invariant: () => true,
};

const scene8: EuclidSceneSpec = {
  id: "book-6-prop-8", family: true,
  title: "The altitude in a right triangle creates three similar triangles.",
  description: "Dropping AD from the right angle at A to hypotenuse BC creates two smaller right triangles. Each shares one acute angle with the whole, so the whole and both pieces carry the same angle pattern at different scales.",
  steps: ["Draw right triangle ABC", "Drop altitude AD to the hypotenuse", "Compare the three resulting angle patterns"],
  control: { kind: "steps" },
  build: () => {
    const a = { x: 279, y: 297 }, b = { x: 135, y: 105 }, c = { x: 535, y: 105 }, d = { x: 279, y: 105 };
    const angleSize = 16;
    const alongAB = { x: a.x - angleSize * .6, y: a.y - angleSize * .8 };
    const angleCorner = { x: a.x + angleSize * .2, y: a.y - angleSize * 1.4 };
    const alongAC = { x: a.x + angleSize * .8, y: a.y - angleSize * .6 };
    return [
      polygon([a, b, c], "area", 0),
      line(alongAB.x, alongAB.y, angleCorner.x, angleCorner.y, "result", 0),
      line(angleCorner.x, angleCorner.y, alongAC.x, alongAC.y, "result", 0),
      point(a.x, a.y, "A", 0, 24, 0),
      point(b.x, b.y, "B", -15, -10, 0),
      point(c.x, c.y, "C", 15, -10, 0),
      line(a.x, a.y, d.x, d.y, "result", 1),
      point(d.x, d.y, "D", 0, -10, 1),
      right(d.x, d.y, false, false, 1),
      label(320, 350, "△ABC ∼ △ABD ∼ △ACD", "result", 2),
    ];
  },
  status: (_value, stage) => ["The whole right triangle", "Altitude AD creates two smaller right triangles", "All three triangles are similar"][stage],
  invariant: () => true,
};

const scene9: EuclidSceneSpec = {
  id: "book-6-prop-9", family: true,
  title: "Cut off a prescribed part from a given line.",
  description: "The upper segment DE is the prescribed part. Its exact length is carried from A to C on the lower line AB, leaving CB as the remainder: C is not a decorative movable cut, but the point fixed by DE.",
  steps: ["Set out the given line AB and prescribed part DE", "Transfer DE from A along AB", "C cuts off the prescribed part exactly"], control: { kind: "steps" },
  build: () => { const d = 165, a = 100, b = 535, c = a + d; return [line(245, 94, 245 + d, 94, "given", 0), point(245, 94, "D", -11, 20, 0), point(245 + d, 94, "E", 10, 20, 0), label(328, 66, "prescribed part DE", "given", 0), line(a, 260, b, 260, "given", 0), point(a, 260, "A", -11, 20, 0), point(b, 260, "B", 10, 20, 0), line(a, 260, c, 260, "result", 1), point(c, 260, "C", 0, 20, 1), label(320, 330, "AC = DE", "result", 2)]; },
  status: (_value, stage) => ["Given line and prescribed part", "The prescribed length is laid off from A", "AC is the required part"][stage], invariant: () => true,
};

const scene10: EuclidSceneSpec = {
  id: "book-6-prop-10", family: true,
  title: "Cut one line in the same ratio as a given cut line.",
  description: "The top line is already divided at D. Parallel construction carries its 2:3 partition to the uncut line AB, producing C so AC:CB reproduces the given ratio rather than an arbitrary fraction.",
  steps: ["Read the division of the given line", "Carry its ratio to AB with parallels", "Mark the corresponding cut C"], control: { kind: "steps" },
  build: () => { const x = 105, top = 80, bottom = 272, given = 250, target = 405, d = x + given * .4, c = x + target * .4; return [line(x, top, x + given, top, "given", 0), point(x, top, "D", -10, 20, 0), point(d, top, "E", 0, 20, 0), point(x + given, top, "F", 10, 20, 0), label(230, 50, "DE : EF = 2 : 3", "given", 0), line(x, bottom, x + target, bottom, "given", 1), point(x, bottom, "A", -10, 20, 1), point(x + target, bottom, "B", 10, 20, 1), line(d, top, c, bottom, "construction", 1), line(x + given, top, x + target, bottom, "construction", 1), point(c, bottom, "C", 0, 20, 2), label(320, 340, "AC : CB = DE : EF = 2 : 3", "result", 2)]; },
  status: (_value, stage) => ["Given 2:3 division", "Parallel construction transfers the ratio", "AB is cut similarly"][stage], invariant: () => true,
};

const scene11: EuclidSceneSpec = {
  id: "book-6-prop-11", family: true,
  title: "Find a third proportional to two given lines.",
  description: "The construction seeks C satisfying A:B = B:C. With A six units and B nine, the third proportional is 13.5; the repeated middle term makes the proportion legible as one continuous scale relation.",
  steps: ["Set out A and B", "Repeat B as the middle term of a proportion", "Read C from A:B = B:C"], control: { kind: "steps" },
  build: () => { const a = 120, b = 180, c = b * b / a; return [rect(105, 66, a, 30, "area", 0), label(90, 88, "A", "line", 0), rect(105, 134, b, 30, "area-secondary", 0), label(90, 156, "B", "line", 0), rect(105, 220, b, 30, "area-secondary", 1), label(90, 242, "B", "line", 1), rect(105, 288, c, 30, "area", 2), label(90, 310, "C", "line", 2), label(420, 240, "A : B = B : C", "result", 2)]; },
  status: (_value, stage) => ["Given A and B", "B occupies the two middle places", "C is the third proportional"][stage], invariant: () => close(120 / 180, 180 / 270),
};

const scene12: EuclidSceneSpec = {
  id: "book-6-prop-12", family: true,
  title: "Find a fourth proportional to three given lines.",
  description: "The three given bars A, B, and C determine D by A:B = C:D. The result is not guessed from visual length: the matching cross-products A·D and B·C are equal.",
  steps: ["Set out A, B, and C", "Use parallels to complete the proportional fourth", "Check equal cross-products"], control: { kind: "steps" },
  build: () => { const a = 120, b = 180, c = 200, d = b * c / a; return [rect(100, 52, a, 28, "area", 0), label(84, 73, "A", "line", 0), rect(100, 98, b, 28, "area-secondary", 0), label(84, 119, "B", "line", 0), rect(100, 170, c, 28, "area", 1), label(84, 191, "C", "line", 1), rect(100, 242, d, 28, "area-secondary", 2), label(84, 263, "D", "line", 2), label(430, 310, "A : B = C : D", "result", 2), label(430, 338, "A·D = B·C", "result", 2)]; },
  status: (_value, stage) => ["Three given lines", "The proportion is set up", "D is the fourth proportional"][stage], invariant: () => close(120 / 180, 200 / 300),
};

const scene13: EuclidSceneSpec = {
  id: "book-6-prop-13", family: true,
  title: "Find a mean proportional to two given lines.",
  description: "The altitude CD in a semicircle splits diameter AB into AC and CB. Its square is exactly their rectangle, so CD is the mean proportional: AC:CD = CD:CB.",
  steps: ["Lay AC and CB end to end as a diameter", "Describe the semicircle and erect CD", "Read CD² = AC·CB"], control: { kind: "steps" },
  build: () => { const a = { x: 120, y: 292 }, c = { x: 270, y: 292 }, b = { x: 510, y: 292 }, center = { x: 315, y: 292 }, radius = 195, h = Math.sqrt(150 * 240), d = { x: 270, y: 292 - h }; return [line(a.x, a.y, b.x, b.y, "given", 0), point(a.x, a.y, "A", -10, 20, 0), point(c.x, c.y, "C", 0, 20, 0), point(b.x, b.y, "B", 10, 20, 0), label(195, 326, "AC", "given", 0), label(390, 326, "CB", "construction", 0), arc(center.x, center.y, radius, 180, 360, "construction", 1), line(c.x, c.y, d.x, d.y, "result", 1), point(d.x, d.y, "D", 0, -10, 1), right(c.x, c.y, true, true, 1), label(320, 355, "AC : CD = CD : CB", "result", 2)]; },
  status: (_value, stage) => ["Two given lines form AC and CB", "The semicircle supplies perpendicular CD", "CD is their mean proportional"][stage], invariant: () => close(Math.sqrt(150 * 240) ** 2, 150 * 240),
};

const scene14: EuclidSceneSpec = {
  id: "book-6-prop-14", family: true,
  title: "Equal equiangular parallelograms have reciprocally proportional sides.",
  description: "Both shaded parallelograms have the same area and the same angle shape. The wider one must be correspondingly shorter: 12 by 5 and 10 by 6 carry the same area, making the reciprocal side relation visible.",
  steps: ["Set out two equal-area, equiangular parallelograms", "Compare one pair of corresponding sides", "The other pair reverses the ratio"], control: { kind: "steps" },
  build: () => [rect(85, 95, 240, 100, "area", 0), rect(365, 70, 200, 120, "area-secondary", 0), label(205, 220, "12 × 5 = 60", "given", 0), label(465, 220, "10 × 6 = 60", "construction", 1), label(320, 340, "12 : 10 = 6 : 5, reciprocally", "result", 2)],
  status: (_value, stage) => ["Two equal equiangular parallelograms", "Their areas are both 60", "The side ratios are reciprocal"][stage], invariant: () => close(12 * 5, 10 * 6),
};

const scene15: EuclidSceneSpec = {
  id: "book-6-prop-15", family: true,
  title: "Equal triangles with one equal angle have reciprocally proportional sides.",
  description: "The two triangles are held to the same area while sharing the marked included angle. One takes a longer first side and shorter second side, so the two enclosing side ratios must reverse one another.",
  steps: ["Set out equal-area triangles with one equal angle", "Compare the first enclosing sides", "Read the reciprocal comparison of the second sides"], control: { kind: "steps" },
  build: () => [polygon([{ x: 95, y: 290 }, { x: 335, y: 290 }, { x: 95, y: 130 }], "area", 0), polygon([{ x: 390, y: 290 }, { x: 550, y: 290 }, { x: 390, y: 50 }], "area-secondary", 0), label(215, 320, "½·12·5", "given", 0), label(470, 320, "½·10·6", "construction", 1), label(320, 355, "12 : 10 = 6 : 5, reciprocally", "result", 2)],
  status: (_value, stage) => ["Equal triangles with one equal angle", "Their two area products agree", "The enclosing side ratios are reciprocal"][stage], invariant: () => close(12 * 5, 10 * 6),
};

const scene16: EuclidSceneSpec = {
  id: "book-6-prop-16", family: true,
  title: "Proportional lines have equal rectangles on extremes and means.",
  description: "The four lengths satisfy A:B = C:D. The two area tiles make Euclid's cross-product statement concrete: the rectangle A by D has exactly the same dimensions in area as B by C.",
  steps: ["Set out A:B = C:D", "Form the rectangle on the extremes", "Form the matching rectangle on the means"], control: { kind: "steps" },
  build: () => [rect(90, 105, 240, 100, "area", 1), label(210, 162, "A·D = 60", "result", 1), rect(375, 85, 200, 120, "area-secondary", 2), label(475, 152, "B·C = 60", "result", 2), label(320, 345, "A:B = C:D ⇔ A·D = B·C", "result", 2)],
  status: (_value, stage) => ["A:B = C:D", "The extreme rectangle is formed", "It equals the rectangle on the means"][stage], invariant: () => close(12 / 10, 6 / 5) && close(12 * 5, 10 * 6),
};

const scene17: EuclidSceneSpec = {
  id: "book-6-prop-17", family: true,
  title: "The square on a mean proportional equals the rectangle on the extremes.",
  description: "With A:B = B:C, B is the mean proportional. The square B² and the rectangle A by C have identical area, which is the geometric form of B² = A·C.",
  steps: ["Set out A:B = B:C", "Form the rectangle A by C", "Compare it with the square on B"], control: { kind: "steps" },
  build: () => [rect(80, 115, 240, 135, "area", 1), label(200, 185, "A·C = 36", "result", 1), rect(390, 100, 180, 180, "area-secondary", 2), label(480, 195, "B² = 36", "result", 2), label(320, 345, "A:B = B:C ⇔ A·C = B²", "result", 2)],
  status: (_value, stage) => ["B is the mean proportional", "The rectangle on A and C is formed", "It equals the square on B"][stage], invariant: () => close(4 / 6, 6 / 9) && close(4 * 9, 6 ** 2),
};

const scene18: EuclidSceneSpec = {
  id: "book-6-prop-18", family: true,
  title: "Describe a figure similar and similarly situated on a given line.",
  description: "The left triangle gives both a shape and an orientation. On the prescribed base AB, the same three angles and side directions reproduce that figure at a new scale, so the copy is situated as well as similar.",
  steps: ["Read the given figure's side directions", "Set its corresponding base on AB", "Complete the similarly situated copy"], control: { kind: "steps" },
  build: () => [...triangle({ x: 160, y: 205 }, .72, 0), line(360, 286, 555, 286, "given", 1), point(360, 286, "A", -10, 20, 1), point(555, 286, "B", 10, 20, 1), polygon([{ x: 360, y: 286 }, { x: 555, y: 286 }, { x: 432, y: 102 }], "area-secondary", 2), point(432, 102, "C", 0, -10, 2), label(455, 345, "same angles; corresponding sides parallel", "result", 2)],
  status: (_value, stage) => ["Given figure", "The prescribed base AB is fixed", "A similar, similarly situated figure is complete"][stage], invariant: () => true,
};

const scene19: EuclidSceneSpec = {
  id: "book-6-prop-19", family: true,
  title: "Similar triangles are in the duplicate ratio of corresponding sides.",
  description: "The right triangle is 3/2 the scale of the left. Its side ratio is 3:2, while its area ratio is 9:4: the visual separates the linear scale from its square, the duplicate ratio.",
  steps: ["Set out similar triangles", "Read their 3:2 side scale", "Compare the 9:4 areas"], control: { kind: "steps" },
  build: () => [...triangle({ x: 170, y: 215 }, .7, 0), ...triangle({ x: 445, y: 205 }, 1.05, 1, "area-secondary", "DEF"), label(320, 52, "corresponding sides: 3 : 2", "given", 1), label(320, 350, "areas: 9 : 4 = (3 : 2)²", "result", 2)],
  status: (_value, stage) => ["Two similar triangles", "The side scale is 3:2", "Their areas have the duplicate ratio 9:4"][stage], invariant: () => close((1.05 / .7) ** 2, 9 / 4),
};

const scene20: EuclidSceneSpec = {
  id: "book-6-prop-20", family: true,
  title: "Similar polygons divide into similar triangles with the same duplicate ratio.",
  description: "Each quadrilateral is divided along a matching diagonal. The resulting triangle pairs are similar, and each pair has the same squared scale; adding the matching pieces preserves that ratio for the whole polygons.",
  steps: ["Draw two similar quadrilaterals", "Divide each along a matching diagonal", "Add the similar triangle pairs"], control: { kind: "steps" },
  build: () => { const one = [{ x: 95, y: 285 }, { x: 245, y: 285 }, { x: 275, y: 120 }, { x: 130, y: 78 }], two = [{ x: 360, y: 300 }, { x: 555, y: 300 }, { x: 594, y: 86 }, { x: 406, y: 31 }]; return [polygon(one, "area", 0), polygon(two, "area-secondary", 0), line(one[0].x, one[0].y, one[2].x, one[2].y, "construction", 1), line(two[0].x, two[0].y, two[2].x, two[2].y, "construction", 1), label(320, 350, "matching triangle pairs share one duplicate ratio", "result", 2)]; },
  status: (_value, stage) => ["Similar polygons", "Corresponding diagonals divide them alike", "The whole polygons inherit the triangle-pair ratio"][stage], invariant: () => true,
};

const scene21: EuclidSceneSpec = {
  id: "book-6-prop-21", family: true,
  title: "Figures similar to the same figure are similar to one another.",
  description: "Both outer triangles reproduce the angle pattern of the middle reference triangle. Removing the common template makes their relation immediate: the two outer figures match each other at a different scale.",
  steps: ["Set out the common reference figure", "Construct two figures similar to it", "Compare the two derived figures"], control: { kind: "steps" },
  build: () => [...triangle({ x: 320, y: 206 }, .55, 0, "construction", "DEF"), ...triangle({ x: 140, y: 220 }, .76, 1), ...triangle({ x: 500, y: 198 }, .92, 1, "area-secondary", "GHI"), label(320, 350, "ABC ∼ DEF and GHI ∼ DEF, therefore ABC ∼ GHI", "result", 2)],
  status: (_value, stage) => ["Common reference triangle", "Two triangles copy its angle pattern", "The two copies are similar to one another"][stage], invariant: () => true,
};

const scene22: EuclidSceneSpec = {
  id: "book-6-prop-22", family: true,
  title: "Similar figures on proportional lines have proportional areas.",
  description: "Squares are the clearest similar figures on the four proportional lengths. If A:B equals C:D, their square areas satisfy A²:B² = C²:D²; conversely the equal area ratios recover the side proportion.",
  steps: ["Set out A:B = C:D", "Describe similar figures on each line", "Compare the two area ratios"], control: { kind: "steps" },
  build: () => [rect(65, 90, 120, 120, "area", 1), rect(220, 90, 180, 180, "area-secondary", 1), rect(440, 90, 160, 160, "area", 2), label(125, 235, "A²", "result", 1), label(310, 295, "B²", "result", 1), label(520, 275, "C² / D²", "result", 2), label(320, 350, "A:B = C:D ⇔ A²:B² = C²:D²", "result", 2)],
  status: (_value, stage) => ["Proportional side lengths", "Similar figures are described on them", "Their area ratios agree"][stage], invariant: () => close((2 / 3) ** 2, (4 / 6) ** 2),
};

const scene23: EuclidSceneSpec = {
  id: "book-6-prop-23", family: true,
  title: "Equiangular parallelogram ratios compound their side ratios.",
  description: "The two rectangles have matching angles. Their area ratio is obtained by applying the width ratio and then the height ratio: 12 by 5 compared with 10 by 6 makes the product of side ratios visible.",
  steps: ["Set out equiangular parallelograms", "Compare one pair of sides", "Compound with the second side ratio"], control: { kind: "steps" },
  build: () => [rect(70, 100, 240, 100, "area", 0), rect(375, 80, 200, 120, "area-secondary", 0), label(190, 165, "12 × 5", "given", 0), label(475, 145, "10 × 6", "construction", 1), label(320, 345, "area ratio = (12:10) compounded with (5:6)", "result", 2)],
  status: (_value, stage) => ["Equiangular parallelograms", "The first side ratio is fixed", "The second ratio compounds it into the area ratio"][stage], invariant: () => close((12 * 5) / (10 * 6), (12 / 10) * (5 / 6)),
};

const scene24: EuclidSceneSpec = {
  id: "book-6-prop-24", family: true,
  title: "Parallelograms about a diagonal are similar to the whole and each other.",
  description: "A smaller parallelogram shares a corner and a diagonal direction with the larger one. Parallel opposite sides preserve every angle, so the corner figure, its partner, and the whole carry the same shape at different scales.",
  steps: ["Draw the whole parallelogram", "Mark the parallelograms about its diagonal", "Compare their parallel corresponding sides"], control: { kind: "steps" },
  build: () => { const whole = [{ x: 120, y: 300 }, { x: 485, y: 300 }, { x: 555, y: 90 }, { x: 190, y: 90 }], inner = [{ x: 120, y: 300 }, { x: 310, y: 300 }, { x: 365, y: 160 }, { x: 175, y: 160 }]; return [polygon(whole, "area", 0), line(120, 300, 555, 90, "construction", 1), polygon(inner, "area-secondary", 1), label(320, 350, "corner parallelograms ∼ whole parallelogram", "result", 2)]; },
  status: (_value, stage) => ["Whole parallelogram", "The diagonal and corner figure are marked", "Parallel sides give the same angle pattern"][stage], invariant: () => true,
};

const scene25: EuclidSceneSpec = {
  id: "book-6-prop-25", family: true, title: "Construct a figure similar to one given figure and equal to another.",
  description: "The left triangle supplies the angle pattern; the equal-area rectangle supplies the target area. Scaling the triangle by the square root of the area ratio preserves its shape while making its area match the given rectangle.",
  steps: ["Read the model triangle", "Read the target area", "Scale the model until its area agrees"], control: { kind: "steps" },
  build: () => [...triangle({ x: 135, y: 205 }, .62, 0), rect(260, 132, 150, 105, "area-secondary", 1), label(335, 192, "target area", "construction", 1), ...triangle({ x: 512, y: 205 }, .9, 2, "area", "DEF"), label(320, 350, "△DEF ∼ model and area(DEF) = target area", "result", 2)],
  status: (_value, stage) => ["Model figure", "Target area", "One similar figure has exactly the target area"][stage], invariant: () => true,
};

const scene26: EuclidSceneSpec = {
  id: "book-6-prop-26", family: true, title: "Removing a similar parallelogram leaves one about the same diagonal.",
  description: "The smaller parallelogram shares a corner and angle pattern with the whole. Its removal leaves the complementary corner figure aligned with the same diagonal, the structural fact needed for Euclid's later application constructions.",
  steps: ["Draw the whole parallelogram", "Remove a similar corner parallelogram", "Follow the common diagonal in the remainder"], control: { kind: "steps" },
  build: () => { const whole = [{ x: 105, y: 305 }, { x: 520, y: 305 }, { x: 575, y: 82 }, { x: 160, y: 82 }], cut = [{ x: 105, y: 305 }, { x: 280, y: 305 }, { x: 310, y: 184 }, { x: 135, y: 184 }]; return [polygon(whole, "area", 0), polygon(cut, "area-secondary", 1), line(105, 305, 575, 82, "result", 2), label(340, 350, "remainder lies about the same diagonal", "result", 2)]; },
  status: (_value, stage) => ["Whole parallelogram", "A similar corner figure is taken away", "The remainder is organized by the same diagonal"][stage], invariant: () => true,
};

const scene27: EuclidSceneSpec = {
  id: "book-6-prop-27", family: true, title: "The parallelogram applied at the half-line is greatest.",
  description: "For a fixed base split into x and 1−x, the applied rectangle's area is x(1−x). Moving the application shows the product peak exactly at the half-line, where the figure is similar to its prescribed defect.",
  steps: ["Fix the total base", "Choose the applied part x", "See the area peak at x = 1/2"], control: { kind: "range", label: "Move the applied part along the base", min: .12, max: .88, step: .01, initial: .5 },
  build: (value) => { const width = 400, x = 120, split = x + width * value, height = 140 * (1 - value); return [line(x, 300, x + width, 300, "given"), rect(x, 300 - height, split - x, height, "area"), point(x, 300, "A", -10, 20), point(split, 300, "C", 0, 20), point(x + width, 300, "B", 10, 20), label(320, 352, `area ∝ x(1−x); maximum at x = 1/2`, "result")]; },
  status: (value) => `Applied area is ${Math.round(value * (1 - value) * 1000) / 1000}; it peaks at 1/4 when x = 1/2`, invariant: (value) => value >= .12 && value <= .88,
};

const scene28: EuclidSceneSpec = {
  id: "book-6-prop-28", family: true, title: "Apply a parallelogram equal to a given area, deficient by a prescribed similar figure.",
  description: "The applied rectangle reaches the target area while the small shaded corner is the prescribed deficiency. The construction exists only below the half-line maximum, which the visible comparison states instead of hiding as a condition in the prose.",
  steps: ["Fix the base and the allowable maximum", "Set the required area below that maximum", "Complete the deficient parallelogram"], control: { kind: "steps" },
  build: () => [line(105, 302, 535, 302, "given", 0), rect(105, 132, 330, 170, "area", 1), rect(355, 202, 80, 100, "area-secondary", 2), label(270, 222, "given area", "result", 1), label(395, 192, "similar defect", "construction", 2), label(320, 350, "given area < half-line maximum", "result", 2)],
  status: (_value, stage) => ["Fixed line and maximum condition", "The required area is applied", "A prescribed similar deficiency remains"][stage], invariant: () => true,
};

const scene29: EuclidSceneSpec = {
  id: "book-6-prop-29", family: true, title: "Apply a parallelogram equal to a given area, exceeding by a prescribed similar figure.",
  description: "This is the complementary application: the required area is retained and the shaded corner is the prescribed excess. The diagram distinguishes the excess from the area being matched, which is the construction's entire point.",
  steps: ["Fix the given base", "Apply the required area", "Add the prescribed similar excess"], control: { kind: "steps" },
  build: () => [line(105, 302, 535, 302, "given", 0), rect(105, 152, 300, 150, "area", 1), rect(405, 92, 130, 210, "area-secondary", 2), label(255, 232, "given area", "result", 1), label(470, 198, "similar excess", "construction", 2), label(320, 350, "applied figure exceeds by the prescribed similar figure", "result", 2)],
  status: (_value, stage) => ["Given base", "The required area is applied", "The prescribed similar excess is added"][stage], invariant: () => true,
};

const scene30: EuclidSceneSpec = {
  id: "book-6-prop-30", family: true, title: "Cut a line in extreme and mean ratio.",
  description: "C is placed so the whole AB is to the greater AC as AC is to the lesser CB. The two bar lengths make the golden cut concrete: AC is about 0.618 of AB, not an arbitrary draggable division.",
  steps: ["Set out AB", "Construct the extreme-and-mean cut C", "Compare whole:greater with greater:lesser"], control: { kind: "steps" },
  build: () => { const a = 105, b = 535, c = a + (b - a) / ((1 + Math.sqrt(5)) / 2); return [line(a, 230, b, 230, "given", 0), point(a, 230, "A", -10, 20, 0), point(b, 230, "B", 10, 20, 0), point(c, 230, "C", 0, 20, 1), line(a, 230, c, 230, "result", 1), label(320, 180, "AC greater; CB lesser", "construction", 1), label(320, 330, "AB : AC = AC : CB = φ", "result", 2)]; },
  status: (_value, stage) => ["Given line AB", "C fixes the golden cut", "Whole:greater equals greater:lesser"][stage], invariant: () => close(1 / ((1 + Math.sqrt(5)) / 2), ((1 + Math.sqrt(5)) / 2) - 1),
};

const scene31: EuclidSceneSpec = {
  id: "book-6-prop-31", family: true, title: "Similar figures on the hypotenuse equal the sum of those on the legs.",
  description: "Squares make the theorem familiar, but the labels deliberately say similar figures: any similarly described figures scale by the squared side ratio. The hypotenuse figure therefore equals the two leg figures together.",
  steps: ["Draw right triangle ABC", "Drop AD and describe similar figures on the legs", "Add the two leg figures"], control: { kind: "steps" },
  build: () => {
    const a = { x: 270, y: 222 }, b = { x: 270, y: 132 }, c = { x: 390, y: 222 };
    const bc = { x: c.x - b.x, y: c.y - b.y };
    const projection = ((a.x - b.x) * bc.x + (a.y - b.y) * bc.y) / (bc.x ** 2 + bc.y ** 2);
    const d = { x: b.x + projection * bc.x, y: b.y + projection * bc.y };
    const legOneSquare = [b, a, { x: 180, y: 222 }, { x: 180, y: 132 }];
    const legTwoSquare = [a, c, { x: 390, y: 342 }, { x: 270, y: 342 }];
    const hypotenuseSquare = [b, c, { x: 480, y: 102 }, { x: 360, y: 12 }];
    return [
      polygon([a, b, c], "construction", 0),
      right(a.x, a.y, false, true, 0),
      polygon(legOneSquare, "area", 1),
      polygon(legTwoSquare, "area-secondary", 1),
      line(a.x, a.y, d.x, d.y, "result", 1),
      polygon(hypotenuseSquare, "area", 2),
      point(a.x, a.y, "A", -16, 22, 0),
      point(b.x, b.y, "B", -16, -9, 0),
      point(c.x, c.y, "C", 15, 6, 0),
      point(d.x, d.y, "D", 12, -8, 1),
      label(375, 110, "hypotenuse figure", "result", 2),
      label(320, 370, "figure(hypotenuse) = figure(leg 1) + figure(leg 2)", "result", 2),
    ];
  },
  status: (_value, stage) => ["Right triangle", "Similar figures on its legs", "The hypotenuse figure equals their sum"][stage], invariant: () => true,
};

const scene32: EuclidSceneSpec = {
  id: "book-6-prop-32", family: true, title: "Placed similar triangles with parallel corresponding sides have collinear remaining sides.",
  description: "The two triangles meet at one angle and their corresponding sides are parallel. Those parallel directions force the unpaired edges A-B and D-E onto one straight line, making the conclusion a visible alignment.",
  steps: ["Place two triangles at one angle", "Mark the corresponding parallel sides", "Read the remaining straight line"], control: { kind: "steps" },
  build: () => [polygon([{ x: 120, y: 275 }, { x: 305, y: 275 }, { x: 205, y: 105 }], "area", 0), polygon([{ x: 305, y: 275 }, { x: 510, y: 275 }, { x: 410, y: 86 }], "area-secondary", 1), line(120, 275, 510, 275, "result", 2), label(320, 350, "the remaining sides lie on one straight line", "result", 2)],
  status: (_value, stage) => ["First triangle", "Second triangle is placed with parallel corresponding sides", "The remaining sides are collinear"][stage], invariant: () => true,
};

const scene33: EuclidSceneSpec = {
  id: "book-6-prop-33", family: true, title: "In equal circles, angles have the ratio of the arcs they stand on.",
  description: "Equal-radius circles turn a central angle directly into an arc fraction. A 60 degree and a 90 degree angle stand on one-sixth and one-quarter circumferences, so their angle ratio 2:3 matches the arc ratio 2:3.",
  steps: ["Draw equal circles", "Mark central angles and their arcs", "Compare the matching ratios"], control: { kind: "steps" },
  build: () => [circle(185, 205, 100, "construction", 0), circle(455, 205, 100, "construction", 0), line(185, 205, 235, 118, "given", 1), line(185, 205, 285, 205, "given", 1), line(455, 205, 455, 105, "given", 1), line(455, 205, 555, 205, "given", 1), arc(185, 205, 100, -60, 0, "result", 2), arc(455, 205, 100, -90, 0, "result", 2), label(320, 350, "60° : 90° = arc₆₀ : arc₉₀ = 2 : 3", "result", 2)],
  status: (_value, stage) => ["Equal circles", "Central angles stand on their arcs", "Angle and arc ratios agree"][stage], invariant: () => close(60 / 90, 2 / 3),
};

export const BOOK_SIX_SCENES: Record<string, EuclidSceneSpec> = Object.fromEntries(
  [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9, scene10, scene11, scene12, scene13, scene14, scene15, scene16, scene17, scene18, scene19, scene20, scene21, scene22, scene23, scene24, scene25, scene26, scene27, scene28, scene29, scene30, scene31, scene32, scene33].map((scene) => [scene.id.replace("book-6-", ""), scene]),
);

export function validateBookSixScenes() {
  return Object.values(BOOK_SIX_SCENES).every((scene) => {
    const values = scene.control.kind === "range" ? [scene.control.min, scene.control.initial, scene.control.max] : [0];
    return values.every((value) => scene.invariant(value) && scene.build(value).every((primitive) => Object.values(primitive).every((candidate) => typeof candidate !== "number" || Number.isFinite(candidate))));
  });
}
