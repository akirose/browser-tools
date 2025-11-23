/**
 * End-to-end workflow tests
 *
 * These tests verify complete workflows using multiple browser tools together.
 * Requires Chrome running on :9222
 */

import { jest } from '@jest/globals';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync, unlinkSync, readFileSync } from 'node:fs';
import { ensureChromeRunning } from '../setup.js';

const execAsync = promisify(exec);

describe('Browser Tools E2E Workflows', () => {
	let chromeRunning = false;
	const cleanupFiles = [];

	beforeAll(async () => {
		chromeRunning = await ensureChromeRunning();
	});

	afterAll(() => {
		// Cleanup any created files
		for (const file of cleanupFiles) {
			try {
				if (existsSync(file)) {
					unlinkSync(file);
				}
			} catch (e) {
				// Ignore
			}
		}
	});

	const testOrSkip = chromeRunning ? test : test.skip;

	describe('Complete navigation and inspection workflow', () => {
		testOrSkip('navigates, evaluates, and takes screenshot', async () => {
			// Step 1: Navigate to a page
			const { stdout: navOutput } = await execAsync('node browser-nav.js https://example.com');
			expect(navOutput).toContain('✓');

			// Step 2: Verify page loaded by evaluating title
			const { stdout: titleOutput } = await execAsync('node browser-eval.js "document.title"');
			expect(titleOutput).toContain('Example');

			// Step 3: Take screenshot
			const { stdout: screenshotPath } = await execAsync('node browser-screenshot.js');
			const path = screenshotPath.trim();
			cleanupFiles.push(path);

			expect(existsSync(path)).toBe(true);

			// Step 4: Verify page has expected elements
			const { stdout: linkCount } = await execAsync(
				'node browser-eval.js "document.querySelectorAll(\'a\').length"'
			);
			expect(parseInt(linkCount)).toBeGreaterThan(0);
		}, 60000);
	});

	describe('Multi-tab workflow', () => {
		testOrSkip('opens multiple tabs and switches between them', async () => {
			// Open first tab
			await execAsync('node browser-nav.js https://example.com --new');

			// Open second tab
			await execAsync('node browser-nav.js https://www.google.com --new');

			// Verify we're on the second tab
			const { stdout: title } = await execAsync('node browser-eval.js "document.title"');
			expect(title.toLowerCase()).toContain('google');

			// Navigate current tab to different URL
			await execAsync('node browser-nav.js https://github.com');

			const { stdout: newTitle } = await execAsync('node browser-eval.js "document.title"');
			expect(newTitle.toLowerCase()).toContain('github');
		}, 90000);
	});

	describe('Data extraction workflow', () => {
		testOrSkip('extracts and processes page data', async () => {
			// Navigate to test page
			await execAsync('node browser-nav.js https://example.com');

			// Extract all links
			const { stdout: linksJson } = await execAsync(
				`node browser-eval.js "Array.from(document.querySelectorAll('a')).map(a => ({ text: a.textContent.trim(), href: a.href }))"`
			);

			expect(linksJson).toBeTruthy();

			// Extract page metadata
			const { stdout: metadata } = await execAsync(
				'node browser-eval.js "({ url: window.location.href, title: document.title, linkCount: document.querySelectorAll(\'a\').length })"'
			);

			expect(metadata).toContain('url:');
			expect(metadata).toContain('title:');
			expect(metadata).toContain('linkCount:');
		}, 60000);
	});

	describe('Form interaction workflow', () => {
		testOrSkip('loads test page and interacts with form', async () => {
			// Load the test fixture HTML
			const fixtureHTML = readFileSync('__tests__/fixtures/sample.html', 'utf-8');

			// Create a data URL
			const dataURL = `data:text/html;charset=utf-8,${encodeURIComponent(fixtureHTML)}`;

			// Navigate to the data URL
			await execAsync(`node browser-nav.js "${dataURL}"`);

			// Verify page loaded
			const { stdout: title } = await execAsync('node browser-eval.js "document.title"');
			expect(title).toContain('Test Page');

			// Verify form exists
			const { stdout: hasForm } = await execAsync(
				'node browser-eval.js "document.querySelector(\'#test-form\') !== null"'
			);
			expect(hasForm.trim()).toBe('true');

			// Count buttons
			const { stdout: buttonCount } = await execAsync(
				'node browser-eval.js "document.querySelectorAll(\'button\').length"'
			);
			expect(parseInt(buttonCount)).toBeGreaterThan(0);
		}, 60000);
	});

	describe('Screenshot comparison workflow', () => {
		testOrSkip('takes screenshots before and after changes', async () => {
			await execAsync('node browser-nav.js https://example.com');

			// Take first screenshot
			const { stdout: screenshot1 } = await execAsync('node browser-screenshot.js');
			const path1 = screenshot1.trim();
			cleanupFiles.push(path1);

			// Make a change to the page
			await execAsync(
				'node browser-eval.js "document.body.style.backgroundColor = \'red\'"'
			);

			// Take second screenshot
			await new Promise(resolve => setTimeout(resolve, 500)); // Wait for change
			const { stdout: screenshot2 } = await execAsync('node browser-screenshot.js');
			const path2 = screenshot2.trim();
			cleanupFiles.push(path2);

			// Both screenshots should exist
			expect(existsSync(path1)).toBe(true);
			expect(existsSync(path2)).toBe(true);

			// Filenames should be different
			expect(path1).not.toBe(path2);
		}, 60000);
	});

	describe('Error handling workflow', () => {
		testOrSkip('handles navigation errors gracefully', async () => {
			// Try to evaluate without active page (might fail)
			try {
				await execAsync('node browser-eval.js "document.title"', { timeout: 5000 });
			} catch (error) {
				// Either succeeds (if tab exists) or fails gracefully
				if (error.code !== 0) {
					expect(error.stderr || error.stdout).toBeTruthy();
				}
			}
		}, 10000);
	});
});
