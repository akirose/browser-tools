/**
 * Global test setup
 * Runs before all tests
 */

import { chromium } from 'playwright';

export const TEST_CDP_URL = 'http://localhost:9222';
export const TEST_TIMEOUT = 30000;

// Check if Chrome is running (for E2E tests)
export async function ensureChromeRunning() {
	try {
		const browser = await chromium.connectOverCDP(TEST_CDP_URL);
		await browser.close();
		return true;
	} catch (e) {
		console.warn('⚠️  Chrome not running on :9222. E2E tests will be skipped.');
		return false;
	}
}

// Create a test page for E2E tests
export async function createTestPage() {
	const browser = await chromium.connectOverCDP(TEST_CDP_URL);
	const context = browser.contexts()[0];
	const page = await context.newPage();
	return { browser, context, page };
}

// Cleanup test page
export async function cleanupTestPage({ browser, page }) {
	if (page) {
		try {
			await page.close();
		} catch (e) {
			// Ignore
		}
	}
	if (browser) {
		try {
			await browser.close();
		} catch (e) {
			// Ignore
		}
	}
}

// Global test setup
beforeAll(() => {
	// Suppress console output during tests (optional)
	// jest.spyOn(console, 'log').mockImplementation(() => {});
	// jest.spyOn(console, 'error').mockImplementation(() => {});
});

// Global test teardown
afterAll(() => {
	// Restore console
	// jest.restoreAllMocks();
});
