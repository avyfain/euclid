import type { EuclidSceneSpec, ScenePrimitive, SceneTone } from "./book-2-figure-data";

type Point = { x: number; y: number };

const line = (x1: number, y1: number, x2: number, y2: number, tone: SceneTone = "line", stage = 0): ScenePrimitive => ({ kind: "line", x1, y1, x2, y2, tone, stage });
const circle = (cx: number, cy: number, r: number, tone: SceneTone = "construction", stage = 0): ScenePrimitive => ({ kind: "circle", cx, cy, r, tone, stage });
const polygon = (points: Point[], tone: SceneTone = "area", stage = 0): ScenePrimitive => ({ kind: "polygon", points: points.map(({ x, y }) => [x, y]), tone, stage });
const point = (x: number, y: number, text: string, dx = 0, dy = -10, stage = 0): ScenePrimitive => ({ kind: "point", x, y, label: text, dx, dy, stage });
const label = (x: number, y: number, text: string, tone: SceneTone = "line", stage = 0): ScenePrimitive => ({ kind: "label", x, y, text, tone, stage });
const right = (x: number, y: number, flipX = false, flipY = false, stage = 0): ScenePrimitive => ({ kind: "right-angle", x, y, size: 13, flipX, flipY, stage });

const close = (first: number, second: number) => Math.abs(first - second) < 1e-8;
const distance = (first: Point, second: Point) => Math.hypot(first.x - second.x, first.y - second.y);
const midpoint = (first: Point, second: Point): Point => ({ x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 });

function pointOnCircle(center: Point, radius: number, angle: number): Point {
  return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
}

function regularPoints(center: Point, radius: number, sides: number, rotation = -Math.PI / 2): Point[] {
  return Array.from({ length: sides }, (_, index) => pointOnCircle(center, radius, rotation + index * Math.PI * 2 / sides));
}

function transform(points: Point[], center: Point, scale: number, target: Point): Point[] {
  return points.map((candidate) => ({ x: target.x + (candidate.x - center.x) * scale, y: target.y + (candidate.y - center.y) * scale }));
}

function foot(from: Point, start: Point, end: Point): Point {
  const direction = { x: end.x - start.x, y: end.y - start.y };
  const amount = ((from.x - start.x) * direction.x + (from.y - start.y) * direction.y) / (direction.x ** 2 + direction.y ** 2);
  return { x: start.x + amount * direction.x, y: start.y + amount * direction.y };
}

function incenter(first: Point, second: Point, third: Point): Point {
  const a = distance(second, third), b = distance(first, third), c = distance(first, second), sum = a + b + c;
  return { x: (a * first.x + b * second.x + c * third.x) / sum, y: (a * first.y + b * second.y + c * third.y) / sum };
}

function intersectNormal(first: number, second: number, center: Point, radius: number): Point {
  const one = { x: Math.cos(first), y: Math.sin(first) }, two = { x: Math.cos(second), y: Math.sin(second) };
  const d1 = one.x * center.x + one.y * center.y + radius, d2 = two.x * center.x + two.y * center.y + radius;
  const determinant = one.x * two.y - one.y * two.x;
  return { x: (d1 * two.y - one.y * d2) / determinant, y: (one.x * d2 - d1 * two.x) / determinant };
}

function tangentPolygon(center: Point, radius: number, normals: number[]) {
  const vertices = normals.map((normal, index) => intersectNormal(normal, normals[(index + 1) % normals.length], center, radius));
  const contacts = normals.map((normal) => pointOnCircle(center, radius, normal));
  return { vertices, contacts };
}

function labelledPoints(points: Point[], names: string, stage = 0): ScenePrimitive[] {
  return points.map((candidate, index) => point(candidate.x, candidate.y, names[index], index < 2 ? -13 : 10, index % 2 ? 18 : -10, stage));
}

