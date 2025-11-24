#!/usr/bin/env node

import { connectToContext, closeBrowser } from "./shared/browser.js";
import { printCookies, printJSON } from "./shared/format.js";

// Parse command line arguments
const maskSensitive = process.argv.includes("--mask");
const jsonOutput = process.argv.includes("--json");

const { browser, context } = await connectToContext();
const cookies = await context.cookies();

if (jsonOutput) {
	printJSON(cookies, true);
} else {
	printCookies(cookies, maskSensitive);
}

await closeBrowser(browser);
