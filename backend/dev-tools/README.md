# Development Tools

This directory contains development and testing scripts that are not part of the production application.

## Scripts Directory

### Authentication & 2FA Testing
- `create_test_user.php` - Create test users for development
- `enable_user_2fa.php` - Enable 2FA for testing users
- `generate_totp.php` - Generate TOTP codes for testing
- `auto_2fa_test.sh` - Automated 2FA testing script
- `qr_test.php` - Test QR code generation
- `send_email_challenge.php` - Test email 2FA challenges

### Permission Management
- `grant_owner.php` - Grant owner role to users for testing

### Activity Logging
- `show_activity.php` - View activity logs (Eloquent)
- `show_activity_pdo.php` - View activity logs (PDO)
- `log_activity_test.php` - Test activity logging
- `migrate_activity_logs.php` - Migration utility for activity logs

## Usage

These scripts should only be used in development or testing environments.

**Run from the backend directory:**
```bash
docker compose exec php_fpm php dev-tools/scripts/script_name.php
```

**Or from the host:**
```bash
cd backend
php dev-tools/scripts/script_name.php
```

## Security Notice

⚠️ **Do not use these scripts in production environments.**

These tools may:
- Create users with weak passwords
- Bypass normal security checks
- Modify data directly
- Expose sensitive information

Make sure these directories are excluded from production deployments.
