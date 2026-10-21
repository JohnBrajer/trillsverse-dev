"""Safe, model-free demonstration CLI. Never executes shell commands."""
import argparse
import json
from .core import Capability, Harness, Intent


def main() -> None:
    parser = argparse.ArgumentParser(description="Trilligence Harness — evidence-first agent kernel")
    parser.add_argument("command", choices=["demo", "version"])
    args = parser.parse_args()
    if args.command == "version":
        print("Trilligence Harness 0.1.0")
        return
    with Harness() as h:
        h.heartbeat({"mode": "demo", "model": "none"})
        h.register(Capability(
            name="extract_signal", description="Extract a verified signal from provided text",
            needs=("text",), adds=("signal",), path_expansion=2,
            handler=lambda payload: {"signal": str(payload["text"]).strip().lower()},
            verifier=lambda payload, result: result["signal"] == str(payload["text"]).strip().lower(),
        ), available=True)
        h.register(Capability(
            name="summarize_signal", description="Optional future summarization adapter",
            needs=("signal",), adds=("summary",), path_expansion=3,
        ), available=False)
        paths = h.perspective_expand({"text"}, "summary")
        receipt = h.execute(Intent(capability="extract_signal", payload={"text": "  SYSTEM BREACH  "}), facts={"text"})
        print(json.dumps({"paths": [vars(p) for p in paths], "receipt": vars(receipt),
                          "catalog": h.catalog(), "journal_valid": h.audit()}, indent=2))


if __name__ == "__main__":
    main()
