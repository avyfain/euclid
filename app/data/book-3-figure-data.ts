import type { EuclidSceneSpec, ScenePrimitive, SceneTone } from "./book-2-figure-data";

type Point = { x: number; y: number };

const line = (x1: number, y1: number, x2: number, y2: number, tone: SceneTone = "line", stage = 0): ScenePrimitive => ({ kind: "line", x1, y1, x2, y2, tone, stage });
const circle = (cx: number, cy: number, r: number, tone: SceneTone = "construction", stage = 0): ScenePrimitive => ({ kind: "circle", cx, cy, r, tone, stage });
const point = (x: number, y: number, text: string, dx = 0, dy = -10, stage = 0): ScenePrimitive => ({ kind: "point", x, y, label: text, dx, dy, stage });
const label = (x: number, y: number, text: string, tone: SceneTone = "line", stage = 0): ScenePrimitive => ({ kind: "label", x, y, text, tone, stage });
const right = (x: number, y: number, flipX = false, flipY = false, stage = 0): ScenePrimitive => ({ kind: "right-angle", x, y, size: 14, flipX, flipY, stage });

function pointOnCircle(center: Point, radius: number, angle: number): Point {
  return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
}

function chordAtY(center: Point, radius: number, y: number) {
  const half = Math.sqrt(radius ** 2 - (y - center.y) ** 2);
  return { left: { x: center.x - half, y }, right: { x: center.x + half, y } };
}

function rayToCircle(pointFrom: Point, center: Point, radius: number, angle: number) {
  const unit = { x: Math.cos(angle), y: Math.sin(angle) };
  const relative = { x: pointFrom.x - center.x, y: pointFrom.y - center.y };
  const projection = relative.x * unit.x + relative.y * unit.y;
  const discriminant = projection ** 2 - (relative.x ** 2 + relative.y ** 2 - radius ** 2);
  const distance = -projection + Math.sqrt(Math.max(0, discriminant));
  return { point: { x: pointFrom.x + unit.x * distance, y: pointFrom.y + unit.y * distance }, distance };
}

function secantFromOutside(pointFrom: Point, center: Point, radius: number, angle: number) {
  const unit = { x: Math.cos(angle), y: Math.sin(angle) };
  const relative = { x: pointFrom.x - center.x, y: pointFrom.y - center.y };
  const projection = relative.x * unit.x + relative.y * unit.y;
  const discriminant = projection ** 2 - (relative.x ** 2 + relative.y ** 2 - radius ** 2);
  const root = Math.sqrt(Math.max(0, discriminant));
  const nearDistance = -projection - root;
  const farDistance = -projection + root;
  return {
    near: { x: pointFrom.x + unit.x * nearDistance, y: pointFrom.y + unit.y * nearDistance },
    far: { x: pointFrom.x + unit.x * farDistance, y: pointFrom.y + unit.y * farDistance },
    nearDistance,
    farDistance,
  };
}

function angleAt(vertex: Point, first: Point, second: Point) {
  const one = { x: first.x - vertex.x, y: first.y - vertex.y };
  const two = { x: second.x - vertex.x, y: second.y - vertex.y };
  const cosine = (one.x * two.x + one.y * two.y) / (Math.hypot(one.x, one.y) * Math.hypot(two.x, two.y));
  return Math.acos(Math.max(-1, Math.min(1, cosine)));
}

const center = { x: 320, y: 190 };
const radius = 130;

const scene1: EuclidSceneSpec = {
  id: "book-3-prop-1",
  family: true,
  title: "Two chord bisectors locate the centre of a given circle.",
  description: "Bisecting two unrelated chords and erecting perpendiculars through their midpoints produces two lines that meet only at the circle's centre O.",
  steps: ["Take two arbitrary chords AB and EF", "Bisect the chords at D and G", "Draw the perpendiculars through D and G", "Their intersection O is the centre"],
  control: { kind: "steps" },
  build: () => {
    const first = chordAtY(center, radius, 115);
    const secondX = 383;
    const secondHalf = Math.sqrt(radius ** 2 - (secondX - center.x) ** 2);
    const e = { x: secondX, y: center.y - secondHalf };
    const f = { x: secondX, y: center.y + secondHalf };
    return [
      circle(center.x, center.y, radius, "construction", 0),
      line(first.left.x, first.left.y, first.right.x, first.right.y, "given", 0),
      line(e.x, e.y, f.x, f.y, "given", 0),
      point(first.left.x, first.left.y, "A", -14, -8, 0), point(first.right.x, first.right.y, "B", 10, -8, 0),
      point(e.x, e.y, "E", 10, -8, 0), point(f.x, f.y, "F", 10, 18, 0),
      point(center.x, first.left.y, "D", -14, 20, 1), point(secondX, center.y, "G", 10, -8, 1),
      label(center.x, 90, "AD = DB", "result", 1), label(449, center.y - 8, "EG = GF", "result", 1),
      line(center.x, 44, center.x, 336, "result", 2),
      line(170, center.y, 470, center.y, "result", 2),
      right(center.x, first.left.y, true, first.left.y < center.y, 2),
      right(secondX, center.y, true, true, 2),
      point(center.x, center.y, "O", 10, -10, 3),
      label(320, 362, "The perpendicular bisectors meet at O", "result", 3),
    ];
  },
  status: (_value, stage) => ["Two chords in the given circle", "D and G bisect the chords", "Both bisectors pass through the centre", "O is the centre of the circle"][stage],
  invariant: () => true,
};

const scene2: EuclidSceneSpec = {
  id: "book-3-prop-2",
  family: true,
  title: "A chord joining two circumference points stays inside the circle.",
  description: "Move B around the circumference. The full chord AB remains in the disc: a circle contains every segment between two of its points.",
  steps: ["Choose two points A and B on the circumference", "Join A to B", "The entire chord lies within the circle"],
  control: { kind: "range", label: "Move B around the circumference", min: 0.12, max: 0.88, step: 0.01, initial: 0.5 },
  build: (value) => {
    const a = pointOnCircle(center, radius, -2.48);
    const b = pointOnCircle(center, radius, -0.2 + value * 2.15);
    return [
      circle(center.x, center.y, radius),
      line(a.x, a.y, b.x, b.y, "result"),
      line(center.x, center.y, a.x, a.y, "construction"), line(center.x, center.y, b.x, b.y, "construction"),
      point(center.x, center.y, "O", 9, -8), point(a.x, a.y, "A", -15, -8), point(b.x, b.y, "B", 10, -8),
      label(320, 360, "Every point of chord AB is inside the circle", "result"),
    ];
  },
  status: () => "The chord AB remains within the circle",
  invariant: (value) => value >= 0.12 && value <= 0.88,
};

const scene3: EuclidSceneSpec = {
  id: "book-3-prop-3",
  family: true,
  title: "A central line bisecting a chord is perpendicular to it, and conversely.",
  description: "The centre O, midpoint D, and the diameter line up. Equal radii make the two triangles on either side of OD congruent, so the chord is bisected exactly when OD meets it at a right angle.",
  steps: ["Draw chord AB and diameter through O", "Mark D as the midpoint of AB", "Compare the equal-radius triangles", "OD is perpendicular to AB, and the converse holds"],
  control: { kind: "steps" },
  build: () => {
    const chord = chordAtY(center, radius, 270);
    return [
      circle(center.x, center.y, radius, "construction", 0),
      line(chord.left.x, chord.left.y, chord.right.x, chord.right.y, "given", 0),
      line(center.x, 60, center.x, 320, "given", 0),
      point(chord.left.x, chord.left.y, "A", -15, 18, 0), point(chord.right.x, chord.right.y, "B", 10, 18, 0), point(center.x, center.y, "O", 10, -8, 0),
      point(center.x, chord.left.y, "D", 10, 20, 1), label(center.x, 294, "AD = DB", "result", 1),
      line(center.x, center.y, chord.left.x, chord.left.y, "construction", 2), line(center.x, center.y, chord.right.x, chord.right.y, "construction", 2),
      label(215, 210, "OA = OB", "result", 2),
      right(center.x, chord.left.y, true, true, 3),
      label(320, 350, "OD ⟂ AB exactly when AD = DB", "result", 3),
    ];
  },
  status: (_value, stage) => ["A diameter and a chord", "D bisects AB", "The radius pairs are equal", "Bisecting and perpendicularity are equivalent"][stage],
  invariant: () => true,
};

