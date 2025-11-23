# Testing Guide

This document provides comprehensive information about testing the browser-tools-playwright project.

## Table of Contents
1. [Overview](#overview)
2. [Setup](#setup)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Writing Tests](#writing-tests)
6. [Mocking](#mocking)
7. [Continuous Integration](#continuous-integration)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The project uses **Jest** as the testing framework with support for ESM (ES Modules). Tests are organized into three categories:

- **Unit Tests**: Test individual functions and modules in isolation
- **Integration Tests**: Test how multiple components work together
- **E2E Tests**: Test complete workflows using actual Chrome browser

### Test Coverage Goals

| Component | Target Coverage |
|-----------|----------------|
| shared/format.js | 100% |
| shared/browser.js | 90%+ |
| shared/platform.js | 80%+ |
| shared/pick-logic.js | 70%+ |
| Overall Project | 80%+ |

---

## Setup

### 1. Install Dependencies

```bash
npm install
```

This installs Jest and other testing dependencies defined in `package.json`.

### 2. Chrome Setup (for Integration/E2E Tests)

Integration and E2E tests require Chrome running with remote debugging:

```bash
node browser-start.js
```

This starts Chrome on port 9222. Keep it running while executing integration/E2E tests.

---

## Running Tests

### All Tests with Coverage

```bash
npm test
```

This runs all tests and generates a coverage report.

### Watch Mode

```bash
npm run test:watch
```

Re-runs tests automatically when files change. Useful during development.

### Unit Tests Only

```bash
npm run test:unit
```

Runs only unit tests (faster, no Chrome required).

### Integration Tests Only

```bash
npm run test:integration
```

Requires Chrome running on :9222.

### E2E Tests Only

```bash
npm run test:e2e
```

Runs end-to-end workflow tests. Requires Chrome running on :9222.

### Debug Mode

```bash
npm run test:debug
```

Runs tests in debug mode. You can then attach a debugger (e.g., Chrome DevTools) to `chrome://inspect`.

### Run Specific Test File

```bash
npx jest __tests__/unit/shared/format.test.js
```

### Run Tests Matching Pattern

```bash
npx jest --testNamePattern="printResult"
```

Runs only tests with names matching "printResult".

---

## Test Structure

```
__tests__/
├── unit/                       # Unit tests (no external dependencies)
│   ├── shared/
│   │   ├── browser.test.js     # Tests for shared/browser.js
│   │   ├── format.test.js      # Tests for shared/format.js
│   │   ├── pick-logic.test.js  # Tests for shared/pick-logic.js
│   │   └── platform.test.js    # Tests for shared/platform.js
│   └── tools/
│       └── browser-hn-scraper.test.js  # Tests for browser-hn-scraper.js
│
├── integration/                # Integration tests (require Chrome)
│   ├── browser-eval.test.js
│   ├── browser-nav.test.js
│   └── browser-screenshot.test.js
│
├── e2e/                        # End-to-end workflow tests
│   └── browser-workflow.test.js
│
├── mocks/                      # Mock objects and utilities
│   ├── playwright.mock.js
│   ├── child-process.mock.js
│   └── fetch.mock.js
│
├── fixtures/                   # Test data and HTML files
│   ├── sample.html
│   └── mock-responses.json
│
└── setup.js                    # Global test setup
```

---

## Writing Tests

### Unit Test Example

```javascript
import { jest } from '@jest/globals';
import { printResult } from '../../../shared/format.js';

describe('printResult', () => {
	let consoleLogSpy;

	beforeEach(() => {
		consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test('prints primitive number', () => {
		printResult(42);
		expect(consoleLogSpy).toHaveBeenCalledWith(42);
	});

	test('prints object as key-value pairs', () => {
		printResult({ name: 'John', age: 30 });
		expect(consoleLogSpy).toHaveBeenCalledTimes(2);
		expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 'name: John');
		expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 'age: 30');
	});
});
```

### Integration Test Example

```javascript
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { ensureChromeRunning } from '../setup.js';

const execAsync = promisify(exec);

describe('browser-eval.js integration', () => {
	let chromeRunning = false;

	beforeAll(async () => {
		chromeRunning = await ensureChromeRunning();
	});

	const testOrSkip = chromeRunning ? test : test.skip;

	testOrSkip('executes JavaScript', async () => {
		const { stdout } = await execAsync('node browser-eval.js "2 + 2"');
		expect(stdout.trim()).toBe('4');
	});
});
```

### E2E Test Example

```javascript
describe('Complete workflow', () => {
	testOrSkip('navigates, evaluates, and screenshots', async () => {
		// Navigate
		await execAsync('node browser-nav.js https://example.com');

		// Evaluate
		const { stdout } = await execAsync('node browser-eval.js "document.title"');
		expect(stdout).toContain('Example');

		// Screenshot
		const { stdout: path } = await execAsync('node browser-screenshot.js');
		expect(existsSync(path.trim())).toBe(true);
	}, 60000);
});
```

---

## Mocking

### Using Playwright Mocks

```javascript
import { createMockPlaywrightSetup } from '../../mocks/playwright.mock.js';

const { browser, context, page } = createMockPlaywrightSetup();

// Mock page.evaluate
page.evaluate.mockResolvedValue({ title: 'Test Page' });

// Use in tests
const result = await page.evaluate(() => document.title);
expect(result.title).toBe('Test Page');
```

### Using Fetch Mocks

```javascript
import { mockFetch, mockFetchError } from '../../mocks/fetch.mock.js';

// Mock successful fetch
mockFetch();
const data = await scrapeHackerNews(10);

// Mock fetch error
mockFetchError('Network error');
await expect(scrapeHackerNews(10)).rejects.toThrow('Network error');
```

### Mocking Console Output

```javascript
let consoleLogSpy;

beforeEach(() => {
	consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
	jest.restoreAllMocks();
});

test('prints message', () => {
	printSuccess('Done');
	expect(consoleLogSpy).toHaveBeenCalledWith('✓ Done');
});
```

---

## Best Practices

### 1. Test Organization

- **One test file per source file**: `browser.js` → `browser.test.js`
- **Descriptive test names**: Use `describe` and `test` with clear names
- **Arrange-Act-Assert**: Structure tests clearly

### 2. Test Independence

- Each test should be independent
- Use `beforeEach` and `afterEach` for setup/cleanup
- Don't rely on test execution order

### 3. Async Handling

```javascript
// ✅ Good - use async/await
test('async operation', async () => {
	const result = await someAsyncFunction();
	expect(result).toBe('expected');
});

// ❌ Bad - missing await
test('async operation', () => {
	someAsyncFunction().then(result => {
		expect(result).toBe('expected');
	});
});
```

### 4. Timeout for Slow Tests

```javascript
test('slow operation', async () => {
	// Test code
}, 30000); // 30 second timeout
```

### 5. Conditional Tests

Skip tests when Chrome is not available:

```javascript
const testOrSkip = chromeRunning ? test : test.skip;

testOrSkip('requires Chrome', async () => {
	// Test that needs Chrome
});
```

---

## Continuous Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run unit tests
        run: npm run test:unit

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Start Chrome
        run: |
          google-chrome --remote-debugging-port=9222 --headless --no-sandbox --disable-dev-shm-usage &
          sleep 5

      - name: Run integration tests
        run: npm run test:integration

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Troubleshooting

### Issue: "Cannot find module"

**Solution**: Ensure you're using the correct import paths. All imports should be relative paths with `.js` extension:

```javascript
// ✅ Correct
import { printResult } from '../../../shared/format.js';

// ❌ Incorrect
import { printResult } from '../../../shared/format';
```

### Issue: "SyntaxError: Cannot use import statement outside a module"

**Solution**: This project uses ESM. Make sure:
1. `package.json` has `"type": "module"`
2. You're importing from `@jest/globals`:

```javascript
import { jest } from '@jest/globals';
```

### Issue: Integration tests fail with "Chrome not running"

**Solution**: Start Chrome with remote debugging:

```bash
node browser-start.js
```

Then run integration tests in another terminal.

### Issue: "EADDRINUSE: address already in use ::9222"

**Solution**: Chrome is already running. Either:
1. Kill existing Chrome: `killall 'Google Chrome'` (macOS)
2. Or use the existing Chrome instance

### Issue: Tests timeout

**Solution**: Increase timeout for slow tests:

```javascript
test('slow test', async () => {
	// ...
}, 60000); // 60 seconds
```

Or update `jest.config.js`:

```javascript
testTimeout: 60000  // Default 60 seconds
```

### Issue: Mock not working

**Solution**: Ensure mocks are set up before importing the module:

```javascript
// ✅ Correct order
jest.mock('playwright');
import { connectToActivePage } from '../shared/browser.js';

// ❌ Wrong order
import { connectToActivePage } from '../shared/browser.js';
jest.mock('playwright');
```

### Issue: Coverage not generated

**Solution**: Run tests with the `--coverage` flag:

```bash
npm test
```

Or manually:

```bash
npx jest --coverage
```

---

## Code Coverage

View coverage report after running tests:

```bash
open coverage/lcov-report/index.html  # macOS
xdg-open coverage/lcov-report/index.html  # Linux
start coverage/lcov-report/index.html  # Windows
```

### Coverage Thresholds

The project enforces coverage thresholds in `jest.config.js`:

```javascript
coverageThreshold: {
	global: {
		branches: 70,
		functions: 75,
		lines: 80,
		statements: 80
	}
}
```

Tests will fail if coverage drops below these thresholds.

---

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Testing](https://playwright.dev/docs/test-intro)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## Contributing

When adding new features:

1. Write tests first (TDD approach recommended)
2. Ensure all tests pass: `npm test`
3. Maintain coverage above 80%
4. Add integration/E2E tests for user-facing features
5. Update this document if adding new test patterns

---

## License

MIT - Same as the main project
