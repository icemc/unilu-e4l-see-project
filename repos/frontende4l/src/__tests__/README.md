# Frontend Tests

This directory contains unit tests and integration tests for the E4L frontend application.

## Test Structure

```
src/__tests__/
├── unit/                  # Unit tests for Redux actions, reducers, and utilities
│   ├── navAction.test.js
│   ├── navReducer.test.js
│   └── userReducer.test.js
└── integration/           # Integration tests for React components
    ├── footer.test.js
    ├── NavBar.test.js
    └── verticalSpace.test.js
```

## Running Tests

### Install dependencies
```bash
npm install
```

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run only unit tests
```bash
npm run test:unit
```

### Run only integration tests
```bash
npm run test:integration
```

### Run tests for CI/CD
```bash
# Unit tests with coverage and JUnit reports
npm run test:unit:ci

# Integration tests with coverage and JUnit reports
npm run test:integration:ci
```

## Test Coverage

Tests generate coverage reports in the `coverage/` directory:
- `coverage/lcov-report/index.html` - HTML coverage report
- `coverage/junit-*.xml` - JUnit XML reports for CI/CD

## Unit Tests

Unit tests focus on testing individual functions, actions, and reducers in isolation:

### navAction.test.js
- Tests all navigation action creators
- Verifies correct action types and payloads

### navReducer.test.js  
- Tests navigation state management
- Verifies state immutability
- Tests all action types

### userReducer.test.js
- Tests user authentication state
- Tests authentication request states
- Verifies error handling

## Integration Tests

Integration tests verify that components work correctly with Redux store and React Router:

### footer.test.js
- Tests Footer component rendering
- Verifies copyright year display
- Tests privacy notice link
- Tests external links

### verticalSpace.test.js
- Tests spacing component rendering
- Verifies dynamic height calculation
- Tests various height values

### NavBar.test.js
- Tests NavBar with Redux integration
- Tests authenticated vs unauthenticated states
- Verifies theme switching
- Tests component with different store states

## Technologies Used

- **Jest**: Test runner and assertion library
- **React Testing Library**: Testing utilities for React components
- **@testing-library/jest-dom**: Custom Jest matchers
- **babel-jest**: Babel transformer for Jest

## CI/CD Integration

Tests are automatically run in the GitLab CI/CD pipeline:

1. **Build stage**: Builds the application
2. **Test stage**: 
   - Runs unit tests
   - Runs integration tests (after unit tests pass)
3. **Docker build stage**: Builds Docker image (after tests pass)
4. **Deploy stages**: Deploys to staging/production

Test results are reported in JUnit format and coverage is tracked.

## Writing New Tests

### Unit Test Example
```javascript
import myReducer from '../../reducer/myReducer';

describe('myReducer', () => {
  test('should handle MY_ACTION', () => {
    const action = { type: 'MY_ACTION' };
    const result = myReducer(initialState, action);
    expect(result.someProperty).toBe('expectedValue');
  });
});
```

### Integration Test Example
```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';
import MyComponent from '../../container/MyComponent';

describe('MyComponent', () => {
  test('should render component', () => {
    render(<MyComponent />);
    expect(screen.getByText('Some Text')).toBeInTheDocument();
  });
});
```

## Best Practices

1. **Isolation**: Unit tests should test one thing at a time
2. **Mocking**: Mock external dependencies and API calls
3. **Coverage**: Aim for high test coverage of critical paths
4. **Descriptive Names**: Use clear, descriptive test names
5. **Arrange-Act-Assert**: Follow the AAA pattern in tests