const scene4: EuclidSceneSpec = {
  id: "book-3-prop-4",
  family: true,
  title: "Two noncentral chords cannot bisect one another.",
  description: "The crossing point P is not either chord's midpoint: D and G are the actual midpoints, and their perpendicular bisectors meet at O rather than P.",
  steps: ["Draw two chords that cross at P", "Locate their distinct midpoints D and G", "Draw the two perpendicular bisectors", "They meet at O, not at P"],
  control: { kind: "steps" },
  build: () => {
    const first = chordAtY(center, radius, 130);
    const x = 375;
    const half = Math.sqrt(radius ** 2 - (x - center.x) ** 2);
    const e = { x, y: center.y - half }, f = { x, y: center.y + half };
    const p = { x, y: first.left.y };
    return [
      circle(center.x, center.y, radius, "construction", 0),
      line(first.left.x, first.left.y, first.right.x, first.right.y, "given", 0), line(e.x, e.y, f.x, f.y, "given", 0),
      point(first.left.x, first.left.y, "A", -15, -8, 0), point(first.right.x, first.right.y, "B", 10, -8, 0), point(e.x, e.y, "E", 10, -8, 0), point(f.x, f.y, "F", 10, 18, 0), point(p.x, p.y, "P", 10, -10, 0),
      point(center.x, first.left.y, "D", -14, 20, 1), point(x, center.y, "G", 10, -8, 1),
      label(center.x, 104, "D is midpoint of AB", "result", 1), label(466, center.y + 4, "G is midpoint of EF", "result", 1),
      line(center.x, 48, center.x, 332, "result", 2), line(180, center.y, 470, center.y, "result", 2),
      point(center.x, center.y, "O", 10, -10, 3), label(320, 358, "P is not D or G, so neither chord bisects the other", "result", 3),
    ];
  },
  status: (_value, stage) => ["Chords cross at P", "Their midpoints are D and G", "Each midpoint has its own central bisector", "The noncentral chords do not bisect one another"][stage],
  invariant: () => true,
};

const scene5: EuclidSceneSpec = {
  id: "book-3-prop-5",
  family: true,
  title: "Intersecting circles have distinct centres.",
  description: "Move one circle while retaining two intersections. Its centre P cannot coincide with O: two equal-radius circles with one centre would be the same circle, not cutting circles.",
  steps: ["Set out two circles that cut", "Mark their two intersection points", "Compare the distinct centres O and P"],
  control: { kind: "range", label: "Change the distance between the centres", min: 0.15, max: 0.85, step: 0.01, initial: 0.5 },
  build: (value) => {
    const r = 130;
    const separation = 74 + value * 130;
    const o = { x: 320 - separation / 2, y: 190 }, p = { x: 320 + separation / 2, y: 190 };
    const h = Math.sqrt(r ** 2 - (separation / 2) ** 2);
    return [
      circle(o.x, o.y, r), circle(p.x, p.y, r), line(o.x, o.y, p.x, p.y, "result"),
      point(o.x, o.y, "O", -14, -8), point(p.x, p.y, "P", 10, -8),
      point(320, 190 - h, "A", -12, -8), point(320, 190 + h, "B", -12, 18),
      label(320, 350, "The cutting circles have O ≠ P", "result"),
    ];
  },
  status: () => "Two intersections require two distinct centres",
  invariant: (value) => {
    const separation = 74 + value * 130;
    return separation > 0 && separation < 260;
  },
};

const scene6: EuclidSceneSpec = {
  id: "book-3-prop-6",
  family: true,
  title: "Touching circles have distinct centres.",
  description: "The circles meet at exactly T while their centres O and P remain a radius-sum apart. Moving the first radius preserves that one contact point.",
  steps: ["Set out two circles with one contact point T", "Join the centres O and P", "Read OP as the sum of the two radii"],
  control: { kind: "range", label: "Change one radius while preserving contact", min: 0.18, max: 0.84, step: 0.01, initial: 0.5 },
  build: (value) => {
    const r1 = 82 + value * 45, r2 = 68, o = { x: 155, y: 190 }, t = { x: 155 + r1, y: 190 }, p = { x: t.x + r2, y: 190 };
    return [
      circle(o.x, o.y, r1), circle(p.x, p.y, r2), line(o.x, o.y, p.x, p.y, "result"),
      point(o.x, o.y, "O", -14, -8), point(p.x, p.y, "P", 10, -8), point(t.x, t.y, "T", 0, 20),
      label((o.x + t.x) / 2, 164, "r₁", "construction"), label((t.x + p.x) / 2, 164, "r₂", "construction"),
      label(320, 350, "OP = r₁ + r₂; O ≠ P", "result"),
    ];
  },
  status: () => "One contact point, two distinct centres",
  invariant: (value) => Number.isFinite(value),
};

const scene7: EuclidSceneSpec = {
  id: "book-3-prop-7",
  family: true,
  title: "From an interior noncentral point, the central ray is greatest and its opposite is least.",
  description: "P moves along the diameter but is never O. PB passes through O and is longest; PA is shortest; the symmetric oblique rays PQ and PR are equal and lie between them.",
  steps: ["Choose P inside the circle but away from O", "Draw the diameter ray PA-PB through O", "Compare it with two symmetric oblique rays"],
  control: { kind: "range", label: "Move the interior point P", min: 0.12, max: 0.88, step: 0.01, initial: 0.5 },
  build: (value) => {
    const offset = 30 + value * 62;
    const p = { x: center.x - offset, y: center.y };
    const a = { x: center.x - radius, y: center.y }, b = { x: center.x + radius, y: center.y };
    const q = rayToCircle(p, center, radius, -0.72).point;
    const r = rayToCircle(p, center, radius, 0.72).point;
    return [
      circle(center.x, center.y, radius), line(a.x, a.y, b.x, b.y, "given"),
      line(p.x, p.y, a.x, a.y, "construction"), line(p.x, p.y, b.x, b.y, "result"),
      line(p.x, p.y, q.x, q.y, "construction"), line(p.x, p.y, r.x, r.y, "construction"),
      point(a.x, a.y, "A", -15, 18), point(b.x, b.y, "B", 10, 18), point(q.x, q.y, "Q", 8, -8), point(r.x, r.y, "R", 8, 18),
      point(p.x, p.y, "P", -8, -10), point(center.x, center.y, "O", 8, -10),
      label(320, 344, "PB greatest; PA least; PQ = PR", "result"),
    ];
  },
  status: () => "The central ray is greatest and the opposite ray least",
  invariant: (value) => {
    const offset = 30 + value * 62;
    const p = { x: center.x - offset, y: center.y };
    const oblique = rayToCircle(p, center, radius, 0.72).distance;
    return oblique < radius + offset && oblique > radius - offset;
  },
};

const scene8: EuclidSceneSpec = {
  id: "book-3-prop-8",
  family: true,
  title: "From an exterior point, the central secant is longest and its exterior part shortest.",
  description: "The central secant PAB supplies the two extremes. Symmetric oblique secants pass through near points C and E and far points D and F, visibly bracketing the central lengths.",
  steps: ["Choose exterior point P and the central secant PAB", "Draw symmetric oblique secants PC-D and PE-F", "Compare the near and far reaches"],
  control: { kind: "range", label: "Move the exterior point P", min: 0.12, max: 0.88, step: 0.01, initial: 0.5 },
  build: (value) => {
    const distance = radius + 42 + value * 78;
    const p = { x: center.x - distance, y: center.y };
    const a = { x: center.x - radius, y: center.y }, b = { x: center.x + radius, y: center.y };
    const angle = Math.asin(radius / distance) * 0.64;
    const upper = secantFromOutside(p, center, radius, -angle);
    const lower = secantFromOutside(p, center, radius, angle);
    return [
      circle(center.x, center.y, radius), line(p.x, p.y, b.x, b.y, "result"),
      line(p.x, p.y, upper.far.x, upper.far.y, "construction"), line(p.x, p.y, lower.far.x, lower.far.y, "construction"),
      point(p.x, p.y, "P", -14, -8), point(a.x, a.y, "A", -15, 18), point(b.x, b.y, "B", 10, 18),
      point(upper.near.x, upper.near.y, "C", -14, -8), point(upper.far.x, upper.far.y, "D", 10, -8),
      point(lower.near.x, lower.near.y, "E", -14, 18), point(lower.far.x, lower.far.y, "F", 10, 18),
      label(320, 344, "PB greatest; PA least; PC = PE and PD = PF", "result"),
    ];
  },
  status: () => "Central far reach greatest; central exterior reach least",
  invariant: (value) => {
    const distance = radius + 42 + value * 78;
    const p = { x: center.x - distance, y: center.y };
    const centralNear = distance - radius, centralFar = distance + radius;
    const diagonal = secantFromOutside(p, center, radius, Math.asin(radius / distance) * 0.64);
    return diagonal.nearDistance > centralNear && diagonal.farDistance < centralFar;
  },
};

