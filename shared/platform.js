/**
 * Platform-specific utilities
 *
 * This module provides cross-platform functions for operations that
 * differ between operating systems (macOS, Windows, Linux).
 */

import { homedir, platform } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";

/**
 * Get the Chrome executable path for the current platform
 * @returns {string} Path to Chrome executable
 */
export function getChromeExecutablePath() {
	const plat = platform();

	switch (plat) {
		case "darwin": // macOS
			return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
		case "win32": // Windows
			return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
		case "linux":
			return "/usr/bin/google-chrome";
		default:
			throw new Error(`Unsupported platform: ${plat}`);
	}
}

/**
 * Get the default Chrome user data directory for the current platform
 * @returns {string} Path to Chrome user data directory
 */
export function getChromeUserDataDir() {
	const plat = platform();
	const home = homedir();

	switch (plat) {
		case "darwin": // macOS
			return join(home, "Library/Application Support/Google/Chrome");
		case "win32": // Windows
			return join(home, "AppData/Local/Google/Chrome/User Data");
		case "linux":
			return join(home, ".config/google-chrome");
		default:
			throw new Error(`Unsupported platform: ${plat}`);
	}
}

/**
 * Get the command to kill Chrome processes
 * @returns {string} Kill command for the current platform
 */
export function getChromeKillCommand() {
	const plat = platform();

	switch (plat) {
		case "darwin": // macOS
			return "killall 'Google Chrome'";
		case "win32": // Windows
			return "taskkill /F /IM chrome.exe /T";
		case "linux":
			return "killall chrome";
		default:
			throw new Error(`Unsupported platform: ${plat}`);
	}
}

/**
 * Kill all Chrome processes (with user warning)
 * @param {boolean} silent - If true, don't show warning
 * @param {number} warningDelayMs - Milliseconds to wait after warning (default: 3000)
 */
export async function killChromeProcesses(silent = false, warningDelayMs = 0) {
	if (!silent && warningDelayMs > 0) {
		console.warn(
			"⚠️  This will close ALL Chrome windows. Press Ctrl+C to cancel...",
		);
		await new Promise((r) => setTimeout(r, warningDelayMs));
	}

	try {
		const killCommand = getChromeKillCommand();
		execSync(killCommand, { stdio: "ignore" });

		if (!silent) {
			console.log("✓ Chrome processes terminated");
		}
	} catch (error) {
		// Ignore errors - Chrome might not be running
	}
}

/**
 * Wait for processes to fully terminate
 * This is more reliable than a fixed timeout
 * @param {number} maxWaitMs - Maximum time to wait in milliseconds
 */
export async function waitForProcessTermination(maxWaitMs = 3000) {
	const plat = platform();
	const checkCommand =
		plat === "win32"
			? 'tasklist /FI "IMAGENAME eq chrome.exe" 2>NUL | find /I "chrome.exe"'
			: "pgrep -x 'Google Chrome' || pgrep -x chrome";

	const startTime = Date.now();

	while (Date.now() - startTime < maxWaitMs) {
		try {
			execSync(checkCommand, { stdio: "ignore" });
			// Chrome still running, wait a bit
			await new Promise((r) => setTimeout(r, 200));
		} catch {
			// Chrome not found, process terminated
			return true;
		}
	}

	return false; // Timed out
}

/**
 * Get the temporary directory path
 * @returns {string} Temp directory path
 */
export function getTempDir() {
	return join(homedir(), ".cache/scraping");
}

/**
 * Get rsync command for syncing Chrome profile (macOS/Linux only)
 * @param {string} source - Source directory
 * @param {string} destination - Destination directory
 * @returns {string} rsync command
 */
export function getRsyncCommand(source, destination) {
	const plat = platform();

	if (plat === "win32") {
		throw new Error(
			"Profile syncing with rsync is not supported on Windows. Use robocopy instead.",
		);
	}

	return `rsync -a --delete "${source}/" "${destination}/"`;
}

/**
 * Sync Chrome profile directory
 * @param {string} source - Source directory (optional, defaults to system Chrome profile)
 * @param {string} destination - Destination directory (optional, defaults to temp dir)
 */
export function syncChromeProfile(source = null, destination = null) {
	const src = source || getChromeUserDataDir();
	const dest = destination || getTempDir();

	const plat = platform();

	try {
		if (plat === "win32") {
			// Windows: use robocopy
			execSync(`robocopy "${src}" "${dest}" /MIR /NFL /NDL /NJH /NJS /nc /ns /np`, {
				stdio: "pipe",
			});
		} else {
			// macOS/Linux: use rsync
			const rsyncCmd = getRsyncCommand(src, dest);
			execSync(rsyncCmd, { stdio: "pipe" });
		}
	} catch (error) {
		// robocopy returns non-zero exit codes even on success
		// Only throw if it's not a robocopy success code (0-7)
		if (plat === "win32" && error.status <= 7) {
			return; // Success
		}
		throw error;
	}
}

/**
 * Get platform information
 * @returns {Object} Platform details
 */
export function getPlatformInfo() {
	return {
		platform: platform(),
		isWindows: platform() === "win32",
		isMacOS: platform() === "darwin",
		isLinux: platform() === "linux",
		homedir: homedir(),
	};
}
