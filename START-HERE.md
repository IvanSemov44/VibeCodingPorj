# START HERE - VibeCoding Full Stack Starter Kit

## One Command to Rule Them All

```bash
docker compose up -d
```

That's it! Everything else happens automatically.

## What Just Happened?

When you run that command, the system automatically:

1. Starts MySQL database
2. Starts Redis cache
3. Starts Laravel backend (PHP-FPM + Nginx)
4. Starts Next.js frontend
5. Waits for database to be ready
6. Runs all migrations (creates tables)
7. Seeds demo data (users, tools, categories, etc.)

## Ready to Use!

### Access the App
- Frontend: http://localhost:8200
- Backend API: http://localhost:8201

### Login
Pick any demo user:

```
Email: ivan@admin.local
Password: P@ssw0rd!
```

Other users:
- elena@frontend.local
- petar@backend.local
- maria@pm.local
- nikolay@qa.local
- anna@designer.local

All passwords: `P@ssw0rd!`

## What You'll Find Inside

Once logged in, you'll have access to:

- **30+ AI/ML Tools** - Full catalog with descriptions, URLs, docs, screenshots
- **6 Categories** - Model Hubs, Inference APIs, Prompting Tools, etc.
- **6 Tags** - NLP, Vision, Training, Deployment, etc.
- **Journal System** - 3 sample journal entries with moods and XP
- **6 User Roles** - Owner, Frontend, Backend, PM, QA, Designer

## Common Commands

### Start
```bash
docker compose up -d
```

### Stop
```bash
docker compose down
```

### Reset Everything (Fresh Start)
```bash
docker compose down -v
docker compose up -d
```

### View Logs
```bash
docker compose logs -f
```

### Access Backend Shell
```bash
docker compose exec php_fpm bash
```

## Need More Details?

Check out these guides:

- [QUICK-START.md](QUICK-START.md) - Quick reference cheat sheet
- [SETUP.md](SETUP.md) - Complete setup guide with troubleshooting
- [SEED-DATA-REFERENCE.md](SEED-DATA-REFERENCE.md) - Full list of all seed data

## Ports Used

- 8200 - Frontend (Next.js)
- 8201 - Backend API (Laravel)
- 8202 - PHP-FPM
- 8203 - MySQL
- 8204 - Redis
- 8205 - Tools container

## Quick Troubleshooting

### Nothing works?
```bash
docker compose down
docker compose up -d
docker compose logs -f
```

### Port already in use?
Edit `docker-compose.yml` and change port numbers.

### Want fresh data?
```bash
docker compose down -v
docker compose up -d
```

## That's It!

You're ready to explore. The entire application is pre-populated with real demo data.

Happy coding! 🚀
