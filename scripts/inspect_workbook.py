#!/usr/bin/env python3
"""Inspect an XLSX workbook using only the Python standard library."""

from __future__ import annotations

import json
import sys
import zipfile
from datetime import datetime, timedelta
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
      "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}
REL_NS = {"p": "http://schemas.openxmlformats.org/package/2006/relationships"}


def text(node: ET.Element | None) -> str:
    return "" if node is None else "".join(node.itertext())


def column_number(reference: str) -> int:
    letters = "".join(char for char in reference if char.isalpha())
    value = 0
    for char in letters:
        value = value * 26 + ord(char.upper()) - 64
    return value


def iso_date(serial: float) -> str:
    return (datetime(1899, 12, 30) + timedelta(days=serial)).isoformat()


def inspect(path: Path) -> dict:
    with zipfile.ZipFile(path) as archive:
        shared = []
        if "xl/sharedStrings.xml" in archive.namelist():
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            shared = [text(item) for item in root.findall("m:si", NS)]

        date_styles: set[int] = set()
        if "xl/styles.xml" in archive.namelist():
            styles = ET.fromstring(archive.read("xl/styles.xml"))
            custom_dates = {int(n.attrib["numFmtId"]) for n in styles.findall("m:numFmts/m:numFmt", NS)
                            if any(token in n.attrib.get("formatCode", "").lower() for token in ("yy", "dd", "mm"))}
            date_formats = custom_dates | set(range(14, 23)) | {45, 46, 47}
            for index, xf in enumerate(styles.findall("m:cellXfs/m:xf", NS)):
                if int(xf.attrib.get("numFmtId", 0)) in date_formats:
                    date_styles.add(index)

        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        targets = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels.findall("p:Relationship", REL_NS)}
        result = {"file": str(path), "sheets": []}

        for sheet in workbook.findall("m:sheets/m:sheet", NS):
            target = targets[sheet.attrib[f"{{{NS['r']}}}id"]].lstrip("/")
            xml_path = target if target.startswith("xl/") else f"xl/{target}"
            root = ET.fromstring(archive.read(xml_path))
            rows = []
            formulas = []
            hyperlinks = []
            for row in root.findall("m:sheetData/m:row", NS):
                values: dict[int, object] = {}
                for cell in row.findall("m:c", NS):
                    ref = cell.attrib["r"]
                    kind = cell.attrib.get("t")
                    raw = text(cell.find("m:v", NS))
                    formula = text(cell.find("m:f", NS))
                    if formula:
                        formulas.append({"cell": ref, "formula": formula, "cached": raw})
                    if kind == "s" and raw:
                        value: object = shared[int(raw)]
                    elif kind == "str":
                        value = raw
                    elif kind == "inlineStr":
                        value = text(cell.find("m:is", NS))
                    elif kind == "b":
                        value = raw == "1"
                    elif raw and int(cell.attrib.get("s", 0)) in date_styles:
                        value = iso_date(float(raw))
                    elif raw:
                        number = float(raw)
                        value = int(number) if number.is_integer() else number
                    else:
                        value = None
                    values[column_number(ref)] = value
                if values:
                    rows.append({"row": int(row.attrib["r"]), "values": [values.get(i) for i in range(1, max(values) + 1)]})
            for link in root.findall("m:hyperlinks/m:hyperlink", NS):
                hyperlinks.append(link.attrib)
            result["sheets"].append({
                "name": sheet.attrib["name"],
                "rows": rows,
                "formulas": formulas,
                "merged_cells": [node.attrib["ref"] for node in root.findall("m:mergeCells/m:mergeCell", NS)],
                "hyperlinks": hyperlinks,
            })
        return result


if __name__ == "__main__":
    workbook_path = Path(sys.argv[1] if len(sys.argv) > 1 else ".codex/SLK_R170_Logbook.xlsx")
    report = inspect(workbook_path)
    if "--full" in sys.argv:
        output = report
    else:
        output = {"file": report["file"], "sheets": []}
        for sheet in report["sheets"]:
            populated = [row for row in sheet["rows"] if any(value not in (None, "") for value in row["values"])]
            output["sheets"].append({
                "name": sheet["name"],
                "physical_rows": len(sheet["rows"]),
                "populated_rows": len(populated),
                "rows": populated[:12],
                "formula_count": len(sheet["formulas"]),
                "formulas": sheet["formulas"][:12],
                "merged_cells": sheet["merged_cells"],
                "hyperlinks": sheet["hyperlinks"],
            })
    print(json.dumps(output, ensure_ascii=False, indent=2))
