#!/usr/bin/env node

import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";

const browser = await chromium.connectOverCDP("http://localhost:9222");
const contexts = browser.contexts();
const context = contexts[0];
const pages = context.pages();
const page = pages[pages.length - 1];

if (!page) {
	console.error("✗ No active tab found");
	process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const filename = `screenshot-${timestamp}.png`;
const filepath = join(tmpdir(), filename);

await page.screenshot({ path: filepath });

console.log(filepath);

await browser.close();
