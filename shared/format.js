/**
 * Shared output formatting utilities
 *
 * This module provides common functions for formatting and displaying
 * results from browser operations in a consistent way.
 */

/**
 * Print a result value to console with proper formatting
 * Handles primitives, objects, and arrays of objects
 *
 * @param {*} result - The result to print (can be primitive, object, or array)
 */
export function printResult(result) {
	if (result === null || result === undefined) {
		console.log(result);
		return;
	}

	if (Array.isArray(result)) {
		printArray(result);
	} else if (typeof result === "object") {
		printObject(result);
	} else {
		console.log(result);
	}
}

/**
 * Print an array of items
 * @param {Array} items - Array to print
 */
function printArray(items) {
	for (let i = 0; i < items.length; i++) {
		if (i > 0) console.log(""); // Empty line between items

		if (typeof items[i] === "object" && items[i] !== null) {
			printObject(items[i]);
		} else {
			console.log(items[i]);
		}
	}
}

/**
 * Print an object as key-value pairs
 * @param {Object} obj - Object to print
 */
function printObject(obj) {
	for (const [key, value] of Object.entries(obj)) {
		console.log(`${key}: ${value}`);
	}
}

/**
 * Print element information from browser-pick
 * @param {Object|Array} elementInfo - Element info or array of element infos
 */
export function printElementInfo(elementInfo) {
	if (!elementInfo) {
		console.log("✗ No element selected");
		return;
	}

	printResult(elementInfo);
}

/**
 * Print cookies in a readable format
 * @param {Array} cookies - Array of cookie objects
 * @param {boolean} maskSensitive - Whether to mask sensitive cookie values
 */
export function printCookies(cookies, maskSensitive = false) {
	if (!cookies || cookies.length === 0) {
		console.log("No cookies found");
		return;
	}

	const sensitivePatterns = ["session", "token", "auth", "jwt", "password"];

	for (const cookie of cookies) {
		const isSensitive =
			maskSensitive &&
			sensitivePatterns.some((pattern) => cookie.name.toLowerCase().includes(pattern));

		const value = isSensitive ? "***MASKED***" : cookie.value;

		console.log(`${cookie.name}: ${value}`);
		console.log(`  domain: ${cookie.domain}`);
		console.log(`  path: ${cookie.path}`);
		console.log(`  httpOnly: ${cookie.httpOnly}`);
		console.log(`  secure: ${cookie.secure}`);
		console.log("");
	}

	if (maskSensitive) {
		console.log(
			"ℹ️  Sensitive cookies (containing 'session', 'token', 'auth', etc.) are masked",
		);
	}
}

/**
 * Format a timestamp for filenames (replaces colons and dots)
 * @param {Date} date - Date object to format
 * @returns {string} Formatted timestamp
 */
export function formatTimestampForFilename(date = new Date()) {
	return date.toISOString().replace(/[:.]/g, "-");
}

/**
 * Print JSON output (useful for piping to other tools)
 * @param {*} data - Data to output as JSON
 * @param {boolean} pretty - Whether to pretty-print the JSON
 */
export function printJSON(data, pretty = false) {
	console.log(JSON.stringify(data, null, pretty ? 2 : 0));
}

/**
 * Print a success message
 * @param {string} message - Success message
 */
export function printSuccess(message) {
	console.log(`✓ ${message}`);
}

/**
 * Print an error message and optionally exit
 * @param {string} message - Error message
 * @param {boolean} exit - Whether to exit the process
 */
export function printError(message, exit = false) {
	console.error(`✗ ${message}`);
	if (exit) {
		process.exit(1);
	}
}

/**
 * Print a warning message
 * @param {string} message - Warning message
 */
export function printWarning(message) {
	console.warn(`⚠️  ${message}`);
}
