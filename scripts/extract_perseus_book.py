#!/usr/bin/env python3
"""Extract one book of Heath's Euclid from the Perseus TEI download.

Usage:
  python3 scripts/extract_perseus_book.py --book 1 --output app/data/book-1.json
"""

from __future__ import annotations

import argparse
import html
import json
import re
import unicodedata
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path


SOURCE_URL = (
    "https://www.perseus.tufts.edu/hopper/dltext?"
    "doc=Perseus%3Atext%3A1999.01.0086"
)
TEXT_URL = "https://www.perseus.tufts.edu/hopper/text?doc=Euc.+{book}"
ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII"]

BETA_CODE_LETTERS = {
    "a": "α",
    "b": "β",
    "g": "γ",
    "d": "δ",
    "e": "ε",
    "z": "ζ",
    "h": "η",
    "q": "θ",
    "i": "ι",
    "k": "κ",
    "l": "λ",
    "m": "μ",
    "n": "ν",
    "c": "ξ",
    "o": "ο",
    "p": "π",
    "r": "ρ",
    "s": "σ",
    "t": "τ",
    "u": "υ",
    "f": "φ",
    "x": "χ",
    "y": "ψ",
    "w": "ω",
    "v": "ϝ",
}
BETA_CODE_MARKS = {
    ")": "\u0313",  # smooth breathing
    "(": "\u0314",  # rough breathing
    "/": "\u0301",  # acute
    "\\": "\u0300",  # grave
    "=": "\u0342",  # circumflex
    "+": "\u0308",  # diaeresis
    "|": "\u0345",  # iota subscript
    "_": "\u0304",  # macron
    "^": "\u0306",  # breve
}


def beta_code_to_unicode(value: str) -> str:
    """Convert the Beta Code used in Perseus Greek spans to Unicode Greek."""
    output: list[str] = []
    index = 0

    while index < len(value):
        uppercase = value[index] == "*"
        if uppercase:
            index += 1

        prefix_marks: list[str] = []
        while index < len(value) and value[index] in BETA_CODE_MARKS:
            prefix_marks.append(BETA_CODE_MARKS[value[index]])
            index += 1

        if index >= len(value) or value[index].lower() not in BETA_CODE_LETTERS:
            if uppercase:
                output.append("*")
            output.extend(prefix_marks)
            if index < len(value):
                output.append(value[index])
                index += 1
            continue

        source_letter = value[index].lower()
        index += 1
        suffix_marks: list[str] = []
        while index < len(value) and value[index] in BETA_CODE_MARKS:
            suffix_marks.append(BETA_CODE_MARKS[value[index]])
            index += 1

        greek_letter = BETA_CODE_LETTERS[source_letter]
        if uppercase:
            greek_letter = greek_letter.upper()
        elif source_letter == "s":
            next_character = value[index] if index < len(value) else ""
            if not next_character or next_character.lower() not in BETA_CODE_LETTERS:
                greek_letter = "ς"

        output.append(
            unicodedata.normalize(
                "NFC",
                greek_letter + "".join(prefix_marks + suffix_marks),
            )
        )

    return "".join(output)


def target_to_href(target: str, current_book: int) -> tuple[str, bool]:
    patterns = (
        (r"^elem\.(\d+)\.def\.(\d+)$", "def-{}", "Def"),
        (r"^elem\.(\d+)\.post\.(\d+)$", "post-{}", "Post"),
        (r"^elem\.(\d+)\.c\.n\.(\d+)$", "cn-{}", "CN"),
        (r"^elem\.(\d+)\.(\d+)$", "prop-{}", "Prop"),
    )
    for pattern, template, section_code in patterns:
        match = re.match(pattern, target, flags=re.I)
        if match:
            target_book = int(match.group(1))
            number = match.group(2)
            if target_book == current_book:
                return f"#{template.format(number)}", False
            url = (
                "https://www.perseus.tufts.edu/hopper/text?doc="
                f"Perseus%3Atext%3A1999.01.0086%3Abook%3D{target_book}%3A"
                f"type%3D{section_code}%3Anumber%3D{number}"
            )
            return url, True
    return "", False


def render_children(
    element: ET.Element,
    book_number: int,
    text_transform=None,
    line_numbers: bool = False,
) -> str:
    transform = text_transform or (lambda value: value)
    output = html.escape(transform(element.text or ""))
    for child in element:
        output += render_node(child, book_number, text_transform, line_numbers)
        output += html.escape(transform(child.tail or ""))
    return output


