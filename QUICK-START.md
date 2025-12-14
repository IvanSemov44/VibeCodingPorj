# Quick Start Cheat Sheet

## Start the Project
```bash
cd full-stack-starter-kit
docker compose up -d
```

## Access
- Frontend: http://localhost:8200
- Backend: http://localhost:8201

## Login
- Email: `ivan@admin.local`
- Password: `P@ssw0rd!`

## Other Demo Users
- `elena@frontend.local` - Frontend Developer
- `petar@backend.local` - Backend Developer
- `maria@pm.local` - Project Manager
- `nikolay@qa.local` - QA Tester
- `anna@designer.local` - Designer

All passwords: `P@ssw0rd!`

## Reset Everything
```bash
docker compose down -v
docker compose up -d
```

## View Logs
```bash
docker compose logs -f
```

## Stop
```bash
docker compose down
```

That's it! Everything seeds automatically.
