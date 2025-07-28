# Testing Guide

This document provides an overview of the testing setup and practices for the Real Estate Website project.

## Testing Framework

The project uses **Jest** as the testing framework along with **React Testing Library** for component testing.

### Dependencies

- `jest`: JavaScript testing framework
- `@testing-library/react`: Testing utilities for React components
- `@testing-library/jest-dom`: Custom Jest matchers for DOM elements
- `@testing-library/user-event`: User interaction utilities
- `jest-environment-jsdom`: DOM environment for testing
- `whatwg-fetch`: Fetch API polyfill for tests

## Configuration

### Jest Configuration (`jest.config.js`)

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/lib/mock-data.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
}

module.exports = createJestConfig(customJestConfig)
```

### Test Setup (`jest.setup.js`)

Global mocks and configurations including:
- Testing library matchers
- Fetch API polyfill
- Environment variables
- Console methods mocking
- Window location mocking

## Available Scripts

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Structure

### Directory Structure

```
src/
├── components/
│   ├── __tests__/
│   │   ├── SearchBar.test.tsx
│   │   └── Pagination.test.tsx
│   └── ...
├── lib/
│   ├── __tests__/
│   │   └── api.test.ts
│   └── ...
└── app/
    └── api/
        └── properties/
            └── __tests__/
                └── route.test.ts
```

## Test Categories

### 1. Component Tests

Located in `src/components/__tests__/`

**SearchBar Component Tests:**
- Renders with default and custom props
- Handles user input and form submission
- Shows/hides clear button dynamically
- Calls callback functions correctly
- Applies custom CSS classes

**Pagination Component Tests:**
- Renders pagination controls
- Handles page navigation
- Manages items per page selection
- Disables buttons appropriately
- Shows correct item ranges
- Handles ellipsis for large page ranges

### 2. API Client Tests

Located in `src/lib/__tests__/`

**API Client Tests:**
- Authentication endpoints (login, register, logout)
- Property CRUD operations
- Error handling (network errors, invalid JSON, server errors)
- Request/response formatting
- File upload functionality

### 3. API Route Logic Tests

Located in `src/app/api/properties/__tests__/`

**Properties API Route Tests:**
- Database operation validation
- Authentication and authorization logic
- Data validation and transformation
- Query parameter processing
- Response formatting
- Error handling

## Testing Best Practices

### 1. Test Naming Convention

```javascript
describe('ComponentName', () => {
  describe('when condition', () => {
    it('should do something specific', () => {
      // Test implementation
    })
  })
})
```

### 2. Component Testing Patterns

```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Component from '../Component'

describe('Component', () => {
  const mockCallback = jest.fn()

  beforeEach(() => {
    mockCallback.mockClear()
  })

  it('should render correctly', () => {
    render(<Component onCallback={mockCallback} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle user interactions', async () => {
    const user = userEvent.setup()
    render(<Component onCallback={mockCallback} />)
    
    await user.click(screen.getByRole('button'))
    expect(mockCallback).toHaveBeenCalled()
  })
})
```

### 3. API Testing Patterns

```javascript
import { api } from '../api'

// Mock fetch globally
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('should make correct API calls', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'test' }),
    } as Response)

    const result = await api.getData()
    
    expect(mockFetch).toHaveBeenCalledWith(
      'expected-url',
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
    )
    expect(result).toEqual({ data: { data: 'test' } })
  })
})
```

### 4. Mocking Strategies

- **External APIs**: Mock at the fetch level
- **Database**: Mock Prisma client methods
- **Authentication**: Mock auth utility functions
- **File System**: Mock file operations
- **Environment**: Set test-specific environment variables

## Coverage Goals

Current coverage targets:
- **Statements**: > 80%
- **Branches**: > 80%
- **Functions**: > 80%
- **Lines**: > 80%

### Coverage Report

Run `npm run test:coverage` to generate detailed coverage reports:
- Terminal output for quick overview
- HTML report in `coverage/lcov-report/index.html`
- LCOV format for CI/CD integration

## Current Test Status

✅ **Completed:**
- Jest and React Testing Library setup
- Component tests for SearchBar and Pagination
- API client comprehensive testing
- API route logic testing
- Test configuration and scripts

📊 **Coverage:**
- Components: 7.05% (focus areas: SearchBar 100%, Pagination 90.32%)
- Library: 14.23% (focus area: API client 53.94%)
- Overall: 2.72% (due to many untested Next.js pages)

## Future Testing Priorities

1. **High Priority:**
   - Authentication components and flows
   - Property listing and detail components
   - Admin dashboard components
   - Form validation components

2. **Medium Priority:**
   - API route handlers (full integration tests)
   - Database utility functions
   - Email service functions

3. **Low Priority:**
   - Static pages and layouts
   - Styling and presentation components
   - Mock data utilities

## Running Tests in Development

### Watch Mode
```bash
npm run test:watch
```

### Specific Test Files
```bash
npm test -- SearchBar.test.tsx
npm test -- --testPathPattern=components
```

### Debug Mode
```bash
npm test -- --verbose
npm test -- --no-cache
```

## Continuous Integration

The testing setup is ready for CI/CD integration with:
- Standardized exit codes
- JUnit XML output capability
- Coverage thresholds enforcement
- Parallel test execution support

## Troubleshooting

### Common Issues

1. **JSX/TSX Import Errors**: Ensure `@types/react` is installed
2. **Module Resolution**: Check `moduleNameMapper` in Jest config
3. **Async Test Timeouts**: Increase timeout or check for unresolved promises
4. **Mock Issues**: Verify mocks are cleared between tests

### Debug Tips

- Use `screen.debug()` to see rendered DOM
- Add `console.log` statements in tests (they'll be captured)
- Use `--verbose` flag for detailed test output
- Check `coverage/lcov-report/` for detailed coverage analysis

This testing setup provides a solid foundation for maintaining code quality and catching regressions in the real estate platform.