const scene9: EuclidSceneSpec = {
  id: "book-3-prop-9",
  family: true,
  title: "Three equal reaches from an interior point identify the centre.",
  description: "If P has more than two equal straight lines to the circumference, it cannot be off-centre: the three equal reaches shown here are radii, so P coincides with O.",
  steps: ["Assume three equal lines from P meet the circumference", "Compare the three equal reaches", "Their common point P must be O"],
  control: { kind: "steps" },
  build: () => {
    const endpoints = [-Math.PI / 2, Math.PI / 6, Math.PI * 5 / 6].map((angle) => pointOnCircle(center, radius, angle));
    return [
      circle(center.x, center.y, radius, "construction", 0), point(center.x, center.y, "P", 10, -8, 0),
      ...endpoints.flatMap((endpoint, index) => [line(center.x, center.y, endpoint.x, endpoint.y, "given", 1), point(endpoint.x, endpoint.y, ["A", "B", "C"][index], index === 2 ? -15 : 10, index === 0 ? -10 : 18, 1)]),
      label(320, 345, "PA = PB = PC, therefore P = O", "result", 2), point(center.x, center.y, "O", -18, 20, 2),
    ];
  },
  status: (_value, stage) => ["Interior point P", "Three equal reaches from P", "P is the centre O"][stage],
  invariant: () => true,
};

const scene10: EuclidSceneSpec = {
  id: "book-3-prop-10",
  family: true,
  title: "Two circles meet in at most two points.",
  description: "Move the second centre while the circles keep two crossings. The only shared circumference points are A and B; a third would force the same circle.",
  steps: ["Set out two distinct circles", "Mark their crossings A and B", "No third common point is possible"],
  control: { kind: "range", label: "Change the separation of the circles", min: 0.12, max: 0.88, step: 0.01, initial: 0.5 },
  build: (value) => {
    const r1 = 120, r2 = 96, separation = 44 + value * 138;
    const o = { x: 320 - separation / 2, y: 190 }, p = { x: 320 + separation / 2, y: 190 };
    const along = (r1 ** 2 - r2 ** 2 + separation ** 2) / (2 * separation);
    const h = Math.sqrt(r1 ** 2 - along ** 2);
    const ix = o.x + along;
    return [
      circle(o.x, o.y, r1), circle(p.x, p.y, r2), line(o.x, o.y, p.x, p.y, "construction"),
      point(o.x, o.y, "O", -14, -8), point(p.x, p.y, "P", 10, -8),
      point(ix, 190 - h, "A", 10, -8), point(ix, 190 + h, "B", 10, 18),
      label(320, 345, "A and B are the only common points", "result"),
    ];
  },
  status: () => "The two circles share only A and B",
  invariant: (value) => {
    const separation = 44 + value * 138;
    return separation > 24 && separation < 216;
  },
};

const scene11: EuclidSceneSpec = {
  id: "book-3-prop-11",
  family: true,
  title: "The centres of internally touching circles line up with their contact point.",
  description: "The smaller circle moves inside the larger while retaining the single internal contact T. The line through O and P necessarily continues through T.",
  steps: ["Set out internally touching circles", "Join their centres O and P", "Produce OP to the contact point T"],
  control: { kind: "range", label: "Change the inner radius while preserving contact", min: 0.14, max: 0.86, step: 0.01, initial: 0.5 },
  build: (value) => {
    const outer = 125, inner = 46 + value * 46;
    const o = { x: 190, y: 190 }, t = { x: o.x + outer, y: o.y }, p = { x: t.x - inner, y: o.y };
    return [
      circle(o.x, o.y, outer), circle(p.x, p.y, inner), line(o.x - outer - 20, o.y, t.x + 25, t.y, "result"),
      point(o.x, o.y, "O", -14, -8), point(p.x, p.y, "P", 0, -10), point(t.x, t.y, "T", 0, 20),
      label(320, 350, "O, P, and T lie on one straight line", "result"),
    ];
  },
  status: () => "The centres and internal contact are collinear",
  invariant: (value) => Number.isFinite(value),
};

const scene12: EuclidSceneSpec = {
  id: "book-3-prop-12",
  family: true,
  title: "The centres of externally touching circles line up with their contact point.",
  description: "The circles share exactly T. As their radii vary, the join of their centres O and P still runs through that exterior contact point.",
  steps: ["Set out externally touching circles", "Join their centres O and P", "The joined line passes through T"],
  control: { kind: "range", label: "Change the radii while preserving contact", min: 0.14, max: 0.86, step: 0.01, initial: 0.5 },
  build: (value) => {
    const leftRadius = 82 + value * 42, rightRadius = 64;
    const o = { x: 150, y: 190 }, t = { x: o.x + leftRadius, y: o.y }, p = { x: t.x + rightRadius, y: o.y };
    return [
      circle(o.x, o.y, leftRadius), circle(p.x, p.y, rightRadius), line(o.x - 22, o.y, p.x + 22, p.y, "result"),
      point(o.x, o.y, "O", -14, -8), point(p.x, p.y, "P", 10, -8), point(t.x, t.y, "T", 0, 20),
      label(320, 350, "O, T, and P lie on one straight line", "result"),
    ];
  },
  status: () => "The centres and external contact are collinear",
  invariant: (value) => Number.isFinite(value),
};

const scene13: EuclidSceneSpec = {
  id: "book-3-prop-13",
  family: true,
  title: "Two circles can have only one touching point.",
  description: "At a tangency the common line of centres reaches both circumferences at just T. A second contact would make the circles coincide or cut, not touch.",
  steps: ["Set out two circles with one common point", "Mark their line of centres", "Read T as their only contact"],
  control: { kind: "steps" },
  build: () => {
    const o = { x: 210, y: 190 }, r1 = 112, r2 = 74, t = { x: o.x + r1, y: o.y }, p = { x: t.x + r2, y: o.y };
    return [
      circle(o.x, o.y, r1, "construction", 0), circle(p.x, p.y, r2, "construction", 0),
      point(t.x, t.y, "T", 0, 20, 1),
      line(o.x, o.y, p.x, p.y, "result", 2), point(o.x, o.y, "O", -14, -8, 2), point(p.x, p.y, "P", 10, -8, 2),
      label(320, 350, "T is the only common point", "result", 2),
    ];
  },
  status: (_value, stage) => ["Externally tangent circles", "Their single contact is T", "No second touching point is possible"][stage],
  invariant: () => true,
};

const scene14: EuclidSceneSpec = {
  id: "book-3-prop-14",
  family: true,
  title: "Equal chords are equally distant from the centre, and conversely.",
  description: "The symmetric chords AB and CD have equal length and equal perpendicular distances from O. Move them together to see the two statements of the proposition coincide.",
  steps: ["Set out two chords on opposite sides of O", "Drop perpendiculars OM and ON", "Equal chords and equal distances are equivalent"],
  control: { kind: "range", label: "Move the equal chords together", min: 0.14, max: 0.78, step: 0.01, initial: 0.5 },
  build: (value) => {
    const offset = 28 + value * 78;
    const upper = chordAtY(center, radius, center.y - offset);
    const lower = chordAtY(center, radius, center.y + offset);
    return [
      circle(center.x, center.y, radius), line(upper.left.x, upper.left.y, upper.right.x, upper.right.y, "given"), line(lower.left.x, lower.left.y, lower.right.x, lower.right.y, "given"),
      line(center.x, center.y, center.x, upper.left.y, "construction"), line(center.x, center.y, center.x, lower.left.y, "construction"),
      right(center.x, upper.left.y, true, true), right(center.x, lower.left.y, true, false),
      point(upper.left.x, upper.left.y, "A", -14, -8), point(upper.right.x, upper.right.y, "B", 10, -8), point(lower.left.x, lower.left.y, "C", -14, 18), point(lower.right.x, lower.right.y, "D", 10, 18),
      point(center.x, upper.left.y, "M", 10, -8), point(center.x, lower.left.y, "N", 10, 18), point(center.x, center.y, "O", 10, -8),
      label(320, 350, "AB = CD exactly when OM = ON", "result"),
    ];
  },
  status: () => "Equal chords and equal central distances match",
  invariant: (value) => value >= 0.14 && value <= 0.78,
};

