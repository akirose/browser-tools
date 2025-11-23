# Browser Tools

Minimal `Chrome DevTools Protocol` tools for collaborative site exploration.

## Start Chrome

```bash
browser-start.js              # Fresh profile
browser-start.js --profile    # Copy your profile (cookies, logins)
```

Start Chrome on `:9222` with remote debugging.

## Navigate

```bash
browser-nav.js https://example.com
browser-nav.js https://example.com --new
```

Navigate current tab or open new tab.

## Evaluate JavaScript

```bash
browser-eval.js 'document.title'
browser-eval.js 'document.querySelectorAll("a").length'
```

Execute JavaScript in active tab (async context).

## Screenshot

```bash
browser-screenshot.js
```

Screenshot current viewport, returns temp file path.

## Cookies

```bash
browser-cookies.js
browser-cookies.js --mask
browser-cookies.js --json
```

Display cookies from current browser context.

## Pick Element

```bash
browser-pick.js 'Click the submit button'
browser-pick.js 'Find the login form'
```

Select element using natural language message.
