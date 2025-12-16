
update pagination logic for Active Users and Tools and Pending Tool Approvals

Add ban/activate actions for users listed on the Admin Users page.
Add server-side unit tests for EnsureAdminOrOwner middleware.
Add an e2e test that logs in and verifies /admin access.

DONE:
remove edit and delete button for not authorized user for tool list
Page Tools list only approved tools
Add confirmation to Approve (toast + optimistic update) and show toasts on success/failure.
Add server-side protection UI (hide actions when user is not admin).
update all component have dark mode
add tags and categories to admin panel
better role choice
