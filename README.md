# Browser Tools (Playwright)

Chrome DevTools Protocol tools for agent-assisted web automation using Playwright. These tools connect to Chrome running on `:9222` with remote debugging enabled.

## Installation

```bash
npm install
```

## Start Chrome

```bash
node browser-start.js              # Fresh profile
node browser-start.js --profile    # Copy user's profile (cookies, logins)
```

Launch Chrome with remote debugging. Use `--profile` to preserve user's authentication state.

## Navigate

```bash
node browser-nav.js https://example.com
node browser-nav.js https://example.com --new
```

Navigate to URLs. Use `--new` flag to open in a new tab instead of reusing current tab.

## Evaluate JavaScript

```bash
node browser-eval.js 'document.title'
node browser-eval.js 'document.querySelectorAll("a").length'
```

Execute JavaScript in the active tab. Code runs in async context. Use this to extract data, inspect page state, or perform DOM operations programmatically.

## Screenshot

```bash
node browser-screenshot.js
```

Capture current viewport and return temporary file path. Use this to visually inspect page state or verify UI changes.

## Pick Elements

```bash
node browser-pick.js "Click the submit button"
```

**IMPORTANT**: Use this tool when the user wants to select specific DOM elements on the page. This launches an interactive picker that lets the user click elements to select them. The user can select multiple elements (Cmd/Ctrl+Click) and press Enter when done. The tool returns CSS selectors for the selected elements.

Common use cases:
- User says "I want to click that button" → Use this tool to let them select it
- User says "extract data from these items" → Use this tool to let them select the elements
- When you need specific selectors but the page structure is complex or ambiguous

## Cookies

```bash
node browser-cookies.js          # Human-readable format
node browser-cookies.js --mask   # Mask sensitive values
node browser-cookies.js --json   # JSON output
```

Display all cookies for the current tab including domain, path, httpOnly, and secure flags. Use this to debug authentication issues or inspect session state.

## Hacker News Scraper

```bash
node example/browser-hn-scraper.js
node example/browser-hn-scraper.js --limit 10
```

Scrape Hacker News front page submissions. This tool uses Cheerio for HTML parsing and doesn't require browser automation.

## Testing

This project includes comprehensive test coverage with unit, integration, and E2E tests.

### Run All Tests

```bash
npm test
```

### Run Specific Test Types

```bash
npm run test:unit         # Unit tests only (no Chrome required)
npm run test:integration  # Integration tests (requires Chrome on :9222)
npm run test:e2e          # End-to-end workflow tests
npm run test:watch        # Watch mode for development
```

### Test Coverage

- Unit tests: Shared utilities and pure functions
- Integration tests: Individual browser tools
- E2E tests: Complete workflows using multiple tools

See [TESTING.md](TESTING.md) for detailed testing documentation.

