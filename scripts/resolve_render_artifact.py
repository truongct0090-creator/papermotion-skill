#!/usr/bin/env python3
"""Resolve a successful full-quality render artifact from GitHub Actions."""
import json, os, urllib.request
API = "https://api.github.com"
REPO = os.environ["GITHUB_REPOSITORY"]
TOKEN = os.environ["GITHUB_TOKEN"]
RUN_ID = (os.environ.get("EVENT_RENDER_RUN_ID") or os.environ.get("REQUESTED_RENDER_RUN_ID") or "").strip()

def get(path):
    req = urllib.request.Request(API + path, headers={
        "Accept": "application/vnd.github+json", "Authorization": f"Bearer {TOKEN}",
        "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "MottoMotto-SEO-Assistant"})
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.load(response)

runs = [get(f"/repos/{REPO}/actions/runs/{RUN_ID}")] if RUN_ID else get(
    f"/repos/{REPO}/actions/workflows/render-video.yml/runs?per_page=50&status=success").get("workflow_runs", [])
chosen = None
for run in runs:
    if run.get("path") != ".github/workflows/render-video.yml" or run.get("conclusion") != "success":
        continue
    artifacts = get(f"/repos/{REPO}/actions/runs/{run['id']}/artifacts?per_page=100").get("artifacts", [])
    for artifact in artifacts:
        name = artifact.get("name", "")
        if name.startswith("papermotion-") and name.endswith("-full") and not artifact.get("expired"):
            chosen = run, artifact
            break
    if chosen:
        break
if not chosen:
    if EVENT_RUN_ID:
        with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as f:
            f.write("skip=true\\n")
        print("This successful render was a draft or has no full artifact; skipping SEO.")
        raise SystemExit(0)
    if RUN_ID:
        raise SystemExit(f"No successful full-quality PaperMotion artifact found in render run {RUN_ID}. Verify quality=full and artifact retention.")
    raise SystemExit("No recent successful full-quality render found. Run Render PaperMotion video with quality=full first.")
run, artifact = chosen
name = artifact["name"]
scene = name[len("papermotion-"):-len("-full")]
with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as f:
    f.write(f"run_id={run['id']}\nartifact_name={name}\nscene={scene}\n")
print(f"Selected {name} from render run #{run.get('run_number')} ({run['id']})")
