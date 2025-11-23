/**
 * Mock fetch responses for testing
 */
import { jest } from '@jest/globals';

/**
 * Mock Hacker News HTML response
 */
export const mockHackerNewsHTML = `
<!DOCTYPE html>
<html>
<body>
	<table border="0" cellpadding="0" cellspacing="0">
		<tr class="athing" id="123">
			<td>
				<span class="titleline">
					<a href="https://example.com/story1">Example Story 1</a>
				</span>
			</td>
		</tr>
		<tr>
			<td>
				<span class="subtext">
					<span id="score_123">100 points</span> by
					<a href="user?id=testuser" class="hnuser">testuser</a>
					<span class="age" title="2025-11-20T12:00:00">1 hour ago</span> |
					<a href="item?id=123">50 comments</a>
				</span>
			</td>
		</tr>
		<tr class="athing" id="456">
			<td>
				<span class="titleline">
					<a href="https://example.com/story2">Example Story 2</a>
				</span>
			</td>
		</tr>
		<tr>
			<td>
				<span class="subtext">
					<span id="score_456">200 points</span> by
					<a href="user?id=author2" class="hnuser">author2</a>
					<span class="age" title="2025-11-20T11:00:00">2 hours ago</span> |
					<a href="item?id=456">75 comments</a>
				</span>
			</td>
		</tr>
	</table>
</body>
</html>
`;

/**
 * Create mock fetch response
 */
export const createMockFetchResponse = (html = mockHackerNewsHTML, ok = true, status = 200) => ({
	ok,
	status,
	text: async () => html,
	json: async () => JSON.parse(html)
});

/**
 * Mock global fetch
 */
export const mockFetch = (response = createMockFetchResponse()) => {
	global.fetch = jest.fn().mockResolvedValue(response);
	return global.fetch;
};

/**
 * Mock fetch error
 */
export const mockFetchError = (errorMessage = 'Network error') => {
	global.fetch = jest.fn().mockRejectedValue(new Error(errorMessage));
	return global.fetch;
};

/**
 * Reset fetch mock
 */
export const resetFetchMock = () => {
	if (global.fetch && global.fetch.mockReset) {
		global.fetch.mockReset();
	}
};
