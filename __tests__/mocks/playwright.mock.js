/**
 * Mock Playwright objects for testing
 */
import { jest } from '@jest/globals';

export const createMockPage = (overrides = {}) => ({
	evaluate: jest.fn().mockResolvedValue('mock result'),
	goto: jest.fn().mockResolvedValue({}),
	screenshot: jest.fn().mockResolvedValue(Buffer.from('PNG_DATA')),
	close: jest.fn().mockResolvedValue(undefined),
	url: jest.fn().mockReturnValue('https://example.com'),
	title: jest.fn().mockResolvedValue('Example Domain'),
	content: jest.fn().mockResolvedValue('<html></html>'),
	...overrides
});

export const createMockContext = (overrides = {}) => ({
	pages: jest.fn().mockReturnValue([createMockPage()]),
	cookies: jest.fn().mockResolvedValue([
		{
			name: 'test_cookie',
			value: 'test_value',
			domain: '.example.com',
			path: '/',
			httpOnly: false,
			secure: false
		}
	]),
	newPage: jest.fn().mockResolvedValue(createMockPage()),
	close: jest.fn().mockResolvedValue(undefined),
	...overrides
});

export const createMockBrowser = (overrides = {}) => ({
	contexts: jest.fn().mockReturnValue([createMockContext()]),
	close: jest.fn().mockResolvedValue(undefined),
	isConnected: jest.fn().mockReturnValue(true),
	...overrides
});

/**
 * Create a complete mock setup with browser, context, and page
 */
export const createMockPlaywrightSetup = () => {
	const mockPage = createMockPage();
	const mockContext = createMockContext({ pages: jest.fn().mockReturnValue([mockPage]) });
	const mockBrowser = createMockBrowser({ contexts: jest.fn().mockReturnValue([mockContext]) });

	return {
		browser: mockBrowser,
		context: mockContext,
		page: mockPage
	};
};

/**
 * Mock chromium.connectOverCDP
 */
export const mockConnectOverCDP = (mockBrowser) => {
	return jest.fn().mockResolvedValue(mockBrowser);
};
