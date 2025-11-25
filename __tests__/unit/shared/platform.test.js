/**
 * Unit tests for shared/platform.js
 */

import { jest } from '@jest/globals';

describe('shared/platform.js', () => {
	let mockPlatform;
	let mockHomedir;

	beforeEach(async () => {
		// Reset modules before each test
		jest.resetModules();
	});

	const setupMock = async (platformValue, homedirValue = '/home/user') => {
		mockPlatform = jest.fn(() => platformValue);
		mockHomedir = jest.fn(() => homedirValue);

		await jest.unstable_mockModule('node:os', () => ({
			platform: mockPlatform,
			homedir: mockHomedir
		}));
	};

	describe('getChromeExecutablePath', () => {
		test('returns macOS path', async () => {
			await setupMock('darwin');
			const { getChromeExecutablePath } = await import('../../../shared/platform.js');

			const path = getChromeExecutablePath();
			expect(path).toBe('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
		});

		test('returns Windows path', async () => {
			await setupMock('win32');
			const { getChromeExecutablePath } = await import('../../../shared/platform.js');

			const path = getChromeExecutablePath();
			expect(path).toBe('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe');
		});

		test('returns Linux path', async () => {
			await setupMock('linux');
			const { getChromeExecutablePath } = await import('../../../shared/platform.js');

			const path = getChromeExecutablePath();
			expect(path).toBe('/usr/bin/google-chrome');
		});

		test('throws error for unsupported platform', async () => {
			await setupMock('freebsd');
			const { getChromeExecutablePath } = await import('../../../shared/platform.js');

			expect(() => getChromeExecutablePath()).toThrow('Unsupported platform');
		});
	});

	describe('getChromeUserDataDir', () => {
		test('returns macOS user data directory', async () => {
			await setupMock('darwin', '/Users/testuser');
			const { getChromeUserDataDir } = await import('../../../shared/platform.js');

			const path = getChromeUserDataDir();
			expect(path).toContain('Library/Application Support/Google/Chrome');
		});

		test('returns Windows user data directory', async () => {
			await setupMock('win32', 'C:\\Users\\testuser');
			const { getChromeUserDataDir } = await import('../../../shared/platform.js');

			const path = getChromeUserDataDir();
			expect(path).toContain('AppData');
			expect(path).toContain('Local');
			expect(path).toContain('Google');
			expect(path).toContain('Chrome');
		});

		test('returns Linux user data directory', async () => {
			await setupMock('linux', '/home/testuser');
			const { getChromeUserDataDir } = await import('../../../shared/platform.js');

			const path = getChromeUserDataDir();
			expect(path).toContain('.config/google-chrome');
		});
	});

	describe('getChromeKillCommand', () => {
		test('returns macOS kill command', async () => {
			await setupMock('darwin');
			const { getChromeKillCommand } = await import('../../../shared/platform.js');

			const cmd = getChromeKillCommand();
			expect(cmd).toBe("killall 'Google Chrome'");
		});

		test('returns Windows kill command', async () => {
			await setupMock('win32');
			const { getChromeKillCommand } = await import('../../../shared/platform.js');

			const cmd = getChromeKillCommand();
			expect(cmd).toBe('taskkill /F /IM chrome.exe /T');
		});

		test('returns Linux kill command', async () => {
			await setupMock('linux');
			const { getChromeKillCommand } = await import('../../../shared/platform.js');

			const cmd = getChromeKillCommand();
			expect(cmd).toBe('killall chrome');
		});
	});

	describe('getTempDir', () => {
		test('returns cache directory path', async () => {
			await setupMock('darwin', '/Users/testuser');
			const { getTempDir } = await import('../../../shared/platform.js');

			const path = getTempDir();
			expect(path).toContain('.cache/browser-tools');
		});
	});

	describe('getRsyncCommand', () => {
		test('returns rsync command with correct paths', async () => {
			await setupMock('darwin');
			const { getRsyncCommand } = await import('../../../shared/platform.js');

			const cmd = getRsyncCommand('/source/path', '/dest/path');
			expect(cmd).toBe('rsync -a --delete "/source/path/" "/dest/path/"');
		});

		test('throws error on Windows', async () => {
			await setupMock('win32');
			const { getRsyncCommand } = await import('../../../shared/platform.js');

			expect(() => getRsyncCommand('/src', '/dest')).toThrow('not supported on Windows');
		});
	});

	describe('getPlatformInfo', () => {
		test('returns platform info object', async () => {
			await setupMock('darwin', '/Users/testuser');
			const { getPlatformInfo } = await import('../../../shared/platform.js');

			const info = getPlatformInfo();

			expect(info).toHaveProperty('platform');
			expect(info).toHaveProperty('isWindows');
			expect(info).toHaveProperty('isMacOS');
			expect(info).toHaveProperty('isLinux');
			expect(info).toHaveProperty('homedir');

			// One of the platform flags should be true
			const platformFlags = [info.isWindows, info.isMacOS, info.isLinux];
			expect(platformFlags.filter(Boolean)).toHaveLength(1);
		});

		test('correctly identifies macOS', async () => {
			await setupMock('darwin', '/Users/testuser');
			const { getPlatformInfo } = await import('../../../shared/platform.js');

			const info = getPlatformInfo();
			expect(info.isMacOS).toBe(true);
			expect(info.isWindows).toBe(false);
			expect(info.isLinux).toBe(false);
		});

		test('correctly identifies Windows', async () => {
			await setupMock('win32', 'C:\\Users\\testuser');
			const { getPlatformInfo } = await import('../../../shared/platform.js');

			const info = getPlatformInfo();
			expect(info.isWindows).toBe(true);
			expect(info.isMacOS).toBe(false);
			expect(info.isLinux).toBe(false);
		});

		test('correctly identifies Linux', async () => {
			await setupMock('linux', '/home/testuser');
			const { getPlatformInfo } = await import('../../../shared/platform.js');

			const info = getPlatformInfo();
			expect(info.isLinux).toBe(true);
			expect(info.isMacOS).toBe(false);
			expect(info.isWindows).toBe(false);
		});
	});
});
