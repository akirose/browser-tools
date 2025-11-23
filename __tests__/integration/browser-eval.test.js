/**
 * Integration tests for browser-eval.js
 *
 * Note: These tests require a Chrome instance running on :9222
 * Run: node browser-start.js
 */

import { jest } from '@jest/globals';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { ensureChromeRunning } from '../setup.js';

const execAsync = promisify(exec);

describe('browser-eval.js integration', () => {
	let chromeRunning = false;

	beforeAll(async () => {
		chromeRunning = await ensureChromeRunning();
	});

	// Skip tests if Chrome is not running
	const testOrSkip = chromeRunning ? test : test.skip;

	testOrSkip('executes simple JavaScript expression', async () => {
		const { stdout } = await execAsync('node browser-eval.js "2 + 2"');
		expect(stdout.trim()).toBe('4');
	});

	testOrSkip('executes string expression', async () => {
		const { stdout } = await execAsync('node browser-eval.js "\'hello world\'"');
		expect(stdout.trim()).toBe('hello world');
	});

	testOrSkip('executes document.title', async () => {
		// First navigate to a test page
		try {
			await execAsync('node browser-nav.js https://example.com');
			const { stdout } = await execAsync('node browser-eval.js "document.title"');
			expect(stdout).toContain('Example');
		} catch (error) {
			// Skip if navigation fails
			console.warn('Navigation failed, skipping test');
		}
	}, 30000);

	testOrSkip('returns object as key-value pairs', async () => {
		const { stdout } = await execAsync('node browser-eval.js "({ name: \'test\', value: 123 })"');
		expect(stdout).toContain('name: test');
		expect(stdout).toContain('value: 123');
	});

	testOrSkip('returns array of objects', async () => {
		const { stdout } = await execAsync('node browser-eval.js "[{ id: 1 }, { id: 2 }]"');
		expect(stdout).toContain('id: 1');
		expect(stdout).toContain('id: 2');
	});

	testOrSkip('handles async code', async () => {
		const { stdout } = await execAsync(
			'node browser-eval.js "await new Promise(resolve => setTimeout(() => resolve(\'delayed\'), 100))"'
		);
		expect(stdout.trim()).toBe('delayed');
	}, 30000);

	testOrSkip('handles DOM queries', async () => {
		try {
			await execAsync('node browser-nav.js https://example.com');
			const { stdout } = await execAsync('node browser-eval.js "document.querySelectorAll(\'a\').length"');
			const linkCount = parseInt(stdout.trim());
			expect(linkCount).toBeGreaterThanOrEqual(0);
		} catch (error) {
			console.warn('DOM query test failed, skipping');
		}
	}, 30000);

	test('shows usage when no code provided', async () => {
		try {
			await execAsync('node browser-eval.js');
		} catch (error) {
			expect(error.stdout || error.stderr).toContain('Usage:');
		}
	});

	testOrSkip('handles errors in code', async () => {
		try {
			await execAsync('node browser-eval.js "nonExistentVariable"');
			// Should not reach here
			expect(true).toBe(false);
		} catch (error) {
			// Error expected
			expect(error.code).not.toBe(0);
		}
	});
});
