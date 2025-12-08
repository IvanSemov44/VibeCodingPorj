# Documentation Guide

## Overview

This codebase uses **documentation-as-code** through JSDoc comments and PHPDoc annotations. All reusable components, hooks, utilities, and API functions are fully documented with type information, examples, and usage patterns.

## Benefits

✅ **IDE Autocomplete**: Get intelligent suggestions while coding  
✅ **Type Safety**: Catch errors before runtime with type hints  
✅ **Onboarding**: New developers can understand code quickly  
✅ **API Documentation**: Generate docs automatically from code  
✅ **Maintenance**: Clear contracts make refactoring safer  

## Frontend Documentation (JSDoc)

### Components

All React components include:
- Parameter descriptions with types
- Default values
- Return types
- Usage examples
- Variant/size options

**Example:**
```javascript
/**
 * Reusable button component with multiple variants and sizes
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {('primary'|'secondary'|'danger'|'ghost')} [props.variant='primary'] - Button style variant
 * @param {('sm'|'md'|'lg')} [props.size='md'] - Button size
 * @param {boolean} [props.loading=false] - Loading state with spinner
 * @returns {JSX.Element} Button component
 * @example
 * <Button variant="primary" size="lg" loading={isSubmitting}>
 *   Submit Form
 * </Button>
 */
export default function Button({ children, variant = 'primary', ... }) {
```

### Custom Hooks

Hooks document:
- Parameters and return values
- State management behavior
- Side effects
- Usage patterns

**Example:**
```javascript
/**
 * Custom hook for form state management and validation
 * @param {Object} initialValues - Initial form field values
 * @param {Object} [validationRules={}] - Validation rules for each field
 * @returns {Object} Form state and handlers
 * @returns {Object} return.values - Current form values
 * @returns {Object} return.errors - Validation errors
 * @returns {Function} return.handleChange - Change handler (field, value)
 * @example
 * const { values, errors, handleChange, validate } = useForm(
 *   { email: '', password: '' },
 *   { email: { required: true, pattern: EMAIL_PATTERN } }
 * );
 */
export function useForm(initialValues, validationRules = {}) {
```

### Utility Functions

Utilities include:
- Parameter types
- Return types
- Usage examples
- Edge cases

**Example:**
```javascript
/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|string|number} date - Date to format
 * @returns {string} Relative time string or formatted date if > 7 days
 * @example
 * formatRelativeTime(Date.now() - 60000) // "1 minute ago"
 * formatRelativeTime(Date.now() - 3600000) // "1 hour ago"
 */
export function formatRelativeTime(date) {
```

### API Client

API functions document:
- Request parameters
- Response types
- Error handling
- Authentication requirements

**Example:**
```javascript
/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Response>} Login response with user data
 * @throws {ApiError} If login fails with validation errors
 * @example
 * const res = await login('user@example.com', 'password123');
 * const user = await res.json();
 */
export async function login(email, password) {
```

## Backend Documentation (PHPDoc)

### Controllers

Controller methods include:
- Parameter types
- Return types
- Request body parameters
- Response examples
- HTTP status codes

**Example:**
```php
/**
 * Register a new user account
 *
 * @param Request $request
 * @return \Illuminate\Http\JsonResponse
 *
 * @throws \Illuminate\Validation\ValidationException
 *
 * @bodyParam name string required User's full name. Example: John Doe
 * @bodyParam email string required User's email address. Example: john@example.com
 * @bodyParam password string required Password (min 8 characters). Example: password123
 *
 * @response 201 {"id": 1, "name": "John Doe", "email": "john@example.com"}
 * @response 422 {"message": "Validation failed", "errors": {"email": ["Email taken"]}}
 */
public function register(Request $request)
{
```

## IDE Integration

### VS Code

Install the **JavaScript and TypeScript Nightly** extension for enhanced JSDoc support.

**Settings:**
```json
{
  "javascript.suggest.completeFunctionCalls": true,
  "javascript.inlayHints.parameterNames.enabled": "all",
  "typescript.suggest.completeFunctionCalls": true
}
```

### PhpStorm

PHPDoc is natively supported. Enable:
- **Settings → Editor → Inspections → PHP → PHPDoc**
- **Settings → Editor → Code Style → PHP → PHPDoc**

## Generating Documentation

### Frontend (JSDoc)

Install JSDoc:
```bash
npm install --save-dev jsdoc
```

Generate docs:
```bash
npx jsdoc -c frontend/jsdoc.json
```

Output: `frontend/docs/jsdoc/index.html`

### Backend (phpDocumentor)

Install phpDocumentor:
```bash
composer require --dev phpdocumentor/phpdocumentor
```

Generate docs:
```bash
./vendor/bin/phpdoc -d backend/app -t backend/docs
```

Output: `backend/docs/index.html`

## Documentation Standards

### Required for All Public APIs

- ✅ Components exported from `components/`
- ✅ Hooks exported from `hooks/`
- ✅ Utilities exported from `lib/`
- ✅ API functions in `lib/api.js`
- ✅ Controller methods in `app/Http/Controllers/`

### Optional for Internal Code

- ⚪ Private helper functions
- ⚪ Page components (unless reusable)
- ⚪ One-off utilities

### Documentation Checklist

When adding new code:

1. **Add JSDoc/PHPDoc block** above function/class
2. **Document all parameters** with types
3. **Document return value** with type
4. **Add at least one example** for complex APIs
5. **Note any side effects** or requirements
6. **Specify error conditions** with `@throws`

## Type Definitions

### Common JSDoc Types

```javascript
// Basic types
@param {string} name
@param {number} age
@param {boolean} isActive
@param {Array} items
@param {Object} config

// Complex types
@param {string[]} emails - Array of strings
@param {Object.<string, number>} scores - Object map
@param {('sm'|'md'|'lg')} size - Union type
@param {Function} callback - Callback function
@param {React.ReactNode} children - React children

// Optional with default
@param {string} [type='info'] - Optional with default
@param {Object} [options={}] - Optional object

// Return types
@returns {JSX.Element}
@returns {Promise<Response>}
@returns {Object} Return value description
@returns {void}
```

### Common PHPDoc Types

```php
@param string $name
@param int $age
@param bool $isActive
@param array $items
@param Request $request
@param User|null $user

@return \Illuminate\Http\JsonResponse
@return array<string, mixed>
@return void

@throws \Exception
@throws \Illuminate\Validation\ValidationException
```

## Examples by File Type

### Component Documentation
See: `frontend/components/Button.js`

### Hook Documentation
See: `frontend/hooks/useForm.js`

### Utility Documentation
See: `frontend/lib/utils.js`

### API Documentation
See: `frontend/lib/api.js`

### Controller Documentation
See: `backend/app/Http/Controllers/Api/AuthController.php`

## Resources

- [JSDoc Reference](https://jsdoc.app/)
- [PHPDoc Guide](https://docs.phpdoc.org/)
- [TypeScript JSDoc Support](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [React + JSDoc](https://react-typescript-cheatsheet.netlify.app/docs/advanced/jsdoc/)

## Maintenance

Documentation should be updated:
- ✅ When adding new parameters
- ✅ When changing return types
- ✅ When modifying behavior
- ✅ When adding new components/hooks/utilities
- ✅ During code reviews

Well-documented code is maintainable code! 📚
