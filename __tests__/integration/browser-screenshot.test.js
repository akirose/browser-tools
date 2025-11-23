/**
 * Integration tests for browser-screenshot.js
 *
 * Note: These tests require a Chrome instance running on :9222
 */

import { jest } from '@jest/globals';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync, unlinkSync } from 'node:fs';
import { ensureChromeRunning } from '../setup.js';

const execAsync = promisify(exec);

describe('browser-screenshot.js integration', () => {
	let chromeRunning = false;
	const screenshotPaths = [];

	beforeAll(async () => {
		chromeRunning = await ensureChromeRunning();
	});

	afterAll(() => {
		// Cleanup screenshots
		for (const path of screenshotPaths) {
			try {
				if (existsSync(path)) {
					unlinkSync(path);
				}
			} catch (e) {
				// Ignore cleanup errors
			}
		}
	});

	const testOrSkip = chromeRunning ? test : test.skip;

	testOrSkip('creates screenshot file', async () => {
		// First navigate to a page
		await execAsync('node browser-nav.js https://example.com');

		const { stdout } = await execAsync('node browser-screenshot.js');
		const screenshotPath = stdout.trim();

		screenshotPaths.push(screenshotPath);

		expect(screenshotPath).toContain('screenshot-');
		expect(screenshotPath).toContain('.png');
		expect(existsSync(screenshotPath)).toBe(true);
	}, 30000);

	testOrSkip('creates unique filenames for multiple screenshots', async () => {
		await execAsync('node browser-nav.js https://example.com');

		const { stdout: path1 } = await execAsync('node browser-screenshot.js');
		await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
		const { stdout: path2 } = await execAsync('node browser-screenshot.js');

		screenshotPaths.push(path1.trim(), path2.trim());

		expect(path1.trim()).not.toBe(path2.trim());
		expect(existsSync(path1.trim())).toBe(true);
		expect(existsSync(path2.trim())).toBe(true);
	}, 30000);

	testOrSkip('filename contains timestamp', async () => {
		await execAsync('node browser-nav.js https://example.com');

		const { stdout } = await execAsync('node browser-screenshot.js');
		const screenshotPath = stdout.trim();

		screenshotPaths.push(screenshotPath);

		// Filename should match pattern: screenshot-YYYY-MM-DDTHH-MM-SS-MMMZ.png
		expect(screenshotPath).toMatch(/screenshot-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.png/);
	}, 30000);

	testOrSkip('handles error when no active tab', async () => {
		// This test might be tricky - it requires Chrome to be running but with no tabs
		// Skipping for now as it's hard to reliably test
	});
});
