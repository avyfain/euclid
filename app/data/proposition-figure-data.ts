export type FigurePoint = {
  x: number;
  y: number;
  label?: string;
  dx?: number;
  dy?: number;
  stage?: number;
};

type LineStyle = "line" | "given" | "result" | "construction" | "target";
type AngleStyle = "accent" | "muted";
type AreaStyle = "area" | "area-secondary" | "target";

export type FigureElement =
  | {
      kind: "segment";
      from: string;
      to: string;
      style?: LineStyle;
      stage?: number;
    }
  | {
      kind: "circle";
      center: string;
      radius: number;
      stage?: number;
    }
  | {
      kind: "angle";
      center: string;
      radius: number;
      start: number;
      end: number;
      style?: AngleStyle;
      stage?: number;
    }
  | {
      kind: "polygon";
      points: string[];
      style?: AreaStyle;
      stage?: number;
    }
  | {
      kind: "tick";
      from: string;
      to: string;
      count?: number;
      stage?: number;
    }
  | {
      kind: "parallel";
      from: string;
      to: string;
      count?: number;
      stage?: number;
    }
  | {
      kind: "right-angle";
      vertex: string;
      towardA: string;
      towardB: string;
      size?: number;
      stage?: number;
    };

export type PropositionFigureConfig = {
  description: string;
  viewBox?: string;
  points: Record<string, FigurePoint>;
  elements: FigureElement[];
  steps: Array<{ status: string; action?: string }>;
};

const p = (
  x: number,
  y: number,
  label?: string,
  dx = 10,
  dy = -10,
  stage = 0,
): FigurePoint => ({ x, y, label, dx, dy, stage });

const s = (
  from: string,
  to: string,
  style: LineStyle = "line",
  stage = 0,
): FigureElement => ({ kind: "segment", from, to, style, stage });

const circle = (center: string, radius: number, stage = 1): FigureElement => ({
  kind: "circle",
  center,
  radius,
  stage,
});

const angle = (
  center: string,
  radius: number,
  start: number,
  end: number,
  stage = 2,
  style: AngleStyle = "accent",
): FigureElement => ({ kind: "angle", center, radius, start, end, style, stage });

const polygon = (
  points: string[],
  style: AreaStyle = "area",
  stage = 1,
): FigureElement => ({ kind: "polygon", points, style, stage });

const tick = (from: string, to: string, count = 1, stage = 1): FigureElement => ({
  kind: "tick",
  from,
  to,
  count,
  stage,
});

const parallel = (
  from: string,
  to: string,
  count = 1,
  stage = 2,
): FigureElement => ({ kind: "parallel", from, to, count, stage });

const right = (
  vertex: string,
  towardA: string,
  towardB: string,
  stage = 2,
  size = 15,
): FigureElement => ({
  kind: "right-angle",
  vertex,
  towardA,
  towardB,
  stage,
  size,
});

