<!--
  Day 4 Reference
  Purpose: persistent reference for the project state, changes, commands, and pointers
  so future assistants or contributors can pick up work when chat context is unavailable.
-->

# Day 4 — Stabilization, Admin & 2FA Planning (Reference)

Дата: 2025-12-11

Кратко резюме (BG): Днес фокусът беше върху стабилност на frontend fetch логика, преминаване към RTK Query, премахване на циклични refetch-и, коригиране на runtime грешки и подготовка за по-широка сигурност/админ функционалност (2FA, admin panel, RBAC, caching, audit logs). Този файл служи като автономен справочник когато чат контекстът изчезне.

---

## 1) Какво беше направено днес (high level)
- Migrated journal fetches to RTK Query and memoized query args to avoid re-fetch churn.
- Removed an explicit `refetch()` effect in `useJournal` and set RTK Query options to avoid refetch-on-focus/reconnect/mount for stats.
- Fixed a runtime ReferenceError by importing `useMemo` in `frontend/hooks/useJournal.ts`.
- Added a Day 3 seed entry in `backend/database/seeders/JournalSeeder.php` and ran the seeder.

## 2) Files changed / touched (important paths)
- Frontend
  - `frontend/hooks/useJournal.ts` — memoized params, RTK Query usage, added `useMemo` import
  - `frontend/components/JournalSection.tsx` — (UI that consumes the hook)

- Backend
  - `backend/database/seeders/JournalSeeder.php` — added Day 3 entry

## 3) Commands you can run locally (quick references)
Run the journal seeder (already executed during Day 3 work):

```powershell
docker compose -f "c:\Users\ivans\Desktop\Dev\VibeCodingProj\full-stack-starter-kit\docker-compose.yml" exec php_fpm php artisan db:seed --class=JournalSeeder
```

Restart frontend (if you changed frontend files):

```powershell
docker compose -f "c:\Users\ivans\Desktop\Dev\VibeCodingProj\full-stack-starter-kit\docker-compose.yml" restart frontend
```

Tail backend logs to observe incoming requests (e.g., frequent `/api/journal/stats`):

```powershell
docker compose -f "c:\Users\ivans\Desktop\Dev\VibeCodingProj\full-stack-starter-kit\docker-compose.yml" logs --follow backend
```

Open frontend locally: http://localhost:8200
Open backend locally: http://localhost:8201

## 4) How to find the important code when chat context is lost
- Hook used by journal UI: `frontend/hooks/useJournal.ts`
- Journal UI container: `frontend/components/JournalSection.tsx`
- RTK Query API slice: `frontend/store/api.ts` (base URL, endpoints)
- Backend controllers: `backend/app/Http/Controllers/Api/JournalController.php`
- Seeder for demo journal entries: `backend/database/seeders/JournalSeeder.php`

If you need to trace a noisy request:
1. Open browser DevTools Network tab and filter `/journal/stats` to see initiator.
2. Check frontend code for `useGetStatsQuery` or calls to `.refetch()`.
3. Tail backend logs to see source IPs and timestamps.

## 5) Day 4 objectives (a clear checklist for future work)
- Short term (high priority):
  - Instrument client to find the source of repeated `/api/journal/stats` calls (DevTools initiator, or temporary console logs in `useJournal`).
  - Add a short-term throttle on stats fetching in the client while debugging (e.g., `keepUnusedDataFor` or manual guard).

- Mid term (next days):
  - Implement 2FA backend endpoints & TOTP service (Google Authenticator) + Email OTP + Telegram integration.
  - Add role-based middleware and seed granular permissions with Spatie.
  - Build admin backend endpoints for user management and tool approvals.
  - Add Redis caching for categories, tool lists, and user-specific stats.
  - Implement activity/audit logging (Spatie activity log or custom `activity_logs` table).

## 6) Troubleshooting tips & gotchas
- If you see `/api/api` 404s, ensure base URL normalization is centralized in `frontend/store/api.ts` (avoid `NEXT_PUBLIC_API_URL` ending with `/api` twice).
- If RTK Query refetches repeatedly, investigate unstable query args — wrap params in `useMemo` or use `serializeQueryArgs` in API slice.
- For missing React hooks runtime errors, check the imports at the top of the component file (e.g., add `useMemo` to the import list).

## 7) Useful snippets (copy-paste)
- Memoize params for RTK Query in hooks:

```ts
const params = useMemo(() => ({ search, mood, tag }), [search, mood, tag]);
const entriesQuery = useGetEntriesQuery(params);
```

- Disable aggressive RTK Query refetch for stats:

```ts
useGetStatsQuery(undefined, {
  refetchOnFocus: false,
  refetchOnReconnect: false,
  refetchOnMountOrArgChange: false,
});
```

## 8) Notes for future assistants (how to pick up work quickly)
- Always start by checking `docker compose ps` and `docker compose logs` for the `frontend`, `backend`, `php_fpm`, and `mysql` services.
- Verify `SANCTUM_STATEFUL_DOMAINS` and `SESSION_SAME_SITE` env values in `docker-compose.yml` / `php_fpm` environment for SPA auth issues.
- Use the repository root as the working directory: `c:\Users\ivans\Desktop\Dev\VibeCodingProj\full-stack-starter-kit`.
- If making DB changes, create migrations and run `php artisan migrate` inside `php_fpm` container.

## 9) Day 4 log (human-friendly summary)
Today we reduced noisy network behavior, stabilized RTK Query usage, fixed a small runtime bug, and ensured the demo Day 3 content is seeded. The repo is ready for the next phase: 2FA and admin features. This document should be the first file you open if you re-enter the project and the chat window context is lost.

---

_File created automatically on 2025-12-11 to act as a persistent Day 4 reference and to include an implementation plan for 2FA, admin, RBAC, caching, and audit logging._