const scene1: EuclidSceneSpec = {
  id: "book-4-prop-1",
  family: true,
  title: "Fit a chord equal to a given line into a circle.",
  description: "Changing the given segment DE changes the horizontal chord AB by exactly the same amount. The two endpoints remain on the circumference, so the moving line is always the required chord, not a decorative cut.",
  steps: ["Set out the given length DE", "Use that length as the chord AB", "Both endpoints of AB lie on the circumference"],
  control: { kind: "range", label: "Change the given length DE", min: 0.16, max: 0.88, step: 0.01, initial: 0.56 },
  build: (value) => {
    const center = { x: 472, y: 195 }, radius = 126, length = 68 + value * 184, half = length / 2;
    const y = center.y - Math.sqrt(radius ** 2 - half ** 2), a = { x: center.x - half, y }, b = { x: center.x + half, y };
    const d = { x: 74, y: 282 }, e = { x: d.x + length, y: d.y };
    return [
      line(d.x, d.y, e.x, e.y, "given"), point(d.x, d.y, "D", -12, 20), point(e.x, e.y, "E", 10, 20), label((d.x + e.x) / 2, 320, "given length DE", "given"),
      circle(center.x, center.y, radius, "construction"), line(a.x, a.y, b.x, b.y, "result"), point(a.x, a.y, "A", -13, -9), point(b.x, b.y, "B", 10, -9),
      line(center.x, center.y, a.x, a.y, "construction"), line(center.x, center.y, b.x, b.y, "construction"), label(472, 355, "AB = DE", "result"),
    ];
  },
  status: () => "The constructed chord AB is exactly equal to DE",
  invariant: (value) => value >= 0.16 && value <= 0.88,
};

const scene2: EuclidSceneSpec = {
  id: "book-4-prop-2",
  family: true,
  title: "Inscribe a triangle equiangular with a given triangle.",
  description: "The triangle DEF at left supplies the three angles. A, B, and C are placed on the given circle so ABC is a scaled copy of DEF: corresponding angles match while its vertices lie on the circumference.",
  steps: ["Read the three angles of DEF", "Place the corresponding vertices on the circle", "ABC is equiangular with DEF"],
  control: { kind: "steps" },
  build: () => {
    const center = { x: 472, y: 195 }, radius = 122, angles = [-2.25, -0.12, 2.42];
    const abc = angles.map((angle) => pointOnCircle(center, radius, angle)), def = transform(abc, center, 0.56, { x: 155, y: 214 });
    return [
      polygon(def, "area", 0), ...labelledPoints(def, "DEF", 0), label(155, 345, "given triangle DEF", "given", 0),
      circle(center.x, center.y, radius, "construction", 1), ...labelledPoints(abc, "ABC", 1),
      polygon(abc, "area-secondary", 2), label(472, 355, "∠A = ∠D, ∠B = ∠E, ∠C = ∠F", "result", 2),
    ];
  },
  status: (_value, stage) => ["Given triangle DEF", "Corresponding vertices lie on the circle", "The inscribed triangle has the same three angles"][stage],
  invariant: () => true,
};

const scene3: EuclidSceneSpec = {
  id: "book-4-prop-3",
  family: true,
  title: "Circumscribe a triangle equiangular with a given triangle about a circle.",
  description: "The three sides of ABC are tangents to the circle. DEF is an exact smaller copy of ABC, so its angles are transferred while the circle remains tangent to every constructed side.",
  steps: ["Set out the given triangle DEF", "Draw the three matching tangent sides", "The tangent triangle ABC is equiangular with DEF"],
  control: { kind: "steps" },
  build: () => {
    const center = { x: 470, y: 196 }, radius = 100, normals = [-Math.PI / 2, 0.12, 2.73];
    const tangent = tangentPolygon(center, radius, normals), given = transform(tangent.vertices, center, 0.56, { x: 150, y: 215 });
    return [
      polygon(given, "area", 0), ...labelledPoints(given, "DEF", 0), label(150, 350, "given triangle DEF", "given", 0),
      circle(center.x, center.y, radius, "construction", 1), polygon(tangent.vertices, "area-secondary", 1), ...labelledPoints(tangent.vertices, "ABC", 1),
      ...tangent.contacts.flatMap((contact, index) => [line(center.x, center.y, contact.x, contact.y, "construction", 2), right(contact.x, contact.y, contact.x < center.x, contact.y < center.y, 2), point(contact.x, contact.y, "PQR"[index], 9, -9, 2)]),
      label(470, 360, "∠A = ∠D, ∠B = ∠E, ∠C = ∠F", "result", 2),
    ];
  },
  status: (_value, stage) => ["Given triangle DEF", "ABC is drawn through three tangent lines", "The radii prove each side touches the circle"][stage],
  invariant: () => true,
};

