# Error Handling and User Notifications

This document covers the error handling and user notification systems implemented in the frontend application.

## Table of Contents

- [ErrorBoundary Component](#errorboundary-component)
- [Toast Notification System](#toast-notification-system)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

---

## ErrorBoundary Component

The ErrorBoundary component catches JavaScript errors anywhere in the child component tree and displays a fallback UI instead of crashing the entire application.

### Location

`frontend/components/ErrorBoundary.tsx`

### Features

- **Catches React errors**: Prevents the entire app from crashing when a component throws an error
- **Development mode details**: Shows full error stack traces in development for debugging
- **Production-ready fallback**: Displays user-friendly error message in production
- **Recovery actions**: Provides "Try Again" and "Go to Homepage" buttons
- **Custom error handling**: Supports optional `onError` callback for logging to services like Sentry

### Implementation

The ErrorBoundary is already wrapping the entire application in `pages/_app.tsx`:

```typescript
import ErrorBoundary from '../components/ErrorBoundary';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {/* ... rest of app */}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

### Props

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;  // Custom fallback UI (optional)
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;  // Error handler (optional)
}
```

### Using ErrorBoundary with Custom Fallback

```typescript
import ErrorBoundary from '../components/ErrorBoundary';

function MyComponent() {
  return (
    <ErrorBoundary
      fallback={
        <div style={{ padding: 20, textAlign: 'center' }}>
          <h2>Something went wrong with this feature</h2>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      }
      onError={(error, errorInfo) => {
        // Send to error tracking service
        console.error('Error caught:', error, errorInfo);
      }}
    >
      <SomeComponentThatMightThrow />
    </ErrorBoundary>
  );
}
```

### What ErrorBoundary Catches

✅ **Catches:**
- Errors during rendering
- Errors in lifecycle methods
- Errors in constructors of the whole tree below them

❌ **Does NOT catch:**
- Event handlers (use try/catch)
- Asynchronous code (setTimeout, promises)
- Server-side rendering errors
- Errors thrown in the error boundary itself

### Future Enhancement

The ErrorBoundary includes a TODO comment for integrating with error tracking services:

```typescript
// TODO: Send to error tracking service (Sentry, LogRocket, etc.)
// Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
```

To implement Sentry integration:

1. Install Sentry:
   ```bash
   npm install @sentry/nextjs
   ```

2. Update the `componentDidCatch` method:
   ```typescript
   import * as Sentry from '@sentry/nextjs';

   componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
     console.error('Error caught by ErrorBoundary:', error, errorInfo);

     // Send to Sentry
     Sentry.captureException(error, {
       contexts: {
         react: {
           componentStack: errorInfo.componentStack,
         },
       },
     });

     if (this.props.onError) {
       this.props.onError(error, errorInfo);
     }
   }
   ```

---

## Toast Notification System

The toast notification system provides non-blocking feedback to users about the success or failure of their actions.

### Location

- Toast Provider: `frontend/components/Toast.tsx`
- Hook: `useToast()` from `frontend/components/Toast.tsx`

### Features

- **Non-blocking notifications**: Appear as temporary overlays
- **Multiple types**: Success, error, warning, info
- **Auto-dismiss**: Automatically disappear after a timeout
- **Custom messages**: Support for dynamic content with emojis
- **Stack management**: Multiple toasts can appear simultaneously

### Usage

#### 1. Import the hook

```typescript
import { useToast } from '../components/Toast';
```

#### 2. Get the `addToast` function

```typescript
function MyComponent() {
  const { addToast } = useToast();

  // ... component code
}
```

#### 3. Call `addToast` to show notifications

```typescript
// Success toast
addToast('Operation completed successfully! 🎉', 'success');

// Error toast
addToast('Failed to save changes', 'error');

// Warning toast
addToast('This action cannot be undone', 'warning');

// Info toast
addToast('New feature available!', 'info');
```

### Toast Types

| Type | Use Case | Default Color |
|------|----------|---------------|
| `success` | Successful operations | Green |
| `error` | Failed operations, validation errors | Red |
| `warning` | Cautionary messages | Yellow/Orange |
| `info` | General information | Blue |

### Implementation Examples

#### Journal Entry Creation (JournalSection.tsx)

```typescript
const handleSubmit = async (data: JournalCreatePayload): Promise<void> => {
  // Validation
  if (!data.title.trim()) {
    addToast('Title is required', 'error');
    return;
  }

  try {
    await createEntry(data);
    addToast(`Journal entry created! +${data.xp} XP earned! 🎉`, 'success');
  } catch (err: unknown) {
    const message = (err && typeof err === 'object' && 'message' in err)
      ? String(err.message)
      : 'Failed to create entry. Please try again.';
    addToast(message, 'error');
  }
};
```

#### Tool Form Submission (ToolForm.tsx)

```typescript
const onSubmit = async (values: ToolCreatePayload) => {
  try {
    const data = await createTool(values);

    const files = fileRef.current?.files;
    if (files && files.length > 0) {
      await uploadToolScreenshots(data.id, Array.from(files));
      addToast(`Tool created with ${files.length} screenshot(s)!`, 'success');
    } else {
      addToast('Tool created successfully! 🎉', 'success');
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save';
    addToast(message, 'error');
  }
};
```

---

## Usage Examples

### Example 1: Form Validation with Toast

```typescript
import { useToast } from '../components/Toast';

function SignupForm() {
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email.includes('@')) {
      addToast('Please enter a valid email address', 'error');
      return;
    }

    if (password.length < 8) {
      addToast('Password must be at least 8 characters', 'error');
      return;
    }

    try {
      await signupUser({ email, password });
      addToast('Account created successfully! Welcome! 🎉', 'success');
    } catch (err) {
      addToast('Failed to create account. Please try again.', 'error');
    }
  };

  return (/* form JSX */);
}
```

### Example 2: Delete Confirmation with Toast

```typescript
import { useToast } from '../components/Toast';

function ItemList() {
  const { addToast } = useToast();

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await deleteItem(id);
      addToast('Item deleted successfully', 'success');
    } catch (err) {
      addToast('Failed to delete item', 'error');
    }
  };

  return (/* list JSX */);
}
```

### Example 3: API Request with Loading State

```typescript
import { useState } from 'react';
import { useToast } from '../components/Toast';

function DataFetcher() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    addToast('Loading data...', 'info');

    try {
      const data = await api.fetchData();
      addToast('Data loaded successfully!', 'success');
      return data;
    } catch (err) {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (/* component JSX */);
}
```

### Example 4: Wrapping a Risky Component with ErrorBoundary

```typescript
import ErrorBoundary from '../components/ErrorBoundary';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Wrap potentially unstable components */}
      <ErrorBoundary
        fallback={
          <div className="error-widget">
            <p>Unable to load stats widget</p>
          </div>
        }
      >
        <StatsWidget />
      </ErrorBoundary>

      <ErrorBoundary>
        <ChartWidget />
      </ErrorBoundary>
    </div>
  );
}
```

---

## Best Practices

### Toast Notifications

#### ✅ DO:

- **Be specific**: "Journal entry created!" is better than "Success"
- **Use emojis sparingly**: Add personality but don't overuse (🎉 for celebrations, ⚠️ for warnings)
- **Provide context**: Include relevant details like XP earned, item count, etc.
- **Keep messages short**: Toasts auto-dismiss, so keep text concise
- **Handle all error cases**: Always show toast feedback for user actions

```typescript
// Good
addToast(`Tool created with ${files.length} screenshot(s)!`, 'success');
addToast('Failed to upload: File size too large', 'error');

// Bad
addToast('Success', 'success');
addToast('Error', 'error');
```

#### ❌ DON'T:

- Show toasts for every tiny interaction
- Use toasts for critical information that requires user acknowledgment (use modals instead)
- Show multiple toasts for the same action
- Use very long messages that get cut off

### Error Boundaries

#### ✅ DO:

- **Wrap at appropriate levels**: Wrap entire app, and individual risky features
- **Provide recovery actions**: Always give users a way to recover (reload, go home, try again)
- **Log errors in production**: Integrate with Sentry or similar service
- **Test error scenarios**: Deliberately throw errors in development to test boundaries
- **Show appropriate details**: Full stack traces in dev, user-friendly messages in production

```typescript
// Good - Wrapping a risky third-party component
<ErrorBoundary fallback={<WidgetFallback />}>
  <ThirdPartyWidget />
</ErrorBoundary>
```

#### ❌ DON'T:

- Rely on ErrorBoundary to catch async errors (use try/catch)
- Wrap every single component (too granular)
- Ignore errors silently without logging
- Show technical error messages to end users in production

### Combining Both

```typescript
function FeatureComponent() {
  const { addToast } = useToast();

  const handleRiskyAction = async () => {
    try {
      // Async operation (not caught by ErrorBoundary)
      const result = await riskyApiCall();
      addToast('Action completed successfully!', 'success');
    } catch (err) {
      // Handle async errors with toast
      addToast('Failed to complete action', 'error');
    }
  };

  return (
    // ErrorBoundary catches rendering errors
    <ErrorBoundary>
      <SomeComplexComponent onAction={handleRiskyAction} />
    </ErrorBoundary>
  );
}
```

---

## Current Implementations

The following components currently use toast notifications:

1. **JournalSection** (`frontend/components/JournalSection.tsx`):
   - ✅ Create entry success (with XP earned)
   - ✅ Delete entry success
   - ✅ Validation errors
   - ✅ API errors

2. **ToolForm** (`frontend/components/ToolForm.tsx`):
   - ✅ Tool create/update success
   - ✅ Screenshot upload with count
   - ✅ Form validation errors
   - ✅ API errors

The **ErrorBoundary** is currently wrapping:
- ✅ Entire application (`pages/_app.tsx`)

---

## Testing

### Testing Toast Notifications

1. Navigate to http://localhost:8200/dashboard
2. Create a journal entry - should see: "Journal entry created! +{xp} XP earned! 🎉"
3. Delete a journal entry - should see: "Journal entry deleted successfully"
4. Submit an empty form - should see validation error toasts

### Testing ErrorBoundary

To test the ErrorBoundary in development:

1. Create a component that throws an error:

```typescript
function BuggyComponent() {
  throw new Error('Test error - ErrorBoundary should catch this!');
  return <div>This won't render</div>;
}
```

2. Add it to a page:

```typescript
<ErrorBoundary>
  <BuggyComponent />
</ErrorBoundary>
```

3. Visit the page - you should see the error fallback UI with the error details (in development mode)

---

## Future Enhancements

### Toast System

- [ ] Add toast positioning options (top-right, bottom-left, etc.)
- [ ] Add custom duration per toast
- [ ] Add action buttons in toasts (Undo, Retry, etc.)
- [ ] Add toast animation customization
- [ ] Add toast queue management for many simultaneous toasts

### ErrorBoundary

- [x] Integrate with Sentry for error tracking
- [ ] Add error retry mechanisms
- [ ] Add error recovery suggestions based on error type
- [ ] Add user feedback form in error UI
- [ ] Track error frequency and patterns

---

## Related Documentation

- [Component Architecture](./ARCHITECTURE.md) - Frontend architecture patterns
- [Component Refactoring](./COMPONENT_REFACTORING_COMPLETE.md) - Refactoring guidelines
- [Toast Component Source](./components/Toast.tsx) - Toast implementation
- [ErrorBoundary Source](./components/ErrorBoundary.tsx) - ErrorBoundary implementation

---

**Last Updated**: 2025-12-12
**Status**: ✅ Implemented and Active
