/**
 * Unit tests for shared/pick-logic.js
 */

import { jest } from '@jest/globals';
import {
	pickLogicCode,
	initializePicker,
	runPicker
} from '../../../shared/pick-logic.js';

describe('shared/pick-logic.js', () => {
	describe('pickLogicCode', () => {
		test('is a non-empty string', () => {
			expect(typeof pickLogicCode).toBe('string');
			expect(pickLogicCode.length).toBeGreaterThan(0);
		});

		test('contains window.pick function definition', () => {
			expect(pickLogicCode).toContain('window.pick');
			expect(pickLogicCode).toContain('async (message)');
		});

		test('contains required DOM manipulation code', () => {
			expect(pickLogicCode).toContain('document.createElement');
			expect(pickLogicCode).toContain('overlay');
			expect(pickLogicCode).toContain('highlight');
			expect(pickLogicCode).toContain('banner');
		});

		test('contains event handlers', () => {
			expect(pickLogicCode).toContain('addEventListener');
			expect(pickLogicCode).toContain('mousemove');
			expect(pickLogicCode).toContain('click');
			expect(pickLogicCode).toContain('keydown');
		});

		test('contains element info builder', () => {
			expect(pickLogicCode).toContain('buildElementInfo');
			expect(pickLogicCode).toContain('tagName');
			expect(pickLogicCode).toContain('parents');
		});

		test('contains cleanup logic', () => {
			expect(pickLogicCode).toContain('cleanup');
			expect(pickLogicCode).toContain('removeEventListener');
			expect(pickLogicCode).toContain('remove()');
		});

		test('contains keyboard shortcuts', () => {
			expect(pickLogicCode).toContain('Escape');
			expect(pickLogicCode).toContain('Enter');
			expect(pickLogicCode).toContain('metaKey');
			expect(pickLogicCode).toContain('ctrlKey');
		});
	});

	describe('initializePicker', () => {
		test('calls page.evaluate with pickLogicCode', async () => {
			const mockPage = {
				evaluate: jest.fn().mockResolvedValue(undefined)
			};

			await initializePicker(mockPage);

			expect(mockPage.evaluate).toHaveBeenCalledTimes(1);
			expect(mockPage.evaluate).toHaveBeenCalledWith(pickLogicCode);
		});

		test('handles evaluate errors', async () => {
			const mockPage = {
				evaluate: jest.fn().mockRejectedValue(new Error('Evaluate failed'))
			};

			await expect(initializePicker(mockPage)).rejects.toThrow('Evaluate failed');
		});
	});

	describe('runPicker', () => {
		test('initializes picker and runs with message', async () => {
			const mockResult = {
				tag: 'button',
				id: 'test-btn',
				class: 'btn',
				text: 'Click me',
				html: '<button>Click me</button>',
				parents: 'div > form'
			};

			const mockPage = {
				evaluate: jest.fn()
					.mockResolvedValueOnce(undefined) // initializePicker call
					.mockResolvedValueOnce(mockResult) // runPicker call
			};

			const result = await runPicker(mockPage, 'Select a button');

			expect(mockPage.evaluate).toHaveBeenCalledTimes(2);
			expect(mockPage.evaluate).toHaveBeenNthCalledWith(1, pickLogicCode);
			expect(result).toEqual(mockResult);
		});

		test('returns null when picker is cancelled', async () => {
			const mockPage = {
				evaluate: jest.fn()
					.mockResolvedValueOnce(undefined)
					.mockResolvedValueOnce(null) // User cancelled
			};

			const result = await runPicker(mockPage, 'Select something');

			expect(result).toBeNull();
		});

		test('returns array for multi-selection', async () => {
			const mockResults = [
				{ tag: 'a', id: null, class: 'link', text: 'Link 1' },
				{ tag: 'a', id: null, class: 'link', text: 'Link 2' }
			];

			const mockPage = {
				evaluate: jest.fn()
					.mockResolvedValueOnce(undefined)
					.mockResolvedValueOnce(mockResults)
			};

			const result = await runPicker(mockPage, 'Select links');

			expect(Array.isArray(result)).toBe(true);
			expect(result).toHaveLength(2);
		});
	});

	describe('module exports', () => {
		test('exports all required functions and constants', async () => {
			const module = await import('../../../shared/pick-logic.js');

			expect(module.pickLogicCode).toBeDefined();
			expect(module.initializePicker).toBeDefined();
			expect(module.runPicker).toBeDefined();
		});
	});
});
