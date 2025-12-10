# Frontend Code Structure

## Architecture Overview

This Next.js frontend follows best practices for maintainability, reusability, and type safety.

**Key Features:**
- 📦 Component-based architecture with reusable UI library
- 🔄 Custom hooks for logic reuse
- 📝 **Full JSDoc documentation** for all APIs
- 🎨 Theme system with dark/light modes
- ⚡ Optimized for developer experience with IDE autocomplete

> **Note:** All components, hooks, and utilities are fully documented with JSDoc. See [DOCUMENTATION.md](../../DOCUMENTATION.md) for the complete documentation guide.

## Directory Structure

```
frontend/
├── components/       # Reusable UI components
│   ├── Alert.js     # Alert/notification component
│   ├── Badge.js     # Colored badge component
│   ├── Button.js    # Reusable button with loading states
│   ├── Card.js      # Card container component
│   ├── Input.js     # Form input with validation display
│   ├── Layout.js    # Page layout wrapper
│   └── Toast.js     # Toast notification system
├── context/         # React context providers
│   └── ThemeContext.js  # Dark/light theme management
├── hooks/           # Custom React hooks
│   └── useForm.js   # Form state and validation hook
├── lib/             # Utility functions and configurations
│   ├── api.js       # API client functions
│   ├── constants.js # Shared constants
│   └── errors.js    # Error handling utilities
├── pages/           # Next.js pages (file-based routing)
│   ├── _app.js      # App wrapper with providers
│   ├── index.js     # Home page
│   ├── login.js     # Login page
│   ├── register.js  # Registration page
│   └── dashboard.js # User dashboard
└── styles/          # Global styles
    └── globals.css  # CSS variables and themes
```

## Component Guidelines

### Button Component
- **Variants**: primary, secondary, danger, ghost
- **Sizes**: sm, md, lg
- **Features**: Loading states, disabled states, full width option

```jsx
<Button 
  variant="primary" 
  size="lg" 
  loading={isLoading}
  fullWidth
>
  Submit
</Button>
```

### Input Component
- Consistent styling across forms
- Built-in error display
- Helper text support
- Required field indicator

```jsx
<Input
  label="Email"
  type="email"
  value={email}
  onChange={setValue}
  error={errors.email}
  required
  helperText="We'll never share your email"
/>
```

### Alert Component
- **Types**: success, error, warning, info
- Dismissible option
- Icon included automatically

```jsx
<Alert 
  type="error" 
  message="Login failed" 
  onClose={() => setError(null)} 
/>
```

## Custom Hooks

### useForm Hook
Manages form state, validation, and errors.

```jsx
const { values, errors, handleChange, validate } = useForm(
  { email: '', password: '' },
  {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: 'Invalid email format'
    },
    password: {
      required: true,
      minLength: 8
    }
  }
);
```

**Validation Rules:**
- `required` - Field must have value
- `minLength` / `maxLength` - String length validation
- `pattern` - Regex validation
- `match` - Must match another field (e.g., password confirmation)
- `custom` - Custom validation function

## API Client

All API calls go through `lib/api.js` which provides:
- Automatic CSRF token handling
- Consistent error handling
- Credential management

```jsx
import { login, register, logout, getUser } from '../lib/api';

try {
  await getCsrf();
  await login(email, password);
  router.push('/dashboard');
} catch (error) {
  // Handle ApiError
}
```

> **Important:** Always use the centralized API client in `lib/api.js` for backend requests. Do not call `fetch()` directly for `/api/*` endpoints — use the helpers (`getCsrf`, `login`, `getUser`, `getTools`, `getCategories`, `getRoles`, etc.) or `fetchWithAuth` exported by the module. This ensures consistent `credentials: 'include'`, proper `Accept: application/json` headers, and CSRF/XSRF handling required by Laravel Sanctum.


## Constants

Centralized configuration in `lib/constants.js`:
- API endpoints
- Routes
- Validation rules
- UI constants

```jsx
import { API_ENDPOINTS, VALIDATION, ROUTES } from '../lib/constants';
```

## Error Handling

Custom error classes and utilities in `lib/errors.js`:
- `ApiError` - Structured API errors
- `handleApiError` - Standardized error handling
- `parseValidationErrors` - Laravel validation error parsing

## Theme System

Dark/light mode managed through:
- CSS variables in `styles/globals.css`
- `ThemeContext` provider
- `useTheme` hook

```jsx
const { theme, toggleTheme } = useTheme();
```

## Best Practices

1. **DRY (Don't Repeat Yourself)**
   - Reuse components (Input, Button, Alert)
   - Extract common logic into hooks
   - Centralize constants

2. **Consistent Error Handling**
   - Always use try/catch with API calls
   - Display user-friendly error messages
   - Log errors for debugging

3. **Form Validation**
   - Client-side validation for UX
   - Server-side validation for security
   - Display errors inline

4. **Loading States**
   - Show spinners during async operations
   - Disable inputs during loading
   - Provide feedback to users

5. **Accessibility**
   - Required field indicators
   - Proper label associations
   - Error messages linked to inputs

6. **Code Organization**
   - Keep components small and focused
   - Separate business logic from UI
   - Use meaningful variable names

## Adding New Pages

1. Create page file in `pages/`
2. Import Layout, Card, and form components
3. Use `useForm` hook for form management
4. Import API functions from `lib/api.js`
5. Handle loading and error states
6. Add route to `lib/constants.js`

Example:
```jsx
import { useState } from 'react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useForm } from '../hooks/useForm';

export default function MyPage() {
  const [loading, setLoading] = useState(false);
  const { values, errors, handleChange, validate } = useForm(/* ... */);
  
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // API call
  }
  
  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <Input /* ... */ />
        <Button loading={loading}>Submit</Button>
      </form>
    </Card>
  );
}
```

## Testing Checklist

- [ ] Form validation works (required fields, formats)
- [ ] Loading states display correctly
- [ ] Errors display and clear appropriately
- [ ] Dark mode styling works
- [ ] Mobile responsive
- [ ] Keyboard navigation works
- [ ] API errors handled gracefully
