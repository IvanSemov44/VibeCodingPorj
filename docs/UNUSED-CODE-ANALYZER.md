# Unused Code Analyzer

This project includes scripts to find unused code, files, and dependencies in both frontend and backend.

## Tools Installed

### Frontend
- **ts-prune**: Finds unused exports in TypeScript files
- **depcheck**: Finds unused dependencies in package.json
- **unimported**: Finds unused files in the project

### Backend
- **PHPStan**: Static analysis tool that can detect unused code (already installed)

## Available Scripts

### Run Both Frontend and Backend Analysis

From the **root directory**:

```bash
npm run find:unused
```

This runs both frontend and backend analyzers together.

### Frontend Only

From the **root directory**:
```bash
npm run find:frontend
```

Or from the **frontend directory**:
```bash
npm run find:unused              # Run all frontend analyzers
npm run find:unused-exports      # Find unused exports only
npm run find:unused-deps         # Find unused dependencies only
npm run find:unused-files        # Find unused files only
```

### Backend Only

From the **root directory**:
```bash
npm run find:backend
```

Or from the **backend directory**:
```bash
composer run find:unused
```

## Understanding the Output

### Frontend - ts-prune (Unused Exports)

Example output:
```
\components\Button.tsx:3 - ButtonVariant (used in module)
\lib\api.ts:8 - getCookie
```

- Lines without "(used in module)" are potentially unused exports
- Lines with "(used in module)" are used within the same file but not imported elsewhere
- Review these to determine if they should be removed or if they're part of your public API

### Frontend - depcheck (Unused Dependencies)

Shows dependencies listed in package.json that aren't imported anywhere in your code.

**Action**: Remove these from package.json to reduce bundle size.

### Frontend - unimported (Unused Files)

Lists files that exist in your project but are never imported.

**Action**: Review and consider deleting if they're not needed.

### Backend - PHPStan (Static Analysis)

Shows various code quality issues including:
- Unused private methods/properties
- Dead code
- Type errors
- Undefined variables

**Action**: Review and fix reported issues.

## Interpreting Results

Not everything flagged as "unused" should be deleted:

### Keep These:
- Public API exports (if you're building a library)
- Page components in Next.js (pages/\*.tsx)
- Entry points (\_app.tsx, index.tsx)
- Configuration files exports
- Type definitions used for documentation
- Utility functions you plan to use

### Consider Removing:
- Functions/components never imported anywhere
- Dead code from refactoring
- Experimental code no longer needed
- Dependencies in package.json not actually used
- Duplicate implementations

## Best Practices

1. **Review Before Deleting**: Don't blindly delete everything flagged as unused
2. **Run Tests**: After removing code, run your test suite to ensure nothing breaks
3. **Check Git History**: See why the code was added before removing it
4. **Run Regularly**: Add to your CI/CD pipeline to catch unused code early
5. **Team Review**: Discuss with your team before removing public APIs

## Adding to CI/CD

You can add this to your GitHub Actions or other CI tools:

```yaml
- name: Find unused code
  run: npm run find:unused
```

## Troubleshooting

### Backend script fails
If the backend script doesn't work:
- Ensure Docker containers are running: `docker compose up -d`
- Or use: `docker compose exec php_fpm composer run find:unused`

### Too many false positives
Adjust the tools' configuration files:
- **ts-prune**: Add a `.tsprunerc` file to ignore specific files
- **depcheck**: Create a `.depcheckrc` configuration
- **PHPStan**: Modify `phpstan.neon` to adjust strictness level

## Configuration Files

You can customize the behavior by creating:

**Frontend**:
- `.tsprunerc` - Configure ts-prune
- `.depcheckrc` - Configure depcheck
- `.unimportedrc.json` - Configure unimported

**Backend**:
- `phpstan.neon` - Already exists, adjust rules as needed

## Next Steps

To install composer-unused (additional tool for backend):

```bash
cd backend
composer require --dev icanhazstring/composer-unused
```

Then add to composer.json scripts:
```json
"find:unused-deps": "vendor/bin/composer-unused"
```
