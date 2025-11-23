/**
 * Shared browser connection utilities for Playwright-based tools
 *
 * This module provides common functions for connecting to Chrome via CDP
 * and accessing browser contexts and pages with proper error handling.
 */

import { chromium } from "playwright";

/**
 * Connect to Chrome running on port 9222 via CDP
 * @returns {Promise<{browser: Browser}>}
 */
export async function connectToBrowser() {
	try {
		const browser = await chromium.connectOverCDP("http://localhost:9222");
		return { browser };
	} catch (error) {
		console.error("✗ Failed to connect to Chrome on :9222");
		console.error("  Make sure Chrome is running with --remote-debugging-port=9222");
		console.error("  Run: node browser-start.js");
		process.exit(1);
	}
}

/**
 * Get the first (default) browser context
 * @param {Browser} browser - Playwright browser instance
 * @returns {BrowserContext}
 */
export function getBrowserContext(browser) {
	const contexts = browser.contexts();

	if (contexts.length === 0) {
		console.error("✗ No browser context found");
		console.error("  This usually means Chrome is not properly running");
		process.exit(1);
	}

	return contexts[0];
}

/**
 * Get the most recently used page (tab)
 * The "active tab" is approximated as the last page in the pages array.
 * This is not perfect but works for most use cases.
 *
 * @param {BrowserContext} context - Playwright browser context
 * @param {boolean} required - If true, exit with error when no page found
 * @returns {Page|null}
 */
export function getActivePage(context, required = true) {
	const pages = context.pages();
	const page = pages[pages.length - 1];

	if (!page && required) {
		console.error("✗ No active tab found");
		console.error("  Open at least one tab in Chrome");
		process.exit(1);
	}

	return page || null;
}

/**
 * Connect to Chrome and get the active page in one call
 * This is the most common operation - connects to Chrome and returns
 * the browser, context, and active page.
 *
 * @returns {Promise<{browser: Browser, context: BrowserContext, page: Page}>}
 */
export async function connectToActivePage() {
	const { browser } = await connectToBrowser();
	const context = getBrowserContext(browser);
	const page = getActivePage(context, true);

	return { browser, context, page };
}

/**
 * Connect to Chrome and get the context (for operations that don't need a page)
 * Useful for operations like reading cookies that work at the context level.
 *
 * @returns {Promise<{browser: Browser, context: BrowserContext}>}
 */
export async function connectToContext() {
	const { browser } = await connectToBrowser();
	const context = getBrowserContext(browser);

	return { browser, context };
}

/**
 * Safely close the browser connection
 * @param {Browser} browser - Playwright browser instance
 */
export async function closeBrowser(browser) {
	try {
		await browser.close();
	} catch (error) {
		// Ignore errors on close - browser might already be disconnected
	}
}
