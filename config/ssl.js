const pem = require( 'pem' );
const fs = require( 'fs-extra' );
const utils = require ( './utils.js' );
const path = require( 'path' );

// we are the server, we don't need this
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


function generateSSLCertificates( callback ) {

	console.debug( 'ssl: generateSSLCertificates: generating new self signed SSL Certificates ...' );

	const pemOptions = {
		days: 365,
		selfSigned: true
	};

	pem.createCertificate( pemOptions, ( err, keys ) => {

		if ( err ) throw err;

		const opts = {};
		opts.key = keys.serviceKey;
		opts.cert = keys.certificate;
		callback( null, opts );

	} );

}

function readCertificates( options, callback ) {

	const homePath = utils.getHome();
	const fileKey = path.join( homePath, 'certs', 'server.key' );
	const fileCrt = path.join( homePath, 'certs', 'server.crt' );
	//const fileCa = path.join( homePath, 'certs', 'ca.crt' );

	const result = {};
	result.keyPath = fileKey;
	result.certPath = fileCrt;

	try {

		console.debug( `readCertificates: reading self signed private key ${fileKey}` );
		console.debug( `readCertificates: reading self signed certificate ${fileCrt}` );

		result.key = fs.readFileSync( fileKey );
		result.cert = fs.readFileSync( fileCrt );
		//options.ca = fs.readFileSync( fileCa );

	} catch( e ) {

		// file can not be read or does not exists

	}


	if ( !result.key || !result.cert ) {

		fs.ensureDirSync( path.join( homePath, 'certs' ) );

		generateSSLCertificates( ( err, opts ) => {

			console.debug( `ssl: readCertificates: writing self signed private key ${fileKey}` );
			console.debug( `ssl: readCertificates: writing self signed certificate ${fileCrt}` );

			fs.writeFileSync( fileKey, opts.key.toString() );
			fs.writeFileSync( fileCrt, opts.cert.toString() );
			result.key = opts.key;
			result.cert = opts.cert;
			callback && callback( null, result );

		} );

	} else {

		console.debug( `ssl: readCertificates: using self signed private key ${fileKey}` );
		console.debug( `ssl: readCertificates: using self signed certificate ${fileCrt}` );

		callback && callback( null, result );

	}


}

module.exports = {
	readCertificates
};
