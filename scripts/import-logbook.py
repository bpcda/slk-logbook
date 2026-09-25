#!/usr/bin/env python3
"""Dry-run or import the SLK workbook through authenticated Supabase REST."""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any

from inspect_workbook import inspect


DESTINATIONS = {
    "Viaggi": "trips",
    "Rifornimenti": "fuel_entries",
    "Manutenzione": "maintenance_events",
    "Diagnostica": "issues",
    "Controlli periodici": "inspections",
    "Ricambi a bordo": "parts",
}


def clean(value: Any) -> Any:
    return None if value in (None, "") else value


def number(value: Any) -> float | None:
    if value in (None, ""):
        return None
    if isinstance(value, (int, float)):
        return value
    normalized = str(value).replace("€", "").replace("km", "").strip()
    normalized = normalized.replace(".", "").replace(",", ".") if "," in normalized else normalized
    try:
        return float(normalized)
    except ValueError:
        return None


def date(value: Any, include_time: bool = False) -> str | None:
    if value in (None, ""):
        return None
    raw = str(value)
    for pattern in (None, "%d/%m/%Y", "%d/%m/%Y %H:%M"):
        try:
            parsed = datetime.fromisoformat(raw) if pattern is None else datetime.strptime(raw, pattern)
            return parsed.isoformat() if include_time else parsed.date().isoformat()
        except ValueError:
            pass
    return None


def boolean(value: Any) -> bool:
    return str(value).strip().lower() in {"1", "true", "sì", "si", "yes", "x", "presente"}


def fuel(value: Any) -> str:
    normalized = str(value or "").lower()
    if "gpl" in normalized:
        return "lpg"
    if "benz" in normalized or "petrol" in normalized:
        return "petrol"
    return "other"


def severity(value: Any) -> str:
    normalized = str(value or "").lower()
    if any(word in normalized for word in ("urgent", "grave", "alta")):
        return "urgent"
    if any(word in normalized for word in ("info", "bassa")):
        return "info"
    return "check"


def row_dict(headers: list[Any], values: list[Any]) -> dict[str, Any]:
    return {str(header): values[index] if index < len(values) else None for index, header in enumerate(headers)}


