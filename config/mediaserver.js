const ssl = require( './ssl.js' );
const NodeMediaServer = require( 'node-media-server' );

const opts = { };

ssl.readCertificates( opts, ( err, certs ) => {

	const https = {
		port: 8001,
		key: certs.keyPath,
		cert: certs.certPath,
		allow_origin: '*'
	};

	const http = {
		port: 8000,
		key: certs.keyPath,
		cert: certs.certPath,
		allow_origin: '*'
	};

	const rtmp = {
		port: 1935,
		chunk_size: 60000,
		gop_cache: true,
		ping: 30,
		ping_timeout: 60
	};

	const nms = new NodeMediaServer( { rtmp, http, https } );
	nms.run();

} );

