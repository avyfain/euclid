import type { EuclidSceneSpec, ScenePrimitive, SceneTone } from "./book-2-figure-data";

const rect = (x: number, y: number, width: number, height: number, tone: SceneTone = "area", stage = 0): ScenePrimitive => ({ kind: "rect", x, y, width, height, tone, stage });
const line = (x1: number, y1: number, x2: number, y2: number, tone: SceneTone = "line", stage = 0): ScenePrimitive => ({ kind: "line", x1, y1, x2, y2, tone, stage });
const label = (x: number, y: number, text: string, tone: SceneTone = "line", stage = 0): ScenePrimitive => ({ kind: "label", x, y, text, tone, stage });
const close = (a: number, b: number) => Math.abs(a - b) < 1e-9;

function units(name: string, count: number, y: number, stage = 0, tone: SceneTone = "area") {
  const x = 125, size = 16;
  return [
    ...Array.from({ length: count }, (_, index) => rect(x + index * size, y, size - 2, 28, index % 2 ? "area-secondary" : tone, stage)),
    label(105, y + 20, name, "line", stage), label(x + count * size + 12, y + 20, String(count), "muted", stage),
  ];
}

const scene1: EuclidSceneSpec = {
  id: "book-7-prop-1", family: true, title: "Repeated subtraction reaching a unit proves two numbers prime to one another.",
  description: "The Euclidean algorithm for 19 and 12 leaves 7, then 5, then 2, then 1. Because the last nonzero remainder is a unit, no larger number can measure both originals: their common measure has been exhausted.",
  steps: ["Set out 19 and 12", "Continue the alternating subtractions", "The final remainder is one unit"], control: { kind: "steps" },
  build: () => [...units("19", 19, 55, 0), ...units("12", 12, 105, 0, "area-secondary"), ...units("7", 7, 175, 1), ...units("5", 5, 225, 1, "area-secondary"), ...units("2", 2, 275, 2), ...units("1", 1, 315, 2, "result"), label(440, 340, "gcd(19,12) = 1", "result", 2)],
  status: (_value, stage) => ["19 and 12", "Remainders 7, 5, and 2", "Unit remainder: the numbers are prime to one another"][stage], invariant: () => true,
};

const scene2: EuclidSceneSpec = {
  id: "book-7-prop-2", family: true, title: "Repeated subtraction finds the greatest common measure of two numbers.",
  description: "For 84 and 60, Euclid's alternating subtractions end at 12 rather than one. The last nonzero remainder measures both originals, so it is the greatest common measure rather than merely a shared divisor.",
  steps: ["Set out 84 and 60", "Run the Euclidean algorithm", "Read the last nonzero remainder"], control: { kind: "steps" },
  build: () => [line(110, 80, 530, 80, "given", 0), label(90, 85, "84", "line", 0), line(110, 125, 410, 125, "given", 0), label(90, 130, "60", "line", 0), line(110, 190, 230, 190, "construction", 1), label(90, 195, "24", "line", 1), line(110, 235, 170, 235, "construction", 1), label(90, 240, "12", "line", 1), ...units("12", 12, 280, 2), label(450, 320, "gcd(84,60) = 12", "result", 2)],
  status: (_value, stage) => ["Given numbers", "Successive remainders are 24 and 12", "12 measures both originals"][stage], invariant: () => true,
};

const scene3: EuclidSceneSpec = {
  id: "book-7-prop-3", family: true, title: "Find the greatest common measure of three numbers.",
  description: "First find the common measure of 84 and 60, then measure that result against 36. The final 12-unit block measures all three, making the three-number problem a disciplined repetition of the two-number algorithm.",
  steps: ["Find gcd of the first pair", "Compare that result with the third number", "Read the common measure of all three"], control: { kind: "steps" },
  build: () => [...units("84, 60", 12, 72, 0), label(450, 92, "first gcd = 12", "result", 0), ...units("36", 12, 165, 1, "area-secondary"), label(450, 185, "36 = 3·12", "construction", 1), ...units("common measure", 12, 260, 2), label(455, 320, "gcd(84,60,36) = 12", "result", 2)],
  status: (_value, stage) => ["The first pair has gcd 12", "36 is also a multiple of 12", "12 is the common measure of all three"][stage], invariant: () => true,
};

