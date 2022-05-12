const assert = require( 'assert' );
const path = require( 'path' );
const fs = require( 'fs-extra' );
const networkInterfaces = require( 'os' ).networkInterfaces;

function getPackageName() {

	const packageJsonFile = path.resolve( __dirname, '..', 'package.json' );
	return fs.readJsonSync( packageJsonFile ).name;

}

function getHome() {

	let home = process.env.APPDATA || ( process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share' );
	home = path.join( home, getPackageName() );
	console.debug( `util: getHome: using path ${home}` );
	fs.ensureDirSync( home );

	return home;

}

function getIpAddress( interfaceRegexp ) {

	console.debug( 'utils: getIpAddress', interfaceRegexp );

	const nets = networkInterfaces();
	const keys = Object.keys( nets );
	let ip, name, net;

	for ( name of keys )
	{

		for ( net of nets[ name ] )
		{

			// Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
			if (
				net.family === 'IPv4' &&
				!net.internal &&
				name.match( interfaceRegexp )
			)
			{

				ip = net.address;

			}

		}

	}

	if ( !ip )
	{

		throw new Error( 'Could not fetch Wi-Fi IP Address' );

	}

	return ip;

}

function compileRegexp( str, flags ) {

	if ( !str )
		return;

	if ( str instanceof RegExp )
	{

		// already a regexp
		return str;

	}

	assert( typeof str === 'string', `compileRegexp: first arguments should be a string or a regexp, actual ${typeof str}` );

	if ( !flags )
		flags = 'ig';


	str = str.replace( /\\\\/, '\\', str );


	try
	{

		str = new RegExp( str, flags );

	} catch ( e )
	{

		throw new Error( `${e.message}` );

	}

	console.debug( 'compileRegexp', str );

	return str;

}

module.exports = {
	getPackageName,
	getHome,
	getIpAddress,
	compileRegexp,
};
