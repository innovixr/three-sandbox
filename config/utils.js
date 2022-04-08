const networkInterfaces = require( 'os' ).networkInterfaces;

function getIpAddress( interfaceRegexp ) {
	console.assert( interfaceRegexp instanceof RegExp );

	const nets = networkInterfaces();
	const keys = Object.keys( nets );
	let ip, name, net;

	for ( name of keys ) {
		for ( net of nets[ name]  ) {

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

module.exports = {
	getIpAddress: getIpAddress
};
