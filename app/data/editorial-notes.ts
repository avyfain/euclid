import type { SourceNote } from "./types";

export const EDITORIAL_NOTES: Record<string, SourceNote[]> = {
  "common-notions": [
    {
      id: "common-notions-numbering-note",
      label: "The two numbering systems",
      blocks: [
        "<p><strong>4</strong> is Heath's numbering of the five Common Notions he accepts. <strong>[7]</strong> is Heiberg's numbering from the transmitted Greek sequence.</p>",
        "<p>After Common Notion 3, later manuscripts inserted several additional axioms. Heiberg printed three of them in brackets as interpolations and omitted a fourth entirely. So <q>things which coincide...</q> is the seventh item in that textual sequence, but the fourth accepted Common Notion. The next is correspondingly <strong>[8]</strong> / Common Notion 5. Heath explains this explicitly in his notes.</p>",
        "<p>Older editions used yet another arrangement, often calling those statements Axioms 8 and 9, because they retained more of the interpolated material.</p>",
      ],
    },
  ],
};