def render_node(
    element: ET.Element,
    book_number: int,
    text_transform=None,
    line_numbers: bool = False,
) -> str:
    tag = element.tag
    if tag == "foreign" and element.get("lang", "").lower() == "greek":
        text_transform = beta_code_to_unicode
    content = render_children(element, book_number, text_transform, line_numbers)

    if tag == "p":
        return f"<p>{content.strip()}</p>"
    if tag == "emph":
        segment_name = plain_text(element)
        if re.fullmatch(r"[A-Z]{2}", segment_name):
            escaped_name = html.escape(segment_name)
            return (
                f'<span class="segment" aria-label="line segment {escaped_name}">'
                f"{escaped_name}</span>"
            )
        return f"<em>{content}</em>"
    if tag == "foreign":
        source_language = element.get("lang", "")
        language = html.escape(
            "grc" if source_language.lower() == "greek" else source_language,
            quote=True,
        )
        return f'<span class="foreign" lang="{language}">{content}</span>'
    if tag == "quote":
        return f"<q>{content}</q>"
    if tag == "term":
        return f'<span class="term">{content}</span>'
    if tag == "title":
        return f"<cite>{content}</cite>"
    if tag in {"ref", "xref"}:
        href, external = target_to_href(element.get("target", ""), book_number)
        if href:
            external_attributes = ' target="_blank" rel="noreferrer"' if external else ""
            return f'<a class="citation-link" href="{href}"{external_attributes}>{content}</a>'
        return content
    if tag == "hi":
        rendition = element.get("rend", "")
        class_name = {
            "bold": "source-bold",
            "center": "source-center",
            "ital": "source-italic",
            "italic": "source-italic",
        }.get(rendition, "source-highlight")
        return f'<span class="{class_name}">{content}</span>'
    if tag == "lb":
        number = element.get("n", "")
        if line_numbers and number:
            escaped_number = html.escape(number, quote=True)
            return (
                '<span class="source-line-number" aria-hidden="true" '
                f'data-line="{escaped_number}"></span>'
            )
        return " "
    if tag == "pb":
        return " "
    if tag == "figure":
        return ""
    return content


def plain_text(element: ET.Element) -> str:
    return re.sub(r"\s+", " ", "".join(element.itertext())).strip()


def section_meta(code: str, head: str) -> tuple[str, str, str]:
    lowered = code.lower().replace(" ", "")
    if lowered.startswith("def"):
        suffix = code[3:].strip()
        label = f"Definitions {suffix}".strip()
        return "definitions", label, "Def."
    if lowered == "post":
        return "postulates", "Postulates", "Post."
    if lowered == "cn":
        return "common-notions", "Common notions", "C.N."
    if lowered == "prop":
        return "propositions", "Propositions", "Prop."
    slug = re.sub(r"[^a-z0-9]+", "-", code.lower()).strip("-") or "section"
    return slug, head.rstrip(".") or code, code


def item_id(section_id: str, number: str) -> str:
    prefix = {
        "definitions": "def",
        "postulates": "post",
        "common-notions": "cn",
        "propositions": "prop",
    }.get(section_id, section_id)
    return f"{prefix}-{number}"