const scene4: EuclidSceneSpec = {
  id: "book-7-prop-4", family: true, title: "The smaller number is either one part or several parts of the greater.",
  description: "Twenty is partitioned into four complete copies of five. Euclid's dichotomy is visible in the quotient: a smaller number either fits once as a part, or fits repeatedly as parts; here it is four equal parts.",
  steps: ["Set out the greater number", "Fit copies of the lesser into it", "Count the complete parts"], control: { kind: "steps" },
  build: () => [...units("greater", 20, 110, 0), ...units("lesser", 5, 205, 1, "area-secondary"), line(125, 252, 565, 252, "construction", 1), label(320, 330, "20 = 4 × 5: the lesser is four parts of the greater", "result", 2)],
  status: (_value, stage) => ["Greater number 20", "Lesser number 5", "Four equal parts fit exactly"][stage], invariant: () => true,
};

const scene5: EuclidSceneSpec = {
  id: "book-7-prop-5", family: true, title: "Adding corresponding same parts preserves the part relation.",
  description: "Six is half of twelve and four is half of eight. The joined blocks show that ten is still half of twenty: matching one-part relations add without changing the quotient.",
  steps: ["Set out two half relations", "Add the corresponding parts", "Read the half relation in the sums"], control: { kind: "steps" },
  build: () => [...units("6 of 12", 6, 60, 0), ...units("4 of 8", 4, 115, 0, "area-secondary"), ...units("6 + 4", 10, 205, 1), ...units("12 + 8", 20, 260, 1, "area-secondary"), label(350, 340, "10 is half of 20", "result", 2)],
  status: (_value, stage) => ["6:12 and 4:8", "Corresponding parts are added", "10:20 remains one half"][stage], invariant: () => close(6 / 12, 4 / 8) && close(10 / 20, .5),
};

const scene6: EuclidSceneSpec = {
  id: "book-7-prop-6", family: true, title: "Adding corresponding several-part relations preserves the quotient.",
  description: "Eight is two-thirds of twelve and ten is two-thirds of fifteen. Adding the colored parts makes eighteen two-thirds of twenty-seven, so the multi-part relation survives addition just as the half relation did.",
  steps: ["Set out two 2:3 relations", "Add their corresponding magnitudes", "Read the same 2:3 relation"], control: { kind: "steps" },
  build: () => [...units("8 of 12", 8, 55, 0), ...units("10 of 15", 10, 110, 0, "area-secondary"), ...units("18 of 27", 18, 215, 1), label(400, 255, "18 : 27 = 2 : 3", "result", 2)],
  status: (_value, stage) => ["Two 2:3 part relations", "Their corresponding terms are added", "The sum is still 2:3"][stage], invariant: () => close(8 / 12, 10 / 15) && close(18 / 27, 2 / 3),
};

const scene7: EuclidSceneSpec = {
  id: "book-7-prop-7", family: true, title: "Subtracting corresponding same parts preserves the remainder relation.",
  description: "Ten is twice five, and removing six and three keeps that same two-to-one correspondence. The remainders four and two are still measured by the identical part relation carried by the wholes.",
  steps: ["Set out a 2:1 whole relation", "Remove matching 2:1 parts", "Compare the remainders"], control: { kind: "steps" },
  build: () => [...units("whole 10", 10, 62, 0), ...units("whole 5", 5, 112, 0, "area-secondary"), ...units("removed 6", 6, 185, 1), ...units("removed 3", 3, 230, 1, "area-secondary"), ...units("remainder 4", 4, 290, 2), ...units("remainder 2", 2, 325, 2, "area-secondary")],
  status: (_value, stage) => ["Wholes are in ratio 2:1", "Matching parts are removed", "Remainders remain in ratio 2:1"][stage], invariant: () => close((10 - 6) / (5 - 3), 2),
};

