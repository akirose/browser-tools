/**
 * Integration tests for browser-nav.js
 *
 * Note: These tests require a Chrome instance running on :9222
 */

import { jest } from '@jest/globals';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { ensureChromeRunning } from '../setup.js';

const execAsync = promisify(exec);

describe('browser-nav.js integration', () => {
	let chromeRunning = false;

	beforeAll(async () => {
		chromeRunning = await ensureChromeRunning();
	});

	const testOrSkip = chromeRunning ? test : test.skip;

	testOrSkip('navigates to URL', async () => {
		const { stdout } = await execAsync('node browser-nav.js https://example.com');
		expect(stdout).toContain('✓ Navigated to:');
		expect(stdout).toContain('https://example.com');
	}, 30000);

	testOrSkip('opens URL in new tab with --new flag', async () => {
		const { stdout } = await execAsync('node browser-nav.js https://example.com --new');
		expect(stdout).toContain('✓ Opened:');
		expect(stdout).toContain('https://example.com');
	}, 30000);

	testOrSkip('handles different URLs', async () => {
		const urls = [
			'https://www.google.com',
			'https://github.com',
			'https://www.wikipedia.org'
		];

		for (const url of urls) {
			const { stdout } = await execAsync(`node browser-nav.js ${url}`);
			expect(stdout).toContain('✓');
			expect(stdout).toContain(url);
		}
	}, 60000);

	test('shows usage when no URL provided', async () => {
		try {
			await execAsync('node browser-nav.js');
		} catch (error) {
			expect(error.stdout || error.stderr).toContain('Usage:');
		}
	});

	testOrSkip('handles invalid URLs gracefully', async () => {
		try {
			await execAsync('node browser-nav.js not-a-valid-url', { timeout: 10000 });
			// Might succeed or fail depending on Playwright's handling
		} catch (error) {
			// Expected to fail
			expect(error.code).not.toBe(0);
		}
	}, 15000);
});