const scene4: EuclidSceneSpec = {
  id: "book-4-prop-4",
  family: true,
  title: "Inscribe a circle in a given triangle.",
  description: "The internal angle bisectors meet at I. Its perpendicular distances to all three sides are equal, so a circle centered at I reaches the triangle exactly at E, F, and G.",
  steps: ["Draw triangle ABC", "Intersect two internal angle bisectors at I", "Drop equal perpendiculars to the three sides and draw the circle"],
  control: { kind: "steps" },
  build: () => {
    const a = { x: 190, y: 310 }, b = { x: 450, y: 310 }, c = { x: 327, y: 75 }, i = incenter(a, b, c);
    const e = foot(i, a, b), f = foot(i, b, c), g = foot(i, c, a), radius = distance(i, e);
    return [
      polygon([a, b, c], "area", 0), ...labelledPoints([a, b, c], "ABC", 0),
      line(b.x, b.y, i.x, i.y, "construction", 1), line(c.x, c.y, i.x, i.y, "construction", 1), point(i.x, i.y, "I", 10, -9, 1),
      circle(i.x, i.y, radius, "result", 2), line(i.x, i.y, e.x, e.y, "construction", 2), line(i.x, i.y, f.x, f.y, "construction", 2), line(i.x, i.y, g.x, g.y, "construction", 2),
      right(e.x, e.y, false, false, 2), right(f.x, f.y, f.x < i.x, f.y < i.y, 2), right(g.x, g.y, g.x < i.x, g.y < i.y, 2), ...labelledPoints([e, f, g], "EFG", 2),
      label(320, 365, "IE = IF = IG: the circle touches all three sides", "result", 2),
    ];
  },
  status: (_value, stage) => ["Triangle ABC", "Its angle bisectors locate I", "The equal perpendiculars give the incircle"][stage],
  invariant: () => true,
};

const scene5: EuclidSceneSpec = {
  id: "book-4-prop-5",
  family: true,
  title: "Circumscribe a circle about a given triangle.",
  description: "The perpendicular bisectors of two sides meet at O. Since O is equally far from A, B, and C, one circle centered at O passes through every vertex of the triangle.",
  steps: ["Draw triangle ABC", "Construct perpendicular bisectors of AB and AC", "Use their intersection O as the circle's centre"],
  control: { kind: "steps" },
  build: () => {
    const o = { x: 320, y: 190 }, radius = 128, a = pointOnCircle(o, radius, -2.44), b = pointOnCircle(o, radius, -0.28), c = pointOnCircle(o, radius, 2.1);
    const ab = midpoint(a, b), ac = midpoint(a, c);
    const bisector = (middle: Point) => {
      const dx = o.x - middle.x, dy = o.y - middle.y, length = Math.hypot(dx, dy);
      return line(middle.x - dx * 105 / length, middle.y - dy * 105 / length, middle.x + dx * 105 / length, middle.y + dy * 105 / length, "construction", 1);
    };
    return [
      polygon([a, b, c], "area", 0), ...labelledPoints([a, b, c], "ABC", 0),
      bisector(ab), bisector(ac), point(ab.x, ab.y, "D", -8, 19, 1), point(ac.x, ac.y, "E", -12, -9, 1),
      circle(o.x, o.y, radius, "result", 2), point(o.x, o.y, "O", 10, -8, 2), line(o.x, o.y, a.x, a.y, "construction", 2), line(o.x, o.y, b.x, b.y, "construction", 2), line(o.x, o.y, c.x, c.y, "construction", 2),
      label(320, 360, "OA = OB = OC", "result", 2),
    ];
  },
  status: (_value, stage) => ["Triangle ABC", "Two side bisectors meet at O", "The circle through A, B, and C is fixed"][stage],
  invariant: () => true,
};

