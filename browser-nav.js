#!/usr/bin/env node

import { connectToActivePage, closeBrowser } from "./shared/browser.js";
import { printSuccess } from "./shared/format.js";

const url = process.argv[2];
const newTab = process.argv[3] === "--new";

if (!url) {
	console.log("Usage: browser-nav.js <url> [--new]");
	console.log("\nExamples:");
	console.log("  browser-nav.js https://example.com       # Navigate current tab");
	console.log("  browser-nav.js https://example.com --new # Open in new tab");
	process.exit(1);
}

const { browser, context, page } = await connectToActivePage();

if (newTab) {
	const newPage = await context.newPage();
	await newPage.goto(url, { waitUntil: "domcontentloaded" });
	printSuccess(`Opened: ${url}`);
} else {
	await page.goto(url, { waitUntil: "domcontentloaded" });
	printSuccess(`Navigated to: ${url}`);
}

await closeBrowser(browser);
