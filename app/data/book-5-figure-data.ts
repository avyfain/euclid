import type { EuclidSceneSpec, ScenePrimitive, SceneTone } from "./book-2-figure-data";

type Row = { name: string; parts: number[]; y: number; stage: number; tone?: SceneTone };
type Definition = {
  title: string;
  description: string;
  steps: string[];
  statuses: string[];
  rows: Row[];
  conclusion: string;
  invariant: () => boolean;
};

const rect = (x: number, y: number, width: number, height: number, tone: SceneTone, stage: number): ScenePrimitive => ({ kind: "rect", x, y, width, height, tone, stage });
const line = (x1: number, y1: number, x2: number, y2: number, tone: SceneTone, stage: number): ScenePrimitive => ({ kind: "line", x1, y1, x2, y2, tone, stage });
const label = (x: number, y: number, text: string, tone: SceneTone, stage: number, anchor: "start" | "middle" | "end" = "middle"): ScenePrimitive => ({ kind: "label", x, y, text, tone, stage, anchor });
const close = (first: number, second: number) => Math.abs(first - second) < 1e-9;

function rowPrimitives(row: Row): ScenePrimitive[] {
  const unit = 17, x = 172, height = 25;
  let cursor = x;
  const blocks = row.parts.map((part, index) => {
    const width = part * unit, tone = index % 2 ? "area-secondary" : row.tone ?? "area";
    const block = rect(cursor, row.y, width, height, tone, row.stage);
    cursor += width;
    return block;
  });
  return [
    ...blocks,
    ...row.parts.slice(1).map((_, index) => {
      const divider = x + row.parts.slice(0, index + 1).reduce((sum, part) => sum + part, 0) * unit;
      return line(divider, row.y, divider, row.y + height, "construction", row.stage);
    }),
    label(158, row.y + 18, row.name, "line", row.stage, "end"),
    label(cursor + 10, row.y + 18, String(row.parts.reduce((sum, part) => sum + part, 0)), "muted", row.stage, "start"),
  ];
}

function makeScene(number: number, definition: Definition): EuclidSceneSpec {
  return {
    id: `book-5-prop-${number}`,
    family: true,
    title: definition.title,
    description: definition.description,
    steps: definition.steps,
    control: { kind: "steps" },
    build: () => [
      ...definition.rows.flatMap(rowPrimitives),
      label(320, 360, definition.conclusion, "result", 2),
    ],
    status: (_value, stage) => definition.statuses[stage] ?? definition.statuses.at(-1) ?? definition.conclusion,
    invariant: definition.invariant,
  };
}

