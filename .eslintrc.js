module.exports = {
	env: {
		'browser': true,
		//'es6': false,
		//'module': true,
		'node':true
	},
	parser: '@babel/eslint-parser',
	parserOptions: {
		ecmaFeatures: {
			globalReturn: false
		},
		ecmaVersion: 2020,
		sourceType: 'module',
		allowImportExportEverywhere: true,
		requireConfigFile: false

	},
	plugins: [
		//'@babel'
	],
	extends: [
		'eslint:recommended',
	],
	rules: {
		'indent': [ 'error', 'tab' ],
		//'indent': [ 'error', 4 ], space
		'linebreak-style': [ 'error', 'unix' ],
		'quotes': [ 'error', 'single' ],
		'semi': [ 'error', 'always' ],
		'no-unused-vars': [ 'warn', 'all' ],
		'no-var': [ 'warn' ],
		'no-console': 'off',
		'object-curly-spacing':[ 'error','always' ],
		'array-bracket-spacing':[ 'error','always' ],
		'block-spacing':[ 'error','always' ],
		'space-before-blocks':[ 'error','always' ],
		'space-in-parens':[ 'error','always' ],
		'space-infix-ops': [ 'error', { 'int32Hint': false } ]
	},
	ignorePatterns: [
		'node_modules',
		'src/dist'
	]
};

