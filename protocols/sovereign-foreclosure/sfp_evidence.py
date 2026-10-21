#!/usr/bin/env python3
"""Read-only Caddy JSON access-log exporter for SFP-001.

Usage:
  python sfp_evidence.py /path/to/access.log --private-out private.json --public-out public.json

Never presents a user-agent string as authenticated identity or a GET as contract assent.
Public export contains no IP addresses or request headers. Private export is sensitive.
"""
import argparse
import hashlib
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

SENSITIVE_PREFIXES = ("/api/auth", "/admin", "/private", "/.env", "/config", "/secrets")
DEFAULT_PATHS = ("/system-breach", "/corpus.json", "/corpus.md", "/corpus.txt", "/llms-full.txt")
FAMILIES = ("ClaudeBot", "GPTBot", "Googlebot", "Google-Extended", "Applebot", "ChatGPT-User", "PerplexityBot", "Meta-ExternalAgent")


def classify(ua):
    return next((name for name in FAMILIES if name.lower() in ua.lower()), "other")


def parse_entry(line, path_prefixes=DEFAULT_PATHS):
    """Return limited forensic facts from a Caddy JSON line, or None."""
    try:
        event = json.loads(line)
        req = event.get("request") or {}
        uri = req.get("uri", "")
        path = urlsplit(uri).path or "/"
        if any(path.startswith(x) for x in SENSITIVE_PREFIXES):
            return None
        if not any(path == x or path.startswith(x.rstrip("/") + "/") for x in path_prefixes):
            return None
        headers = req.get("headers") or {}
        agent = headers.get("User-Agent", headers.get("user-agent", []))
        if isinstance(agent, list):
            agent = agent[0] if agent else ""
        if not isinstance(agent, str):
            agent = ""
        family = classify(agent)
        if family == "other":
            return None
        raw_time = event.get("ts")
        if isinstance(raw_time, (float, int)):
            timestamp = datetime.fromtimestamp(raw_time, tz=timezone.utc).isoformat()
        elif isinstance(raw_time, str):
            timestamp = raw_time
        else:
            timestamp = None
        return {
            "timestamp": timestamp,
            "method": str(req.get("method", ""))[:16],
            "path": path,
            "status": event.get("status"),
            "bytes_sent": event.get("size"),
            "claimed_bot_family": family,
            "claimed_user_agent": agent[:320],
            "source_ip": str(req.get("client_ip") or req.get("remote_ip") or ""),
            "identity_verification": "UNVERIFIED",
            "contract_assent": "NOT_ESTABLISHED",
            "training_use": "NOT_ESTABLISHED",
        }
    except (ValueError, TypeError, OverflowError, OSError):
        return None


def report(log_path, path_prefixes=DEFAULT_PATHS):
    log_path = Path(log_path)
    file_hash = hashlib.sha256()
    items = []
    bad_lines = 0
    with log_path.open("rb") as stream:
        for raw in stream:
            file_hash.update(raw)
            event = parse_entry(raw, path_prefixes)
            if event:
                items.append(event)
            elif not raw.lstrip().startswith(b"{"):
                bad_lines += 1
    return {
        "protocol": "SFP-001",
        "source_sha256": file_hash.hexdigest(),
        "source_file_bytes": log_path.stat().st_size,
        "scope": list(path_prefixes),
        "malformed_or_non_json_lines": bad_lines,
        "matching_requests": len(items),
        "claimed_bot_counts": dict(Counter(x["claimed_bot_family"] for x in items)),
        "limitations": [
            "User-Agent values are self-declared, not independently verified.",
            "A request does not establish training, indexing, contractual assent, or payment obligation.",
            "Source-file SHA256 detects subsequent changes; it does not independently authenticate origin.",
            "Validate IP ownership separately against authoritative provider sources before attribution.",
        ],
        "events": items,
    }


def public_version(private):
    safe = {k: v for k, v in private.items() if k != "events"}
    safe["redaction_policy"] = "Source IP, request headers and raw evidence withheld; original logs retained privately."
    safe["events"] = [{k: v for k, v in item.items() if k not in ("source_ip", "claimed_user_agent")}
                      for item in private["events"]]
    return safe


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("access_log", type=Path)
    parser.add_argument("--private-out", required=True, type=Path)
    parser.add_argument("--public-out", required=True, type=Path)
    parser.add_argument("--paths", nargs="+", default=list(DEFAULT_PATHS),
                        help="Explicit approved public path prefixes")
    args = parser.parse_args()
    if args.private_out.resolve() == args.public_out.resolve():
        parser.error("private and public outputs must be different files")
    data = report(args.access_log, tuple(args.paths))
    args.private_out.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    args.private_out.chmod(0o600)
    args.public_out.write_text(json.dumps(public_version(data), indent=2) + "\n", encoding="utf-8")
    print(f"SFP-001: {data['matching_requests']} candidate requests. Identity and assent NOT verified.")


if __name__ == "__main__":
    main()