const scene6: EuclidSceneSpec = {
  id: "book-4-prop-6",
  family: true,
  title: "Inscribe a square in a given circle.",
  description: "Two perpendicular diameters give four right central angles. Joining their endpoints makes four congruent isosceles triangles, hence the inscribed quadrilateral has equal sides and right angles.",
  steps: ["Draw two perpendicular diameters", "Mark their four circumference endpoints", "Join consecutive endpoints to form the square"],
  control: { kind: "steps" },
  build: () => {
    const o = { x: 320, y: 190 }, radius = 128, vertices = regularPoints(o, radius, 4);
    return [
      circle(o.x, o.y, radius, "construction", 0), line(192, 190, 448, 190, "given", 0), line(320, 62, 320, 318, "given", 0), point(o.x, o.y, "O", 10, -8, 0), right(o.x, o.y, true, true, 0),
      ...labelledPoints(vertices, "ABCD", 1),
      polygon(vertices, "area", 2), label(320, 355, "AB = BC = CD = DA and every angle is right", "result", 2),
    ];
  },
  status: (_value, stage) => ["Perpendicular diameters", "Four equal quarter-arcs", "The joined endpoints form an inscribed square"][stage],
  invariant: () => true,
};

const scene7: EuclidSceneSpec = {
  id: "book-4-prop-7",
  family: true,
  title: "Circumscribe a square about a given circle.",
  description: "The four tangent lines at the endpoints of perpendicular diameters form a square. Each radius meets its side at a right angle, fixing equal distances from the centre to all four sides.",
  steps: ["Draw perpendicular diameters of the circle", "Draw a tangent at each endpoint", "Their intersections form the circumscribed square"],
  control: { kind: "steps" },
  build: () => {
    const o = { x: 320, y: 190 }, radius = 112, tangent = tangentPolygon(o, radius, [-Math.PI / 2, 0, Math.PI / 2, Math.PI]);
    return [
      circle(o.x, o.y, radius, "construction", 0), line(o.x - radius, o.y, o.x + radius, o.y, "given", 0), line(o.x, o.y - radius, o.x, o.y + radius, "given", 0), point(o.x, o.y, "O", 9, -8, 0),
      ...tangent.contacts.flatMap((contact) => [line(o.x, o.y, contact.x, contact.y, "construction", 1), right(contact.x, contact.y, contact.x < o.x, contact.y < o.y, 1)]),
      polygon(tangent.vertices, "area", 2), ...labelledPoints(tangent.vertices, "ABCD", 2), label(320, 355, "each side touches the circle", "result", 2),
    ];
  },
  status: (_value, stage) => ["Perpendicular diameters", "Four radius-tangent right angles", "The tangent intersections give a square"][stage],
  invariant: () => true,
};

const scene8: EuclidSceneSpec = {
  id: "book-4-prop-8",
  family: true,
  title: "Inscribe a circle in a given square.",
  description: "The centre O of the square is equally distant from the midpoints E, F, G, and H of its four sides. That common half-side is the radius of the circle tangent to every side.",
  steps: ["Draw the given square ABCD", "Bisect all four sides", "Draw the circle centered at the square's centre"],
  control: { kind: "steps" },
  build: () => {
    const a = { x: 205, y: 75 }, b = { x: 435, y: 75 }, c = { x: 435, y: 305 }, d = { x: 205, y: 305 }, o = { x: 320, y: 190 };
    const e = midpoint(a, b), f = midpoint(b, c), g = midpoint(c, d), h = midpoint(d, a);
    return [
      polygon([a, b, c, d], "area", 0), ...labelledPoints([a, b, c, d], "ABCD", 0),
      point(o.x, o.y, "O", 10, -8, 1), ...labelledPoints([e, f, g, h], "EFGH", 1), line(o.x, o.y, e.x, e.y, "construction", 1), line(o.x, o.y, f.x, f.y, "construction", 1),
      circle(o.x, o.y, distance(o, e), "result", 2), label(320, 355, "OE = OF = OG = OH", "result", 2),
    ];
  },
  status: (_value, stage) => ["Given square ABCD", "The side midpoints are equidistant from O", "The circle touches all four sides"][stage],
  invariant: () => true,
};

