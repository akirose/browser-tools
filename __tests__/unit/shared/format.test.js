/**
 * Unit tests for shared/format.js
 */

import { jest } from '@jest/globals';
import {
	printResult,
	printCookies,
	printElementInfo,
	printJSON,
	printSuccess,
	printError,
	printWarning,
	formatTimestampForFilename
} from '../../../shared/format.js';

describe('shared/format.js', () => {
	let consoleLogSpy, consoleErrorSpy, consoleWarnSpy;

	beforeEach(() => {
		consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('printResult', () => {
		test('prints primitive number', () => {
			printResult(42);
			expect(consoleLogSpy).toHaveBeenCalledWith(42);
			expect(consoleLogSpy).toHaveBeenCalledTimes(1);
		});

		test('prints primitive string', () => {
			printResult('hello world');
			expect(consoleLogSpy).toHaveBeenCalledWith('hello world');
		});

		test('prints boolean', () => {
			printResult(true);
			expect(consoleLogSpy).toHaveBeenCalledWith(true);
		});

		test('prints null', () => {
			printResult(null);
			expect(consoleLogSpy).toHaveBeenCalledWith(null);
		});

		test('prints undefined', () => {
			printResult(undefined);
			expect(consoleLogSpy).toHaveBeenCalledWith(undefined);
		});

		test('prints simple object', () => {
			printResult({ name: 'John', age: 30 });
			expect(consoleLogSpy).toHaveBeenCalledTimes(2);
			expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 'name: John');
			expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 'age: 30');
		});

		test('prints empty object', () => {
			printResult({});
			expect(consoleLogSpy).not.toHaveBeenCalled();
		});

		test('prints array of primitives', () => {
			printResult([1, 2, 3]);
			// Array prints with separators: item, separator, item, separator, item
			expect(consoleLogSpy).toHaveBeenCalledTimes(5);
			expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 1);
			expect(consoleLogSpy).toHaveBeenNthCalledWith(2, ''); // separator
			expect(consoleLogSpy).toHaveBeenNthCalledWith(3, 2);
			expect(consoleLogSpy).toHaveBeenNthCalledWith(4, ''); // separator
			expect(consoleLogSpy).toHaveBeenNthCalledWith(5, 3);
		});

		test('prints array of objects with separator', () => {
			printResult([{ id: 1 }, { id: 2 }]);
			expect(consoleLogSpy).toHaveBeenCalledWith(''); // Separator between items
			expect(consoleLogSpy).toHaveBeenCalledWith('id: 1');
			expect(consoleLogSpy).toHaveBeenCalledWith('id: 2');
		});

		test('prints mixed array', () => {
			printResult([42, { name: 'test' }, 'string']);
			expect(consoleLogSpy).toHaveBeenCalledWith(42);
			expect(consoleLogSpy).toHaveBeenCalledWith('name: test');
			expect(consoleLogSpy).toHaveBeenCalledWith('string');
		});

		test('prints empty array', () => {
			printResult([]);
			expect(consoleLogSpy).not.toHaveBeenCalled();
		});
	});

	describe('formatTimestampForFilename', () => {
		test('formats date correctly', () => {
			const date = new Date('2025-11-20T12:30:45.123Z');
			const result = formatTimestampForFilename(date);
			expect(result).toBe('2025-11-20T12-30-45-123Z');
		});

		test('removes colons and dots', () => {
			const date = new Date('2025-01-01T00:00:00.000Z');
			const result = formatTimestampForFilename(date);
			expect(result).not.toMatch(/[:.]/);
		});

		test('uses current date when no argument provided', () => {
			const result = formatTimestampForFilename();
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/);
		});
	});

	describe('printCookies', () => {
		const mockCookies = [
			{
				name: 'session_id',
				value: 'abc123',
				domain: '.example.com',
				path: '/',
				httpOnly: true,
				secure: true
			},
			{
				name: 'theme',
				value: 'dark',
				domain: '.example.com',
				path: '/',
				httpOnly: false,
				secure: false
			}
		];

		test('prints cookies without masking', () => {
			printCookies(mockCookies, false);
			expect(consoleLogSpy).toHaveBeenCalledWith('session_id: abc123');
			expect(consoleLogSpy).toHaveBeenCalledWith('  domain: .example.com');
			expect(consoleLogSpy).toHaveBeenCalledWith('  path: /');
			expect(consoleLogSpy).toHaveBeenCalledWith('  httpOnly: true');
			expect(consoleLogSpy).toHaveBeenCalledWith('  secure: true');
		});

		test('masks sensitive cookies when maskSensitive=true', () => {
			const sensitiveCookies = [
				{
					name: 'auth_token',
					value: 'secret123',
					domain: '.example.com',
					path: '/',
					httpOnly: true,
					secure: true
				}
			];
			printCookies(sensitiveCookies, true);
			expect(consoleLogSpy).toHaveBeenCalledWith('auth_token: ***MASKED***');
		});

		test('masks session cookies', () => {
			const sessionCookie = [
				{
					name: 'SESSION_ID',
					value: 'xyz789',
					domain: '.example.com',
					path: '/',
					httpOnly: true,
					secure: true
				}
			];
			printCookies(sessionCookie, true);
			expect(consoleLogSpy).toHaveBeenCalledWith('SESSION_ID: ***MASKED***');
		});

		test('does not mask non-sensitive cookies when maskSensitive=true', () => {
			const nonSensitiveCookie = [
				{
					name: 'theme',
					value: 'dark',
					domain: '.example.com',
					path: '/',
					httpOnly: false,
					secure: false
				}
			];
			printCookies(nonSensitiveCookie, true);
			expect(consoleLogSpy).toHaveBeenCalledWith('theme: dark');
		});

		test('handles empty cookie array', () => {
			printCookies([], false);
			expect(consoleLogSpy).toHaveBeenCalledWith('No cookies found');
		});

		test('handles null cookies', () => {
			printCookies(null, false);
			expect(consoleLogSpy).toHaveBeenCalledWith('No cookies found');
		});

		test('shows masking info when masking is enabled', () => {
			printCookies(mockCookies, true);
			expect(consoleLogSpy).toHaveBeenCalledWith(
				expect.stringContaining('Sensitive cookies')
			);
		});
	});

	describe('printElementInfo', () => {
		test('prints single element info', () => {
			const elementInfo = {
				tag: 'button',
				id: 'submit-btn',
				class: 'btn btn-primary',
				text: 'Submit',
				html: '<button>Submit</button>',
				parents: 'div > form'
			};
			printElementInfo(elementInfo);
			expect(consoleLogSpy).toHaveBeenCalledWith('tag: button');
			expect(consoleLogSpy).toHaveBeenCalledWith('id: submit-btn');
			expect(consoleLogSpy).toHaveBeenCalledWith('class: btn btn-primary');
		});

		test('prints array of element info', () => {
			const elements = [
				{ tag: 'a', id: null, class: 'link', text: 'Link 1', html: '<a>Link 1</a>', parents: 'div' },
				{ tag: 'a', id: null, class: 'link', text: 'Link 2', html: '<a>Link 2</a>', parents: 'div' }
			];
			printElementInfo(elements);
			expect(consoleLogSpy).toHaveBeenCalledWith('tag: a');
			expect(consoleLogSpy).toHaveBeenCalledWith(''); // Separator
		});

		test('handles null element', () => {
			printElementInfo(null);
			expect(consoleLogSpy).toHaveBeenCalledWith('✗ No element selected');
		});
	});

	describe('printJSON', () => {
		test('prints compact JSON', () => {
			const data = { name: 'test', value: 123 };
			printJSON(data, false);
			expect(consoleLogSpy).toHaveBeenCalledWith('{"name":"test","value":123}');
		});

		test('prints pretty JSON', () => {
			const data = { name: 'test' };
			printJSON(data, true);
			expect(consoleLogSpy).toHaveBeenCalledWith(
				'{\n  "name": "test"\n}'
			);
		});

		test('handles arrays', () => {
			const data = [1, 2, 3];
			printJSON(data, false);
			expect(consoleLogSpy).toHaveBeenCalledWith('[1,2,3]');
		});
	});

	describe('printSuccess', () => {
		test('prints success message with checkmark', () => {
			printSuccess('Operation completed');
			expect(consoleLogSpy).toHaveBeenCalledWith('✓ Operation completed');
		});

		test('handles empty message', () => {
			printSuccess('');
			expect(consoleLogSpy).toHaveBeenCalledWith('✓ ');
		});
	});

	describe('printError', () => {
		test('prints error message without exiting', () => {
			printError('Something went wrong', false);
			expect(consoleErrorSpy).toHaveBeenCalledWith('✗ Something went wrong');
		});

		test('prints error message and exits when exit=true', () => {
			const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
			printError('Fatal error', true);
			expect(consoleErrorSpy).toHaveBeenCalledWith('✗ Fatal error');
			expect(mockExit).toHaveBeenCalledWith(1);
			mockExit.mockRestore();
		});
	});

	describe('printWarning', () => {
		test('prints warning message with emoji', () => {
			printWarning('Be careful');
			expect(consoleWarnSpy).toHaveBeenCalledWith('⚠️  Be careful');
		});
	});
});