const scene15: EuclidSceneSpec = {
  id: "book-3-prop-15",
  family: true,
  title: "The diameter is greatest; chords nearer the centre are greater.",
  description: "The diameter passes through O. As the two parallel chords move away from O, their visible widths shrink in lockstep with their greater distance from the centre.",
  steps: ["Draw the diameter through O", "Draw a nearer chord AB", "Compare it with farther chord CD"],
  control: { kind: "range", label: "Move the two chords away from the centre", min: 0.12, max: 0.78, step: 0.01, initial: 0.5 },
  build: (value) => {
    const nearOffset = 24 + value * 42;
    const farOffset = nearOffset + 36;
    const near = chordAtY(center, radius, center.y - nearOffset);
    const far = chordAtY(center, radius, center.y + farOffset);
    return [
      circle(center.x, center.y, radius), line(center.x - radius, center.y, center.x + radius, center.y, "result"),
      line(near.left.x, near.left.y, near.right.x, near.right.y, "given"), line(far.left.x, far.left.y, far.right.x, far.right.y, "construction"),
      line(center.x, center.y, center.x, near.left.y, "construction"), line(center.x, center.y, center.x, far.left.y, "construction"),
      point(center.x - radius, center.y, "E", -15, 18), point(center.x + radius, center.y, "F", 10, 18), point(center.x, center.y, "O", 10, -8),
      point(near.left.x, near.left.y, "A", -14, -8), point(near.right.x, near.right.y, "B", 10, -8), point(far.left.x, far.left.y, "C", -14, 18), point(far.right.x, far.right.y, "D", 10, 18),
      label(320, 350, "EF > AB > CD as distance from O increases", "result"),
    ];
  },
  status: () => "The nearer chord is the greater chord",
  invariant: (value) => value >= 0.12 && value <= 0.78,
};

const scene16: EuclidSceneSpec = {
  id: "book-3-prop-16",
  family: true,
  title: "The perpendicular at a diameter endpoint is the unique tangent there.",
  description: "The tangent at T is perpendicular to the diameter OT and remains wholly outside the circle except at T. The proof's angle comparison begins from this one-contact boundary.",
  steps: ["Draw diameter OT", "Raise the perpendicular through T", "The perpendicular meets the circle only at T"],
  control: { kind: "steps" },
  build: () => {
    const t = { x: center.x + radius, y: center.y }, a = { x: center.x - radius, y: center.y };
    return [
      circle(center.x, center.y, radius, "construction", 0), line(a.x, a.y, t.x, t.y, "given", 0), point(a.x, a.y, "A", -15, 18, 0), point(t.x, t.y, "T", 10, 18, 0), point(center.x, center.y, "O", 10, -8, 0),
      line(t.x, 44, t.x, 336, "result", 1),
      right(t.x, t.y, true, true, 2), label(320, 350, "OT ⟂ tangent, with T as the sole contact", "result", 2),
    ];
  },
  status: (_value, stage) => ["Diameter OT", "Perpendicular through its endpoint T", "The endpoint perpendicular is the tangent"][stage],
  invariant: () => true,
};

const scene17: EuclidSceneSpec = {
  id: "book-3-prop-17",
  family: true,
  title: "A tangent from an exterior point follows from the circle on OP as diameter.",
  description: "Bisect OP at M and draw the circle with OP as diameter. Its intersection T with the given circle makes OTP a right angle, so PT touches the given circle.",
  steps: ["Join exterior P to centre O", "Bisect OP at M and describe its diameter-circle", "Intersect it with the given circle at T", "Join PT: OT is perpendicular to the tangent"],
  control: { kind: "steps" },
  build: () => {
    const o = { x: 278, y: 208 }, p = { x: 450, y: 208 }, r = 106, m = { x: (o.x + p.x) / 2, y: o.y };
    const diameterRadius = (p.x - o.x) / 2;
    const x = (r ** 2 - diameterRadius ** 2 + (p.x - o.x) ** 2) / (2 * (p.x - o.x));
    const t = { x: o.x + x, y: o.y - Math.sqrt(r ** 2 - x ** 2) };
    return [
      circle(o.x, o.y, r, "construction", 0), point(o.x, o.y, "O", -14, -8, 0), point(p.x, p.y, "P", 10, -8, 0), line(o.x, o.y, p.x, p.y, "given", 0),
      point(m.x, m.y, "M", 0, 20, 1), label(m.x, 238, "OM = MP", "result", 1), circle(m.x, m.y, diameterRadius, "construction", 1),
      point(t.x, t.y, "T", 0, -12, 2), line(p.x, p.y, t.x, t.y, "result", 2), line(o.x, o.y, t.x, t.y, "construction", 2),
      right(t.x, t.y, true, true, 3), label(320, 350, "OT ⟂ PT, therefore PT touches the circle", "result", 3),
    ];
  },
  status: (_value, stage) => ["Join exterior P to O", "The circle on OP as diameter", "T determines PT", "PT is tangent at T"][stage],
  invariant: () => true,
};

const scene18: EuclidSceneSpec = {
  id: "book-3-prop-18",
  family: true,
  title: "The radius to a tangent point is perpendicular to the tangent.",
  description: "At the sole contact T, a nonperpendicular radius would put the tangent inside the circle. The radius OT therefore meets it at a right angle.",
  steps: ["Mark the tangent's contact point T", "Join O to T", "Read the right angle at T"],
  control: { kind: "steps" },
  build: () => {
    const t = { x: center.x + radius, y: center.y };
    return [
      circle(center.x, center.y, radius, "construction", 0), line(t.x, 52, t.x, 328, "given", 0), point(t.x, t.y, "T", 10, 18, 0), point(center.x, center.y, "O", 10, -8, 0),
      line(center.x, center.y, t.x, t.y, "result", 1), right(t.x, t.y, true, true, 2),
      label(320, 350, "OT is perpendicular to the tangent at T", "result", 2),
    ];
  },
  status: (_value, stage) => ["Tangent at T", "Radius OT", "OT ⟂ tangent"][stage],
  invariant: () => true,
};

const scene19: EuclidSceneSpec = {
  id: "book-3-prop-19",
  family: true,
  title: "A line perpendicular to a tangent at contact contains the centre.",
  description: "The line through T perpendicular to the tangent has the same defining direction as the radius. It must therefore pass through O.",
  steps: ["Set out tangent at T", "Draw the perpendicular through T", "The perpendicular reaches O"],
  control: { kind: "steps" },
  build: () => {
    const t = { x: center.x + radius, y: center.y };
    return [
      circle(center.x, center.y, radius, "construction", 0), line(t.x, 52, t.x, 328, "given", 0), point(t.x, t.y, "T", 10, 18, 0),
      line(150, center.y, 490, center.y, "result", 1), right(t.x, t.y, true, true, 1),
      point(center.x, center.y, "O", 10, -8, 2), label(320, 350, "The perpendicular through T contains O", "result", 2),
    ];
  },
  status: (_value, stage) => ["Tangent at T", "Perpendicular through T", "The perpendicular passes through O"][stage],
  invariant: () => true,
};

const scene20: EuclidSceneSpec = {
  id: "book-3-prop-20",
  family: true,
  title: "The angle at the centre is double the angle at the circumference on the same arc.",
  description: "A and B fix one arc. O sees that arc at the centre while C sees it from the remaining circumference; the central opening is exactly twice the inscribed one.",
  steps: ["Fix arc AB", "Join A and B to O and C", "Compare the central and inscribed angles"],
  control: { kind: "steps" },
  build: () => {
    const a = pointOnCircle(center, radius, -2.45), b = pointOnCircle(center, radius, -0.58), c = pointOnCircle(center, radius, 1.62);
    return [
      circle(center.x, center.y, radius, "construction", 0), line(a.x, a.y, b.x, b.y, "given", 0), point(a.x, a.y, "A", -14, -8, 0), point(b.x, b.y, "B", 10, -8, 0), point(c.x, c.y, "C", 10, 18, 0),
      line(center.x, center.y, a.x, a.y, "construction", 1), line(center.x, center.y, b.x, b.y, "construction", 1), line(c.x, c.y, a.x, a.y, "result", 1), line(c.x, c.y, b.x, b.y, "result", 1), point(center.x, center.y, "O", 10, -8, 1),
      label(320, 350, "∠AOB = 2∠ACB", "result", 2),
    ];
  },
  status: (_value, stage) => ["Arc AB", "Central and inscribed angles on the same arc", "The central angle is double"][stage],
  invariant: () => true,
};

