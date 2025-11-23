#!/usr/bin/env node

import { chromium } from "playwright";

const url = process.argv[2];
const newTab = process.argv[3] === "--new";

if (!url) {
	console.log("Usage: browser-nav.js <url> [--new]");
	console.log("\nExamples:");
	console.log("  browser-nav.js https://example.com       # Navigate current tab");
	console.log("  browser-nav.js https://example.com --new # Open in new tab");
	process.exit(1);
}

const browser = await chromium.connectOverCDP("http://localhost:9222");
const contexts = browser.contexts();
const context = contexts[0];

if (newTab) {
	const page = await context.newPage();
	await page.goto(url, { waitUntil: "domcontentloaded" });
	console.log("✓ Opened:", url);
} else {
	const pages = context.pages();
	const page = pages[pages.length - 1];
	await page.goto(url, { waitUntil: "domcontentloaded" });
	console.log("✓ Navigated to:", url);
}

await browser.close();
