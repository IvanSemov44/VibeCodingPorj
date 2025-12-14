# Seed Data Reference

This document lists all the data that gets automatically created when you start the project with Docker.

## Users (7 total)

All users have the same password: **P@ssw0rd!**

| ID | Name | Email | Role | Description |
|----|------|-------|------|-------------|
| 1 | Ivan Ivanov | ivan@admin.local | owner | Platform owner with full access |
| 2 | Elena Petrova | elena@frontend.local | frontend | Frontend developer |
| 3 | Petar Georgiev | petar@backend.local | backend | Backend developer |
| 4 | Maria Dimitrova | maria@pm.local | pm | Project manager |
| 5 | Nikolay Ivanov | nikolay@qa.local | qa | QA tester |
| 6 | Anna Georgieva | anna@designer.local | designer | UI/UX designer |
| 7 | Test User | test@example.com | owner | Automated testing user |

## Roles (6 total)

- `owner` - Full platform access
- `backend` - Backend development access
- `frontend` - Frontend development access
- `pm` - Project management access
- `qa` - Quality assurance access
- `designer` - Design access

## Categories (6 total)

| Name | Slug |
|------|------|
| Model Hubs | model-hubs |
| Inference APIs | inference-apis |
| Prompting Tools | prompting-tools |
| Data Labeling | data-labeling |
| Visualization | visualization |
| Monitoring | monitoring |

## Tags (6 total)

| Name | Slug |
|------|------|
| nlp | nlp |
| vision | vision |
| training | training |
| deployment | deployment |
| open-source | open-source |
| paid | paid |

## Tools (30 total)

Each tool includes:
- Name
- URL
- Documentation URL
- Description
- Usage instructions
- 1-2 placeholder screenshots (from picsum.photos)
- Random category assignment
- 0-3 random tags
- 0-2 random role assignments

### Full Tool List

1. **OpenAI Playground** - Interactive environment to test OpenAI models
2. **Hugging Face** - Model hub and inference API
3. **Cohere** - NLP models and embeddings API
4. **Anthropic Claude** - Claude family of assistant models
5. **Replicate** - Run machine learning models in the cloud
6. **Runway** - Creative tools for video and images using ML
7. **Stability AI** - Generative image models and tools
8. **Midjourney** - AI image generation via Discord bot
9. **DALL-E** - Image generation from text prompts
10. **DeepL** - High-quality machine translation
11. **LangChain** - Framework for building LLM applications
12. **Pinecone** - Managed vector database for embeddings
13. **Qdrant** - Open-source vector search engine
14. **Weaviate** - Vector search engine with graph capabilities
15. **Paperspace** - Cloud GPU instances and ML infrastructure
16. **Gradio** - Easy UI for ML demos
17. **Streamlit** - Apps for ML and data apps
18. **Roboflow** - Computer vision dataset tooling
19. **Labelbox** - Data labeling platform
20. **Supervise.ly** - Annotation and model training platform
21. **LlamaIndex** - Indexing and retrieval for LLMs
22. **Papers With Code** - Research papers connected to code and benchmarks
23. **TensorFlow Hub** - Repository of reusable ML modules
24. **PyTorch Hub** - Pretrained models for PyTorch
25. **MLflow** - Experiment tracking and model registry
26. **DataRobot** - Enterprise AutoML platform
27. **Dataiku** - Collaborative data science platform
28. **Algorithmia** - Model deployment and serving
29. **SuperAnnotate** - Annotation platform for computer vision
30. **Vectara** - Semantic search and retrieval-as-a-service
31. **Qwak** - Infrastructure for ML model deployments

## Journal Entries (3 total)

Created for the first user (Ivan Ivanov):

### Entry 1: Epic Day at VibeCoding Academy
- **Mood**: Victorious
- **XP**: 85
- **Tags**: Backend, Frontend, Refactor, Docs, Feature Quest
- **Content**: Comprehensive overview of building the VibeCoding Academy platform including theme system, user registration, code quality improvements, and documentation.

### Entry 2: Daily Log
- **Mood**: Happy
- **XP**: 20
- **Tags**: DevOps, Bugfix, UX
- **Content**: Tools workflow improvements, validation feedback, pagination fixes, screenshot upload improvements.

### Entry 3: Journey Day 3 - Stability & State Wins
- **Mood**: Productive
- **XP**: 30
- **Tags**: Frontend, State, RTK Query, Debugging
- **Content**: RTK Query stabilization, refetch loop fixes, instrumentation preparation.