const scene9: EuclidSceneSpec = {
  id: "book-4-prop-9",
  family: true,
  title: "Circumscribe a circle about a given square.",
  description: "The diagonals AC and BD meet at O, the common centre of the square. Their half-diagonals OA, OB, OC, and OD are equal, so the circle centered at O passes through all four corners.",
  steps: ["Draw the given square ABCD", "Join the diagonals and locate O", "Draw the circle through the four vertices"],
  control: { kind: "steps" },
  build: () => {
    const a = { x: 205, y: 75 }, b = { x: 435, y: 75 }, c = { x: 435, y: 305 }, d = { x: 205, y: 305 }, o = { x: 320, y: 190 };
    return [
      polygon([a, b, c, d], "area", 0), ...labelledPoints([a, b, c, d], "ABCD", 0),
      line(a.x, a.y, c.x, c.y, "construction", 1), line(b.x, b.y, d.x, d.y, "construction", 1), point(o.x, o.y, "O", 10, -8, 1),
      circle(o.x, o.y, distance(o, a), "result", 2), label(320, 355, "OA = OB = OC = OD", "result", 2),
    ];
  },
  status: (_value, stage) => ["Given square ABCD", "The diagonals locate O", "The circle passes through every vertex"][stage],
  invariant: () => true,
};

const scene10: EuclidSceneSpec = {
  id: "book-4-prop-10",
  family: true,
  title: "Construct an isosceles triangle whose base angles are double its vertex angle.",
  description: "Varying BC preserves the 36 degree vertex angle at A and the two 72 degree base angles. The equal sides satisfy AB = AC = φ times BC, exposing the golden-ratio construction beneath this familiar pentagon angle pattern.",
  steps: ["Set out the base BC", "Construct equal sides AB and AC", "Read the doubled base angles"],
  control: { kind: "range", label: "Change the base BC", min: 0.12, max: 0.86, step: 0.01, initial: 0.5 },
  build: (value) => {
    const base = 132 + value * 62, b = { x: 320 - base / 2, y: 326 }, c = { x: 320 + base / 2, y: 326 };
    const a = { x: 320, y: b.y - base / 2 * Math.tan(72 * Math.PI / 180) };
    return [
      line(b.x, b.y, c.x, c.y, "given"), line(a.x, a.y, b.x, b.y, "result"), line(a.x, a.y, c.x, c.y, "result"), ...labelledPoints([a, b, c], "ABC"),
      label(320, 58, "∠A = 36°", "given"), label(320, 365, "∠B = ∠C = 72° = 2∠A", "result"), label(320, 90, "AB = AC = φ·BC", "construction"),
    ];
  },
  status: () => "Each base angle remains exactly double the vertex angle",
  invariant: (value) => {
    const base = 132 + value * 62, side = base / (2 * Math.sin(Math.PI / 10));
    return close(side / base, (1 + Math.sqrt(5)) / 2);
  },
};

const scene11: EuclidSceneSpec = {
  id: "book-4-prop-11",
  family: true,
  title: "Inscribe a regular pentagon in a given circle.",
  description: "Five equal central angles divide the circumference into five equal arcs. Their equal chords are the five sides of the pentagon, and the equal arcs also force its five equal angles.",
  steps: ["Divide the circumference into five equal arcs", "Mark the five vertices", "Join consecutive vertices"],
  control: { kind: "steps" },
  build: () => {
    const o = { x: 320, y: 190 }, radius = 130, vertices = regularPoints(o, radius, 5);
    return [
      circle(o.x, o.y, radius, "construction", 0), point(o.x, o.y, "O", 10, -8, 0),
      ...vertices.map((vertex) => line(o.x, o.y, vertex.x, vertex.y, "construction", 1)), ...labelledPoints(vertices, "ABCDE", 1),
      polygon(vertices, "area", 2), label(320, 355, "five equal arcs give five equal chords", "result", 2),
    ];
  },
  status: (_value, stage) => ["The given circle", "Five equal central angles mark equal arcs", "The equal chords form a regular pentagon"][stage],
  invariant: () => true,
};

