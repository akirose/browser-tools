#!/usr/bin/env node

/**
 * browser-cookies.js - Refactored version
 *
 * This is an example of how browser-cookies.js would look after refactoring
 * to use the shared utility modules.
 */

import { connectToContext, closeBrowser } from "./shared/browser.js";
import { printCookies } from "./shared/format.js";

// Parse command line arguments
const maskSensitive = process.argv.includes("--mask");
const jsonOutput = process.argv.includes("--json");

const { browser, context } = await connectToContext();
const cookies = await context.cookies();

if (jsonOutput) {
	console.log(JSON.stringify(cookies, null, 2));
} else {
	printCookies(cookies, maskSensitive);
}

await closeBrowser(browser);
