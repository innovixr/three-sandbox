const path = require( 'path' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const utils = require( './utils.js' );

//
const MODULE_NAME = 'three-datgui-xr';
const PUBLIC_PATH = 'public';
const TEMPLATE_PATH = `../${PUBLIC_PATH}/html`;

// data in format [ JS file name => demo title in public pages ]
let pages = [
	[ 'tut_basic_setup', 'basic setup' ],
];

// create one config for each of the data set above
let plugins = pages.map( ( page )=> {
	return new HtmlWebpackPlugin( {
		title: page[0],
		filename: page[0] + '.html',
		template: path.resolve( __dirname, `${TEMPLATE_PATH}/template.html` ),
		chunks: [ page[0], MODULE_NAME ],
		inject: true
	} );
} );

function pageReducer( accu, page ) {
	return accu + `<li title="${page[0]}">${page[1]}</li>`;
}

// just add one config for the index page

const allPages = {
	examples:pages.filter( x=>x[0].indexOf( 'ex_' ) === 0 ).reduce( pageReducer, '' ),
	features:pages.filter( x=>x[0].indexOf( 'feat_' ) === 0 ).reduce( pageReducer, '' ),
	tutorials:pages.filter( x=>x[0].indexOf( 'tut_' ) === 0 ).reduce( pageReducer, '' ),
	dev:pages.filter( x=>x[0].indexOf( 'dev_' ) === 0 ).reduce( pageReducer, '' )
};

const indexConfig = new HtmlWebpackPlugin( {
	pages: allPages,
	environment: {
		production: false
	},
	filename: 'index.html',
	template: path.resolve( __dirname, `${TEMPLATE_PATH}/index.html` ),
	inject: false
} );
plugins.push( indexConfig );

module.exports = env => {

	let mode = 'development';
	let devtool = 'eval-source-map';

	// Prod environment
	if ( env.NODE_ENV === 'prod' ) {
		devtool = false;
		mode = 'production';
	}

	const entry = {};
	entry[ `../dist/${MODULE_NAME}` ] = `./src/${MODULE_NAME}.js`;
	for ( let page of pages ) {
		entry[ page[0] ] = `./${PUBLIC_PATH}/${page[0]}.js`;
	}

	const alias = {};
	// add an alias of three-datgui-xr itself in order to make examples more real-case
	// scenario and avoiding ../src/three-datgui-xr;
	alias[ `${MODULE_NAME}/${PUBLIC_PATH}` ] = path.resolve( __dirname, `../${PUBLIC_PATH}/` );
	alias[ `${MODULE_NAME}`] = path.resolve( __dirname, `../src/${MODULE_NAME}.js` );
	//alias[ `/assets/`] = path.resolve( __dirname, `../${PUBLIC_PATH}/assets/` );

	const wp = {
		mode,
		devtool,
		entry,
		plugins,
		devServer: {
			static: {
				directory: path.join( __dirname, `../${PUBLIC_PATH}/assets/` ),
				publicPath: '/assets',
			},
			server: env.NODE_SSL ? 'https' : 'http',
			port: env.NODE_SSL ? '8443' : '8080',
			host: env.NODE_SSL ? utils.getIpAddress( /wi-fi|eth0/i ) : 'localhost'
		},

		output: {
			filename: '[name].js',
			path: path.resolve( __dirname, '../dist' )
		},

		resolve: {
			alias
		},

		module: {
			rules: [
				{
					test: /\.(png|svg|jpg|gif)$/,
					use: [ 'file-loader' ],
				}
			],
		}
	};

	return wp;
};