const scene12: EuclidSceneSpec = {
  id: "book-4-prop-12",
  family: true,
  title: "Circumscribe a regular pentagon about a given circle.",
  description: "Tangents at five equally spaced contact points form the five sides. Each radius is perpendicular to its tangent, so the circle has the same distance to every side and the outer pentagon is regular.",
  steps: ["Mark five equal contact points on the circle", "Draw the five tangent lines", "Read the circumscribed regular pentagon"],
  control: { kind: "steps" },
  build: () => {
    const o = { x: 320, y: 190 }, radius = 106, normals = Array.from({ length: 5 }, (_, index) => -Math.PI / 2 + index * Math.PI * 2 / 5);
    const tangent = tangentPolygon(o, radius, normals);
    return [
      circle(o.x, o.y, radius, "construction", 0), point(o.x, o.y, "O", 10, -8, 0), ...labelledPoints(tangent.contacts, "ABCDE", 0),
      ...tangent.contacts.flatMap((contact) => [line(o.x, o.y, contact.x, contact.y, "construction", 1), right(contact.x, contact.y, contact.x < o.x, contact.y < o.y, 1)]),
      polygon(tangent.vertices, "area", 2), label(320, 355, "five tangent sides make the regular pentagon", "result", 2),
    ];
  },
  status: (_value, stage) => ["Five equally spaced contact points", "The radii are perpendicular to the tangent sides", "The tangent intersections give a regular pentagon"][stage],
  invariant: () => true,
};

const scene13: EuclidSceneSpec = {
  id: "book-4-prop-13",
  family: true,
  title: "Inscribe a circle in a regular pentagon.",
  description: "The common centre O is equally distant from all five sides of a regular pentagon. A perpendicular from O to one side reaches its midpoint M, and that apothem is the radius of the inscribed circle.",
  steps: ["Draw the regular pentagon", "Drop a perpendicular from its centre to one side", "Use the common apothem as the circle's radius"],
  control: { kind: "steps" },
  build: () => {
    const o = { x: 320, y: 190 }, circumradius = 132, vertices = regularPoints(o, circumradius, 5), m = midpoint(vertices[0], vertices[1]), apothem = distance(o, m);
    return [
      polygon(vertices, "area", 0), ...labelledPoints(vertices, "ABCDE", 0), point(o.x, o.y, "O", 10, -8, 1),
      line(o.x, o.y, m.x, m.y, "construction", 1), point(m.x, m.y, "M", 10, -8, 1), right(m.x, m.y, m.x < o.x, m.y < o.y, 1),
      circle(o.x, o.y, apothem, "result", 2), label(320, 355, "OM is the equal distance to every side", "result", 2),
    ];
  },
  status: (_value, stage) => ["Given regular pentagon", "OM is perpendicular to a side", "The common apothem gives the incircle"][stage],
  invariant: () => true,
};

const scene14: EuclidSceneSpec = {
  id: "book-4-prop-14",
  family: true,
  title: "Circumscribe a circle about a regular pentagon.",
  description: "The perpendicular bisectors of two sides meet at the common centre O. Every vertex of the regular pentagon lies the same distance from O, so the circle centered there passes through all five vertices.",
  steps: ["Draw the regular pentagon", "Construct perpendicular bisectors of two sides", "Draw the circle through the five vertices"],
  control: { kind: "steps" },
  build: () => {
    const o = { x: 320, y: 190 }, radius = 132, vertices = regularPoints(o, radius, 5);
    const ab = midpoint(vertices[0], vertices[1]), bc = midpoint(vertices[1], vertices[2]);
    const bisector = (middle: Point) => {
      const dx = o.x - middle.x, dy = o.y - middle.y, length = Math.hypot(dx, dy);
      return line(middle.x - dx * 105 / length, middle.y - dy * 105 / length, middle.x + dx * 105 / length, middle.y + dy * 105 / length, "construction", 1);
    };
    return [
      polygon(vertices, "area", 0), ...labelledPoints(vertices, "ABCDE", 0),
      bisector(ab), bisector(bc), point(ab.x, ab.y, "F", 8, -8, 1), point(bc.x, bc.y, "G", 10, 18, 1), point(o.x, o.y, "O", 10, -8, 1),
      circle(o.x, o.y, radius, "result", 2), line(o.x, o.y, vertices[0].x, vertices[0].y, "construction", 2), label(320, 355, "OA = OB = OC = OD = OE", "result", 2),
    ];
  },
  status: (_value, stage) => ["Given regular pentagon", "Two side bisectors locate O", "The circle passes through all five vertices"][stage],
  invariant: () => true,
};

