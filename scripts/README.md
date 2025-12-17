## Synthetic health check and Prometheus integration

This folder contains a simple synthetic check script that queries the backend
health endpoints and writes Prometheus textfile metrics suitable for the
`node_exporter` `textfile` collector.

Files
- `synthetic-check.py` — Python script that pings `/api/health` and `/api/ready`.
- `metrics/` — output directory where `system_health.prom` will be written.

Usage

Run once:
```bash
BACKEND_URL=http://127.0.0.1:8201 python3 scripts/synthetic-check.py
```

Run periodically (example cron, every 30s using a system that supports it):
```cron
*/1 * * * * cd /path/to/repo && BACKEND_URL=http://backend:8201 python3 scripts/synthetic-check.py
```

Prometheus

Configure Prometheus/node_exporter to read the `scripts/metrics` directory with
the `textfile` collector. Example `node_exporter` option:
```
--collector.textfile.directory=/path/to/repo/scripts/metrics
```

Docker

If you run this inside a container, ensure `python3` is installed and use the
backend service name (e.g. `http://backend:8201`) for `BACKEND_URL`.
