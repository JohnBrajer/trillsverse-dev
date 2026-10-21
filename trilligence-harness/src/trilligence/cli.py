"""Safe, model-free demonstration CLI. Never executes shell commands."""
import argparse
import json
from .core import Capability, Harness, Intent


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Trilligence Harness — evidence-first agent kernel")
    parser.add_argument("command", choices=["demo", "version", "openai"])
    parser.add_argument("--model", default="gpt-4.1-mini", help="model for the OpenAI Responses API")
    parser.add_argument("--text", default="TRILLIGENCE", help="public, non-sensitive example text")
    parser.add_argument("--send", action="store_true", help="explicitly opt in to the external API request and charges")
    args = parser.parse_args(argv)
    if args.command == "version":
        print("Trilligence Harness 0.1.0")
        return
    if args.command == "openai":
        if not args.send:
            parser.error("--send is required before sending text to the OpenAI API")
        from .orchestrator import Agent
        from .openai_bridge import OpenAIResponsesBrain
        with Harness() as h:
            h.heartbeat({"mode": "openai-adapter", "model": args.model})
            h.register(Capability(
                "normalize_text", description="Lowercase the original provided text",
                needs=("input_text",), adds=("normalized",),
                handler=lambda payload: args.text.strip().lower(),
                verifier=lambda payload, result: (
                    payload.get("text") == args.text and result == args.text.strip().lower()
                ),
            ), available=True)
            report = Agent(h, OpenAIResponsesBrain(model=args.model), max_steps=1).run(
                "normalized", facts={"input_text"}
            )
            print(json.dumps({"brain": "OpenAIResponsesBrain", "model": args.model,
                              "verified": report.reached, "stop_reason": report.stop_reason,
                              "journal_valid": h.audit(),
                              "receipts": [{"capability": r.capability, "status": r.status,
                                            "record_hash": r.record_hash} for r in report.steps]}, indent=2))
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
