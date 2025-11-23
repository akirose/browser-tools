#!/usr/bin/env node

/**
 * browser-pick.js - Refactored version
 *
 * This is an example of how browser-pick.js would look after refactoring
 * to use the shared utility modules.
 */

import { connectToActivePage, closeBrowser } from "./shared/browser.js";
import { runPicker } from "./shared/pick-logic.js";
import { printElementInfo } from "./shared/format.js";

const message = process.argv.slice(2).join(" ");
if (!message) {
	console.log("Usage: browser-pick.js 'message'");
	console.log("\nExample:");
	console.log('  browser-pick.js "Click the submit button"');
	process.exit(1);
}

const { browser, page } = await connectToActivePage();

const result = await runPicker(page, message);

printElementInfo(result);

await closeBrowser(browser);
