export type SourcePart = {
  id?: string;
  kind: string;
  label: string;
  blocks: string[];
};

export type SourceNote = {
  id: string;
  label: string;
  blocks: string[];
};

export type EuclidItem = {
  id: string;
  number: number | string;
  sourceHeading: string;
  label: string;
  headline: string;
  parts: SourcePart[];
  notes: SourceNote[];
  searchText: string;
  sourceUrl: string;
};

export type EuclidSection = {
  id: string;
  sourceCode: string;
  label: string;
  abbreviation: string;
  items: EuclidItem[];
};

export type EuclidBook = {
  id: string;
  number: number;
  roman: string;
  title: string;
  workTitle: string;
  edition: string;
  sections: EuclidSection[];
  source: {
    provider: string;
    textUrl: string;
    downloadUrl: string;
    citation: string;
    credit: string;
    license: string;
    licenseUrl: string;
    availabilityNotice: string;
  };
};

export type BookCatalogEntry = {
  number: number;
  roman: string;
  title: string;
  available: boolean;
};
