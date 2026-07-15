#!/usr/bin/env python3
"""
Deploy OwlMind AI Quest to Netlify via API (no CLI required).
Uses Netlify's Deploy API with zip upload.

Steps:
1. Creates a zip of the project folder
2. Creates a new Netlify site (or reuses existing)
3. Uploads the zip as a deploy
4. Prints the live URL
"""

import os
import sys
import json
import zipfile
import urllib.request
import urllib.error
import urllib.parse
import time

# Portable configuration based on the script location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "..")) # Root of the website to deploy
ZIP_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, "owlmind-deploy.zip"))
NETLIFY_API = "https://api.netlify.com/api/v1"
STATE_FILE = os.path.abspath(os.path.join(SCRIPT_DIR, "netlify_state.json"))

def make_zip():
    """Zip the project directory."""
    print(f"[1/4] Zipping project from: {PROJECT_DIR}")
    if os.path.exists(ZIP_PATH):
        os.remove(ZIP_PATH)
    with zipfile.ZipFile(ZIP_PATH, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(PROJECT_DIR):
            # Skip node_modules, git, and automation assets
            dirs[:] = [d for d in dirs if d not in ('node_modules', '.git', 'automation')]
            for file in files:
                filepath = os.path.join(root, file)
                # Ensure we don't zip the zip itself if it is in the project dir
                if file.endswith('.zip') or file == 'netlify_state.json':
                    continue
                arcname = os.path.relpath(filepath, PROJECT_DIR)
                zf.write(filepath, arcname)
                print(f"   + {arcname}")
    size_kb = os.path.getsize(ZIP_PATH) / 1024
    print(f"   Zip created: {size_kb:.1f} KB")

def api_request(method, path, token, data=None, binary=None, content_type=None):
    """Make a Netlify API request."""
    url = f"{NETLIFY_API}{path}"
    headers = {
        "Authorization": f"Bearer {token}",
    }
    if binary is not None:
        body = binary
        headers["Content-Type"] = content_type or "application/zip"
    elif data is not None:
        body = json.dumps(data).encode()
        headers["Content-Type"] = "application/json"
    else:
        body = None

    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        print(f"HTTP Error {e.code}: {err_body}")
        raise

def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE) as f:
            return json.load(f)
    return {}

def save_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def main():
    # Get token from env or prompt
    token = os.environ.get("NETLIFY_TOKEN", "").strip()
    if not token:
        print("\n" + "="*60)
        print("NETLIFY PERSONAL ACCESS TOKEN REQUIRED")
        print("="*60)
        print("Get one FREE at: https://app.netlify.com/user/applications")
        print("  -> User settings -> Applications -> Personal access tokens")
        print("  -> New access token -> copy it")
        print("="*60)
        token = input("Paste your Netlify token here: ").strip()
    
    if not token:
        print("ERROR: No token provided. Exiting.")
        sys.exit(1)

    make_zip()

    state = load_state()
    site_id = state.get("site_id")
    site_url = state.get("site_url")

    # Create site if not exists
    if not site_id:
        print("\n[2/4] Creating Netlify site...")
        site = api_request("POST", "/sites", token, data={
            "name": "owlmind-ai-quest",
        })
        site_id = site["id"]
        site_url = site.get("ssl_url") or site.get("url")
        state["site_id"] = site_id
        state["site_url"] = site_url
        save_state(state)
        print(f"   Site created: {site_url}")
    else:
        print(f"\n[2/4] Reusing existing site: {site_url}")

    # Upload zip
    print(f"\n[3/4] Uploading zip to Netlify...")
    with open(ZIP_PATH, 'rb') as f:
        zip_data = f.read()
    
    deploy = api_request(
        "POST",
        f"/sites/{site_id}/deploys",
        token,
        binary=zip_data,
        content_type="application/zip"
    )
    deploy_id = deploy["id"]
    deploy_url = deploy.get("deploy_ssl_url") or deploy.get("deploy_url") or site_url
    print(f"   Deploy submitted. ID: {deploy_id}")

    # Wait for deploy to be ready
    print(f"\n[4/4] Waiting for deploy to go live...")
    for i in range(30):
        time.sleep(4)
        info = api_request("GET", f"/deploys/{deploy_id}", token)
        status = info.get("state", "unknown")
        print(f"   [{i+1}] Status: {status}")
        if status == "ready":
            final_url = info.get("ssl_url") or info.get("url") or site_url
            state["last_deploy_url"] = final_url
            save_state(state)
            print("\n" + "="*60)
            print("✅ DEPLOYMENT SUCCESSFUL!")
            print("="*60)
            print(f"🌐 Live URL: {final_url}")
            print(f"   Site URL: {site_url}")
            print("="*60)
            return
        elif status in ("error", "failed"):
            print(f"ERROR: Deploy failed with status: {status}")
            sys.exit(1)

    print("Timeout waiting for deploy. Check Netlify dashboard.")
    print(f"Site URL: {site_url}")

if __name__ == "__main__":
    main()
