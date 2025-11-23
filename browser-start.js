#!/usr/bin/env node

/**
 * browser-start.js - Refactored version
 *
 * This is an example of how browser-start.js would look after refactoring
 * to use the shared utility modules.
 */

import { spawn, execSync } from "node:child_process";
import { chromium } from "playwright";
import {
	getChromeExecutablePath,
	killChromeProcesses,
	waitForProcessTermination,
	getTempDir,
	syncChromeProfile,
} from "./shared/platform.js";

const useProfile = process.argv[2] === "--profile";

if (process.argv[2] && process.argv[2] !== "--profile") {
	console.log("Usage: browser-start.js [--profile]");
	console.log("\nOptions:");
	console.log("  --profile  Copy your default Chrome profile (cookies, logins)");
	console.log("\nExamples:");
	console.log("  browser-start.js            # Start with fresh profile");
	console.log("  browser-start.js --profile  # Start with your Chrome profile");
	process.exit(1);
}

// Only kill existing Chrome when using profile option
if (useProfile) {
	console.log("Closing existing Chrome processes (required for --profile)...");
	await killChromeProcesses(false, 2000);

	// Wait for processes to fully die
	const terminated = await waitForProcessTermination(3000);
	if (!terminated) {
		console.warn("⚠️  Chrome processes may still be running");
	}
}

// Setup profile directory
const tempDir = getTempDir();
execSync(`mkdir -p ${tempDir}`, { stdio: "ignore" });

if (useProfile) {
	try {
		console.log("Syncing Chrome profile...");
		syncChromeProfile();
		console.log("✓ Profile synced");
	} catch (error) {
		console.error("✗ Failed to sync profile:", error.message);
		process.exit(1);
	}
}

// Start Chrome in background (detached so Node can exit)
const chromeExe = getChromeExecutablePath();
spawn(chromeExe, ["--remote-debugging-port=9222", `--user-data-dir=${tempDir}`], {
	detached: true,
	stdio: "ignore",
}).unref();

// Wait for Chrome to be ready by attempting to connect
let connected = false;
for (let i = 0; i < 30; i++) {
	try {
		const browser = await chromium.connectOverCDP("http://localhost:9222");
		await browser.close();
		connected = true;
		break;
	} catch {
		await new Promise((r) => setTimeout(r, 500));
	}
}

if (!connected) {
	console.error("✗ Failed to connect to Chrome");
	process.exit(1);
}

console.log(`✓ Chrome started on :9222${useProfile ? " with your profile" : ""}`);