const bearing = (from: FigurePoint, to: FigurePoint) =>
  (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;

const steps = (
  given: string,
  construction: string,
  result: string,
  constructionAction = "Show construction",
  resultAction = "Show result",
) => [
  { status: given, action: constructionAction },
  { status: construction, action: resultAction },
  { status: result },
];

const prop32Points = {
  a: p(235, 75, "A", -20, -8),
  b: p(85, 290, "B", -22, 10),
  c: p(390, 290, "C", -5, 24),
  d: p(575, 290, "D", 12, 10),
  e: p(540, 75, "E", 10, -8, 1),
};

export const PROPOSITION_FIGURES: Record<string, PropositionFigureConfig> = {
  "prop-5": {
    description: "An isosceles triangle with its equal sides extended; the base and exterior angle pairs are marked equal.",
    viewBox: "0 0 640 390",
    points: {
      a: p(320, 55, "A", -6, -15),
      b: p(210, 235, "B", -22, 3),
      c: p(430, 235, "C", 12, 3),
      f: p(150, 333, "F", -20, 14, 1),
      g: p(490, 333, "G", 12, 14, 1),
    },
    elements: [
      s("a", "b", "given"), s("a", "c", "given"), s("b", "c"),
      s("b", "f", "construction", 1), s("c", "g", "construction", 1),
      s("f", "c", "construction", 1), s("g", "b", "construction", 1),
      tick("a", "b"), tick("a", "c"), tick("a", "f", 2), tick("a", "g", 2),
      angle("b", 29, -59, 0), angle("c", 29, 180, 239),
      angle("b", 43, 0, 121), angle("c", 43, 59, 180),
    ],
    steps: steps("Given isosceles triangle ABC", "Extend the equal sides and join FC, GB", "Base angles and exterior angles are equal"),
  },
  "prop-6": {
    description: "A triangle with equal base angles; cutting DB equal to AC creates an impossible smaller congruent triangle unless AB equals AC.",
    points: {
      a: p(320, 65, "A", -6, -15),
      b: p(150, 285, "B", -22, 10),
      c: p(490, 285, "C", 12, 10),
      d: p(215, 201, "D", -20, -8, 1),
    },
    elements: [
      s("a", "b", "given"), s("a", "c", "result"), s("b", "c"),
      s("d", "c", "construction", 1), tick("d", "b", 2, 1), tick("a", "c", 2, 1),
      angle("b", 30, -52, 0), angle("c", 30, 180, 232),
      tick("a", "b", 1, 2), tick("a", "c", 1, 2),
    ],
    steps: steps("Angles ABC and ACB are equal", "Assume AB is greater and cut DB = AC", "The contradiction forces AB = AC"),
  },
  "prop-7": {
    description: "Two proposed apexes on the same base would require both pairs of corresponding sides to be equal, producing contradictory angles.",
    points: {
      a: p(145, 292, "A", -24, 8), b: p(495, 292, "B", 12, 8),
      c: p(320, 65, "C", -5, -14), d: p(320, 180, "D", 12, 3, 1),
    },
    elements: [
      s("a", "b", "given"), s("a", "c", "given"), s("c", "b", "given"),
      s("a", "d", "target", 1), s("d", "b", "target", 1), s("c", "d", "construction", 1),
      tick("a", "c"), tick("a", "d"), tick("c", "b", 2), tick("d", "b", 2),
      angle("c", 25, 52, 90), angle("d", 25, -90, -52),
    ],
    steps: steps("Triangle ACB stands on base AB", "Suppose a second equal-sided apex D exists", "The angle comparisons contradict one another"),
  },
  "prop-8": {
    description: "Two triangles have three corresponding sides equal; rigid application makes their included angles coincide.",
    points: {
      a: p(165, 80, "A", -18, -12), b: p(70, 285, "B", -22, 8), c: p(280, 285, "C", 10, 8),
      d: p(455, 80, "D", -18, -12, 1), e: p(360, 285, "E", -22, 8, 1), f: p(570, 285, "F", 10, 8, 1),
    },
    elements: [
      s("a", "b", "given"), s("a", "c", "given"), s("b", "c", "given"),
      s("d", "e", "target", 1), s("d", "f", "target", 1), s("e", "f", "target", 1),
      tick("a", "b"), tick("d", "e"), tick("a", "c", 2), tick("d", "f", 2), tick("b", "c", 3), tick("e", "f", 3),
      angle("a", 31, 65, 115), angle("d", 31, 65, 115),
    ],
    steps: steps("Three side pairs are equal", "Apply ABC to DEF base-to-base", "The included angles coincide"),
  },
  "prop-9": {
    description: "Equal points D and E are chosen on the arms of angle BAC; an equilateral triangle on DE locates the bisector AF.",
    points: {
      a: p(120, 190, "A", -22, 7), b: p(520, 55, "B", 10, -5), c: p(520, 325, "C", 10, 12),
      d: p(310, 126, "D", -3, -14, 1), e: p(310, 254, "E", -3, 23, 1), f: p(420, 190, "F", 10, 6, 1),
    },
    elements: [
      s("a", "b", "given"), s("a", "c", "given"), s("d", "e", "construction", 1),
      s("d", "f", "construction", 1), s("e", "f", "construction", 1), s("a", "f", "result", 2),
      tick("a", "d"), tick("a", "e"), tick("d", "f", 2), tick("e", "f", 2),
      angle("a", 38, -18, 0), angle("a", 38, 0, 18),
    ],
    steps: steps("Given angle BAC", "Choose AD = AE and construct equilateral DEF", "AF bisects angle BAC"),
  },
  "prop-10": {
    description: "An equilateral triangle on AB is split by the bisector CD, forcing AD and DB to be equal.",
    points: {
      a: p(150, 286, "A", -24, 8), b: p(490, 286, "B", 12, 8),
      c: p(320, 70, "C", -5, -15, 1), d: p(320, 286, "D", -5, 25, 2),
    },
    elements: [
      s("a", "b", "given"), s("a", "c", "construction", 1), s("c", "b", "construction", 1),
      s("c", "d", "result", 2), tick("a", "c"), tick("c", "b"), tick("a", "d", 2, 2), tick("d", "b", 2, 2),
      angle("c", 32, 52, 90), angle("c", 32, 90, 128),
    ],
    steps: steps("Given segment AB", "Construct equilateral triangle ABC", "CD bisects AB at D"),
  },
  "prop-11": {
    description: "Equal distances CD and CE support an equilateral triangle DFE; its apex joined to C gives a perpendicular.",
    points: {
      a: p(70, 286, "A", -22, 8), b: p(570, 286, "B", 12, 8), c: p(320, 286, "C", -5, 25),
      d: p(210, 286, "D", -5, 25, 1), e: p(430, 286, "E", -5, 25, 1), f: p(320, 96, "F", 10, -8, 1),
    },
    elements: [
      s("a", "b", "given"), s("d", "f", "construction", 1), s("e", "f", "construction", 1),
      s("f", "c", "result", 2), tick("d", "c"), tick("c", "e"), tick("d", "f", 2), tick("e", "f", 2),
      right("c", "a", "f"), right("c", "f", "b"),
    ],
    steps: steps("Point C lies on line AB", "Set CD = CE and construct equilateral DFE", "FC is perpendicular to AB"),
  },
  "prop-12": {
    description: "A circle centered at C cuts the line at E and G; joining C to their midpoint H gives the perpendicular.",
    points: {
      a: p(65, 285, "A", -22, 8), b: p(575, 285, "B", 12, 8), c: p(320, 75, "C", 10, -8),
      e: p(170, 285, "E", -5, 24, 1), g: p(470, 285, "G", -5, 24, 1), h: p(320, 285, "H", 10, 22, 1),
    },
    elements: [
      s("a", "b", "given"), circle("c", 258, 1), s("c", "e", "construction", 1), s("c", "g", "construction", 1),
      s("c", "h", "result", 2), tick("e", "h"), tick("h", "g"), right("h", "e", "c"), right("h", "c", "g"),
    ],
    steps: steps("Point C is off line AB", "Circle C cuts AB at E and G; bisect EG at H", "CH is perpendicular to AB"),
  },
  "prop-13": {
    description: "A ray standing on a straight line divides the straight angle into adjacent angles whose sum is two right angles.",
    points: {
      c: p(70, 280, "C", -22, 8), b: p(320, 280, "B", -5, 24), d: p(570, 280, "D", 12, 8),
      a: p(430, 75, "A", 10, -8), e: p(320, 75, "E", -22, -8, 1),
    },
    elements: [
      s("c", "d", "given"), s("b", "a", "given"), s("b", "e", "construction", 1),
      right("b", "c", "e", 1), right("b", "e", "d", 1),
      angle("b", 48, 180, 298), angle("b", 48, 298, 360),
    ],
    steps: steps("AB stands on straight line CD", "Draw the reference perpendicular BE", "Angles CBA + ABD equal two right angles"),
  },
  "prop-14": {
    description: "Two opposite-side rays making adjacent angles equal to two right angles must form one straight line through B.",
    points: {
      a: p(75, 185, "A", -22, 7), b: p(320, 185, "B", -5, 24),
      c: p(500, 65, "C", 10, -8), d: p(140, 305, "D", -24, 14), e: p(500, 305, "E", 10, 14, 1),
    },
    elements: [
      s("a", "b", "given"), s("b", "c", "given"), s("b", "d", "result", 2),
      s("b", "e", "target", 1), angle("b", 42, 180, 326), angle("b", 55, 146, 180),
    ],
    steps: steps("Adjacent angles ABC and ABD total two right angles", "Compare BD with the straight continuation BE", "C, B, and D lie on one straight line"),
  },
  "prop-15": {
    description: "Two intersecting straight lines form equal opposite, or vertical, angles.",
    points: {
      a: p(105, 70, "A", -20, -8), b: p(535, 310, "B", 12, 14),
      c: p(535, 70, "C", 12, -8), d: p(105, 310, "D", -22, 14), e: p(320, 190, "E", 12, -8),
    },
    elements: [
      s("a", "b", "given"), s("c", "d", "given"),
      angle("e", 36, 29, 151, 1, "muted"), angle("e", 36, 209, 331, 1, "muted"),
      angle("e", 50, 151, 209, 2, "muted"), angle("e", 50, 331, 389, 2, "muted"),
    ],
    steps: steps("Lines AB and CD intersect at E", "Each adjacent pair forms two right angles", "Opposite vertical angles are equal"),
  },
  "prop-16": {
    description: "A midpoint construction inside an extended triangle copies an interior angle into part of the exterior angle.",
    viewBox: "0 0 640 370",
    points: {
      a: p(260, 70, "A", -18, -10), b: p(95, 290, "B", -22, 10), c: p(380, 290, "C", -5, 25),
      d: p(570, 290, "D", 12, 10), e: p(320, 180, "E", -22, -5, 1), f: p(545, 70, "F", 10, -8, 1),
    },
    elements: [
      s("a", "b", "given"), s("b", "c", "given"), s("c", "a", "given"), s("c", "d", "construction"),
      s("b", "f", "construction", 1), s("c", "f", "construction", 1), tick("a", "e"), tick("e", "c"), tick("b", "e", 2), tick("e", "f", 2),
      angle("c", 42, 180, 220), angle("b", 34, -53, 0),
    ],
    steps: steps("Extend side BC to D", "Bisect AC at E, copy BE to EF, and join FC", "Exterior angle ACD exceeds either opposite interior angle"),
  },
  "prop-17": {
    description: "Producing a side exposes an exterior angle greater than an opposite interior angle, so any two triangle angles total less than two right angles.",
    points: {
      a: p(300, 65, "A", -5, -15), b: p(115, 285, "B", -22, 10), c: p(430, 285, "C", -5, 25), d: p(575, 285, "D", 12, 10, 1),
    },
    elements: [
      s("a", "b", "given"), s("b", "c", "given"), s("c", "a", "given"), s("c", "d", "construction", 1),
      angle("c", 42, 180, 230), angle("b", 34, -50, 0), angle("c", 57, 230, 360, 2, "muted"),
    ],
    steps: steps("Given triangle ABC", "Produce BC to D", "Any two interior angles are less than two right angles"),
  },
  "prop-18": {
    description: "On the longer side AC, AD is cut equal to AB; the isosceles subtriangle transfers a larger angle to B.",
    points: {
      a: p(150, 85, "A", -20, -8), b: p(105, 285, "B", -22, 10), c: p(545, 285, "C", 12, 10), d: p(315, 160, "D", 10, -8, 1),
    },
    elements: [
      s("a", "b", "given"), s("a", "c", "result"), s("b", "c"), s("b", "d", "construction", 1),
      tick("a", "b"), tick("a", "d"), angle("b", 38, -77, 0), angle("c", 30, 180, 205),
    ],
    steps: steps("AC is greater than AB", "Cut AD = AB and join BD", "The greater side AC subtends the greater angle ABC"),
  },
  "prop-19": {
    description: "The larger angle at B rules out an equal or shorter opposite side: the equal-side comparison would make the angles equal, and I.18 reverses the shorter-side case.",
    points: {
      a: p(150, 85, "A", -20, -8), b: p(105, 285, "B", -22, 10), c: p(545, 285, "C", 12, 10),
      e: p(333, 178, "E", 10, -8, 1),
    },
    elements: [
      s("a", "b", "given"), s("b", "c"), s("a", "c", "result", 2),
      s("a", "e", "construction", 1), s("b", "e", "construction", 1),
      tick("a", "b", 2, 1), tick("a", "e", 2, 1),
      angle("b", 25, -77, -25, 1, "muted"), angle("e", 25, 155, 207, 1, "muted"),
      angle("b", 38, -77, 0), angle("c", 30, 180, 205),
    ],
    steps: steps("Angle ABC is greater than angle BCA", "If AC equalled AB the base angles would be equal; if shorter, I.18 would reverse their order", "The greater angle ABC is subtended by greater side AC"),
  },
  "prop-20": {
    description: "Extending BA by DA equal to AC turns the triangle inequality into a direct side comparison in triangle DBC.",
    viewBox: "0 0 640 390",
    points: {
      b: p(110, 315, "B", -22, 10), a: p(245, 145, "A", -20, -8), c: p(520, 315, "C", 12, 10), d: p(345, 20, "D", 10, -4, 1),
    },
    elements: [
      s("b", "a", "given"), s("a", "c", "given"), s("b", "c", "result", 2),
      s("a", "d", "construction", 1), s("d", "c", "construction", 1), tick("a", "d"), tick("a", "c"),
      angle("d", 29, 129, 153), angle("c", 29, 206, 230),
    ],
    steps: steps("Given triangle ABC", "Extend BA so DA = AC and join DC", "Any two sides together exceed the third"),
  },
  "prop-21": {
    description: "Two lines from the ends of BC meet at D inside ABC; their total length is smaller while their included angle is larger.",
    points: {
      a: p(320, 55, "A", -5, -15), b: p(100, 300, "B", -22, 10), c: p(540, 300, "C", 12, 10), d: p(320, 205, "D", 10, -8, 1), e: p(255, 135, "E", -22, -5, 1),
    },
    elements: [
      s("a", "b", "given"), s("a", "c", "given"), s("b", "c"),
      s("b", "d", "result", 1), s("d", "c", "result", 1), s("d", "e", "construction", 1),
      angle("d", 40, 17, 163), angle("a", 35, 48, 132),
    ],
    steps: steps("Triangle ABC stands on BC", "Join B and C to an interior point D", "BD + DC is smaller, but angle BDC is greater"),
  },
  "prop-22": {
    description: "Three lengths are laid consecutively on a ray; two circles recover them as the sides of triangle KFG.",
    viewBox: "0 0 640 410",
    points: {
      d: p(55, 310, "D", -20, 10), f: p(175, 310, "F", -5, 24), g: p(385, 310, "G", -5, 24), h: p(535, 310, "H", 12, 10),
      k: p(280, 120, "K", -5, -15, 2),
    },
    elements: [
      s("d", "h", "given"), tick("d", "f"), tick("f", "g", 2), tick("g", "h", 3),
      circle("f", 217, 1), circle("g", 217, 1),
      s("f", "k", "result", 2), s("k", "g", "result", 2), s("f", "g", "result", 2),
      tick("f", "k"), tick("d", "f"), tick("k", "g", 3), tick("g", "h", 3),
    ],
    steps: steps("Lay the three given lengths on ray DH", "Draw circles centered at F and G with the outer lengths", "Triangle KFG has the three required sides"),
  },
  "prop-23": {
    description: "A triangle built from the three sides around the given angle transfers that angle to point A on line AB.",
    points: {
      c: p(145, 200, "C", -22, 7), d: p(250, 75, "D", 10, -8), e: p(260, 300, "E", 10, 12),
      a: p(390, 280, "A", -22, 10, 1), b: p(590, 280, "B", 12, 10), f: p(500, 145, "F", 10, -8, 1), g: p(545, 280, "G", -5, 24, 1),
    },
    elements: [
      s("c", "d", "given"), s("c", "e", "given"), s("d", "e", "construction"),
      s("a", "b", "given"), s("a", "f", "result", 1), s("f", "g", "construction", 1),
      tick("c", "d"), tick("a", "f"), tick("c", "e", 2), tick("a", "g", 2), tick("d", "e", 3), tick("f", "g", 3),
      angle("c", 35, -50, 50), angle("a", 35, -51, 0),
    ],
    steps: steps("Given angle DCE and line AB", "Construct triangle AFG from the three copied sides", "Angle FAG equals angle DCE"),
  },
  "prop-24": {
    description: "Two pairs of sides are equal, but the wider included angle opens onto the longer base.",
    points: {
      a: p(165, 245, "A", -22, 10), b: p(80, 85, "B", -22, -8), c: p(300, 95, "C", 10, -8),
      d: p(440, 245, "D", -22, 10, 1), e: p(370, 95, "E", -22, -8, 1), f: p(555, 145, "F", 10, -8, 1),
    },
    elements: [
      s("a", "b", "given"), s("a", "c", "given"), s("b", "c", "result", 2),
      s("d", "e", "target", 1), s("d", "f", "target", 1), s("e", "f", "target", 1),
      tick("a", "b"), tick("d", "e"), tick("a", "c", 2), tick("d", "f", 2),
      angle("a", 36, 242, 303), angle("d", 36, 243, 320, 2, "muted"),
    ],
    steps: steps("Two side pairs are equal", "Compare the unequal included angles", "The greater included angle has the greater base"),
  },
  "prop-25": {
    description: "With two side pairs fixed, the triangle with the longer base must have the wider included angle.",
    points: {
      a: p(165, 245, "A", -22, 10), b: p(80, 85, "B", -22, -8), c: p(300, 95, "C", 10, -8),
      d: p(440, 245, "D", -22, 10, 1), e: p(370, 95, "E", -22, -8, 1), f: p(555, 145, "F", 10, -8, 1),
    },
    elements: [
      s("a", "b", "given"), s("a", "c", "given"), s("b", "c", "result"),
      s("d", "e", "target", 1), s("d", "f", "target", 1), s("e", "f", "target", 1),
      tick("a", "b"), tick("d", "e"), tick("a", "c", 2), tick("d", "f", 2),
      angle("a", 36, 242, 303), angle("d", 36, 243, 320, 2, "muted"),
    ],
    steps: steps("Two side pairs are equal; BC is greater than EF", "Test equal or smaller included angles", "Angle BAC must be greater than angle EDF"),
  },
  "prop-26": {
    description: "Two equal angles and one corresponding side determine congruent triangles and all remaining parts.",
    points: {
      a: p(165, 75, "A", -18, -10), b: p(65, 285, "B", -22, 10), c: p(285, 285, "C", 10, 10),
      d: p(455, 75, "D", -18, -10, 1), e: p(355, 285, "E", -22, 10, 1), f: p(575, 285, "F", 10, 10, 1),
    },
    elements: [
      s("a", "b", "given"), s("a", "c", "result", 2), s("b", "c", "given"),
      s("d", "e", "target", 1), s("d", "f", "target", 1), s("e", "f", "target", 1),
      tick("b", "c"), tick("e", "f"), angle("b", 30, -64, 0), angle("e", 30, -64, 0),
      angle("c", 37, 180, 224), angle("f", 37, 180, 224), tick("a", "b", 2, 2), tick("d", "e", 2, 2), tick("a", "c", 3, 2), tick("d", "f", 3, 2),
    ],
    steps: steps("Two angle pairs and one side pair are equal", "Apply one triangle to the other", "The triangles agree in every remaining part"),
  },
  "prop-27": {
    description: "Equal alternate angles made by a transversal prevent two lines from meeting, so the lines are parallel.",
    points: {
      a: p(70, 105, "A", -22, -8), b: p(570, 105, "B", 12, -8), c: p(70, 285, "C", -22, 10), d: p(570, 285, "D", 12, 10),
      e: p(245, 105, "E", -20, -10), f: p(395, 285, "F", 10, 20),
    },
    elements: [
      s("a", "b", "given"), s("c", "d", "given"), s("e", "f", "construction", 1),
      angle("e", 31, 0, 50), angle("f", 31, 180, 230), parallel("a", "b"), parallel("c", "d"),
    ],
    steps: steps("Transversal EF cuts AB and CD", "Alternate angles AEF and EFD are equal", "AB is parallel to CD"),
  },
  "prop-28": {
    description: "Equal corresponding angles, or same-side angles totaling two right angles, force the cut lines to be parallel.",
    points: {
      a: p(70, 105, "A", -22, -8), b: p(570, 105, "B", 12, -8), c: p(70, 285, "C", -22, 10), d: p(570, 285, "D", 12, 10),
      e: p(245, 45, "E", -20, -8), g: p(295, 105, "G", -22, -10), h: p(445, 285, "H", 10, 20), f: p(495, 345, "F", 10, 12),
    },
    elements: [
      s("a", "b", "given"), s("c", "d", "given"), s("e", "f", "construction", 1),
      angle("g", 30, 0, 50), angle("h", 30, 180, 230), angle("g", 43, 50, 180, 2, "muted"),
      parallel("a", "b"), parallel("c", "d"),
    ],
    steps: steps("A transversal cuts AB and CD", "Corresponding angles agree or same-side angles total two right angles", "AB is parallel to CD"),
  },
  "prop-29": {
    description: "A transversal across parallel lines creates equal alternate and corresponding angles, with same-side angles supplementary.",
    points: {
      a: p(65, 105, "A", -22, -8), b: p(575, 105, "B", 12, -8), c: p(65, 285, "C", -22, 10), d: p(575, 285, "D", 12, 10),
      e: p(235, 45, "E", -20, -8), g: p(285, 105, "G", -22, -10), h: p(435, 285, "H", 10, 20), f: p(485, 345, "F", 10, 12),
    },
    elements: [
      s("a", "b", "given"), s("c", "d", "given"), s("e", "f", "construction", 1), parallel("a", "b", 1, 0), parallel("c", "d", 1, 0),
      angle("g", 30, 0, 50), angle("h", 30, 180, 230), angle("g", 43, 180, 230, 2, "muted"), angle("h", 43, 230, 360, 2, "muted"),
    ],
    steps: steps("AB is parallel to CD", "Transversal EF cuts them at G and H", "Alternate and corresponding angles are equal; same-side angles are supplementary"),
  },
  "prop-30": {
    description: "Three lines cut by one transversal transfer equal alternate angles through the common parallel, proving the outer pair parallel.",
    points: {
      a: p(65, 75, "A", -22, -8), b: p(575, 75, "B", 12, -8), e: p(65, 190, "E", -22, 7), f: p(575, 190, "F", 12, 7),
      c: p(65, 305, "C", -22, 12), d: p(575, 305, "D", 12, 12), g: p(240, 35, "G", -20, -8), h: p(320, 190, "H", -22, -10), k: p(400, 345, "K", 10, 12),
    },
    elements: [
      s("a", "b", "given"), s("e", "f", "given"), s("c", "d", "given"), s("g", "k", "construction", 1),
      parallel("a", "b", 1, 0), parallel("e", "f", 1, 0), parallel("c", "d", 1, 2),
      angle("g", 28, 0, 58), angle("h", 28, 180, 238), angle("k", 28, 180, 238),
    ],
    steps: steps("AB and CD are each parallel to EF", "Transversal GK transfers equal alternate angles", "AB is parallel to CD"),
  },
  "prop-31": {
    description: "Copying the alternate angle ADC at A constructs line EAF through A parallel to BC.",
    points: {
      b: p(80, 290, "B", -22, 10), c: p(560, 290, "C", 12, 10), d: p(380, 290, "D", -5, 24),
      a: p(260, 105, "A", -22, -8), e: p(80, 105, "E", -22, -8, 1), f: p(560, 105, "F", 12, -8, 1),
    },
    elements: [
      s("b", "c", "given"), s("a", "d", "construction", 1), s("e", "f", "result", 1),
      angle("a", 31, 0, 57), angle("d", 31, 180, 237), parallel("b", "c"), parallel("e", "f"),
    ],
    steps: steps("Given point A and line BC", "Join AD and copy angle ADC as DAE", "EAF through A is parallel to BC"),
  },
  "prop-32": {
    description: "A parallel through C splits the exterior angle into copies of the two remote interior angles.",
    points: prop32Points,
    elements: [
      s("a", "b", "given"), s("b", "c", "given"), s("c", "a", "given"), s("c", "d", "construction"), s("c", "e", "result", 1),
      parallel("a", "b", 1, 1), parallel("c", "e", 1, 1),
      angle("c", 34, bearing(prop32Points.c, prop32Points.a), bearing(prop32Points.c, prop32Points.e)),
      angle("c", 47, bearing(prop32Points.c, prop32Points.e), bearing(prop32Points.c, prop32Points.d)),
      angle("a", 30, bearing(prop32Points.a, prop32Points.c), bearing(prop32Points.a, prop32Points.b), 2, "muted"),
      angle("b", 30, bearing(prop32Points.b, prop32Points.a), bearing(prop32Points.b, prop32Points.c), 2, "muted"),
    ],
    steps: steps("Extend BC to D", "Draw CE through C parallel to AB", "The exterior angle equals the two remote interior angles"),
  },
  "prop-33": {
    description: "Equal parallel segments AB and CD form a quadrilateral whose joining sides AC and BD are also equal and parallel.",
    points: {
      a: p(135, 95, "A", -22, -8), b: p(365, 95, "B", 10, -8), c: p(235, 285, "C", -22, 12), d: p(465, 285, "D", 10, 12),
    },
    elements: [
      s("a", "b", "given"), s("c", "d", "given"), s("a", "c", "result", 2), s("b", "d", "result", 2), s("b", "c", "construction", 1),
      tick("a", "b"), tick("c", "d"), parallel("a", "b", 1, 0), parallel("c", "d", 1, 0),
      tick("a", "c", 2, 2), tick("b", "d", 2, 2), parallel("a", "c", 2), parallel("b", "d", 2),
    ],
    steps: steps("AB and CD are equal and parallel", "Join BC across the figure", "AC and BD are also equal and parallel"),
  },
  "prop-34": {
    description: "A diagonal divides a parallelogram into congruent triangles, exposing equal opposite sides and angles.",
    points: {
      a: p(135, 85, "A", -22, -8), c: p(400, 85, "C", 10, -8), d: p(505, 295, "D", 10, 12), b: p(240, 295, "B", -22, 12),
    },
    elements: [
      polygon(["a", "b", "c"], "area", 2), polygon(["b", "c", "d"], "area-secondary", 2),
      s("a", "c", "given"), s("c", "d", "given"), s("d", "b", "given"), s("b", "a", "given"), s("b", "c", "result", 1),
      tick("a", "c"), tick("b", "d"), tick("a", "b", 2), tick("c", "d", 2), parallel("a", "c", 1, 0), parallel("b", "d", 1, 0), parallel("a", "b", 2, 0), parallel("c", "d", 2, 0),
    ],
    steps: steps("Given parallelogram ACDB", "Join diagonal BC", "Opposite parts are equal and BC bisects the area"),
  },
  "prop-35": {
    description: "Two sheared parallelograms share base BC and the same bounding parallels, so their areas are equal.",
    points: {
      a: p(95, 85, "A", -22, -8), d: p(305, 85, "D", -5, -12), e: p(245, 85, "E", -5, -12), f: p(455, 85, "F", 10, -8),
      b: p(205, 295, "B", -22, 12), c: p(415, 295, "C", 10, 12),
    },
    elements: [
      polygon(["a", "b", "c", "d"], "area", 2), polygon(["e", "b", "c", "f"], "area-secondary", 2),
      s("a", "f", "construction", 1), s("b", "c", "given"), s("a", "b", "given"), s("d", "c", "given"), s("e", "b", "target"), s("f", "c", "target"),
      parallel("a", "f", 1, 0), parallel("b", "c", 1, 0),
    ],
    steps: steps("Two parallelograms share base BC", "Both lie between parallels AF and BC", "The parallelograms have equal area"),
  },
  "prop-36": {
    description: "Parallelograms on equal bases and between the same parallels have equal area despite different shears.",
    points: {
      a: p(55, 85, "A", -20, -8), d: p(245, 85, "D", -5, -12), e: p(335, 85, "E", -5, -12), h: p(525, 85, "H", 10, -8),
      b: p(105, 295, "B", -22, 12), c: p(295, 295, "C", -5, 24), f: p(385, 295, "F", -5, 24), g: p(575, 295, "G", 10, 12),
    },
    elements: [
      polygon(["a", "b", "c", "d"], "area", 2), polygon(["e", "f", "g", "h"], "area-secondary", 2),
      s("a", "h", "construction"), s("b", "g", "construction"), s("a", "b", "given"), s("c", "d", "given"), s("e", "f", "target"), s("g", "h", "target"),
      tick("b", "c"), tick("f", "g"), parallel("a", "h", 1, 0), parallel("b", "g", 1, 0),
    ],
    steps: steps("Bases BC and FG are equal", "Build the parallelograms between common parallels", "The parallelograms have equal area"),
  },
  "prop-37": {
    description: "Triangles on the same base with apexes on a line parallel to the base have equal altitude and equal area.",
    points: {
      a: p(175, 85, "A", -22, -8), d: p(465, 85, "D", 10, -8), b: p(135, 295, "B", -22, 12), c: p(505, 295, "C", 10, 12),
    },
    elements: [
      polygon(["a", "b", "c"], "area", 2), polygon(["d", "b", "c"], "area-secondary", 2),
      s("a", "d", "construction", 1), s("b", "c", "given"), s("a", "b", "given"), s("a", "c", "given"), s("d", "b", "target"), s("d", "c", "target"),
      parallel("a", "d", 1, 0), parallel("b", "c", 1, 0),
    ],
    steps: steps("Triangles ABC and DBC share base BC", "Their apexes lie on parallel AD", "The triangles have equal area"),
  },
  "prop-38": {
    description: "Triangles on equal bases and between the same parallels have equal altitude and therefore equal area.",
    points: {
      a: p(155, 85, "A", -22, -8), d: p(475, 85, "D", 10, -8), b: p(65, 295, "B", -22, 12), c: p(255, 295, "C", -5, 24), e: p(365, 295, "E", -5, 24), f: p(555, 295, "F", 10, 12),
    },
    elements: [
      polygon(["a", "b", "c"], "area", 2), polygon(["d", "e", "f"], "area-secondary", 2),
      s("a", "d", "construction"), s("b", "f", "construction"), s("a", "b", "given"), s("a", "c", "given"), s("d", "e", "target"), s("d", "f", "target"),
      tick("b", "c"), tick("e", "f"), parallel("a", "d", 1, 0), parallel("b", "f", 1, 0),
    ],
    steps: steps("Bases BC and EF are equal", "Place both apexes on the same parallel", "Triangles ABC and DEF have equal area"),
  },
  "prop-39": {
    description: "Equal triangles on one base must have their apexes on a line parallel to that base.",
    points: {
      a: p(175, 85, "A", -22, -8), d: p(465, 85, "D", 10, -8), e: p(340, 85, "E", -5, -12, 1), b: p(135, 295, "B", -22, 12), c: p(505, 295, "C", 10, 12),
    },
    elements: [
      polygon(["a", "b", "c"], "area", 0), polygon(["d", "b", "c"], "area", 0),
      s("a", "b", "given"), s("a", "c", "given"), s("d", "b", "given"), s("d", "c", "given"), s("b", "c", "given"),
      s("a", "e", "construction", 1), s("e", "c", "construction", 1), s("a", "d", "result", 2), parallel("a", "d"), parallel("b", "c"),
    ],
    steps: steps("Equal triangles ABC and DBC share base BC", "Test the parallel through A with an auxiliary apex E", "AD must be parallel to BC"),
  },
  "prop-40": {
    description: "Equal triangles on equal collinear bases must place their apexes on a line parallel to the common baseline.",
    points: {
      a: p(165, 85, "A", -22, -8), d: p(475, 85, "D", 10, -8), b: p(65, 295, "B", -22, 12), c: p(320, 295, "C", -5, 24), e: p(575, 295, "E", 10, 12), f: p(365, 85, "F", -5, -12, 1),
    },
    elements: [
      polygon(["a", "b", "c"], "area", 0), polygon(["d", "c", "e"], "area", 0),
      s("b", "e", "given"), s("a", "b", "given"), s("a", "c", "given"), s("d", "c", "given"), s("d", "e", "given"),
      tick("b", "c"), tick("c", "e"), s("a", "f", "construction", 1), s("f", "e", "construction", 1), s("a", "d", "result", 2), parallel("a", "d"), parallel("b", "e"),
    ],
    steps: steps("Equal triangles stand on equal bases BC and CE", "Test the parallel through A", "AD is parallel to BE"),
  },
  "prop-41": {
    description: "A parallelogram and triangle share base BC and the same parallels; the diagonal shows the parallelogram contains two equal triangles.",
    points: {
      a: p(145, 85, "A", -22, -8), d: p(425, 85, "D", 10, -8), e: p(520, 85, "E", 10, -8), b: p(215, 295, "B", -22, 12), c: p(495, 295, "C", 10, 12),
    },
    elements: [
      polygon(["a", "b", "c", "d"], "area-secondary", 0), polygon(["e", "b", "c"], "area", 2),
      s("a", "d", "given"), s("a", "b", "given"), s("b", "c", "given"), s("c", "d", "given"), s("e", "b", "target"), s("e", "c", "target"), s("a", "c", "construction", 1),
      parallel("a", "e", 1, 0), parallel("b", "c", 1, 0),
    ],
    steps: steps("Parallelogram ABCD and triangle EBC share base and parallels", "Join diagonal AC", "The parallelogram is double the triangle"),
  },
  "prop-42": {
    description: "Bisecting the triangle base gives a half-triangle that can be doubled as a parallelogram in the required angle.",
    points: {
      a: p(195, 70, "A", -22, -8), b: p(60, 295, "B", -22, 12), e: p(240, 295, "E", -5, 24), c: p(420, 295, "C", -5, 24),
      f: p(320, 70, "F", -5, -12, 1), g: p(500, 70, "G", 10, -8, 1),
    },
    elements: [
      polygon(["a", "b", "c"], "area-secondary", 0), polygon(["f", "e", "c", "g"], "area", 1),
      s("a", "b", "given"), s("a", "c", "given"), s("b", "c", "given"), s("a", "e", "construction", 1),
      s("e", "f", "result", 1), s("f", "g", "result", 1), s("g", "c", "result", 1), tick("b", "e"), tick("e", "c"),
      parallel("f", "g"), parallel("e", "c"), angle("e", 31, 270, 292),
    ],
    steps: steps("Given triangle ABC and angle D", "Bisect BC at E and complete parallelogram FECG", "FECG equals triangle ABC in the required angle"),
  },
  "prop-43": {
    description: "A diagonal and two smaller diagonal parallelograms leave opposite complements BK and KD with equal area.",
    points: {
      a: p(120, 55, "A", -22, -8), e: p(320, 55, "E", -5, -12, 1), b: p(540, 55, "B", 10, -8),
      h: p(120, 190, "H", -22, 7, 1), k: p(320, 190, "K", 10, -8, 1), f: p(540, 190, "F", 10, -8, 1),
      d: p(120, 330, "D", -22, 14), g: p(320, 330, "G", -5, 25, 1), c: p(540, 330, "C", 10, 14),
    },
    elements: [
      polygon(["e", "b", "f", "k"], "area", 2), polygon(["h", "k", "g", "d"], "area", 2),
      s("a", "b", "given"), s("b", "c", "given"), s("c", "d", "given"), s("d", "a", "given"), s("a", "c", "result"),
      s("e", "g", "construction", 1), s("h", "f", "construction", 1),
    ],
    steps: steps("Given parallelogram ABCD with diagonal AC", "Draw the two smaller parallelograms about the diagonal", "Complements BK and KD are equal"),
  },
  "prop-44": {
    description: "A parallelogram equal to the given triangle is transferred and completed on the required segment AB at the given angle.",
    points: {
      c1: p(85, 285), c2: p(220, 285), c3: p(145, 95, "C", -5, -12),
      a: p(305, 285, "A", -22, 12), b: p(555, 285, "B", 10, 12), h: p(390, 90, "H", -22, -8, 1), k: p(640, 90, "K", -5, -8, 1),
    },
    elements: [
      polygon(["c1", "c2", "c3"], "area-secondary", 0), s("c1", "c2", "given"), s("c2", "c3", "given"), s("c3", "c1", "given"),
      s("a", "b", "given"), polygon(["a", "b", "k", "h"], "area", 1), s("a", "h", "result", 1), s("h", "k", "result", 1), s("k", "b", "result", 1),
      parallel("a", "b"), parallel("h", "k"), angle("a", 31, 294, 360),
    ],
    steps: steps("Given segment AB, triangle C, and angle D", "Transfer an equal parallelogram and complete it on AB", "The applied parallelogram equals C in the given angle"),
  },
  "prop-45": {
    description: "A rectilineal figure is split into triangles, converted to adjacent parallelograms, and recombined as one parallelogram.",
    points: {
      a: p(55, 100, "A", -20, -8), b: p(215, 65, "B", -5, -12), c: p(265, 225, "C", 10, -8), d: p(115, 305, "D", -22, 14),
      f: p(350, 95, "F", -20, -8, 1), h: p(460, 95, "H", -5, -12, 1), m: p(570, 95, "M", 10, -8, 1),
      k: p(300, 305, "K", -22, 14, 1), g: p(410, 305, "G", -5, 24, 1), n: p(520, 305, "N", 10, 14, 1),
    },
    elements: [
      polygon(["a", "b", "c", "d"], "area-secondary", 0), s("a", "b", "given"), s("b", "c", "given"), s("c", "d", "given"), s("d", "a", "given"), s("d", "b", "construction", 1),
      polygon(["f", "h", "g", "k"], "area", 1), polygon(["h", "m", "n", "g"], "area", 1),
      s("f", "m", "result", 1), s("m", "n", "result", 1), s("n", "k", "result", 1), s("k", "f", "result", 1), s("h", "g", "construction", 1),
      parallel("f", "m"), parallel("k", "n"),
    ],
    steps: steps("Given rectilineal figure ABCD and angle E", "Split it by DB and convert both triangles to adjacent parallelograms", "The combined parallelogram equals the original figure"),
  },
  "prop-46": {
    description: "A perpendicular equal to AB and two parallels complete the square ADEB on the given segment.",
    points: {
      a: p(180, 285, "A", -22, 12), b: p(450, 285, "B", 10, 12), d: p(180, 55, "D", -22, -8, 1), e: p(450, 55, "E", 10, -8, 1),
    },
    elements: [
      polygon(["a", "b", "e", "d"], "area", 1), s("a", "b", "given"), s("a", "d", "result", 1), s("d", "e", "result", 1), s("e", "b", "result", 1),
      tick("a", "b"), tick("a", "d"), tick("d", "e"), tick("e", "b"), right("a", "b", "d"),
      parallel("a", "b", 1), parallel("d", "e", 1), parallel("a", "d", 2), parallel("b", "e", 2),
    ],
    steps: steps("Given segment AB", "Draw AD perpendicular and equal to AB; complete the parallels", "ADEB is a square"),
  },
  "prop-47": {
    description: "Squares on the three sides of a right triangle are partitioned so the two leg-squares exactly equal the hypotenuse-square.",
    viewBox: "0 -25 640 535",
    points: {
      a: p(220, 190, "A", -22, -8), b: p(220, 310, "B", -22, 14), c: p(380, 190, "C", 10, -8),
      f: p(100, 190, "F", -22, -8, 1), g: p(100, 310, "G", -22, 14, 1), h: p(220, 30, "H", -22, -8, 1), k: p(380, 30, "K", 10, -8, 1),
      d: p(340, 470, "D", -5, 25, 1), e: p(500, 350, "E", 10, 14, 1), l: p(398, 427, "L", 10, 14, 2),
    },
    elements: [
      polygon(["a", "b", "c"], "area-secondary", 0), s("a", "b", "given"), s("a", "c", "given"), s("b", "c", "given"), right("a", "b", "c", 0),
      polygon(["a", "b", "g", "f"], "area", 1), polygon(["h", "a", "c", "k"], "area", 1), polygon(["b", "d", "e", "c"], "area-secondary", 1),
      s("a", "f", "construction", 1), s("f", "g", "construction", 1), s("g", "b", "construction", 1),
      s("h", "a", "construction", 1), s("h", "k", "construction", 1), s("k", "c", "construction", 1),
      s("b", "d", "construction", 1), s("d", "e", "construction", 1), s("e", "c", "construction", 1),
      s("a", "l", "result", 2), s("a", "d", "construction", 2), s("f", "c", "construction", 2),
    ],
    steps: steps("Triangle ABC is right-angled at A", "Describe a square on each side", "The square on BC equals the two squares on BA and AC"),
  },
  "prop-48": {
    description: "A right triangle ADC is constructed with legs equal to AB and AC; equality of the side-squares forces DC to coincide in length with BC.",
    points: {
      a: p(260, 235, "A", -22, 10), b: p(120, 80, "B", -22, -8), c: p(520, 235, "C", 10, 10), d: p(260, 55, "D", 10, -8, 1),
    },
    elements: [
      polygon(["a", "b", "c"], "area-secondary", 0), s("a", "b", "given"), s("b", "c", "given"), s("c", "a", "given"),
      s("a", "d", "construction", 1), s("d", "c", "result", 1), tick("a", "b"), tick("a", "d"), right("a", "c", "d"),
      tick("b", "c", 2, 2), tick("d", "c", 2, 2), angle("a", 34, 180, 270),
    ],
    steps: steps("The square on BC equals the squares on BA and AC", "Construct AD perpendicular to AC with AD = AB", "DC = BC, so angle BAC is right"),
  },
};
