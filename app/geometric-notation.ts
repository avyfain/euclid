const LINE_NUMBER =
  String.raw`(?:<span class="source-line-number"[^>]*></span>\s*)*`;
const RAW_LABEL =
  String.raw`(?:<em>([A-Z](?:[A-Z]{2})?)</em>|<span class="source-italic">([A-Z](?:[A-Z]{2})?)</span>)`;

function notationLabel(kind: "angle" | "triangle", label: string) {
  return `<span class="${kind}" aria-label="${kind} ${label.split("").join(" ")}">${label}</span>`;
}

function addNamedNotation(
  html: string,
  kind: "angle" | "triangle",
  nounPattern: string,
  labelPattern = RAW_LABEL,
) {
  const directNotation = new RegExp(
    String.raw`\b${nounPattern}\s+${LINE_NUMBER}${labelPattern}`,
    "g",
  );

  let result = html.replace(directNotation, (match, firstLabel, secondLabel) => {
    const label = firstLabel ?? secondLabel;
    return match.replace(
      /<(?:em|span class="source-italic")>[A-Z]+<\/(?:em|span)>$/,
      notationLabel(kind, label),
    );
  });

  const postfixNotation = new RegExp(
    String.raw`${labelPattern}(?=\s+(?:be|is|are|being)\s+(?:(?:an?|the|two|three|given|equal|unequal|equiangular|similar|isosceles|equilateral|right-angled|obtuse-angled|acute-angled|right|obtuse|acute|exterior|interior|solid)\s+){0,3}${nounPattern}\b)`,
    "g",
  );
  result = result.replace(
    postfixNotation,
    (_match, firstLabel, secondLabel) =>
      notationLabel(kind, firstLabel ?? secondLabel),
  );

  const followingListItem = new RegExp(
    String.raw`(<span class="${kind}"[^>]*>[A-Z]+</span>)((?:\s*,\s*(?:(?:and|or)\s+)?|\s+(?:and|or)\s+)${LINE_NUMBER})${labelPattern}`,
    "g",
  );
  const precedingListItem = new RegExp(
    String.raw`${labelPattern}((?:\s*,\s*(?:(?:and|or)\s+)?|\s+(?:and|or)\s+)${LINE_NUMBER})(<span class="${kind}"[^>]*>[A-Z]+</span>)`,
    "g",
  );

  let previous: string;
  do {
    previous = result;
    result = result.replace(
      followingListItem,
      (_match, markedLabel, separator, firstLabel, secondLabel) =>
        `${markedLabel}${separator}${notationLabel(kind, firstLabel ?? secondLabel)}`,
    );
    result = result.replace(
      precedingListItem,
      (_match, firstLabel, secondLabel, separator, markedLabel) =>
        `${notationLabel(kind, firstLabel ?? secondLabel)}${separator}${markedLabel}`,
    );
  } while (result !== previous);

  return result;
}

export function addGeometricNotation(html: string) {
  const withAngles = addNamedNotation(
    html,
    "angle",
    String.raw`angles?(?:\s+at)?`,
  );
  return addNamedNotation(
    withAngles,
    "triangle",
    String.raw`triangles?`,
    String.raw`(?:<em>([A-Z]{3})</em>|<span class="source-italic">([A-Z]{3})</span>)`,
  );
}
