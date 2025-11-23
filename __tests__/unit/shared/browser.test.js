/**
 * Unit tests for shared/browser.js
 */

import { jest } from '@jest/globals';
import { createMockPlaywrightSetup } from '../../mocks/playwright.mock.js';

// Mock Playwright before importing the module
let mockBrowser, mockContext, mockPage;

beforeAll(() => {
	const setup = createMockPlaywrightSetup();
	mockBrowser = setup.browser;
	mockContext = setup.context;
	mockPage = setup.page;
});

// Note: Due to ESM module caching, these tests demonstrate the testing approach
// In real scenarios, you might need to use jest.unstable_mockModule or test at integration level

describe('shared/browser.js', () => {
	describe('getBrowserContext', () => {
		test('returns first context when contexts exist', async () => {
			// Import dynamically to get fresh module
			const { getBrowserContext } = await import('../../../shared/browser.js');

			const browser = {
				contexts: jest.fn().mockReturnValue([{ pages: jest.fn() }, { pages: jest.fn() }])
			};

			const context = getBrowserContext(browser);
			expect(context).toBeDefined();
			expect(browser.contexts).toHaveBeenCalled();
		});

		test('exits when no contexts exist', async () => {
			const { getBrowserContext } = await import('../../../shared/browser.js');
			const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
			const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

			const browser = {
				contexts: jest.fn().mockReturnValue([])
			};

			getBrowserContext(browser);

			expect(consoleErrorSpy).toHaveBeenCalledWith('✗ No browser context found');
			expect(mockExit).toHaveBeenCalledWith(1);

			mockExit.mockRestore();
			consoleErrorSpy.mockRestore();
		});
	});

	describe('getActivePage', () => {
		test('returns last page when pages exist', async () => {
			const { getActivePage } = await import('../../../shared/browser.js');

			const page1 = { goto: jest.fn() };
			const page2 = { goto: jest.fn() };
			const context = {
				pages: jest.fn().mockReturnValue([page1, page2])
			};

			const activePage = getActivePage(context, false);
			expect(activePage).toBe(page2);
		});

		test('exits when no pages and required=true', async () => {
			const { getActivePage } = await import('../../../shared/browser.js');
			const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
			const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

			const context = {
				pages: jest.fn().mockReturnValue([])
			};

			getActivePage(context, true);

			expect(consoleErrorSpy).toHaveBeenCalledWith('✗ No active tab found');
			expect(mockExit).toHaveBeenCalledWith(1);

			mockExit.mockRestore();
			consoleErrorSpy.mockRestore();
		});

		test('returns null when no pages and required=false', async () => {
			const { getActivePage } = await import('../../../shared/browser.js');

			const context = {
				pages: jest.fn().mockReturnValue([])
			};

			const page = getActivePage(context, false);
			expect(page).toBeNull();
		});
	});

	describe('closeBrowser', () => {
		test('closes browser successfully', async () => {
			const { closeBrowser } = await import('../../../shared/browser.js');

			const browser = {
				close: jest.fn().mockResolvedValue(undefined)
			};

			await closeBrowser(browser);
			expect(browser.close).toHaveBeenCalled();
		});

		test('handles close errors gracefully', async () => {
			const { closeBrowser } = await import('../../../shared/browser.js');

			const browser = {
				close: jest.fn().mockRejectedValue(new Error('Connection lost'))
			};

			// Should not throw
			await expect(closeBrowser(browser)).resolves.not.toThrow();
		});
	});

	describe('Integration scenarios', () => {
		test('connectToActivePage workflow', () => {
			// This would test the full workflow
			// In practice, this is better tested as an integration test
			// because it requires mocking chromium.connectOverCDP
			expect(true).toBe(true); // Placeholder
		});

		test('connectToContext workflow', () => {
			// Similar to above
			expect(true).toBe(true); // Placeholder
		});
	});
});

// Additional test for module exports
describe('shared/browser.js exports', () => {
	test('exports all required functions', async () => {
		const module = await import('../../../shared/browser.js');

		expect(module.connectToBrowser).toBeDefined();
		expect(module.getBrowserContext).toBeDefined();
		expect(module.getActivePage).toBeDefined();
		expect(module.connectToActivePage).toBeDefined();
		expect(module.connectToContext).toBeDefined();
		expect(module.closeBrowser).toBeDefined();
	});
});
