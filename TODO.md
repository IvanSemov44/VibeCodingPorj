
add seeder default with starting app
update pagination logic for Active Users and Tools and Pending Tool Approvals


Add server-side unit tests for EnsureAdminOrOwner middleware.
Add an e2e test that logs in and verifies /admin access.


I removed Redis password for local dev (the Redis container runs without auth). For production, re-enable strong Redis auth and set REDIS_PASSWORD accordingly; update compose and .env together.
If you want, I can:
Switch other caches to use tags (already done for categories/tools; I applied tags for tags/roles in WarmCache).
Update docker-compose.yml comments or remove the obsolete version: key to silence warnings.
Revert Redis to requirepass and enable proper REDIS_PASSWORD with matching compose + .env for closer-to-prod behavior.


DONE:
remove edit and delete button for not authorized user for tool list
Page Tools list only approved tools
Add confirmation to Approve (toast + optimistic update) and show toasts on success/failure.
Add server-side protection UI (hide actions when user is not admin).
update all component have dark mode
add tags and categories to admin panel
better role choice
Add ban/activate actions for users listed on the Admin Users page.
add base seed data for recent activities 
show more information in recent activities
update the view for tool
