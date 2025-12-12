# Archived Migrations

These migrations were duplicates that have already been run in the database.
They are kept here for reference only and should NOT be run again.

## Duplicate Migrations Archived

### Security Fields to Users
- `2025_12_11_100000_add_security_fields_to_users.php`
  - Superseded by: `2025_12_12_000001_add_security_fields_to_users.php`
  - Reason: Duplicate migration with idempotent checks

### Activity Logs Table
- `2025_12_11_100100_create_activity_logs_table.php`
  - Superseded by: `2025_12_12_000002_create_activity_logs_table.php`
  - Reason: Duplicate migration, newer version has additional indexes

## Note

These files were moved here on December 12, 2025, after both versions had already
been run in the database. The newer versions (2025_12_12_*) included idempotent
checks (`Schema::hasColumn()` and `Schema::hasTable()`), so running both did not
cause database corruption.

The cleanup migration `2025_12_12_121619_cleanup_duplicate_migrations.php` was
created to document this situation.