const scene15: EuclidSceneSpec = {
  id: "book-4-prop-15",
  family: true,
  title: "Inscribe a regular hexagon in a given circle.",
  description: "A radius OA is already the correct chord length: six copies step exactly around the circle. Joining those six equally spaced points gives an equilateral and equiangular hexagon.",
  steps: ["Mark one radius OA", "Step that radius around the circumference six times", "Join the six points to form the hexagon"],
  control: { kind: "steps" },
  build: () => {
    const o = { x: 320, y: 190 }, radius = 130, vertices = regularPoints(o, radius, 6);
    return [
      circle(o.x, o.y, radius, "construction", 0), point(o.x, o.y, "O", 10, -8, 0), line(o.x, o.y, vertices[0].x, vertices[0].y, "given", 0), point(vertices[0].x, vertices[0].y, "A", -12, -8, 0),
      ...labelledPoints(vertices.slice(1), "BCDEF", 1), line(vertices[0].x, vertices[0].y, vertices[1].x, vertices[1].y, "result", 1), label(320, 50, "OA = AB", "result", 1),
      polygon(vertices, "area", 2), label(320, 355, "six equal radius-chords fill the circumference", "result", 2),
    ];
  },
  status: (_value, stage) => ["Radius OA", "The first side AB equals that radius", "Six equal chords form the regular hexagon"][stage],
  invariant: () => true,
};

const scene16: EuclidSceneSpec = {
  id: "book-4-prop-16",
  family: true,
  title: "Inscribe a regular fifteen-sided figure in a given circle.",
  description: "The pentagon contributes 72 degree steps and the equilateral triangle contributes 120 degree steps. Their 48 degree difference can be bisected to make the 24 degree central step required for fifteen equal arcs.",
  steps: ["Mark the 72 degree pentagon step", "Mark the 120 degree triangle step", "Subtract and bisect to obtain 24 degrees", "Step 24 degrees around the circle"],
  control: { kind: "steps" },
  build: () => {
    const o = { x: 320, y: 190 }, radius = 132, five = regularPoints(o, radius, 5), three = regularPoints(o, radius, 3), fifteen = regularPoints(o, radius, 15);
    return [
      circle(o.x, o.y, radius, "construction", 0), point(o.x, o.y, "O", 10, -8, 0), polygon(five, "area", 1), label(320, 43, "pentagon step = 72°", "given", 1),
      polygon(three, "area-secondary", 2), label(320, 365, "triangle step = 120°", "construction", 2),
      line(o.x, o.y, fifteen[0].x, fifteen[0].y, "result", 3), line(o.x, o.y, fifteen[1].x, fifteen[1].y, "result", 3), label(320, 335, "120° − 72° = 48°; bisect to 24°", "result", 3),
      polygon(fifteen, "area", 3), ...labelledPoints([fifteen[0], fifteen[3], fifteen[6], fifteen[9], fifteen[12]], "ABCDE", 3), label(320, 355, "15 equal central steps of 24°", "result", 3),
    ];
  },
  status: (_value, stage) => ["The given circle", "A pentagon supplies 72°", "A triangle supplies 120°", "Twenty-four-degree steps produce the regular fifteen-gon"][stage],
  invariant: () => close(15 * 24, 360),
};

export const BOOK_FOUR_SCENES: Record<string, EuclidSceneSpec> = Object.fromEntries(
  [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9, scene10, scene11, scene12, scene13, scene14, scene15, scene16]
    .map((scene) => [scene.id.replace("book-4-", ""), scene]),
);

export function validateBookFourScenes() {
  return Object.values(BOOK_FOUR_SCENES).every((scene) => {
    const samples = scene.control.kind === "range" ? [scene.control.min, scene.control.initial, scene.control.max] : [0];
    return samples.every((value) => scene.invariant(value) && scene.build(value).every((primitive) =>
      Object.values(primitive).every((candidate) => typeof candidate !== "number" || Number.isFinite(candidate)),
    ));
  });
}