const scenes: Record<number, EuclidSceneSpec> = {
  1: makeScene(1, {
    title: "Equimultiples preserve one common multiplier across every magnitude.",
    description: "The first pair has been copied three times, as has the second. The colored blocks make the shared multiplier visible: whenever A is three copies of B, C is three copies of D as well.",
    steps: ["Set out the original magnitudes B and D", "Take three equal copies of each", "Read the common multiplier"],
    statuses: ["Original magnitudes B and D", "A and C are built from three equal copies", "The multiplier is common to both pairs"],
    rows: [{ name: "B", parts: [2], y: 62, stage: 0 }, { name: "D", parts: [3], y: 108, stage: 0, tone: "area-secondary" }, { name: "A = 3·B", parts: [2, 2, 2], y: 185, stage: 1 }, { name: "C = 3·D", parts: [3, 3, 3], y: 240, stage: 1, tone: "area-secondary" }],
    conclusion: "A is 3·B exactly when C is 3·D",
    invariant: () => 6 / 2 === 9 / 3,
  }),
  2: makeScene(2, {
    title: "Adding same-multiple magnitudes keeps the common multiplier.",
    description: "A and C are double their bases; E and F are triple their bases. When the matching rows are added, the totals are five copies of their respective bases, which is the proposition's real content.",
    steps: ["Set out the double pairs", "Add the triple pairs", "Group the totals by their common base"],
    statuses: ["A and C are double their bases", "E and F contribute three more copies", "Both sums are fivefold"],
    rows: [{ name: "A = 2·B", parts: [2, 2], y: 48, stage: 0 }, { name: "C = 2·D", parts: [3, 3], y: 88, stage: 0, tone: "area-secondary" }, { name: "E = 3·B", parts: [2, 2, 2], y: 146, stage: 1 }, { name: "F = 3·D", parts: [3, 3, 3], y: 186, stage: 1, tone: "area-secondary" }, { name: "A + E = 5·B", parts: [2, 2, 2, 2, 2], y: 255, stage: 2 }, { name: "C + F = 5·D", parts: [3, 3, 3, 3, 3], y: 298, stage: 2, tone: "area-secondary" }],
    conclusion: "A + E is to B as C + F is to D",
    invariant: () => (4 + 6) / 2 === (6 + 9) / 3,
  }),
  3: makeScene(3, {
    title: "Taking equimultiples preserves a same-multiple relation ex aequali.",
    description: "A is twice B and C is twice D. Taking three copies of A and C creates six copies of B and D, so the new magnitudes still correspond to their original bases by one multiplier.",
    steps: ["Start with two double relations", "Take three copies of A and C", "Regroup them as six copies of B and D"],
    statuses: ["A and C are double their bases", "Three copies are taken in corresponding order", "Both resulting magnitudes are sixfold"],
    rows: [{ name: "A = 2·B", parts: [2, 2], y: 62, stage: 0 }, { name: "C = 2·D", parts: [3, 3], y: 106, stage: 0, tone: "area-secondary" }, { name: "3A = 6·B", parts: [2, 2, 2, 2, 2, 2], y: 196, stage: 1 }, { name: "3C = 6·D", parts: [3, 3, 3, 3, 3, 3], y: 252, stage: 1, tone: "area-secondary" }],
    conclusion: "3A is 6·B and 3C is 6·D",
    invariant: () => 3 * 4 / 2 === 3 * 6 / 3,
  }),
  4: makeScene(4, {
    title: "Corresponding equimultiples preserve a proportion.",
    description: "The original ratios 6:4 and 9:6 are equal. Doubling the antecedents and tripling the consequents changes both fractions in the same way, leaving 12:12 equal to 18:18.",
    steps: ["Set out equal ratios A:B and C:D", "Take matching multiples of antecedents and consequents", "Compare the new ratios"],
    statuses: ["6:4 equals 9:6", "Antecedents are doubled; consequents tripled", "The resulting ratios remain equal"],
    rows: [{ name: "A : B", parts: [6], y: 62, stage: 0 }, { name: "C : D", parts: [9], y: 106, stage: 0, tone: "area-secondary" }, { name: "2A : 3B", parts: [6, 6], y: 196, stage: 1 }, { name: "2C : 3D", parts: [9, 9], y: 246, stage: 1, tone: "area-secondary" }],
    conclusion: "2A : 3B = 2C : 3D",
    invariant: () => close(12 / 12, 18 / 18),
  }),
  5: makeScene(5, {
    title: "Subtracting corresponding same multiples leaves corresponding remainders.",
    description: "A is twice C, and the removed part E is twice F. Once the matching colored portions are removed, the remainders R and S remain in that same two-to-one relation.",
    steps: ["Set out two whole magnitudes in a 2:1 relation", "Remove matching 2:1 parts", "Compare the remainders"],
    statuses: ["A = 2C", "E = 2F is removed", "The remainders still satisfy R = 2S"],
    rows: [{ name: "A", parts: [10], y: 58, stage: 0 }, { name: "C", parts: [5], y: 102, stage: 0, tone: "area-secondary" }, { name: "E removed", parts: [6], y: 166, stage: 1 }, { name: "F removed", parts: [3], y: 206, stage: 1, tone: "area-secondary" }, { name: "R = A − E", parts: [4], y: 276, stage: 2 }, { name: "S = C − F", parts: [2], y: 314, stage: 2, tone: "area-secondary" }],
    conclusion: "R = 2S, just as A = 2C",
    invariant: () => (10 - 6) / (5 - 3) === 10 / 5,
  }),
  6: makeScene(6, {
    title: "Remainders of equimultiples are again corresponding equimultiples.",
    description: "Eight and twelve are four copies of two and three. Removing two matching copies leaves four and six, which are still two copies of the same bases rather than a new unrelated pair.",
    steps: ["Set out fourfold magnitudes", "Subtract twofold corresponding parts", "Read the twofold remainders"],
    statuses: ["Both wholes are fourfold", "Twofold parts are subtracted", "The remainders are twofold"],
    rows: [{ name: "A = 4·u", parts: [2, 2, 2, 2], y: 62, stage: 0 }, { name: "B = 4·v", parts: [3, 3, 3, 3], y: 106, stage: 0, tone: "area-secondary" }, { name: "subtract 2·u", parts: [2, 2], y: 168, stage: 1 }, { name: "subtract 2·v", parts: [3, 3], y: 208, stage: 1, tone: "area-secondary" }, { name: "remainder = 2·u", parts: [2, 2], y: 278, stage: 2 }, { name: "remainder = 2·v", parts: [3, 3], y: 316, stage: 2, tone: "area-secondary" }],
    conclusion: "The remainders are equal multiples of u and v",
    invariant: () => (8 - 4) / 2 === (12 - 6) / 3,
  }),
  7: makeScene(7, {
    title: "Equal magnitudes have the same ratio to one common magnitude.",
    description: "A and C are literally equal bars facing the same bar B. Their quotients by B cannot differ; reversing the comparison makes B have the same ratio to either equal magnitude as well.",
    steps: ["Set out equal A and C", "Compare each with B", "Reverse the common comparison"],
    statuses: ["A and C are equal", "A:B and C:B agree", "B:A and B:C agree as well"],
    rows: [{ name: "A", parts: [6], y: 72, stage: 0 }, { name: "C", parts: [6], y: 116, stage: 0, tone: "area-secondary" }, { name: "B", parts: [4], y: 184, stage: 1, tone: "construction" }, { name: "A : B = C : B", parts: [6], y: 258, stage: 2 }, { name: "B : A = B : C", parts: [4], y: 302, stage: 2, tone: "area-secondary" }],
    conclusion: "Equal magnitudes make equal ratios to the same magnitude",
    invariant: () => close(6 / 4, 6 / 4) && close(4 / 6, 4 / 6),
  }),
  8: makeScene(8, {
    title: "With a common term fixed, the greater magnitude gives the greater ratio.",
    description: "Against the fixed bar B, A is longer than C, so A:B exceeds C:B. Turn the fractions around and the order reverses: B:C exceeds B:A because C is the smaller denominator.",
    steps: ["Fix the common magnitude B", "Compare A:B with C:B", "Reverse the terms and observe the order reverse"],
    statuses: ["A is greater than C", "The common denominator B exposes A:B > C:B", "The reciprocal comparison reverses the inequality"],
    rows: [{ name: "A", parts: [8], y: 64, stage: 0 }, { name: "B", parts: [5], y: 108, stage: 0, tone: "construction" }, { name: "C", parts: [3], y: 152, stage: 0, tone: "area-secondary" }, { name: "A : B > C : B", parts: [8], y: 230, stage: 1 }, { name: "B : C > B : A", parts: [5], y: 288, stage: 2, tone: "area-secondary" }],
    conclusion: "Larger numerator, larger ratio; smaller denominator, larger reciprocal ratio",
    invariant: () => 8 / 5 > 3 / 5 && 5 / 3 > 5 / 8,
  }),
  9: makeScene(9, {
    title: "Equal ratios to one common magnitude force equality.",
    description: "If A:B and C:B are equal, the two bars A and C must end together. The mirrored claim B:A = B:C has the same conclusion: sharing the same ratio with the same magnitude leaves no room for unequal terms.",
    steps: ["Use B as the common magnitude", "Set the two ratios equal", "Read the forced equality A = C"],
    statuses: ["B is common", "The ratios are stipulated equal", "The compared magnitudes coincide"],
    rows: [{ name: "B", parts: [4], y: 75, stage: 0, tone: "construction" }, { name: "A : B", parts: [6], y: 150, stage: 1 }, { name: "C : B", parts: [6], y: 196, stage: 1, tone: "area-secondary" }, { name: "A = C", parts: [6], y: 278, stage: 2 }],
    conclusion: "A:B = C:B forces A = C",
    invariant: () => close(6 / 4, 6 / 4),
  }),
  10: makeScene(10, {
    title: "A greater ratio to one common magnitude identifies the greater magnitude.",
    description: "The greater quotient A:B is not an abstract ranking: with B fixed, it can only arise because A is longer than C. Reversing the comparison similarly identifies the smaller denominator.",
    steps: ["Fix B", "Order A:B and C:B", "Read the order of the compared magnitudes"],
    statuses: ["One common magnitude B", "A:B is greater than C:B", "Therefore A is greater than C"],
    rows: [{ name: "A", parts: [8], y: 68, stage: 0 }, { name: "B", parts: [5], y: 112, stage: 0, tone: "construction" }, { name: "C", parts: [3], y: 156, stage: 0, tone: "area-secondary" }, { name: "A : B > C : B", parts: [8], y: 238, stage: 1 }, { name: "A > C", parts: [8], y: 300, stage: 2 }],
    conclusion: "A:B > C:B, so A > C",
    invariant: () => 8 / 5 > 3 / 5 && 8 > 3,
  }),
  11: makeScene(11, {
    title: "Ratios equal to one ratio are equal to one another.",
    description: "Three differently sized pairs all reduce to the same 3:2 relation. Lining their bars up makes the transitive move visible: equality with the same ratio joins every pair into one proportion class.",
    steps: ["Set out three pairs", "Reduce each to the same 3:2 relation", "Join them by the common ratio"],
    statuses: ["Three candidate ratios", "Each pair has the same scale factor", "All three ratios are equal"],
    rows: [{ name: "A : B", parts: [6], y: 62, stage: 0 }, { name: "C : D", parts: [9], y: 110, stage: 0, tone: "area-secondary" }, { name: "E : F", parts: [12], y: 158, stage: 1 }, { name: "3 : 2", parts: [3], y: 254, stage: 2, tone: "result" }],
    conclusion: "A:B = C:D = E:F = 3:2",
    invariant: () => close(6 / 4, 9 / 6) && close(9 / 6, 12 / 8),
  }),
  12: makeScene(12, {
    title: "A chain of proportional magnitudes has proportional sums.",
    description: "Every antecedent is two-thirds of its corresponding consequent. Adding the antecedent bars and the consequent bars preserves that single scale, turning 12:18 back into the same 2:3 proportion.",
    steps: ["Set out three 2:3 pairs", "Add all antecedents and all consequents", "Compare the two totals"],
    statuses: ["Each pair has ratio 2:3", "The corresponding bars are accumulated", "The totals retain ratio 2:3"],
    rows: [{ name: "A", parts: [2], y: 48, stage: 0 }, { name: "C", parts: [4], y: 88, stage: 0, tone: "area-secondary" }, { name: "E", parts: [6], y: 128, stage: 0 }, { name: "B + D + F", parts: [3, 6, 9], y: 200, stage: 1, tone: "area-secondary" }, { name: "A + C + E", parts: [2, 4, 6], y: 270, stage: 2 }],
    conclusion: "A + C + E : B + D + F = 12:18 = 2:3",
    invariant: () => close((2 + 4 + 6) / (3 + 6 + 9), 2 / 3),
  }),
  13: makeScene(13, {
    title: "A ratio equal to a greater ratio is itself greater.",
    description: "A:B and C:D are both 3:2, while E:F is 4:3. The shared middle relation lets the first ratio inherit the strict ordering, which is Euclid's transitivity for ratio inequalities.",
    steps: ["Set out the equal ratios", "Compare their shared value with E:F", "Transfer the inequality back to A:B"],
    statuses: ["A:B equals C:D", "C:D exceeds E:F", "Therefore A:B exceeds E:F"],
    rows: [{ name: "A : B = 3:2", parts: [9], y: 72, stage: 0 }, { name: "C : D = 3:2", parts: [6], y: 116, stage: 0, tone: "area-secondary" }, { name: "E : F = 4:3", parts: [4], y: 194, stage: 1 }, { name: "3:2 > 4:3", parts: [3], y: 274, stage: 2, tone: "result" }],
    conclusion: "A:B = C:D > E:F, so A:B > E:F",
    invariant: () => close(9 / 6, 3 / 2) && 3 / 2 > 4 / 3,
  }),
  14: makeScene(14, {
    title: "Equal ratios preserve the order of corresponding magnitudes.",
    description: "The two pairs have the same two-to-one ratio. Because A is longer than C, their shared scale forces B to be longer than D as well; equality or reversal would produce the matching alternatives.",
    steps: ["Set out equal ratios", "Compare the antecedents A and C", "Transfer the comparison to B and D"],
    statuses: ["A:B equals C:D", "A is greater than C", "B is greater than D by the same ratio"],
    rows: [{ name: "A", parts: [8], y: 62, stage: 0 }, { name: "B", parts: [4], y: 102, stage: 0, tone: "area-secondary" }, { name: "C", parts: [6], y: 166, stage: 1 }, { name: "D", parts: [3], y: 206, stage: 1, tone: "area-secondary" }, { name: "A > C", parts: [8], y: 278, stage: 2 }, { name: "B > D", parts: [4], y: 316, stage: 2, tone: "area-secondary" }],
    conclusion: "A:B = C:D and A > C imply B > D",
    invariant: () => close(8 / 4, 6 / 3) && 8 > 6 && 4 > 3,
  }),
  15: makeScene(15, {
    title: "Parts have the same ratio as corresponding equal multiples.",
    description: "The short bars a and b have ratio 2:3. Taking three copies of each merely magnifies the picture: 6:9 reduces immediately to the same 2:3 relation.",
    steps: ["Set out the two parts", "Take equal multiples of both", "Reduce the enlarged pair to the original ratio"],
    statuses: ["The original parts are 2:3", "Three copies of each are laid end to end", "The ratio is unchanged"],
    rows: [{ name: "a", parts: [2], y: 82, stage: 0 }, { name: "b", parts: [3], y: 126, stage: 0, tone: "area-secondary" }, { name: "3a", parts: [2, 2, 2], y: 208, stage: 1 }, { name: "3b", parts: [3, 3, 3], y: 258, stage: 1, tone: "area-secondary" }],
    conclusion: "a:b = 3a:3b = 2:3",
    invariant: () => close(2 / 3, 6 / 9),
  }),
  16: makeScene(16, {
    title: "Alternating the terms of a proportion gives another proportion.",
    description: "The first layout reads A:B = C:D. Reading the same four bars down the columns instead compares A with C and B with D, revealing the alternate proportion without changing any magnitude.",
    steps: ["Set out A:B = C:D", "Align antecedents and consequents in columns", "Read the alternate ratios"],
    statuses: ["The original proportion is 6:4 = 9:6", "The bars are regrouped by column", "A:C equals B:D"],
    rows: [{ name: "A", parts: [6], y: 54, stage: 0 }, { name: "B", parts: [4], y: 94, stage: 0, tone: "area-secondary" }, { name: "C", parts: [9], y: 160, stage: 1 }, { name: "D", parts: [6], y: 200, stage: 1, tone: "area-secondary" }, { name: "A : C", parts: [6], y: 272, stage: 2 }, { name: "B : D", parts: [4], y: 314, stage: 2, tone: "area-secondary" }],
    conclusion: "A:B = C:D implies A:C = B:D",
    invariant: () => close(6 / 4, 9 / 6) && close(6 / 9, 4 / 6),
  }),
  17: makeScene(17, {
    title: "Proportions remain true componendo and separando.",
    description: "From 6:4 = 9:6, adding each antecedent to its consequent gives 10:4 = 15:6. Subtracting instead gives 2:4 = 3:6; both operations preserve the proportion because each side undergoes the same change.",
    steps: ["Start from equal ratios", "Add antecedent and consequent", "Subtract consequent from antecedent"],
    statuses: ["6:4 equals 9:6", "Componendo creates 10:4 = 15:6", "Separando creates 2:4 = 3:6"],
    rows: [{ name: "A : B", parts: [6], y: 54, stage: 0 }, { name: "C : D", parts: [9], y: 94, stage: 0, tone: "area-secondary" }, { name: "A + B : B", parts: [6, 4], y: 172, stage: 1 }, { name: "C + D : D", parts: [9, 6], y: 216, stage: 1, tone: "area-secondary" }, { name: "A − B : B", parts: [2], y: 284, stage: 2 }, { name: "C − D : D", parts: [3], y: 320, stage: 2, tone: "area-secondary" }],
    conclusion: "(A+B):B = (C+D):D and (A−B):B = (C−D):D",
    invariant: () => close(10 / 4, 15 / 6) && close(2 / 4, 3 / 6),
  }),
  18: makeScene(18, {
    title: "A separated proportion can be restored componendo.",
    description: "The smaller remainders 2:4 and 3:6 are proportional. Adding the same consequent bars back reconstructs 6:4 and 9:6, so the separated relation returns to the original whole relation.",
    steps: ["Set out the separated ratios", "Add each consequent back", "Recover the composed proportion"],
    statuses: ["2:4 equals 3:6", "The common consequents are restored", "6:4 equals 9:6"],
    rows: [{ name: "A − B : B", parts: [2], y: 74, stage: 0 }, { name: "C − D : D", parts: [3], y: 118, stage: 0, tone: "area-secondary" }, { name: "(A − B) + B", parts: [2, 4], y: 214, stage: 1 }, { name: "(C − D) + D", parts: [3, 6], y: 264, stage: 1, tone: "area-secondary" }],
    conclusion: "A:B = C:D is restored componendo",
    invariant: () => close(2 / 4, 3 / 6) && close(6 / 4, 9 / 6),
  }),
  19: makeScene(19, {
    title: "Equal whole-to-whole and removed-part ratios give equal remainders.",
    description: "The whole ratio 10:6 equals the removed-part ratio 5:3. Removing those matched portions leaves 5 and 3, and their ratio returns to the original 5:3 relation.",
    steps: ["Set out whole magnitudes", "Remove proportional parts", "Compare the remainders with the wholes"],
    statuses: ["10:6 equals 5:3", "Five and three are removed", "The remainders again have ratio 5:3"],
    rows: [{ name: "whole A", parts: [10], y: 58, stage: 0 }, { name: "whole C", parts: [6], y: 100, stage: 0, tone: "area-secondary" }, { name: "removed", parts: [5], y: 166, stage: 1 }, { name: "removed", parts: [3], y: 206, stage: 1, tone: "area-secondary" }, { name: "A − part", parts: [5], y: 278, stage: 2 }, { name: "C − part", parts: [3], y: 316, stage: 2, tone: "area-secondary" }],
    conclusion: "(A−part):(C−part) = A:C = 5:3",
    invariant: () => close(10 / 6, 5 / 3) && close((10 - 5) / (6 - 3), 10 / 6),
  }),
  20: makeScene(20, {
    title: "Ordered proportional chains preserve their endpoint comparison ex aequali.",
    description: "The chains 8, 4, 2 and 12, 6, 3 have matching pairwise ratios. Since the first chain begins above its third term, the same linked comparisons force D to stand above F in the second chain.",
    steps: ["Set out two ordered proportional chains", "Follow the two matching links", "Compare the endpoints ex aequali"],
    statuses: ["Both chains halve at each step", "Their pairwise ratios correspond", "A > C transfers to D > F"],
    rows: [{ name: "A, B, C", parts: [8], y: 54, stage: 0 }, { name: "D, E, F", parts: [12], y: 96, stage: 0, tone: "area-secondary" }, { name: "A:B = D:E", parts: [8], y: 172, stage: 1 }, { name: "B:C = E:F", parts: [4], y: 214, stage: 1, tone: "area-secondary" }, { name: "A:C = D:F", parts: [8], y: 286, stage: 2 }],
    conclusion: "A > C exactly when D > F",
    invariant: () => close(8 / 4, 12 / 6) && close(4 / 2, 6 / 3) && 8 > 2 && 12 > 3,
  }),
  21: makeScene(21, {
    title: "Perturbed proportional chains preserve the endpoint comparison.",
    description: "The second chain is paired in perturbed order: A:B matches E:F, while B:C matches D:E. Those two linked two-to-one relations still transfer the endpoint comparison, so A above C forces D above F.",
    steps: ["Set out the first chain A, B, C", "Match it to D, E, F in perturbed order", "Transfer the endpoint comparison"],
    statuses: ["A:B:C is 8:4:2", "The paired ratios are A:B = E:F and B:C = D:E", "A > C transfers to D > F"],
    rows: [{ name: "A, B, C", parts: [8], y: 56, stage: 0 }, { name: "D, E, F", parts: [12], y: 100, stage: 0, tone: "area-secondary" }, { name: "A:B = E:F", parts: [8], y: 174, stage: 1 }, { name: "B:C = D:E", parts: [4], y: 216, stage: 1, tone: "area-secondary" }, { name: "D > F", parts: [12], y: 286, stage: 2 }],
    conclusion: "A > C exactly when D > F",
    invariant: () => close(8 / 4, 6 / 3) && close(4 / 2, 12 / 6) && 8 > 2 && 12 > 3,
  }),
  22: makeScene(22, {
    title: "Any number of matching proportional links combine ex aequali.",
    description: "Four links in the first chain and four in the second have the same two-to-one step. Combining every link reduces the endpoints 16:2 and 24:3 to the same eight-to-one ratio.",
    steps: ["Set out two four-term chains", "Match every adjacent ratio", "Combine the links to compare endpoints"],
    statuses: ["Each chain repeatedly halves", "Every adjacent pair corresponds", "The first and last terms are in the same ratio"],
    rows: [{ name: "A, B, C, D", parts: [16], y: 56, stage: 0 }, { name: "E, F, G, H", parts: [24], y: 100, stage: 0, tone: "area-secondary" }, { name: "all links = 2:1", parts: [2, 2, 2], y: 188, stage: 1 }, { name: "A:D", parts: [16], y: 278, stage: 2 }, { name: "E:H", parts: [24], y: 316, stage: 2, tone: "area-secondary" }],
    conclusion: "A:D = E:H = 8:1",
    invariant: () => close(16 / 2, 24 / 3),
  }),
  23: makeScene(23, {
    title: "A perturbed chain also combines ex aequali.",
    description: "The paired ratios are perturbed: A:B matches E:F, and B:C matches D:E. Euclid's alternating move aligns the middle links, so the endpoint relation emerges as A:C = D:F.",
    steps: ["Set out the two perturbed links", "Align the shared middle terms alternately", "Read the endpoint ratio ex aequali"],
    statuses: ["A:B = E:F and B:C = D:E", "The middle terms are aligned alternately", "A:C equals D:F"],
    rows: [{ name: "A, B, C", parts: [8], y: 58, stage: 0 }, { name: "D, E, F", parts: [12], y: 102, stage: 0, tone: "area-secondary" }, { name: "A:B = E:F", parts: [8], y: 180, stage: 1 }, { name: "B:C = D:E", parts: [4], y: 222, stage: 1, tone: "area-secondary" }, { name: "A:C = D:F", parts: [8], y: 292, stage: 2 }],
    conclusion: "A:C = D:F = 4:1",
    invariant: () => close(8 / 4, 6 / 3) && close(4 / 2, 12 / 6) && close(8 / 2, 12 / 3),
  }),
  24: makeScene(24, {
    title: "Adding two antecedents preserves their shared ratio to the consequent.",
    description: "A and C are double their bases, while E and F are triple their bases. Adding the corresponding antecedents makes five copies on each side, so the two new ratios remain equal.",
    steps: ["Set out two pairs with equal ratios", "Add the corresponding antecedents", "Compare the two sums to their consequents"],
    statuses: ["A:B equals C:D, and E:B equals F:D", "The antecedents are added", "Both sums are fivefold of their consequents"],
    rows: [{ name: "A = 2·B", parts: [2, 2], y: 48, stage: 0 }, { name: "C = 2·D", parts: [3, 3], y: 88, stage: 0, tone: "area-secondary" }, { name: "E = 3·B", parts: [2, 2, 2], y: 146, stage: 1 }, { name: "F = 3·D", parts: [3, 3, 3], y: 186, stage: 1, tone: "area-secondary" }, { name: "A + E", parts: [2, 2, 2, 2, 2], y: 258, stage: 2 }, { name: "C + F", parts: [3, 3, 3, 3, 3], y: 302, stage: 2, tone: "area-secondary" }],
    conclusion: "(A+E):B = (C+F):D = 5:1",
    invariant: () => close((4 + 6) / 2, (6 + 9) / 3),
  }),
  25: makeScene(25, {
    title: "In a proportion, the greatest plus least exceeds the remaining two.",
    description: "The four magnitudes 8, 4, 6, and 3 are proportional because 8:4 equals 6:3. Sorting them reveals the final comparison: greatest plus least is 8 + 3, which exceeds the two middle magnitudes 6 + 4.",
    steps: ["Set out four proportional magnitudes", "Identify greatest, least, and the middle pair", "Compare the two sums"],
    statuses: ["8:4 equals 6:3", "Greatest is 8; least is 3", "8 + 3 is greater than 6 + 4"],
    rows: [{ name: "greatest A", parts: [8], y: 58, stage: 0 }, { name: "middle C", parts: [6], y: 100, stage: 0, tone: "area-secondary" }, { name: "middle B", parts: [4], y: 142, stage: 0, tone: "area-secondary" }, { name: "least D", parts: [3], y: 184, stage: 0 }, { name: "A + D", parts: [8, 3], y: 270, stage: 1 }, { name: "B + C", parts: [4, 6], y: 314, stage: 2, tone: "area-secondary" }],
    conclusion: "A + D = 11 > 10 = B + C",
    invariant: () => close(8 / 4, 6 / 3) && 8 + 3 > 6 + 4,
  }),
};

export const BOOK_FIVE_SCENES: Record<string, EuclidSceneSpec> = Object.fromEntries(
  Object.entries(scenes).map(([number, scene]) => [`prop-${number}`, scene]),
);

export function validateBookFiveScenes() {
  return Object.values(BOOK_FIVE_SCENES).every((scene) => scene.invariant(0) && scene.build(0).every((primitive) =>
    Object.values(primitive).every((candidate) => typeof candidate !== "number" || Number.isFinite(candidate)),
  ));
}
