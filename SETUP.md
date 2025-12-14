# Simple Docker Setup with Seed Data

This guide will help you start the project from zero with Docker and automatically seed all the demo data.

## What Gets Seeded

When you start the project, the following data is automatically created:

### Users (6 demo users)
All users have the password: **P@ssw0rd!**

| Name | Email | Role |
|------|-------|------|
| Ivan Ivanov | ivan@admin.local | owner |
| Elena Petrova | elena@frontend.local | frontend |
| Petar Georgiev | petar@backend.local | backend |
| Maria Dimitrova | maria@pm.local | pm |
| Nikolay Ivanov | nikolay@qa.local | qa |
| Anna Georgieva | anna@designer.local | designer |

### Tools (30+ AI/ML tools)
Including: OpenAI Playground, Hugging Face, Claude, Replicate, LangChain, Pinecone, and many more.

### Categories (6)
- Model Hubs
- Inference APIs
- Prompting Tools
- Data Labeling
- Visualization
- Monitoring

### Tags
Various tags assigned to tools.

### Journal Entries
Sample journal entries for the first user.

## Quick Start

### 1. Start Everything from Zero

```bash
# Navigate to the project directory
cd full-stack-starter-kit

# Start all containers (database, backend, frontend, redis)
docker compose up -d
```

That's it! The system will automatically:
- Wait for the database to be ready
- Run all migrations
- Seed all demo data (users, tools, categories, tags, journals)
- Start the backend API and frontend

### 2. Access the Application

- **Frontend**: http://localhost:8200
- **Backend API**: http://localhost:8201/api
- **MySQL**: localhost:8203 (root password: `vibecode-full-stack-starter-kit_mysql_pass`)
- **Redis**: localhost:8204 (password: `vibecode-full-stack-starter-kit_redis_pass`)

### 3. Login

Use any of the demo users:
- Email: `ivan@admin.local` (or any other from the table above)
- Password: `P@ssw0rd!`

## Starting Fresh (Reset Everything)

If you want to completely reset and start over:

```bash
# Stop all containers
docker compose down

# Remove all data volumes (this deletes the database!)
docker compose down -v

# Start fresh
docker compose up -d
```

This will recreate everything from scratch with fresh seed data.

## Viewing Logs

```bash
# View all logs
docker compose logs -f

# View only backend logs
docker compose logs -f php_fpm

# View only frontend logs
docker compose logs -f frontend

# View only database logs
docker compose logs -f mysql
```

## Stopping the Project

```bash
# Stop all containers (keeps data)
docker compose down

# Stop and remove data
docker compose down -v
```

## How Seeding Works

The seeding happens automatically through the [docker-entrypoint-phpfpm.sh](backend/docker-entrypoint-phpfpm.sh#L27-L28) script, which runs:

1. `php artisan migrate --force` - Creates all database tables
2. `php artisan db:seed --force` - Seeds all demo data

The [DatabaseSeeder](backend/database/seeders/DatabaseSeeder.php) calls these seeders in order:
1. **RoleSeeder** - Creates roles (owner, backend, frontend, pm, qa, designer)
2. **UserSeeder** - Creates 6 demo users
3. **CategorySeeder** - Creates 6 categories
4. **TagSeeder** - Creates tags
5. **ToolSeeder** - Creates 30+ AI/ML tools with screenshots
6. **JournalSeeder** - Creates sample journal entries
7. **TestUserSeeder** - Creates a test user for automated checks

## Configuration

Seeding behavior is controlled by these environment variables in [backend/.env](backend/.env):

```env
DEMO_USER_PASSWORD=P@ssw0rd!           # Password for all demo users
DEMO_USER_RESET_PASSWORD=true          # Reset passwords on each seed
ALLOW_SEED_IN_PRODUCTION=false         # Safety: don't seed in production
```

## Manual Seeding (If Needed)

If you need to re-seed data without restarting:

```bash
# Access the backend container
docker compose exec php_fpm bash

# Run migrations and seeders
php artisan migrate:fresh --seed
```

**Warning**: `migrate:fresh` will DROP all tables and recreate them!

## Troubleshooting

### Containers won't start
```bash
# Check what's running
docker compose ps

# Check logs for errors
docker compose logs
```

### Database connection errors
```bash
# Make sure MySQL is healthy
docker compose ps mysql

# Wait a bit longer - MySQL takes 30-60 seconds to start
docker compose logs mysql
```

### Port already in use
If ports 8200-8205 are already in use, edit [docker-compose.yml](docker-compose.yml) and change the port mappings.

### Need to change demo user password
Edit `DEMO_USER_PASSWORD` in [backend/.env](backend/.env) and restart:
```bash
docker compose restart php_fpm
docker compose exec php_fpm php artisan db:seed --force
```

## What's Running

After `docker compose up -d`, you'll have:

| Service | Container | Purpose |
|---------|-----------|---------|
| frontend | vibecode-full-stack-starter-kit_frontend | Next.js frontend app |
| backend | vibecode-full-stack-starter-kit_backend | Nginx web server |
| php_fpm | vibecode-full-stack-starter-kit_php_fpm | Laravel/PHP-FPM backend |
| queue | vibecode-full-stack-starter-kit_queue | Laravel queue worker |
| mysql | vibecode-full-stack-starter-kit_mysql | MySQL 8.0 database |
| redis | vibecode-full-stack-starter-kit_redis | Redis cache |

## Next Steps

Once everything is running:

1. Login with `ivan@admin.local` / `P@ssw0rd!`
2. Explore the tools catalog
3. Create journal entries
4. Try different user roles

Enjoy exploring the project!