def transform(sheet: str, row: dict[str, Any]) -> tuple[dict[str, Any] | None, str | None]:
    if sheet == "Viaggi":
        start, start_km = date(row.get("Data partenza"), True), number(row.get("Km iniziali"))
        if not start or start_km is None:
            return None, "data partenza o km iniziali mancanti/non validi"
        end_km = number(row.get("Km finali"))
        if end_km is None and number(row.get("Km percorsi")) is not None:
            end_km = start_km + number(row["Km percorsi"])
        return {
            "started_at": start, "ended_at": date(row.get("Data ritorno"), True), "origin": clean(row.get("Origine")),
            "destination": clean(row.get("Destinazione")), "odometer_start_km": int(start_km),
            "odometer_end_km": int(end_km) if end_km is not None else None, "trip_type": clean(row.get("Tipo viaggio")),
            "primary_fuel_type": fuel(row.get("Carburante prevalente")) if clean(row.get("Carburante prevalente")) else None,
            "reported_consumption": number(row.get("Consumo medio")), "tolls_eur": number(row.get("Costo pedaggi")) or 0,
            "parking_eur": number(row.get("Costo parcheggi")) or 0, "other_cost_eur": number(row.get("Altri costi")) or 0,
            "conditions": clean(row.get("Meteo/condizioni")), "anomalies": clean(row.get("Problemi/anomalie")), "notes": clean(row.get("Note")),
        }, None
    if sheet == "Rifornimenti":
        filled, km, liters = date(row.get("Data"), True), number(row.get("Km odometro")), number(row.get("Litri"))
        price = number(row.get("€/L"))
        total = number(row.get("Costo totale")) or number(row.get("Importo")) or ((liters or 0) * (price or 0))
        if not filled or km is None or not liters or total is None:
            return None, "data, odometro, litri o costo mancanti/non validi"
        return {"filled_at": filled, "odometer_km": int(km), "fuel_type": fuel(row.get("Carburante")), "liters": liters,
                "price_per_liter_eur": price, "total_cost_eur": round(total, 2), "is_full_tank": boolean(row.get("Pieno?")),
                "location": clean(row.get("Località")), "notes": clean(row.get("Note"))}, None
    if sheet == "Manutenzione":
        performed, title = date(row.get("Data")), clean(row.get("Intervento/Ricambio"))
        if not performed or not title:
            return None, "data o intervento mancanti/non validi"
        quantity, unit = number(row.get("Quantità")), number(row.get("Costo unitario"))
        total = number(row.get("Costo totale")) or ((quantity or 0) * (unit or 0))
        brand = clean(row.get("Marca / Codice"))
        return {"performed_at": performed, "odometer_km": number(row.get("Km odometro")), "category": clean(row.get("Categoria")) or "altro",
                "title": title, "description": f"Marca/codice: {brand}" if brand else None, "performed_by": clean(row.get("Eseguito da")),
                "parts_cost_eur": round(total, 2), "total_cost_eur": round(total, 2), "next_due_odometer_km": number(row.get("Prossima scadenza km")),
                "next_due_date": date(row.get("Prossima scadenza data")), "removed_part_status": clean(row.get("Stato pezzo rimosso / diagnosi")),
                "notes": clean(row.get("Note"))}, None
    if sheet == "Diagnostica":
        detected, title = date(row.get("Data")), clean(row.get("Sintomo"))
        if not detected or not title:
            return None, "data o sintomo mancanti/non validi"
        resolved = date(row.get("Data risoluzione"))
        return {"detected_at": detected, "odometer_km": number(row.get("Km odometro")), "title": title,
                "dtc_code": clean(row.get("DTC / Codice")), "occurrence_condition": clean(row.get("Condizione comparsa")),
                "fuel_type": fuel(row.get("Carburante")) if clean(row.get("Carburante")) else None,
                "severity": severity(row.get("Gravità")), "status": "resolved" if resolved else "open",
                "resolution": clean(row.get("Esito")) or clean(row.get("Intervento fatto")), "resolved_at": resolved, "notes": clean(row.get("Note"))}, None
    if sheet == "Controlli periodici":
        checked = date(row.get("Data"))
        if not checked:
            return None, "data mancante/non valida"
        excluded = {"Data", "Km odometro", "Esito generale", "Note"}
        checks = {key: value for key, value in row.items() if key not in excluded and clean(value) is not None}
        return {"checked_at": checked, "odometer_km": number(row.get("Km odometro")), "checks": checks,
                "result": clean(row.get("Esito generale")), "notes": clean(row.get("Note"))}, None
    if sheet == "Ricambi a bordo":
        name = clean(row.get("Ricambio / Attrezzo"))
        if not name:
            return None, "nome ricambio mancante"
        return {"category": clean(row.get("Categoria")), "name": name, "manufacturer": clean(row.get("Marca / Codice")),
                "quantity": number(row.get("Quantità")) or 1, "status": "stock", "is_on_board": boolean(row.get("Presente?")),
                "last_verified_at": date(row.get("Data verifica")), "notes": clean(row.get("Note"))}, None
    return None, "foglio non mappato"


def load_env(path: Path = Path(".env")) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip() and not line.lstrip().startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip("'\""))


