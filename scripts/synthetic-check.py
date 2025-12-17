#!/usr/bin/env python3
"""
Simple synthetic health checker that writes Prometheus textfile metrics.

Usage:
  BACKEND_URL=http://127.0.0.1:8201 python3 scripts/synthetic-check.py

This will create/update `scripts/metrics/system_health.prom` which can be
scraped by Prometheus `textfile` collector (node_exporter). Run periodically
via cron or a container.
"""
import json
import os
import sys
import time
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError


BACKEND = os.environ.get('BACKEND_URL', 'http://127.0.0.1:8201').rstrip('/')
METRICS_DIR = os.path.join(os.path.dirname(__file__), 'metrics')
OUT_FILE = os.path.join(METRICS_DIR, 'system_health.prom')
TMP_FILE = OUT_FILE + '.tmp'


def fetch(path, timeout=5):
    url = f"{BACKEND}{path}"
    req = Request(url, headers={'Accept': 'application/json', 'User-Agent': 'synthetic-check/1'})
    try:
        with urlopen(req, timeout=timeout) as res:
            body = res.read().decode('utf-8')
            status = res.getcode()
            return status, body
    except HTTPError as e:
        return e.code, e.read().decode('utf-8') if e.fp else ''
    except URLError as e:
        return None, str(e)
    except Exception as e:
        return None, str(e)


def safe_float(v):
    try:
        return float(v)
    except Exception:
        return 0.0


def write_metrics(metrics_text: str):
    os.makedirs(METRICS_DIR, exist_ok=True)
    with open(TMP_FILE, 'w', encoding='utf-8') as f:
        f.write(metrics_text)
    # atomic replace
    os.replace(TMP_FILE, OUT_FILE)


def main():
    timestamp = int(time.time())
    lines = []

    # Liveness (/api/health)
    status, body = fetch('/api/health')
    live = 0
    if status == 200:
        live = 1
    lines.append(f"# HELP system_health_liveness Liveness probe (1=ok,0=fail)")
    lines.append(f"# TYPE system_health_liveness gauge")
    lines.append(f"system_health_liveness {live} {timestamp}")

    # Readiness (/api/ready)
    status, body = fetch('/api/ready')
    ready = 0
    if status == 200:
        ready = 1
    lines.append(f"# HELP system_health_readiness Readiness probe (1=ok,0=fail)")
    lines.append(f"# TYPE system_health_readiness gauge")
    lines.append(f"system_health_readiness {ready} {timestamp}")

    # If readiness returned JSON with checks, expose per-check metrics
    if status == 200:
        try:
            j = json.loads(body)
            checks = j.get('checks') if isinstance(j, dict) else None
            if isinstance(checks, dict):
                lines.append(f"# HELP system_health_check_status Per-check status (1=ok,0!=ok)")
                lines.append(f"# TYPE system_health_check_status gauge")
                for k, v in checks.items():
                    val = 1 if str(v).lower() == 'ok' else 0
                    # sanitize label value
                    k_safe = str(k).replace('"', '\\"')
                    lines.append(f'system_health_check_status{{check="{k_safe}"}} {val} {timestamp}')
        except Exception:
            pass

    # Add a scrape timestamp
    lines.append(f"# HELP system_health_last_check_seconds Unix timestamp of last synthetic check")
    lines.append(f"# TYPE system_health_last_check_seconds gauge")
    lines.append(f"system_health_last_check_seconds {timestamp}")

    text = '\n'.join(lines) + '\n'
    write_metrics(text)


if __name__ == '__main__':
    try:
        main()
        print('ok')
        sys.exit(0)
    except Exception as e:
        print('error', e, file=sys.stderr)
        sys.exit(2)
