//const webpack = require( 'webpack' );

// eslint-disable-next-line no-unused-vars
module.exports = env => {

	return {

		mode: 'production',

		entry: {
			'../build/three-datgui-xr': './src/three-datgui-xr.js',
		},

		output: {
			filename: '[name].js',
			library: 'ThreeDatGuiXR',
			libraryTarget: 'umd'
		}


	};

};
