# Quick Reference Guide

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `CODE_STRUCTURE.md` | Architecture and component reference |
| `DOCUMENTATION.md` | JSDoc/PHPDoc guide and standards |
| `ENVIRONMENT.md` | Environment variables setup |
| This file | Quick reference for common tasks |

## 🎯 Components Quick Reference

### Button
```jsx
<Button variant="primary|secondary|danger|ghost" size="sm|md|lg" loading={bool}>
  Click Me
</Button>
```

### Input
```jsx
<Input 
  label="Email" 
  value={email} 
  onChange={setEmail}
  error={errors.email}
  required
/>
```

### Alert
```jsx
<Alert type="error|success|warning|info" message="Error message" onClose={() => {}} />
```

### Card
```jsx
<Card title="Title" footer="Footer content">
  Card body content
</Card>
```

### Badge
```jsx
<Badge variant="primary|success|warning|error|purple" size="sm|md|lg">
  Label
</Badge>
```

### Loading
```jsx
// Spinner only
<LoadingSpinner size="sm|md|lg|xl" color="#3b82f6" />

// Full page loading
<LoadingPage message="Loading data..." />
```

### AuthLayout
```jsx
<AuthLayout
  title="Welcome Back"
  subtitle="Sign in to continue"
  footerText="Don't have an account?"
  footerLink="/register"
  footerLinkText="Sign up"
>
  <Card>{/* form content */}</Card>
</AuthLayout>
```

## 🪝 Hooks Quick Reference

### useForm
```javascript
const { values, errors, handleChange, handleBlur, validate, reset } = useForm(
  { email: '', password: '' },
  {
    email: {
      required: true,
      pattern: VALIDATION.EMAIL_PATTERN,
      patternMessage: 'Invalid email'
    },
    password: {
      required: true,
      minLength: VALIDATION.PASSWORD_MIN_LENGTH
    }
  }
);

// In input
<Input value={values.email} onChange={(v) => handleChange('email', v)} />

// On submit
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;
  // Make API call
};
```

### useAuth
```javascript
// Require authentication (redirects if not logged in)
const { user, loading } = useAuth();

if (loading) return <LoadingPage />;
// user is guaranteed to be present here

// Optional authentication (doesn't redirect)
const { user, loading } = useAuth(false);
```

### useRedirectIfAuthenticated
```javascript
// Use on login/register pages to redirect if already logged in
const { checking } = useRedirectIfAuthenticated();

if (checking) return <LoadingPage />;
// Show login form
```

### useAsync
```javascript
const { execute, loading, error, data, reset } = useAsync(
  async (id) => {
    const res = await fetch(`/api/items/${id}`);
    return res.json();
  },
  {
    onSuccess: (data) => console.log('Success!', data),
    onError: (err) => console.error('Error!', err)
  }
);

// Call function
await execute(123);

// Check state
if (loading) return <LoadingSpinner />;
if (error) return <Alert type="error" message={error.message} />;
```

### useDebounce
```javascript
import { useDebounce } from '@/hooks/useAsync';

const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 500);

useEffect(() => {
  // This only runs 500ms after user stops typing
  if (debouncedSearch) {
    performSearch(debouncedSearch);
  }
}, [debouncedSearch]);
```

### useTheme
```javascript
const { theme, toggleTheme } = useTheme();

<button onClick={toggleTheme}>
  {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
</button>
```

## 🛠️ Utilities Quick Reference

### API Client
```javascript
import { getCsrf, login, register, logout, getUser } from '@/lib/api';

// Before first request
await getCsrf();

// Login
const res = await login('user@example.com', 'password');
const user = await res.json();

// Register
const res = await register('John Doe', 'john@example.com', 'pass123', 'pass123');

// Get current user
const res = await getUser();
if (res.ok) {
  const user = await res.json();
}

// Logout
await logout();
```

### Error Handling
```javascript
import { ApiError, parseValidationErrors } from '@/lib/errors';

try {
  const res = await login(email, password);
  // Success
} catch (err) {
  if (err instanceof ApiError) {
    if (err.status === 422) {
      // Validation errors
      const errors = parseValidationErrors(err);
      setErrors(errors); // { email: 'Email is required' }
    } else {
      setError(err.message);
    }
  }
}
```

