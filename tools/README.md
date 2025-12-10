# Tools

This folder contains small developer utilities for the full-stack starter kit.

Available checks:

- `check_api.sh` — Bash script that pings `/api/health` and `/api/tools` on the local backend. Usage:

```bash
# from repo root
chmod +x tools/check_api.sh
./tools/check_api.sh http://localhost:8201
```

- `check_api.ps1` — PowerShell equivalent:

```powershell
# from repo root
.\'tools\check_api.ps1' -BaseUrl 'http://localhost:8201'
```

These scripts are quick sanity checks to confirm the backend is reachable and that the tools discovery endpoint is returning data.