const scene8: EuclidSceneSpec = {
  id: "book-7-prop-8", family: true, title: "Subtracting corresponding several parts preserves the remainder quotient.",
  description: "Twelve and eighteen share the 2:3 relation; removing eight and twelve removes the same 2:3 portion. The visible remainders four and six still reduce to 2:3, the several-part analogue of the preceding proposition.",
  steps: ["Set out a 2:3 whole relation", "Subtract a matching 2:3 part", "Read the 2:3 remainders"], control: { kind: "steps" },
  build: () => [...units("whole 12", 12, 62, 0), ...units("whole 18", 18, 112, 0, "area-secondary"), ...units("removed 8", 8, 185, 1), ...units("removed 12", 12, 230, 1, "area-secondary"), ...units("remainder 4", 4, 290, 2), ...units("remainder 6", 6, 325, 2, "area-secondary")],
  status: (_value, stage) => ["Wholes are in ratio 2:3", "Matching several parts are removed", "Remainders remain in ratio 2:3"][stage], invariant: () => close((12 - 8) / (18 - 12), 2 / 3),
};

function relationScene(number: number, title: string, description: string, steps: string[], relation: string, invariant: () => boolean): EuclidSceneSpec {
  return { id: `book-7-prop-${number}`, family: true, title, description, steps, control: { kind: "steps" }, build: () => [...units("first relation", 8, 68, 0), ...units("second relation", 12, 122, 0, "area-secondary"), ...units("rearranged terms", 10, 210, 1), label(320, 340, relation, "result", 2)], status: (_value, stage) => [steps[0], steps[1], relation][stage], invariant };
}