const scene21: EuclidSceneSpec = {
  id: "book-3-prop-21",
  family: true,
  title: "Angles standing on the same chord in the same segment are equal.",
  description: "A and B fix the chord. C and D lie on the same remaining arc, so both angles ACB and ADB stand on the same segment and have the same opening.",
  steps: ["Fix chord AB", "Choose C and D on the same segment", "Join each point to A and B", "The two inscribed angles are equal"],
  control: { kind: "steps" },
  build: () => {
    const a = pointOnCircle(center, radius, -2.46), b = pointOnCircle(center, radius, -0.68);
    const c = pointOnCircle(center, radius, 1.42), d = pointOnCircle(center, radius, 2.08);
    return [
      circle(center.x, center.y, radius, "construction", 0), line(a.x, a.y, b.x, b.y, "given", 0), point(a.x, a.y, "A", -14, -8, 0), point(b.x, b.y, "B", 10, -8, 0),
      point(c.x, c.y, "C", 10, 18, 1), point(d.x, d.y, "D", -15, 18, 1),
      line(c.x, c.y, a.x, a.y, "result", 2), line(c.x, c.y, b.x, b.y, "result", 2), line(d.x, d.y, a.x, a.y, "construction", 2), line(d.x, d.y, b.x, b.y, "construction", 2),
      label(320, 350, "∠ACB = ∠ADB", "result", 3),
    ];
  },
  status: (_value, stage) => ["Chord AB", "C and D on the same segment", "Both angles stand on AB", "Angles in the same segment are equal"][stage],
  invariant: () => true,
};

const scene22: EuclidSceneSpec = {
  id: "book-3-prop-22",
  family: true,
  title: "Opposite angles of a cyclic quadrilateral sum to two right angles.",
  description: "The four vertices all lie on one circle. Opposite angles A and C subtend the two complementary arcs between B and D, and together make two right angles.",
  steps: ["Place A, B, C, and D on the circle", "Join the cyclic quadrilateral", "Compare opposite angles A and C"],
  control: { kind: "steps" },
  build: () => {
    const a = pointOnCircle(center, radius, -2.46), b = pointOnCircle(center, radius, -0.62), c = pointOnCircle(center, radius, 0.68), d = pointOnCircle(center, radius, 2.38);
    return [
      circle(center.x, center.y, radius, "construction", 0),
      ...[a, b, c, d].map((vertex, index) => point(vertex.x, vertex.y, ["A", "B", "C", "D"][index], vertex.x < center.x ? -15 : 10, vertex.y < center.y ? -8 : 18, 0)),
      line(a.x, a.y, b.x, b.y, "given", 1), line(b.x, b.y, c.x, c.y, "given", 1), line(c.x, c.y, d.x, d.y, "given", 1), line(d.x, d.y, a.x, a.y, "given", 1),
      line(a.x, a.y, c.x, c.y, "construction", 2), line(b.x, b.y, d.x, d.y, "construction", 2),
      label(320, 350, "∠A + ∠C = two right angles", "result", 2),
    ];
  },
  status: (_value, stage) => ["Four concyclic points", "Cyclic quadrilateral ABCD", "Opposite angles are supplementary"][stage],
  invariant: () => true,
};

const scene23: EuclidSceneSpec = {
  id: "book-3-prop-23",
  family: true,
  title: "Two similar unequal segments cannot stand on the same chord and side.",
  description: "The shared chord AB admits many unequal arcs, but their inscribed angles differ. Similarity would require equal angles, which forces the same arc and therefore the same segment.",
  steps: ["Fix the common chord AB", "Compare two unequal arcs on its upper side", "Their different openings prevent similarity", "Equal angle would force the segments to coincide"],
  control: { kind: "steps" },
  build: () => {
    const a = { x: 190, y: 225 }, b = { x: 450, y: 225 };
    const c1 = { x: 320, y: 305 }, r1 = Math.hypot(a.x - c1.x, a.y - c1.y);
    const c2 = { x: 320, y: 375 }, r2 = Math.hypot(a.x - c2.x, a.y - c2.y);
    const start1 = Math.atan2(a.y - c1.y, a.x - c1.x) * 180 / Math.PI;
    const end1 = Math.atan2(b.y - c1.y, b.x - c1.x) * 180 / Math.PI;
    const start2 = Math.atan2(a.y - c2.y, a.x - c2.x) * 180 / Math.PI;
    const end2 = Math.atan2(b.y - c2.y, b.x - c2.x) * 180 / Math.PI;
    return [
      line(a.x, a.y, b.x, b.y, "given", 0), point(a.x, a.y, "A", -14, 18, 0), point(b.x, b.y, "B", 10, 18, 0),
      { kind: "arc", cx: c1.x, cy: c1.y, r: r1, start: start1, end: end1, tone: "result", stage: 1 },
      label(320, 153, "first segment", "result", 1),
      { kind: "arc", cx: c2.x, cy: c2.y, r: r2, start: start2, end: end2, tone: "construction", stage: 2 },
      label(320, 187, "unequal candidate", "construction", 2),
      label(320, 350, "Same shape would force the same arc on AB", "result", 3),
    ];
  },
  status: (_value, stage) => ["Common chord AB", "One segment on AB", "An unequal candidate has a different opening", "Similar segments on AB must be equal"][stage],
  invariant: () => true,
};

const scene24: EuclidSceneSpec = {
  id: "book-3-prop-24",
  family: true,
  title: "Similar segments on equal chords are equal.",
  description: "The two circles have equal radii and the chords AB and CD have equal length. Their matching arcs rise by the same amount, so the complete segments coincide in size and shape.",
  steps: ["Set out equal circles", "Draw equal chords AB and CD", "Compare the matching segments"],
  control: { kind: "steps" },
  build: () => {
    const left = { x: 205, y: 205 }, rightCenter = { x: 435, y: 205 }, r = 98, chordY = 160;
    const leftChord = chordAtY(left, r, chordY), rightChord = chordAtY(rightCenter, r, chordY);
    return [
      circle(left.x, left.y, r, "construction", 0), circle(rightCenter.x, rightCenter.y, r, "construction", 0),
      line(leftChord.left.x, chordY, leftChord.right.x, chordY, "given", 1), line(rightChord.left.x, chordY, rightChord.right.x, chordY, "given", 1),
      point(leftChord.left.x, chordY, "A", -14, -8, 1), point(leftChord.right.x, chordY, "B", 10, -8, 1), point(rightChord.left.x, chordY, "C", -14, -8, 1), point(rightChord.right.x, chordY, "D", 10, -8, 1),
      label(320, 350, "equal chord and similar arc give equal segments", "result", 2),
    ];
  },
  status: (_value, stage) => ["Equal circles", "Equal chords AB and CD", "The corresponding segments are equal"][stage],
  invariant: () => true,
};

const scene25: EuclidSceneSpec = {
  id: "book-3-prop-25",
  family: true,
  title: "The perpendicular bisector completes the circle of a given segment.",
  description: "The given chord AB and its arc determine a unique centre O on the perpendicular bisector of AB. Once O is found, the whole circle follows from the common radius OA = OB.",
  steps: ["Start with the given chord AB and circular arc", "Bisect AB at M and erect its perpendicular", "Locate O on that perpendicular", "Describe the complete circle"],
  control: { kind: "steps" },
  build: () => {
    const o = { x: 320, y: 302 }, r = 154, y = 194;
    const chord = chordAtY(o, r, y);
    const start = Math.atan2(chord.left.y - o.y, chord.left.x - o.x) * 180 / Math.PI;
    const end = Math.atan2(chord.right.y - o.y, chord.right.x - o.x) * 180 / Math.PI;
    return [
      line(chord.left.x, chord.left.y, chord.right.x, chord.right.y, "given", 0),
      { kind: "arc", cx: o.x, cy: o.y, r, start, end, tone: "given", stage: 0 },
      point(chord.left.x, chord.left.y, "A", -14, 18, 0), point(chord.right.x, chord.right.y, "B", 10, 18, 0),
      point(o.x, y, "M", 10, -8, 1), line(o.x, 50, o.x, 348, "construction", 1), right(o.x, y, true, true, 1),
      point(o.x, o.y, "O", 10, 18, 2), line(o.x, o.y, chord.left.x, chord.left.y, "result", 2), line(o.x, o.y, chord.right.x, chord.right.y, "result", 2),
      circle(o.x, o.y, r, "result", 3), label(320, 368, "OA = OB completes the given segment's circle", "result", 3),
    ];
  },
  status: (_value, stage) => ["Given circular segment AB", "Perpendicular bisector of AB", "Its centre is O", "The complete circle is described"][stage],
  invariant: () => true,
};

