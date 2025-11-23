/**
 * Unit tests for browser-hn-scraper.js
 */

import { jest } from '@jest/globals';
import { scrapeHackerNews } from '../../../browser-hn-scraper.js';
import { mockFetch, mockFetchError, resetFetchMock, mockHackerNewsHTML } from '../../mocks/fetch.mock.js';

describe('browser-hn-scraper.js', () => {
	afterEach(() => {
		resetFetchMock();
	});

	describe('scrapeHackerNews', () => {
		test('fetches and parses Hacker News submissions', async () => {
			mockFetch();

			const submissions = await scrapeHackerNews(30);

			expect(global.fetch).toHaveBeenCalledWith('https://news.ycombinator.com');
			expect(Array.isArray(submissions)).toBe(true);
			expect(submissions.length).toBeGreaterThan(0);
		});

		test('respects the limit parameter', async () => {
			mockFetch();

			const submissions = await scrapeHackerNews(1);

			expect(submissions.length).toBeLessThanOrEqual(1);
		});

		test('parses submission fields correctly', async () => {
			mockFetch();

			const submissions = await scrapeHackerNews(1);
			const submission = submissions[0];

			expect(submission).toHaveProperty('id');
			expect(submission).toHaveProperty('title');
			expect(submission).toHaveProperty('url');
			expect(submission).toHaveProperty('points');
			expect(submission).toHaveProperty('author');
			expect(submission).toHaveProperty('time');
			expect(submission).toHaveProperty('comments');
			expect(submission).toHaveProperty('hnUrl');
		});

		test('extracts correct data from HTML', async () => {
			mockFetch();

			const submissions = await scrapeHackerNews(1);
			const submission = submissions[0];

			expect(submission.id).toBe('123');
			expect(submission.title).toBe('Example Story 1');
			expect(submission.url).toBe('https://example.com/story1');
			expect(submission.points).toBe(100);
			expect(submission.author).toBe('testuser');
			expect(submission.comments).toBe(50);
			expect(submission.hnUrl).toBe('https://news.ycombinator.com/item?id=123');
		});

		test('handles multiple submissions', async () => {
			mockFetch();

			const submissions = await scrapeHackerNews(10);

			expect(submissions.length).toBeGreaterThanOrEqual(2);
			expect(submissions[0].id).toBe('123');
			expect(submissions[1].id).toBe('456');
		});

		test('handles network errors', async () => {
			mockFetchError('Network error');

			await expect(scrapeHackerNews(30)).rejects.toThrow('Network error');
		});

		test('handles HTTP errors', async () => {
			const errorResponse = {
				ok: false,
				status: 404,
				text: async () => ''
			};
			mockFetch(errorResponse);

			await expect(scrapeHackerNews(30)).rejects.toThrow('HTTP error! status: 404');
		});

		test('handles malformed HTML gracefully', async () => {
			const malformedHTML = '<html><body>No submissions here</body></html>';
			mockFetch({
				ok: true,
				status: 200,
				text: async () => malformedHTML
			});

			const submissions = await scrapeHackerNews(30);

			expect(submissions).toEqual([]);
		});

		test('defaults to 30 submissions when no limit provided', async () => {
			mockFetch();

			const submissions = await scrapeHackerNews();

			// Should attempt to fetch up to 30 (limited by mock data)
			expect(submissions.length).toBeLessThanOrEqual(30);
		});

		test('handles submissions without all fields', async () => {
			const partialHTML = `
				<table>
					<tr class="athing" id="999">
						<td><span class="titleline"><a href="https://example.com/partial">Partial Story</a></span></td>
					</tr>
					<tr>
						<td><span class="subtext">
							<a href="user?id=user999" class="hnuser">user999</a>
						</span></td>
					</tr>
				</table>
			`;

			mockFetch({
				ok: true,
				status: 200,
				text: async () => partialHTML
			});

			const submissions = await scrapeHackerNews(1);

			expect(submissions.length).toBe(1);
			expect(submissions[0].id).toBe('999');
			expect(submissions[0].points).toBe(0); // No score, should default to 0
			expect(submissions[0].comments).toBe(0); // No comments, should default to 0
		});
	});

	describe('module exports', () => {
		test('exports scrapeHackerNews function', async () => {
			const module = await import('../../../browser-hn-scraper.js');
			expect(module.scrapeHackerNews).toBeDefined();
			expect(typeof module.scrapeHackerNews).toBe('function');
		});
	});
});
