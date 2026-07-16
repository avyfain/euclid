import type { BookCatalogEntry } from "./types";

const ROMAN = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
];

export const BOOK_CATALOG: BookCatalogEntry[] = ROMAN.map((roman, index) => ({
  number: index + 1,
  roman,
  title: `Book ${roman}`,
  available: index === 0,
}));