const scene26: EuclidSceneSpec = {
  id: "book-3-prop-26",
  family: true,
  title: "Equal angles in equal circles stand on equal arcs.",
  description: "The equal circles carry matching central angles AOB and CDE. Their boundary arcs AB and CE therefore have the same measure; the same is true of the corresponding inscribed angles.",
  steps: ["Set out two equal circles", "Draw matching central angles", "Read the equal arcs they stand on"],
  control: { kind: "steps" },
  build: () => {
    const left = { x: 190, y: 195 }, rightCenter = { x: 450, y: 195 }, r = 96;
    const firstAngles = [-2.45, -0.84];
    const a = pointOnCircle(left, r, firstAngles[0]), b = pointOnCircle(left, r, firstAngles[1]);
    const c = pointOnCircle(rightCenter, r, firstAngles[0]), d = pointOnCircle(rightCenter, r, firstAngles[1]);
    const u = pointOnCircle(left, r, 1.35), v = pointOnCircle(rightCenter, r, 1.35);
    return [
      circle(left.x, left.y, r, "construction", 0), circle(rightCenter.x, rightCenter.y, r, "construction", 0),
      ...[a, b, c, d].map((vertex, index) => point(vertex.x, vertex.y, ["A", "B", "C", "D"][index], vertex.x < (index < 2 ? left.x : rightCenter.x) ? -14 : 10, -8, 0)),
      line(left.x, left.y, a.x, a.y, "given", 1), line(left.x, left.y, b.x, b.y, "given", 1), line(rightCenter.x, rightCenter.y, c.x, c.y, "given", 1), line(rightCenter.x, rightCenter.y, d.x, d.y, "given", 1),
      point(left.x, left.y, "O", 10, -8, 1), point(rightCenter.x, rightCenter.y, "P", 10, -8, 1),
      line(u.x, u.y, a.x, a.y, "construction", 2), line(u.x, u.y, b.x, b.y, "construction", 2), line(v.x, v.y, c.x, c.y, "construction", 2), line(v.x, v.y, d.x, d.y, "construction", 2),
      label(320, 350, "∠AOB = ∠CPD, so arc AB = arc CD", "result", 2),
    ];
  },
  status: (_value, stage) => ["Equal circles", "Equal central angles", "Equal angles stand on equal arcs"][stage],
  invariant: () => true,
};

const scene27: EuclidSceneSpec = {
  id: "book-3-prop-27",
  family: true,
  title: "Equal arcs in equal circles stand on equal angles.",
  description: "The highlighted arcs AB and CD have the same measure on equal circles. Their central openings, and the matching angles at circumference points, therefore agree exactly.",
  steps: ["Set out equal arcs AB and CD", "Join their endpoints to the centres", "Read the equal central and inscribed angles"],
  control: { kind: "steps" },
  build: () => {
    const left = { x: 190, y: 195 }, rightCenter = { x: 450, y: 195 }, r = 96;
    const angles = [-2.35, -0.72];
    const a = pointOnCircle(left, r, angles[0]), b = pointOnCircle(left, r, angles[1]), c = pointOnCircle(rightCenter, r, angles[0]), d = pointOnCircle(rightCenter, r, angles[1]);
    const e = pointOnCircle(left, r, 1.45), f = pointOnCircle(rightCenter, r, 1.45);
    return [
      circle(left.x, left.y, r, "construction", 0), circle(rightCenter.x, rightCenter.y, r, "construction", 0),
      { kind: "arc", cx: left.x, cy: left.y, r, start: angles[0] * 180 / Math.PI, end: angles[1] * 180 / Math.PI, tone: "result", stage: 0 },
      { kind: "arc", cx: rightCenter.x, cy: rightCenter.y, r, start: angles[0] * 180 / Math.PI, end: angles[1] * 180 / Math.PI, tone: "result", stage: 0 },
      ...[a, b, c, d].map((vertex, index) => point(vertex.x, vertex.y, ["A", "B", "C", "D"][index], index === 0 || index === 2 ? -14 : 10, -8, 0)),
      line(left.x, left.y, a.x, a.y, "construction", 1), line(left.x, left.y, b.x, b.y, "construction", 1), line(rightCenter.x, rightCenter.y, c.x, c.y, "construction", 1), line(rightCenter.x, rightCenter.y, d.x, d.y, "construction", 1),
      line(e.x, e.y, a.x, a.y, "given", 2), line(e.x, e.y, b.x, b.y, "given", 2), line(f.x, f.y, c.x, c.y, "given", 2), line(f.x, f.y, d.x, d.y, "given", 2),
      label(320, 350, "arc AB = arc CD, so ∠AOB = ∠CPD", "result", 2),
    ];
  },
  status: (_value, stage) => ["Equal arcs AB and CD", "Their central angles", "Equal arcs stand on equal angles"][stage],
  invariant: () => true,
};

const scene28: EuclidSceneSpec = {
  id: "book-3-prop-28",
  family: true,
  title: "Equal chords in equal circles cut off equal arcs.",
  description: "AB and CD have equal chord length in equal circles. Their endpoints subtend the same central angle, so the minor arcs directly above them are equal as well.",
  steps: ["Set out equal circles", "Draw equal chords AB and CD", "Compare the cut-off arcs"],
  control: { kind: "steps" },
  build: () => {
    const left = { x: 190, y: 198 }, rightCenter = { x: 450, y: 198 }, r = 98, chordY = 148;
    const first = chordAtY(left, r, chordY), second = chordAtY(rightCenter, r, chordY);
    const start = Math.atan2(chordY - left.y, first.left.x - left.x) * 180 / Math.PI;
    const end = Math.atan2(chordY - left.y, first.right.x - left.x) * 180 / Math.PI;
    return [
      circle(left.x, left.y, r, "construction", 0), circle(rightCenter.x, rightCenter.y, r, "construction", 0),
      line(first.left.x, chordY, first.right.x, chordY, "given", 1), line(second.left.x, chordY, second.right.x, chordY, "given", 1),
      point(first.left.x, chordY, "A", -14, -8, 1), point(first.right.x, chordY, "B", 10, -8, 1), point(second.left.x, chordY, "C", -14, -8, 1), point(second.right.x, chordY, "D", 10, -8, 1),
      { kind: "arc", cx: left.x, cy: left.y, r, start, end, tone: "result", stage: 2 },
      { kind: "arc", cx: rightCenter.x, cy: rightCenter.y, r, start, end, tone: "result", stage: 2 },
      label(320, 350, "AB = CD, therefore arc AB = arc CD", "result", 2),
    ];
  },
  status: (_value, stage) => ["Equal circles", "Equal chords AB and CD", "Equal chords cut off equal arcs"][stage],
  invariant: () => true,
};