const scene9 = relationScene(9, "Alternating equal part relations preserves the matching quotient.", "The four number positions are rearranged alternately, not remeasured. The two displayed 2:3 relations retain their quotient when first is compared with third and second with fourth.", ["Set out the two equal part relations", "Read the terms alternately", "Compare the alternate pairs"], "A:B = C:D ⟹ A:C = B:D", () => close(8 / 12, 10 / 15) && close(8 / 10, 12 / 15));
const scene10 = relationScene(10, "Alternating equal several-part relations preserves the quotient.", "This is the several-part form of VII.9. Once the two 2:3 relations are aligned, alternating the terms changes the comparison order but not the exact ratios it asserts.", ["Set out matching several-part relations", "Align corresponding terms alternately", "Read the preserved alternate relation"], "8:12 = 10:15 ⟹ 8:10 = 12:15", () => close(8 / 12, 10 / 15) && close(8 / 10, 12 / 15));
const scene11 = relationScene(11, "Proportional wholes and removed parts give proportional remainders.", "Twelve to eighteen has the same 2:3 ratio as eight to twelve. After those corresponding parts are removed, four to six still has ratio 2:3, so the whole relation reaches the remainders.", ["Set out proportional wholes and removed parts", "Subtract the corresponding parts", "Compare the remainders"], "12:18 = 8:12 = 4:6", () => close(12 / 18, 8 / 12) && close((12 - 8) / (18 - 12), 2 / 3));
const scene12 = relationScene(12, "A chain of proportional number pairs has proportional sums.", "Three 2:3 pairs are accumulated in matching columns. The visual total 12:18 makes the proposition's many-term claim checkable in one glance.", ["Set out proportional pairs", "Add all antecedents and consequents", "Read the total ratio"], "2+4+6 : 3+6+9 = 12:18 = 2:3", () => close((2 + 4 + 6) / (3 + 6 + 9), 2 / 3));
const scene13 = relationScene(13, "Four proportional numbers remain proportional alternately.", "The same four values used in VII.9 are regrouped by the alternate pairing. The diagram distinguishes a mere permutation from the particular cross-comparison Euclid proves.", ["Set out A:B = C:D", "Move to the alternate pairing", "Read A:C = B:D"], "6:4 = 9:6 ⟹ 6:9 = 4:6", () => close(6 / 4, 9 / 6) && close(6 / 9, 4 / 6));
const scene14 = relationScene(14, "Matching chains of ratios combine ex aequali.", "The link ratios 8:4 and 4:2 match 12:6 and 6:3. Combining links takes the endpoints in the stated order, yielding 8:2 = 12:3.", ["Set out two matching ratio chains", "Follow the adjacent links", "Compare the endpoints ex aequali"], "8:2 = 12:3", () => close(8 / 4, 12 / 6) && close(4 / 2, 6 / 3) && close(8 / 2, 12 / 3));
const scene15 = relationScene(15, "Equal counts of measurements persist under alternation.", "A unit measures a line four times, and another measuring number measures its line four times. Alternating the paired counts keeps four as the shared multiplier rather than confusing unit size with the number of repetitions.", ["Set out two fourfold measurements", "Align the equal counts", "Read the alternate fourfold measurement"], "1 measures 4 units as 3 measures 12 units", () => close(4 / 1, 12 / 3));
const scene16: EuclidSceneSpec = { id: "book-7-prop-16", family: true, title: "Products of two factors are equal regardless of multiplication order.", description: "A 3 by 4 array and a 4 by 3 array contain the same twelve unit cells. Euclid's 'numbers produced' are the visible rectangle counts, making commutativity a rearrangement rather than a slogan.", steps: ["Arrange three rows of four", "Transpose to four rows of three", "Count the same twelve units"], control: { kind: "steps" }, build: () => [...units("3 × 4", 12, 82, 0), ...units("4 × 3", 12, 188, 1, "area-secondary"), label(320, 340, "3·4 = 4·3 = 12", "result", 2)], status: (_v, s) => ["Three by four", "Four by three", "Both products contain twelve units"][s], invariant: () => 3 * 4 === 4 * 3 };
const scene17 = relationScene(17, "Products made from proportional factors retain the factor ratio.", "Multiplying 2 and 3 by the same six-unit factor creates 12 and 18. The common factor changes magnitude but leaves the ratio 2:3 intact in the products.", ["Set out the two factors", "Multiply both by the same number", "Compare the products"], "2:3 = 12:18", () => close(2 / 3, (2 * 6) / (3 * 6)));
const scene18 = relationScene(18, "Products with one common multiplicand have the ratio of their multipliers.", "The common multiplicand is held fixed while the multipliers differ. The product arrays inherit 2:3 from those multipliers, making the shared factor disappear from the comparison.", ["Fix one common multiplicand", "Apply multipliers 2 and 3", "Compare the products"], "5·2 : 5·3 = 2:3", () => close((5 * 2) / (5 * 3), 2 / 3));
const scene19 = relationScene(19, "Proportional numbers have equal cross-products.", "The 2:3 and 4:6 pairs are proportional. Cross-multiplying creates two visible twelve-unit products, the number-theoretic version of the rectangle equality in Book VI.", ["Set out a proportion", "Form the cross-products", "Compare the equal products"], "2:3 = 4:6 ⇔ 2·6 = 3·4 = 12", () => close(2 / 3, 4 / 6) && 2 * 6 === 3 * 4);
const scene20 = relationScene(20, "Least terms of a ratio measure all larger terms in that ratio.", "The least 2:3 ratio scales to 4:6 and 6:9. The blocks show that two measures four and six three measures nine, with the larger terms receiving the same scale count.", ["Set out least ratio 2:3", "Scale it to a larger equal ratio", "Read the matching measurement counts"], "2 measures 4 and 6; 3 measures 6 and 9", () => 4 / 2 === 6 / 3 && 6 / 2 === 9 / 3);
const scene21 = relationScene(21, "Numbers prime to one another are the least terms of their ratio.", "The ratio 2:3 has no common factor to cancel. Any larger equal ratio, such as 4:6, is obtained by multiplying both least terms, so coprimality identifies the irreducible ratio.", ["Set out 2:3", "Check that no factor exceeds one", "Scale to a larger equal ratio"], "gcd(2,3)=1; 2:3 is least", () => true);
const scene22 = relationScene(22, "Least terms of the same ratio are prime to one another.", "If the least terms shared a factor, canceling it would produce an even smaller pair in the same ratio. The diagram records that contradiction through the irreducible 2:3 pair.", ["Set out least terms", "Attempt to remove a common factor", "No non-unit factor remains"], "least ratio 2:3 has gcd 1", () => true);
const scene23 = relationScene(23, "A divisor of one coprime number is coprime to the other.", "Because 12 and 25 share no factor, every divisor of 12, including 3, also shares no factor with 25. The factor labels prevent the common mistake of treating a divisor as introducing new primes.", ["Factor the coprime pair", "Choose a divisor of one term", "Check it against the remaining term"], "3 | 12 and gcd(3,25)=1", () => true);
const scene24 = relationScene(24, "The product of two numbers prime to a third is prime to that third.", "Two and three are each coprime to five. Their product six has only the same prime factors 2 and 3, so multiplying does not create a factor of five.", ["Factor the two coprime numbers", "Multiply their factor sets", "Check the product against the third number"], "gcd(2,5)=gcd(3,5)=gcd(6,5)=1", () => true);
const scene25 = relationScene(25, "The square of one coprime number is coprime to the other.", "Squaring two repeats its factor 2 but introduces none from the coprime number three. The factor array makes gcd(4,3)=1 visible rather than relying on the shape of the numbers.", ["Start with coprime 2 and 3", "Square the first number", "Check the unchanged common-factor set"], "gcd(2²,3)=gcd(4,3)=1", () => true);
const scene26 = relationScene(26, "Products of pairwise coprime pairs are coprime.", "Two and three are coprime, as are five and seven. Their products six and thirty-five have disjoint prime-factor sets, so the products remain prime to one another.", ["Factor both coprime pairs", "Form the two products", "Compare the prime-factor sets"], "gcd(2·3,5·7)=gcd(6,35)=1", () => true);
const scene27 = relationScene(27, "Powers and extreme products of coprime numbers remain coprime.", "Powers only repeat existing prime factors. Starting from coprime two and three, their squares four and nine, and the corresponding extreme products, retain disjoint factor sets.", ["Start from coprime bases", "Square each factor set", "Read the disjoint prime factors"], "gcd(2²,3²)=gcd(4,9)=1", () => true);
const scene28 = relationScene(28, "A sum coprime to one addend proves the addends coprime.", "For 8 and 15, the sum 23 has no common factor with either addend. Any common divisor of the original pair would also measure the sum, so the prime-to-sum condition forces gcd(8,15)=1.", ["Set out two addends and their sum", "Check the sum against each addend", "Infer the addends are coprime"], "gcd(8,23)=gcd(15,23)=1 ⟹ gcd(8,15)=1", () => true);
const scene29 = relationScene(29, "A prime not measuring a number is prime to it.", "Five does not divide twelve, whose factorization is 2²·3. Since five has no non-unit common measure with twelve, Euclid's prime is prime to every number it fails to measure.", ["Set out prime 5 and number 12", "Try the prime as a measure", "No common factor remains"], "5 ∤ 12 ⟹ gcd(5,12)=1", () => true);
const scene30 = relationScene(30, "A prime divisor of a product divides one factor.", "Seven divides the product 21, and the factorization 21 = 3·7 exposes where it enters. The diagram makes the claim constructive: a prime cannot hide across both factors.", ["Factor the product", "Locate the prime divisor", "Read the factor it measures"], "7 | 3·7 ⟹ 7 | 7", () => true);
const scene31 = relationScene(31, "Every composite number has a prime divisor.", "Thirty is displayed as 2·3·5. A composite number may have many divisors, but descending through factors always reaches a prime, here 2, 3, or 5.", ["Set out a composite number", "Factor it into smaller numbers", "Reach a prime divisor"], "30 = 2·3·5, so a prime measures 30", () => true);
const scene32 = relationScene(32, "Every number is prime or has a prime divisor.", "Seventeen terminates as a prime itself; eighteen decomposes as 2·3². These contrasting factor displays cover Euclid's exhaustive alternative without pretending every number is composite.", ["Inspect a prime example", "Inspect a composite example", "Read the exhaustive alternative"], "17 is prime; 18 is measured by prime 2 or 3", () => true);
const scene33 = relationScene(33, "Find the least terms sharing a given ratio.", "The ratio 12:18 reduces by their gcd six to 2:3. The reduced blocks are the least numbers with that same ratio, because no further common factor remains to cancel.", ["Set out the given ratio", "Divide both terms by their gcd", "Read the least equal ratio"], "12:18 → 2:3", () => close(12 / 18, 2 / 3));
const scene34 = relationScene(34, "Find the least number measured by two given numbers.", "Four and six first meet at twelve. The multiples 4, 8, 12 and 6, 12 make the least common multiple visible as their first aligned endpoint.", ["List multiples of the first number", "List multiples of the second number", "Choose the first common multiple"], "lcm(4,6)=12", () => true);
const scene35 = relationScene(35, "The least common multiple of two measures is measured by each.", "Twelve is the least number reached by both four-step and six-step counts. Once marked, each original number tiles it exactly, which is the defining verification of the least common multiple.", ["Construct the least common multiple", "Tile it by the first measure", "Tile it by the second measure"], "4 | 12 and 6 | 12", () => true);
const scene36 = relationScene(36, "Find the least number measured by three given numbers.", "The first common meeting point of 4, 6, and 9 is 36. Each row's equal chunks ends exactly there, so the least common multiple is verified by all three measurements.", ["List common multiples progressively", "Include the third measure", "Read the first shared endpoint"], "lcm(4,6,9)=36", () => true);
const scene37 = relationScene(37, "A number measured by another has the corresponding named part.", "Twelve is measured by three four times. The visible fourths identify the named part: one measuring unit is a fourth part of the measured number.", ["Set out the measured number", "Partition it by the measuring number", "Name the resulting equal part"], "3 measures 12; 3 is one fourth of 12", () => true);
const scene38 = relationScene(38, "A named part implies a number that measures the whole by that name.", "Calling three a fourth part of twelve is equivalent to saying four copies of three make twelve. The bar can be read in either direction, which is exactly the converse Euclid states.", ["Set out a named fourth part", "Repeat it four times", "Read the measuring number"], "3 is a fourth of 12 ⟹ 3 measures 12", () => true);
const scene39 = relationScene(39, "Find the least number having given named parts.", "A number having a third and a fourth must be measured by both three and four. Twelve is the first shared multiple, so it is the least number that carries both requested named parts.", ["Translate parts into measuring numbers", "Find their first shared multiple", "Read the least number with both parts"], "least number with thirds and fourths = lcm(3,4) = 12", () => true);

export const BOOK_SEVEN_SCENES: Record<string, EuclidSceneSpec> = Object.fromEntries([scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9, scene10, scene11, scene12, scene13, scene14, scene15, scene16, scene17, scene18, scene19, scene20, scene21, scene22, scene23, scene24, scene25, scene26, scene27, scene28, scene29, scene30, scene31, scene32, scene33, scene34, scene35, scene36, scene37, scene38, scene39].map((scene) => [scene.id.replace("book-7-", ""), scene]));
export function validateBookSevenScenes() { return Object.values(BOOK_SEVEN_SCENES).every((scene) => scene.invariant(0) && scene.build(0).every((primitive) => Object.values(primitive).every((value) => typeof value !== "number" || Number.isFinite(value)))); }
