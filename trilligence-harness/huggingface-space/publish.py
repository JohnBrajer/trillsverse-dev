"""Explicitly authorized Hugging Face static Space release utility.

Set HF_TOKEN and HF_SPACE_REPO_ID via secrets/CI environment. No token is
persisted, logged, or accepted from agent/model-generated input.
"""
import os
from pathlib import Path


def main() -> None:
    token = os.environ.get("HF_TOKEN")
    repo_id = os.environ.get("HF_SPACE_REPO_ID")
    if not token or not repo_id:
        raise SystemExit("Skipped: HF_TOKEN and HF_SPACE_REPO_ID must both be set")
    if repo_id.count("/") != 1 or any(part in ("", ".", "..") for part in repo_id.split("/")):
        raise SystemExit("Invalid HF_SPACE_REPO_ID; expected owner/space-name")
    from huggingface_hub import HfApi

    client = HfApi(token=token)
    client.create_repo(repo_id=repo_id, repo_type="space", space_sdk="static", exist_ok=True)
    client.upload_folder(
        repo_id=repo_id,
        repo_type="space",
        folder_path=str(Path(__file__).resolve().parent),
        ignore_patterns=["publish.py", "__pycache__/*"],
        commit_message="Publish Trilligence Harness static architecture demo",
    )
    print(f"Published static demonstration to https://huggingface.co/spaces/{repo_id}")


if __name__ == "__main__":
    main()