const scene29: EuclidSceneSpec = {
  id: "book-3-prop-29",
  family: true,
  title: "Equal arcs in equal circles are subtended by equal chords.",
  description: "The matching highlighted arcs have equal measure in equal circles. Joining their endpoints makes equal central triangles, so chords AB and CD are equal.",
  steps: ["Mark equal arcs AB and CD", "Join each arc's endpoints", "Read the equal subtending chords"],
  control: { kind: "steps" },
  build: () => {
    const left = { x: 190, y: 198 }, rightCenter = { x: 450, y: 198 }, r = 98;
    const angles = [-2.48, -0.66];
    const a = pointOnCircle(left, r, angles[0]), b = pointOnCircle(left, r, angles[1]), c = pointOnCircle(rightCenter, r, angles[0]), d = pointOnCircle(rightCenter, r, angles[1]);
    return [
      circle(left.x, left.y, r, "construction", 0), circle(rightCenter.x, rightCenter.y, r, "construction", 0),
      { kind: "arc", cx: left.x, cy: left.y, r, start: angles[0] * 180 / Math.PI, end: angles[1] * 180 / Math.PI, tone: "given", stage: 0 },
      { kind: "arc", cx: rightCenter.x, cy: rightCenter.y, r, start: angles[0] * 180 / Math.PI, end: angles[1] * 180 / Math.PI, tone: "given", stage: 0 },
      point(a.x, a.y, "A", -14, -8, 0), point(b.x, b.y, "B", 10, -8, 0), point(c.x, c.y, "C", -14, -8, 0), point(d.x, d.y, "D", 10, -8, 0),
      line(a.x, a.y, b.x, b.y, "result", 1), line(c.x, c.y, d.x, d.y, "result", 1),
      line(left.x, left.y, a.x, a.y, "construction", 2), line(left.x, left.y, b.x, b.y, "construction", 2), line(rightCenter.x, rightCenter.y, c.x, c.y, "construction", 2), line(rightCenter.x, rightCenter.y, d.x, d.y, "construction", 2),
      label(320, 350, "arc AB = arc CD, therefore chord AB = CD", "result", 2),
    ];
  },
  status: (_value, stage) => ["Equal arcs", "Their subtending chords", "Equal arcs have equal chords"][stage],
  invariant: () => true,
};

const scene30: EuclidSceneSpec = {
  id: "book-3-prop-30",
  family: true,
  title: "The perpendicular diameter bisects a given circumference.",
  description: "Bisect chord AB at M and draw OM through the centre. Its extension meets the chosen arc at C, making arcs AC and CB equal.",
  steps: ["Fix the given arc AB", "Bisect chord AB at M", "Produce OM to meet the arc at C", "The circumference is bisected at C"],
  control: { kind: "steps" },
  build: () => {
    const angles = [-2.48, -0.64];
    const a = pointOnCircle(center, radius, angles[0]), b = pointOnCircle(center, radius, angles[1]), c = pointOnCircle(center, radius, -Math.PI / 2);
    const chordMid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    return [
      circle(center.x, center.y, radius, "construction", 0), line(a.x, a.y, b.x, b.y, "given", 0), point(a.x, a.y, "A", -14, -8, 0), point(b.x, b.y, "B", 10, -8, 0),
      point(chordMid.x, chordMid.y, "M", 10, 18, 1), label(chordMid.x, chordMid.y + 34, "AM = MB", "result", 1),
      line(center.x, center.y + radius, center.x, center.y - radius, "result", 2), point(center.x, center.y, "O", 10, 18, 2), point(c.x, c.y, "C", 0, -10, 2), right(chordMid.x, chordMid.y, true, true, 2),
      label(320, 350, "arc AC = arc CB", "result", 3),
    ];
  },
  status: (_value, stage) => ["Given arc AB", "M bisects chord AB", "Central perpendicular meets C", "C bisects the circumference"][stage],
  invariant: () => true,
};

const scene31: EuclidSceneSpec = {
  id: "book-3-prop-31",
  family: true,
  title: "An angle in a semicircle is right; angles in greater and lesser segments fall below and above it.",
  description: "The diameter AB gives the right angle ACB. On the non-diameter chord DE, a vertex on the greater segment makes an acute angle, while one on the lesser segment makes an obtuse angle.",
  steps: ["Draw the diameter AB and point C on the semicircle", "Compare the right angle ACB", "Use chord DE to compare the greater and lesser segments"],
  control: { kind: "steps" },
  build: () => {
    const a = { x: center.x - radius, y: center.y }, b = { x: center.x + radius, y: center.y }, c = { x: center.x, y: center.y - radius };
    const d = pointOnCircle(center, radius, -2.72), e = pointOnCircle(center, radius, -0.42);
    const acuteVertex = pointOnCircle(center, radius, Math.PI / 2), obtuseVertex = pointOnCircle(center, radius, -Math.PI / 2);
    return [
      circle(center.x, center.y, radius, "construction", 0), line(a.x, a.y, b.x, b.y, "given", 0), line(c.x, c.y, a.x, a.y, "result", 0), line(c.x, c.y, b.x, b.y, "result", 0),
      point(a.x, a.y, "A", -15, 18, 0), point(b.x, b.y, "B", 10, 18, 0), point(c.x, c.y, "C", 0, -10, 0), right(c.x, c.y, true, false, 1), label(320, 48, "∠ACB = right angle", "result", 1),
      line(d.x, d.y, e.x, e.y, "given", 2), line(acuteVertex.x, acuteVertex.y, d.x, d.y, "construction", 2), line(acuteVertex.x, acuteVertex.y, e.x, e.y, "construction", 2), line(obtuseVertex.x, obtuseVertex.y, d.x, d.y, "result", 2), line(obtuseVertex.x, obtuseVertex.y, e.x, e.y, "result", 2),
      point(d.x, d.y, "D", -14, -8, 2), point(e.x, e.y, "E", 10, -8, 2), point(acuteVertex.x, acuteVertex.y, "F", 10, 18, 2), point(obtuseVertex.x, obtuseVertex.y, "G", 0, -10, 2),
      label(320, 350, "∠DFE < right < ∠DGE", "result", 2),
    ];
  },
  status: (_value, stage) => ["The semicircle on diameter AB", "Angle ACB is right", "Greater and lesser segments bracket the right angle"][stage],
  invariant: () => true,
};

const scene32: EuclidSceneSpec = {
  id: "book-3-prop-32",
  family: true,
  title: "A tangent-chord angle equals the angle in the alternate segment.",
  description: "At contact T, the angle made by the tangent and chord TA is copied by the angle TBA on the opposite circumference. The second chord TB yields the matching converse pair.",
  steps: ["Draw tangent at T and chord TA", "Choose B on the alternate segment", "Compare the tangent-chord and inscribed angles"],
  control: { kind: "steps" },
  build: () => {
    const t = { x: center.x + radius, y: center.y }, a = pointOnCircle(center, radius, -2.18), b = pointOnCircle(center, radius, 2.06);
    return [
      circle(center.x, center.y, radius, "construction", 0), line(t.x, 46, t.x, 334, "given", 0), point(t.x, t.y, "T", 10, 18, 0), point(a.x, a.y, "A", -14, -8, 0),
      line(t.x, t.y, a.x, a.y, "result", 1), point(b.x, b.y, "B", -14, 18, 1), line(b.x, b.y, t.x, t.y, "construction", 1), line(b.x, b.y, a.x, a.y, "construction", 1),
      line(center.x, center.y, t.x, t.y, "construction", 2), right(t.x, t.y, true, true, 2),
      label(320, 350, "angle(tangent, TA) = ∠TBA", "result", 2),
    ];
  },
  status: (_value, stage) => ["Tangent at T and chord TA", "B sees the same chord from the alternate segment", "The tangent-chord and alternate-segment angles agree"][stage],
  invariant: () => true,
};

const scene33: EuclidSceneSpec = {
  id: "book-3-prop-33",
  family: true,
  title: "A circle segment can be described on a line to admit a given angle.",
  description: "The given rectilineal angle on the left is copied at C on the circle segment over AB. Choosing the centre so the inscribed angle ACB matches the given opening fixes the required arc.",
  steps: ["Set out the given rectilineal angle", "Set out the base AB", "Describe the segment with matching angle ACB"],
  control: { kind: "steps" },
  build: () => {
    const o = { x: 455, y: 300 }, r = 142, chordY = 205, chord = chordAtY(o, r, chordY), c = pointOnCircle(o, r, -Math.PI / 2);
    const opening = angleAt(c, chord.left, chord.right), v = { x: 165, y: 285 }, arm = 150;
    const g1 = { x: v.x + arm * Math.cos(-Math.PI / 2 - opening / 2), y: v.y + arm * Math.sin(-Math.PI / 2 - opening / 2) };
    const g2 = { x: v.x + arm * Math.cos(-Math.PI / 2 + opening / 2), y: v.y + arm * Math.sin(-Math.PI / 2 + opening / 2) };
    return [
      line(v.x, v.y, g1.x, g1.y, "given", 0), line(v.x, v.y, g2.x, g2.y, "given", 0), point(v.x, v.y, "V", -10, 18, 0), label(130, 315, "given angle", "result", 0),
      line(chord.left.x, chordY, chord.right.x, chordY, "given", 1), point(chord.left.x, chordY, "A", -14, 18, 1), point(chord.right.x, chordY, "B", 10, 18, 1),
      circle(o.x, o.y, r, "construction", 2), point(c.x, c.y, "C", 0, -10, 2), line(c.x, c.y, chord.left.x, chordY, "result", 2), line(c.x, c.y, chord.right.x, chordY, "result", 2),
      label(455, 365, "∠ACB = given angle", "result", 2),
    ];
  },
  status: (_value, stage) => ["Given rectilineal angle", "Base AB", "Segment AB is constructed with the same angle"][stage],
  invariant: () => true,
};