def extract_item(
    item: ET.Element,
    section_id: str,
    section_label: str,
    section_code: str,
    book: int,
) -> dict:
    number = item.get("n", "")
    head_node = item.find("head")
    source_heading = plain_text(head_node) if head_node is not None else number
    parts = []

    part_nodes = item.findall("div4")
    if part_nodes:
        part_labels = {
            "Enunc": "Statement",
            "Proof": "Proof",
            "QED": "Conclusion",
            "Constr": "Construction",
            "Setting-out": "Setting out",
        }
        for part in part_nodes:
            kind = part.get("type", "Text")
            blocks = [
                render_node(
                    p,
                    book,
                    line_numbers=section_id == "propositions",
                )
                for p in part.findall("p")
            ]
            if blocks:
                parts.append(
                    {
                        "kind": kind.lower(),
                        "label": part_labels.get(kind, kind.replace("-", " ").title()),
                        "blocks": blocks,
                    }
                )
    else:
        paragraph_nodes = item.findall("p")
        blocks = [
            render_node(
                p,
                book,
                line_numbers=section_id == "propositions",
            )
            for p in paragraph_nodes
        ]
        if section_id == "propositions" and blocks:
            parts.append({"kind": "enunc", "label": "Statement", "blocks": blocks[:1]})
            proof_blocks = blocks[1:]
            if proof_blocks and "Q. E. D." in plain_text(paragraph_nodes[-1]):
                parts.append({"kind": "proof", "label": "Proof", "blocks": proof_blocks[:-1]})
                parts.append({"kind": "qed", "label": "Conclusion", "blocks": proof_blocks[-1:]})
            elif proof_blocks:
                parts.append({"kind": "proof", "label": "Proof", "blocks": proof_blocks})
        elif blocks:
            parts.append({"kind": "text", "label": "", "blocks": blocks})

    if section_id == "propositions":
        statement_part = next(
            (part for part in parts if part["kind"] == "enunc"),
            None,
        )
        if statement_part and statement_part["blocks"]:
            first_block = statement_part["blocks"][0]
            line_one = (
                '<span class="source-line-number" aria-hidden="true" '
                'data-line="1"></span>'
            )
            statement_part["blocks"][0] = first_block.replace(
                "<p>",
                f"<p>{line_one}",
                1,
            )

        block_locations = [
            (part, block_index)
            for part in parts
            for block_index in range(len(part["blocks"]))
        ]
        for location_index, (part, block_index) in enumerate(block_locations[:-1]):
            block = part["blocks"][block_index]
            trailing_marker = re.search(
                r'\s*(<span class="source-line-number"[^>]*></span>)\s*</p>$',
                block,
            )
            if not trailing_marker:
                continue
            marker = trailing_marker.group(1)
            part["blocks"][block_index] = block[: trailing_marker.start()] + "</p>"
            next_part, next_block_index = block_locations[location_index + 1]
            next_part["blocks"][next_block_index] = next_part["blocks"][
                next_block_index
            ].replace("<p>", f"<p>{marker}", 1)

    notes = []
    for index, note in enumerate(item.findall("note"), start=1):
        blocks = [render_node(p, book) for p in note.findall("p")]
        if blocks:
            notes.append(
                {
                    "id": f"{item_id(section_id, number)}-note-{index}",
                    "label": note.get("n", f"Note {index}"),
                    "blocks": blocks,
                }
            )

    statement_node = None
    for part in part_nodes:
        if part.get("type") == "Enunc":
            statement_node = part.find("p")
            break
    if statement_node is None:
        statement_node = item.find("p")

    headline = plain_text(statement_node) if statement_node is not None else source_heading
    search_text = plain_text(item)
    return {
        "id": item_id(section_id, number),
        "number": int(number) if number.isdigit() else number,
        "sourceHeading": source_heading,
        "label": f"{section_label.rstrip('s')} {number}" if section_id != "propositions" else f"Proposition {number}",
        "headline": headline,
        "parts": parts,
        "notes": notes,
        "searchText": search_text,
        "sourceUrl": (
            "https://www.perseus.tufts.edu/hopper/text?doc="
            f"Perseus%3Atext%3A1999.01.0086%3Abook%3D{book}%3A"
            f"type%3D{section_code.replace(' ', '+')}%3Anumber%3D{number}"
        ),
    }


def extract_book(root: ET.Element, book_number: int) -> dict:
    book_node = next(
        (
            node
            for node in root.iter("div1")
            if node.get("type") == "book" and node.get("n") == str(book_number)
        ),
        None,
    )
    if book_node is None:
        raise ValueError(f"Book {book_number} was not found in the Perseus source")

    sections = []
    for section in book_node.findall("div2"):
        code = section.get("n", "")
        head_node = section.find("head")
        head = plain_text(head_node) if head_node is not None else code
        section_id, label, abbreviation = section_meta(code, head)
        items = [
            extract_item(item, section_id, label, code, book_number)
            for item in section.findall("div3")
        ]
        if items:
            sections.append(
                {
                    "id": section_id,
                    "sourceCode": code,
                    "label": label,
                    "abbreviation": abbreviation,
                    "items": items,
                }
            )

    return {
        "id": f"book-{book_number}",
        "number": book_number,
        "roman": ROMAN[book_number],
        "title": f"Book {ROMAN[book_number]}",
        "workTitle": "Euclid's Elements",
        "edition": "Thomas L. Heath translation",
        "sections": sections,
        "source": {
            "provider": "Perseus Digital Library",
            "textUrl": TEXT_URL.format(book=book_number),
            "downloadUrl": SOURCE_URL,
            "citation": "Euclid. Euclid's Elements. Sir Thomas Little Heath, ed. New York: Dover, 1956.",
            "credit": "Text provided by Perseus Digital Library, with funding from The National Science Foundation.",
            "license": "Creative Commons Attribution-ShareAlike 3.0 United States",
            "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/us/",
            "availabilityNotice": (
                "The Perseus TEI download also requests Perseus credit, noncommercial use, "
                "retention of its availability statement, and that modifications be offered back."
            ),
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--book", type=int, required=True, choices=range(1, 14))
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    request = urllib.request.Request(
        SOURCE_URL,
        headers={"User-Agent": "EuclidReader/1.0 (+https://www.perseus.tufts.edu/)"},
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        root = ET.fromstring(response.read())

    payload = extract_book(root, args.book)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    item_count = sum(len(section["items"]) for section in payload["sections"])
    print(f"Wrote {item_count} items from Book {payload['roman']} to {args.output}")


if __name__ == "__main__":
    main()
