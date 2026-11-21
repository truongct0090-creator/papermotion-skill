#!/usr/bin/env python3
"""Resolve a successful full-quality video artifact from GitHub Actions."""
import json
import os
import urllib.request

API = "https://api.github.com"
REPO = os.environ["GITHUB_REPOSITORY"]
TOKEN = os.environ["GITHUB_TOKEN"]
EVENT_RUN_ID = (os.environ.get("EVENT_RENDER_RUN_ID") or "").strip()
REQUESTED_RUN_ID = (os.environ.get("REQUESTED_RENDER_RUN_ID") or "").strip()
RUN_ID = EVENT_RUN_ID or REQUESTED_RUN_ID


def get(path):
    req = urllib.request.Request(API + path, headers={
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {TOKEN}",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "MottoMotto-SEO-Assistant",
    })
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.load(response)


def is_video_workflow(run):
    """Avoid querying artifacts for unrelated CI and thumbnail workflows."""
    path = (run.get("path") or "").lower()
    name = (run.get("name") or "").lower()
    markers = ("render", "video", "nokia", "film")
    return any(marker in path or marker in name for marker in markers)


def full_artifact(artifacts):
    for artifact in artifacts:
        name = artifact.get("name", "")
        if name.lower().endswith("-full") and not artifact.get("expired"):
            return artifact
    return None


def find_in_run(run):
    if run.get("conclusion") != "success":
        return None
    artifact = full_artifact(
        get(f"/repos/{REPO}/actions/runs/{run['id']}/artifacts?per_page=100").get("artifacts", [])
    )
    return (run, artifact) if artifact else None


if RUN_ID:
    runs = [get(f"/repos/{REPO}/actions/runs/{RUN_ID}")]
else:
    runs = []
    # Search several pages so older, still-retained full renders remain usable.
    for page in range(1, 6):
        page_runs = get(
            f"/repos/{REPO}/actions/runs?per_page=100&page={page}&status=success"
        ).get("workflow_runs", [])
        if not page_runs:
            break
        runs.extend(page_runs)

chosen = None
for run in runs:
    if not is_video_workflow(run):
        continue
    chosen = find_in_run(run)
    if chosen:
        break

if not chosen:
    if EVENT_RUN_ID:
        with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as f:
            f.write("skip=true\n")
        print(
            f"Render run {EVENT_RUN_ID} completed successfully but did not publish "
            "a non-expired artifact ending in '-full'; skipping SEO."
        )
        raise SystemExit(0)
    if REQUESTED_RUN_ID:
        raise SystemExit(
            f"Render run {REQUESTED_RUN_ID} has no successful, non-expired full-quality "
            "video artifact. Choose a run that uploaded an artifact ending in '-full'."
        )
    raise SystemExit(
        "No successful, non-expired full-quality video artifact was found in recent "
        "video/Nokia/film workflows. Run the full video workflow first, then rerun "
        "YouTube SEO Assistant with render_run_id left blank."
    )

run, artifact = chosen
name = artifact["name"]
scene = name[:-len("-full")]
if scene.startswith("papermotion-"):
    scene = scene[len("papermotion-"):]
with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as f:
    f.write(
        f"run_id={run['id']}\n"
        f"artifact_name={name}\n"
        f"scene={scene}\n"
        f"head_sha={run.get('head_sha', '')}\n"
    )
print(
    f"Selected full-quality artifact '{name}' from workflow "
    f"'{run.get('name')}' run #{run.get('run_number')} ({run['id']})."
)