### Utility Functions
```javascript
import { 
  formatDate, 
  formatRelativeTime, 
  truncate, 
  capitalize,
  formatNumber,
  getInitials,
  sleep,
  isEmpty,
  deepClone,
  groupBy
} from '@/lib/utils';

formatDate(new Date()); // "Dec 8, 2025"
formatRelativeTime(date); // "2 hours ago"
truncate('Long text...', 10); // "Long text..."
capitalize('hello world'); // "Hello World"
formatNumber(1234567); // "1,234,567"
getInitials('John Doe'); // "JD"
await sleep(1000); // Wait 1 second
isEmpty({}); // true
deepClone(obj); // Deep copy
groupBy(users, 'role'); // { admin: [...], user: [...] }
```

### Constants
```javascript
import { 
  API_BASE_URL, 
  ROUTES, 
  API_ENDPOINTS, 
  VALIDATION,
  UI,
  THEME,
  STORAGE_KEYS
} from '@/lib/constants';

// Navigate
router.push(ROUTES.DASHBOARD);

// Validate
if (!VALIDATION.EMAIL_PATTERN.test(email)) { ... }

// Theme
localStorage.setItem(STORAGE_KEYS.THEME, THEME.DARK);
```

### Shared Styles
```javascript
import { styles, transition } from '@/lib/styles';

<div style={styles.pageContainer}>
  <h1 style={styles.pageTitle}>Welcome</h1>
  <p style={styles.pageSubtitle}>Subtitle</p>
</div>

<div style={{ ...styles.flexCenter, gap: 10 }}>
  Centered content
</div>
```

## 🎨 Theme System

### Using CSS Variables
```jsx
<div style={{ 
  color: 'var(--text-primary)',
  background: 'var(--card-bg)',
  border: '1px solid var(--border-color)'
}}>
```

### Available CSS Variables
```css
/* Light/Dark mode automatically applied */
--text-primary
--text-secondary
--text-tertiary
--bg-primary
--bg-secondary
--bg-tertiary
--card-bg
--border-color
--accent-primary
--accent-hover
--shadow-sm
--shadow-md
--shadow-lg
```

## 📋 Common Patterns

### Protected Page
```javascript
export default function ProtectedPage() {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingPage />;
  
  return (
    <Layout>
      <h1>Welcome, {user.name}!</h1>
    </Layout>
  );
}
```

### Form with Validation
```javascript
export default function FormPage() {
  const { values, errors, handleChange, validate, setFieldError } = useForm(
    { email: '', password: '' },
    {
      email: { required: true, pattern: VALIDATION.EMAIL_PATTERN },
      password: { required: true, minLength: 8 }
    }
  );
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      const res = await someApiCall(values);
      // Success
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const errors = parseValidationErrors(err);
        Object.keys(errors).forEach(field => {
          setFieldError(field, errors[field]);
        });
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <Input 
        label="Email"
        value={values.email}
        onChange={(v) => handleChange('email', v)}
        error={errors.email}
        required
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### Async Data Fetching
```javascript
export default function DataPage() {
  const fetchData = async (id) => {
    const res = await fetch(`/api/data/${id}`);
    return res.json();
  };
  
  const { execute, loading, error, data } = useAsync(fetchData);
  
  useEffect(() => {
    execute(1);
  }, []);
  
  if (loading) return <LoadingPage />;
  if (error) return <Alert type="error" message={error.message} />;
  
  return <div>{data.title}</div>;
}
```

## 🔍 IDE Autocomplete

All components, hooks, and utilities have full JSDoc documentation. Your IDE will show:
- ✅ Parameter types and descriptions
- ✅ Return types
- ✅ Usage examples
- ✅ Available variants/options

Just hover over any import or function call!

## 📖 More Information

- Full architecture: `CODE_STRUCTURE.md`
- Documentation guide: `DOCUMENTATION.md`
- Environment setup: `ENVIRONMENT.md`
- Component examples: `components/*.js` (read the JSDoc comments)
