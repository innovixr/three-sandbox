const path = require( 'path' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const CopyPlugin = require( 'copy-webpack-plugin' );
const networkInterfaces = require( 'os' ).networkInterfaces;

const MODULE_NAME = 'three-sandbox';
const PUBLIC_PATH = 'public';
const TEMPLATE_PATH = `../${PUBLIC_PATH}/html`;

// data in format [ JS file name => demo title in public pages ]
let pages = [
	[ 'exp_basic_setup', 'Basic setup' ],
	//[ 'kit_basic_setup', 'Basic setup' ],
	[ 'three_webgl', 'THREE WebGL test' ],
	[ 'three_htmlmesh', 'THREE.HTMLMesh test' ],
	[ 'three_obs', 'THREE OBS' ],
	[ 'three_torus', 'THREE Torus' ],
	[ 'datguixr_keyboard', 'Keyboard' ],
	[ 'pixi_keyboard_v1', 'Keyboard v1' ],
	[ 'pixi_keyboard_v2', 'Keyboard v2' ],
	[ 'pixi_keyboard_v3', 'Keyboard v3' ],
];

const keys = [
	'exp',
	//'kit',
	'datguixr',
	'three',
	'pixi'
];


function getIpAddress( interfaceRegexp ) {
	console.assert( interfaceRegexp instanceof RegExp );

	const nets = networkInterfaces();
	const keys = Object.keys( nets );
	let ip, name, net;

	for ( name of keys ) {
		for ( net of nets[name] ) {
			// Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
			if (
				net.family === 'IPv4'
				&& !net.internal
				&& name.match( interfaceRegexp )
			) {
				ip = net.address;
			}

		}

	}

	if ( !ip ) {
		throw new Error( 'Error: could not fetch private IP address' );
	}

	return ip;
}

// create one config for each of the data set above
let plugins = pages.map( ( page ) => {
	return new HtmlWebpackPlugin( {
		title: page[0],
		filename: page[0] + '.html',
		template: path.resolve( __dirname, `${TEMPLATE_PATH}/template.html` ),
		chunks: [ page[0], MODULE_NAME ],
		inject: true,
	} );
} );

const allPages = {};

for ( let key of keys )
	allPages[ key ] = pages.filter( x => x[ 0 ].indexOf( `${key}_` ) === 0 ).reduce( pageReducer, '' );

function pageReducer( accu, page ) {
	return accu + `<li title="${page[0]}">${page[1]}</li>`;
}

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
	entry[`../dist/${MODULE_NAME}`] = `./src/${MODULE_NAME}.js`;
	for ( let page of pages ) {
		entry[page[0]] = `./${PUBLIC_PATH}/${page[0]}.js`;
	}

	const alias = {};
	// add an alias of for itself in order to make examples more real-case
	// scenario and avoiding ../src/..;
	alias[`${MODULE_NAME}/${PUBLIC_PATH}`] = path.resolve( __dirname, `../${PUBLIC_PATH}/` );
	alias[`${MODULE_NAME}`] = path.resolve( __dirname, `../src/${MODULE_NAME}.js` );
	alias[ 'DatGuiXR' ] = path.resolve( __dirname, '../src/DatGuiXR/DatGuiXR.js' );
	alias[ 'three-kit' ] = path.resolve( __dirname, '../src/KIT/KIT.js' );
	alias[ 'three-pixit' ] = path.resolve( __dirname, '../src/three-pixit/three-pixit.js' );

	//alias[ `/assets/`] = path.resolve( __dirname, `../${PUBLIC_PATH}/assets/` );

	const wp = {
		mode,
		devtool,
		entry,
		plugins,
		devServer: {
			static: {
				directory: path.join( __dirname, `../${PUBLIC_PATH}/` ),
				publicPath: '/',
			},
			server: env.NODE_SSL ? 'https' : 'http',
			port: env.NODE_SSL ? '8443' : '8080',
			host: env.NODE_SSL ? getIpAddress( /wi-fi|eth0|Ethernet/i ) : 'localhost'
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


	if ( mode === 'production' )
	{
		delete wp.devtool;
		wp.mode = 'production';
		wp.plugins.push( new CopyPlugin( {
			patterns: [
				{ from: 'public/assets/*.*', to: 'assets/[name][ext]' },
			],
		} ) );

		wp.optimization = {
			minimize: true,
			/*
			minimizer: [
				new TerserPlugin( {
					test: /\.js(\?.*)?$/i,
					extractComments: 'some',
					terserOptions: {
						format: {
							comments: /@license/i,
						},
						compress: {
							drop_console: true,
						},
					}
				} ),
			],
			*/
		};
	}

	return wp;
};