class SupabaseRest:
    def __init__(self) -> None:
        load_env()
        self.url = os.getenv("VITE_SUPABASE_URL", "").rstrip("/")
        self.key = os.getenv("VITE_SUPABASE_ANON_KEY", "")
        email, password = os.getenv("VITE_APP_LOGIN_EMAIL", ""), os.getenv("IMPORT_PASSWORD", "")
        if not all((self.url, self.key, email, password)):
            raise RuntimeError("Impostare VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_APP_LOGIN_EMAIL e IMPORT_PASSWORD.")
        auth = self.request("POST", "/auth/v1/token?grant_type=password", {"email": email, "password": password}, authenticated=False)
        self.token, self.user_id = auth["access_token"], auth["user"]["id"]
        vehicles = self.request("GET", f"/rest/v1/vehicles?user_id=eq.{self.user_id}&select=id")
        if vehicles:
            self.vehicle_id = vehicles[0]["id"]
        else:
            created = self.request("POST", "/rest/v1/vehicles", {"user_id": self.user_id, "name": "SLK R170", "manufacturer": "Mercedes-Benz",
                           "model": "SLK R170", "variant": "R170.445", "chassis": "M111.943", "vin": "WDB1704451F158666"}, prefer="return=representation")
            self.vehicle_id = created[0]["id"]

    def request(self, method: str, path: str, body: Any = None, authenticated: bool = True, prefer: str | None = None) -> Any:
        headers = {"apikey": self.key, "Content-Type": "application/json"}
        if authenticated:
            headers["Authorization"] = f"Bearer {self.token}"
        if prefer:
            headers["Prefer"] = prefer
        request = urllib.request.Request(self.url + path, data=json.dumps(body).encode() if body is not None else None, headers=headers, method=method)
        try:
            with urllib.request.urlopen(request) as response:
                payload = response.read()
                return json.loads(payload) if payload else None
        except urllib.error.HTTPError as error:
            raise RuntimeError(f"Supabase HTTP {error.code}: {error.read().decode()}") from error

    def insert_unless_present(self, table: str, payload: dict[str, Any]) -> bool:
        source_ref = urllib.parse.quote(str(payload["source_ref"]), safe="")
        existing = self.request("GET", f"/rest/v1/{table}?source_ref=eq.{source_ref}&select=id")
        if existing:
            return False
        self.request("POST", f"/rest/v1/{table}", payload)
        return True


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", required=True, type=Path)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    workbook = inspect(args.file)
    report: dict[str, Any] = {"file": str(args.file), "dry_run": args.dry_run, "sheets_found": [], "totals": Counter(), "problems": [], "duplicates": []}
    records: list[tuple[str, dict[str, Any]]] = []
    fingerprints: set[str] = set()

    for sheet in workbook["sheets"]:
        name = sheet["name"]
        report["sheets_found"].append(name)
        if name not in DESTINATIONS:
            continue
        headers = sheet["rows"][0]["values"] if sheet["rows"] else []
        read = importable = 0
        for raw in sheet["rows"][1:]:
            values = raw["values"]
            if not any(value not in (None, "") for value in values):
                continue
            read += 1
            payload, problem = transform(name, row_dict(headers, values))
            source_ref = f"Excel:{name}:row={raw['row']}"
            if problem or payload is None:
                report["problems"].append({"source_ref": source_ref, "reason": problem})
                continue
            fingerprint = f"{DESTINATIONS[name]}:{json.dumps(payload, sort_keys=True, default=str)}"
            if fingerprint in fingerprints:
                report["duplicates"].append(source_ref)
                continue
            fingerprints.add(fingerprint)
            payload.update({"source": "excel_import", "source_ref": source_ref})
            records.append((DESTINATIONS[name], payload))
            importable += 1
        report["totals"][name] = {"rows_read": read, "importable": importable, "destination": DESTINATIONS[name]}

    inserted = skipped = 0
    if not args.dry_run:
        client = SupabaseRest()
        for table, payload in records:
            payload.update({"user_id": client.user_id, "vehicle_id": client.vehicle_id})
            if client.insert_unless_present(table, payload):
                inserted += 1
            else:
                skipped += 1
    report["result"] = {"would_import": len(records)} if args.dry_run else {"inserted": inserted, "already_present": skipped}
    report["totals"] = dict(report["totals"])
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if report["problems"] else 0


if __name__ == "__main__":
    sys.exit(main())