## Database Schema

The seeders populate these tables:

- `users` - User accounts
- `roles` - Permission roles (via Spatie Permission)
- `categories` - Tool categories
- `tags` - Tool tags
- `tools` - AI/ML tools catalog
- `journal_entries` - User journal entries
- `role_tool` - Many-to-many relationship between roles and tools
- `category_tool` - Many-to-many relationship between categories and tools
- `tag_tool` - Many-to-many relationship between tags and tools

## How to Modify Seed Data

### Change User Passwords

Edit [backend/.env](backend/.env):
```env
DEMO_USER_PASSWORD=YourNewPassword123!
DEMO_USER_RESET_PASSWORD=true
```

Then restart:
```bash
docker compose restart php_fpm
docker compose exec php_fpm php artisan db:seed --force
```

### Add More Users

Edit [backend/database/seeders/UserSeeder.php](backend/database/seeders/UserSeeder.php) and add to the `$users` array:

```php
['name' => 'New User', 'email' => 'new@example.com', 'role' => 'backend'],
```

### Add More Tools

Edit [backend/database/seeders/ToolSeeder.php](backend/database/seeders/ToolSeeder.php) and add to the `$tools` array:

```php
[
    'name' => 'My Tool',
    'url' => 'https://example.com',
    'docs_url' => 'https://docs.example.com',
    'description' => 'Tool description',
    'usage' => 'How to use the tool'
],
```

### Add More Categories/Tags

Edit:
- [backend/database/seeders/CategorySeeder.php](backend/database/seeders/CategorySeeder.php)
- [backend/database/seeders/TagSeeder.php](backend/database/seeders/TagSeeder.php)

### Disable Seeding

To start with an empty database, comment out the seeders in [backend/database/seeders/DatabaseSeeder.php](backend/database/seeders/DatabaseSeeder.php):

```php
public function run(): void
{
    // Comment out any seeders you don't want
    // $this->call(\Database\Seeders\RoleSeeder::class);
    // $this->call(\Database\Seeders\UserSeeder::class);
    // etc...
}
```

## Re-running Seeders

The seeders are idempotent - they use `firstOrCreate` or `updateOrCreate`, so running them multiple times won't create duplicates.

To re-run seeders:

```bash
# Enter the PHP container
docker compose exec php_fpm bash

# Run all seeders
php artisan db:seed --force

# Run specific seeder
php artisan db:seed --class=UserSeeder --force

# Fresh migration + seed (WARNING: deletes all data!)
php artisan migrate:fresh --seed
```

## Production Safety

The seeders include safety checks:

```php
if (app()->environment('production') && ! filter_var(env('ALLOW_SEED_IN_PRODUCTION', 'false'), FILTER_VALIDATE_BOOLEAN)) {
    return;
}
```

This prevents accidentally seeding demo data in production unless you explicitly set:
```env
ALLOW_SEED_IN_PRODUCTION=true
```

## Seeder Execution Order

Order matters! The [DatabaseSeeder](backend/database/seeders/DatabaseSeeder.php) runs them in this sequence:

1. **RoleSeeder** - Must run first (users need roles)
2. **UserSeeder** - Creates users with roles
3. **CategorySeeder** - Categories for tools
4. **TagSeeder** - Tags for tools
5. **ToolSeeder** - Tools (references categories, tags, roles)
6. **JournalSeeder** - Journal entries (references users)
7. **TestUserSeeder** - Test user for automation

## Viewing Seed Data

### Via API

```bash
# Get all users
curl http://localhost:8201/api/users

# Get all tools
curl http://localhost:8201/api/tools

# Get all categories
curl http://localhost:8201/api/categories
```

### Via Database

```bash
# Access MySQL
docker compose exec mysql mysql -u root -pvibecode-full-stack-starter-kit_mysql_pass vibecode-full-stack-starter-kit_app

# View users
SELECT id, name, email FROM users;

# View tools count
SELECT COUNT(*) FROM tools;

# View journal entries
SELECT id, title, mood, xp FROM journal_entries;
```

### Via Frontend

1. Login at http://localhost:8200
2. Navigate to Tools page - see all 30+ tools
3. Navigate to Journal page - see 3 sample entries
4. Check user profile - see assigned roles

## Summary

When you run `docker compose up -d`, you automatically get:
- 7 users (6 demo + 1 test)
- 6 roles
- 6 categories
- 6 tags
- 30+ tools with relationships
- 3 journal entries

All ready to explore and test the full application!
