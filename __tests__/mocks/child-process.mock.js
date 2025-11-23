/**
 * Mock child_process functions for testing
 */

export const mockSpawn = jest.fn(() => ({
	unref: jest.fn(),
	on: jest.fn(),
	kill: jest.fn(),
	pid: 12345
}));

export const mockExecSync = jest.fn((cmd) => {
	// Simulate different commands
	if (cmd.includes('killall') || cmd.includes('taskkill')) {
		return ''; // Success, no output
	}
	if (cmd.includes('mkdir')) {
		return ''; // Success
	}
	if (cmd.includes('rsync') || cmd.includes('robocopy')) {
		return ''; // Success
	}
	if (cmd.includes('pgrep') || cmd.includes('tasklist')) {
		// Throw error to simulate process not found
		const error = new Error('Command failed');
		error.status = 1;
		throw error;
	}
	return '';
});

export const mockExec = jest.fn((cmd, callback) => {
	callback(null, '', '');
});

/**
 * Reset all process mocks
 */
export const resetProcessMocks = () => {
	mockSpawn.mockClear();
	mockExecSync.mockClear();
	mockExec.mockClear();
};
