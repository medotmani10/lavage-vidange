# Testing Guide - Lavage & Vidange ERP 2026

## Overview

This guide covers the testing strategy, setup, and best practices for the Lavage & Vidange ERP system.

## Testing Stack

- **Test Runner**: Vitest (Vite-native, fast)
- **Testing Library**: @testing-library/react
- **DOM Environment**: jsdom / happy-dom
- **Coverage**: v8 (built-in to Vitest)
- **UI**: @vitest/ui (optional visual interface)

## Test Structure

```
src/
├── test/
│   ├── setup.ts              # Global test setup & mocks
│   ├── components/           # Component tests
│   │   ├── Button.test.tsx
│   │   ├── Card.test.tsx
│   │   └── Input.test.tsx
│   ├── pages/                # Page tests
│   │   ├── Dashboard.test.tsx
│   │   └── Login.test.tsx
│   ├── stores/               # Store tests
│   │   └── useAuthStore.test.ts
│   └── utils/                # Utility tests
│       └── helpers.test.ts
├── components/
├── pages/
└── ...
```

## Running Tests

### Basic Commands

```bash
# Run tests in watch mode (development)
npm test

# Run tests once (CI/CD)
npm run test:run

# Run with coverage report
npm run test:coverage

# Open visual UI
npm run test:ui

# Run specific test file
npm test Button.test.tsx

# Run tests matching pattern
npm test -t "Button"
```

### Vitest Configuration

See `vitest.config.ts`:

```typescript
{
  test: {
    globals: true,           // Global test APIs (describe, it, expect)
    environment: 'jsdom',    // Browser-like environment
    setupFiles: './src/test/setup.ts',
    css: true,               // Process CSS
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
}
```

## Writing Tests

### Component Testing

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByText('Loading')).toBeDisabled();
  });
});
```

### Testing with User Events

```typescript
import { userEvent } from '@testing-library/user-event';

it('handles user input', async () => {
  const user = userEvent.setup();
  render(<Input placeholder="Enter name" />);
  
  const input = screen.getByPlaceholderText('Enter name');
  await user.type(input, 'John Doe');
  
  expect(input).toHaveValue('John Doe');
});
```

### Testing Async Operations

```typescript
it('fetches and displays data', async () => {
  render(<Customers />);
  
  // Wait for data to load
  const customerName = await screen.findByText('John Doe');
  expect(customerName).toBeInTheDocument();
});

// Or with waitFor
import { waitFor } from '@testing-library/react';

it('updates after async operation', async () => {
  fireEvent.click(screen.getByText('Save'));
  
  await waitFor(() => {
    expect(screen.getByText('Saved!')).toBeInTheDocument();
  });
});
```

### Testing Custom Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../stores/useAuthStore';

it('updates auth state', () => {
  const { result } = renderHook(() => useAuthStore());
  
  act(() => {
    result.current.setUser({ id: '1', email: 'test@test.com' });
  });
  
  expect(result.current.user).toEqual({ id: '1', email: 'test@test.com' });
});
```

## Mocking

### Supabase Mock

Already configured in `setup.ts`:

```typescript
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
    })),
  },
}));
```

### Custom Mocks

```typescript
// In test file
vi.mock('../lib/supabase', async () => {
  const actual = await vi.importActual('../lib/supabase');
  return {
    ...actual,
    supabase: {
      ...actual.supabase,
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        }),
      }),
    },
  };
});
```

## Test Coverage

### Generate Coverage Report

```bash
npm run test:coverage
```

### Coverage Targets

Configure in `vitest.config.ts`:

```typescript
coverage: {
  thresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}
```

### View HTML Report

```bash
# Open coverage/index.html in browser
open coverage/index.html
```

## Testing Best Practices

### 1. Test User Behavior, Not Implementation

```typescript
// ❌ Bad - Testing implementation
expect(component.state.isOpen).toBe(true);

// ✅ Good - Testing behavior
expect(screen.getByText('Modal Title')).toBeInTheDocument();
```

### 2. Use Proper Queries (in order of preference)

1. `getByRole` - Most accessible
2. `getByLabelText` - For form fields
3. `getByPlaceholderText` - For inputs
4. `getByText` - For non-interactive elements
5. `getByTestId` - Last resort

```typescript
// ✅ Best
screen.getByRole('button', { name: 'Submit' });

// ✅ Good
screen.getByLabelText('Email');

// ✅ Acceptable
screen.getByTestId('submit-button');
```

### 3. Test Accessibility

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('is accessible', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 4. Mock External Dependencies

```typescript
// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr' },
  }),
}));

// Mock Zustand stores
vi.mock('../stores/useAuthStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
  })),
}));
```

### 5. Clean Up After Tests

```typescript
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
```

## Test Examples

### Page Component Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Login } from '../pages/Login';

describe('Login Page', () => {
  it('renders login form', () => {
    render(<Login />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows error on failed login', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    await user.type(screen.getByLabelText(/email/i), 'wrong@email.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
```

### Store Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useQueueStore } from '../stores/useQueueStore';

describe('useQueueStore', () => {
  beforeEach(() => {
    useQueueStore.getState().clearTickets();
  });

  it('adds ticket to queue', () => {
    const { fetchTickets, createTicket } = useQueueStore.getState();
    
    // Note: This requires mocking the Supabase calls
    // See setup.ts for mock configuration
  });
});
```

## Continuous Integration

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:run
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Debugging Tests

### VS Code Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Vitest",
      "command": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "${relativeFile}"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Console Logging

```typescript
it('logs for debugging', () => {
  render(<Component />);
  
  // Debug entire DOM
  console.log(screen.debug());
  
  // Debug specific element
  console.log(screen.debug(screen.getByRole('button')));
});
```

## Performance Testing

### Measure Render Time

```typescript
import { render, screen } from '@testing-library/react';
import { measureRenderTime } from '@testing-library/react';

it('renders within time limit', () => {
  const { renderTime } = measureRenderTime(() => {
    render(<LargeComponent />);
  });
  
  expect(renderTime).toBeLessThan(100); // ms
});
```

## Common Issues

### Issue: "Cannot find module"

**Solution**: Ensure proper path aliases in `vitest.config.ts`:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

### Issue: "window is not defined"

**Solution**: Use `vi.stubGlobal()` or ensure jsdom environment:

```typescript
// In vitest.config.ts
environment: 'jsdom',
```

### Issue: Mock not working

**Solution**: Hoist mocks to top of file:

```typescript
vi.mock('../lib/supabase', () => ({
  // mock
}));

// Import after mock
import { supabase } from '../lib/supabase';
```

## Resources

- [Vitest Documentation](https://vitest.dev)
- [Testing Library](https://testing-library.com)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing)

---

**Happy Testing!** 🧪
