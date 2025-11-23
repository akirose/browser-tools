#!/usr/bin/env node

/**
 * browser-eval.js - Refactored version
 *
 * This is an example of how browser-eval.js would look after refactoring
 * to use the shared utility modules.
 */

import { connectToActivePage, closeBrowser } from "./shared/browser.js";
import { printResult } from "./shared/format.js";

const code = process.argv.slice(2).join(" ");
if (!code) {
	console.log("Usage: browser-eval.js 'code'");
	console.log("\nExamples:");
	console.log('  browser-eval.js "document.title"');
	console.log('  browser-eval.js "document.querySelectorAll(\'a\').length"');
	process.exit(1);
}

const { browser, page } = await connectToActivePage();

const result = await page.evaluate((c) => {
	const AsyncFunction = (async () => {}).constructor;
	return new AsyncFunction(`return (${c})`)();
}, code);

printResult(result);

await closeBrowser(browser);
