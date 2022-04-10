//const webpack = require( 'webpack' );

// eslint-disable-next-line no-unused-vars
module.exports = env => {

	return {

		mode: 'production',

		entry: {
			'../build/three-sandbox': './src/three-sandbox.js',
		},

		output: {
			filename: '[name].js',
			library: 'ThreeSandbox',
			libraryTarget: 'umd'
		}


	};

};