const scene34: EuclidSceneSpec = {
  id: "book-3-prop-34",
  family: true,
  title: "A segment admitting a given angle can be cut from a given circle.",
  description: "The given angle determines the required inscribed opening. On the supplied circle, choose chord AB so that point C on the remaining circumference sees exactly that opening, cutting off the required segment.",
  steps: ["Set out the given angle", "Place the candidate chord AB in the given circle", "Choose C with the same opening and cut off the segment"],
  control: { kind: "steps" },
  build: () => {
    const o = { x: 455, y: 205 }, r = 120, a = pointOnCircle(o, r, -2.38), b = pointOnCircle(o, r, -0.76), c = pointOnCircle(o, r, 1.48);
    const opening = angleAt(c, a, b), v = { x: 115, y: 286 }, arm = 145;
    const g1 = { x: v.x + arm * Math.cos(-Math.PI / 2 - opening / 2), y: v.y + arm * Math.sin(-Math.PI / 2 - opening / 2) };
    const g2 = { x: v.x + arm * Math.cos(-Math.PI / 2 + opening / 2), y: v.y + arm * Math.sin(-Math.PI / 2 + opening / 2) };
    return [
      line(v.x, v.y, g1.x, g1.y, "given", 0), line(v.x, v.y, g2.x, g2.y, "given", 0), point(v.x, v.y, "V", -10, 18, 0), label(120, 316, "given angle", "result", 0),
      circle(o.x, o.y, r, "construction", 1), line(a.x, a.y, b.x, b.y, "given", 1), point(a.x, a.y, "A", -14, -8, 1), point(b.x, b.y, "B", 10, -8, 1),
      point(c.x, c.y, "C", 10, 18, 2), line(c.x, c.y, a.x, a.y, "result", 2), line(c.x, c.y, b.x, b.y, "result", 2),
      label(455, 365, "cut-off segment admits ∠ACB", "result", 2),
    ];
  },
  status: (_value, stage) => ["Given angle", "Given circle and chord AB", "The cut-off segment admits that angle"][stage],
  invariant: () => true,
};

const scene35: EuclidSceneSpec = {
  id: "book-3-prop-35",
  family: true,
  title: "The products of the segments of two intersecting chords are equal.",
  description: "P moves inside the circle while the two chords rotate through it. Each time, the product PA by PB exactly matches PC by PD: the circle fixes this power of P.",
  steps: ["Choose intersection P inside the circle", "Draw two chords through P", "Compare their segment products"],
  control: { kind: "range", label: "Move the chord intersection P", min: 0.14, max: 0.86, step: 0.01, initial: 0.5 },
  build: (value) => {
    const p = { x: center.x - 72 + value * 144, y: center.y + 24 };
    const firstForward = rayToCircle(p, center, radius, 0.16).point;
    const firstBackward = rayToCircle(p, center, radius, Math.PI + 0.16).point;
    const secondForward = rayToCircle(p, center, radius, -1.08).point;
    const secondBackward = rayToCircle(p, center, radius, Math.PI - 1.08).point;
    return [
      circle(center.x, center.y, radius), line(firstBackward.x, firstBackward.y, firstForward.x, firstForward.y, "given"), line(secondBackward.x, secondBackward.y, secondForward.x, secondForward.y, "construction"),
      point(p.x, p.y, "P", 10, -8), point(firstBackward.x, firstBackward.y, "A", -14, -8), point(firstForward.x, firstForward.y, "B", 10, 18), point(secondBackward.x, secondBackward.y, "C", -14, 18), point(secondForward.x, secondForward.y, "D", 10, -8),
      label(320, 350, "PA·PB = PC·PD", "result"),
    ];
  },
  status: () => "The two chord products at P remain equal",
  invariant: (value) => value >= 0.14 && value <= 0.86,
};

const scene36: EuclidSceneSpec = {
  id: "book-3-prop-36",
  family: true,
  title: "A tangent square equals the product of the external and whole secant.",
  description: "From exterior P, the central secant meets the circle at A and B while PT touches at T. Moving P preserves the power relation PT² = PA by PB.",
  steps: ["Draw secant PAB and tangent PT", "Join O to the contact point T", "Compare PT² with PA by PB"],
  control: { kind: "range", label: "Move the exterior point P", min: 0.14, max: 0.86, step: 0.01, initial: 0.5 },
  build: (value) => {
    const distance = radius + 42 + value * 74;
    const p = { x: center.x + distance, y: center.y }, a = { x: center.x + radius, y: center.y }, b = { x: center.x - radius, y: center.y };
    const offset = radius ** 2 / distance;
    const t = { x: center.x + offset, y: center.y - Math.sqrt(radius ** 2 - offset ** 2) };
    return [
      circle(center.x, center.y, radius), line(p.x, p.y, b.x, b.y, "given"), line(p.x, p.y, t.x, t.y, "result"), line(center.x, center.y, t.x, t.y, "construction"),
      point(p.x, p.y, "P", 10, -8), point(a.x, a.y, "A", 10, 18), point(b.x, b.y, "B", -14, 18), point(t.x, t.y, "T", 10, -8), point(center.x, center.y, "O", -14, 18),
      right(t.x, t.y, true, true), label(320, 350, "PT² = PA·PB", "result"),
    ];
  },
  status: () => "The tangent square equals the secant product",
  invariant: (value) => value >= 0.14 && value <= 0.86,
};

const scene37: EuclidSceneSpec = {
  id: "book-3-prop-37",
  family: true,
  title: "The matching secant product proves the second line is tangent.",
  description: "Assume PT² equals PA by PB for the secant PAB. The equality forces OT perpendicular to PT, so T is the single contact point and PT is tangent.",
  steps: ["Set out secant PAB and the line PT", "Assume PT² = PA by PB", "Join OT and read the right angle", "PT touches the circle at T"],
  control: { kind: "steps" },
  build: () => {
    const distance = 188, p = { x: center.x + distance, y: center.y }, a = { x: center.x + radius, y: center.y }, b = { x: center.x - radius, y: center.y };
    const offset = radius ** 2 / distance;
    const t = { x: center.x + offset, y: center.y - Math.sqrt(radius ** 2 - offset ** 2) };
    return [
      circle(center.x, center.y, radius, "construction", 0), line(p.x, p.y, b.x, b.y, "given", 0), line(p.x, p.y, t.x, t.y, "given", 0),
      point(p.x, p.y, "P", 10, -8, 0), point(a.x, a.y, "A", 10, 18, 0), point(b.x, b.y, "B", -14, 18, 0), point(t.x, t.y, "T", 10, -8, 0),
      label(320, 336, "PT² = PA·PB", "result", 1),
      line(center.x, center.y, t.x, t.y, "construction", 2), point(center.x, center.y, "O", -14, 18, 2), right(t.x, t.y, true, true, 2),
      label(320, 365, "OT ⟂ PT, therefore PT is tangent", "result", 3),
    ];
  },
  status: (_value, stage) => ["Secant PAB and candidate PT", "The power equality is given", "The equality forces a right angle", "PT is tangent at T"][stage],
  invariant: () => true,
};

export const BOOK_THREE_SCENES: Record<string, EuclidSceneSpec> = Object.fromEntries(
  [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9, scene10, scene11, scene12, scene13, scene14, scene15, scene16, scene17, scene18, scene19, scene20, scene21, scene22, scene23, scene24, scene25, scene26, scene27, scene28, scene29, scene30, scene31, scene32, scene33, scene34, scene35, scene36, scene37]
    .map((scene) => [scene.id.replace("book-3-", ""), scene]),
);

export function validateBookThreeScenes() {
  return Object.values(BOOK_THREE_SCENES).every((scene) => {
    const samples = scene.control.kind === "range"
      ? [scene.control.min, scene.control.initial, scene.control.max]
      : [0];
    return samples.every((value) => scene.invariant(value) && scene.build(value).every((primitive) =>
      Object.values(primitive).every((candidate) => typeof candidate !== "number" || Number.isFinite(candidate)),
    ));
  });
}
