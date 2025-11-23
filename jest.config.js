export default {
	testEnvironment: 'node',

	// ESM support
	transform: {},

	// Test file patterns
	testMatch: [
		'**/__tests__/**/*.test.js',
		'**/?(*.)+(spec|test).js'
	],

	// Coverage configuration
	collectCoverageFrom: [
		'browser-*.js',
		'shared/**/*.js',
		'!browser-hn-scraper.js',
		'!**/*.refactored.js',
		'!**/__tests__/**',
		'!**/node_modules/**'
	],

	coveragePathIgnorePatterns: [
		'/node_modules/',
		'/__tests__/',
		'.refactored.js'
	],

	coverageThreshold: {
		global: {
			branches: 70,
			functions: 75,
			lines: 80,
			statements: 80
		}
	},

	// Test timeout (30 seconds for E2E tests)
	testTimeout: 30000,

	// Verbose output
	verbose: true,

	// Setup files
	setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],

	// Module resolution
	moduleDirectories: ['node_modules', '<rootDir>'],

	// Clear mocks between tests
	clearMocks: true,
	resetMocks: true,
	restoreMocks: true,
};
