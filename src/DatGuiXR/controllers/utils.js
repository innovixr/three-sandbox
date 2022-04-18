function isDefined( value ) {
	return typeof value !== 'undefined';
}

function isUndefined( value ) {
	return typeof value === 'undefined';
}

function isEmptyString( value ) {
	if ( value === undefined ) return true;
	if ( value === null ) return true;
	if ( value === '' ) return true;
	return false;
}

function mergeConfig( ...objects ) {
	const isObject = obj => obj && typeof obj === 'object';

	return objects.reduce( ( prev, obj ) => {
		Object.keys( obj ).forEach( key => {
			const pVal = prev[key];
			const oVal = obj[key];

			if ( Array.isArray( pVal ) && Array.isArray( oVal ) ) {
				// use this line to contact object rather than replace
				//prev[key] = pVal.concat(...oVal);
				// in our case, don't concat but just replace
				prev[key] = oVal;
			} else if ( isObject( pVal ) && isObject( oVal ) ) {
				prev[key] = mergeConfig( pVal, oVal );
			} else {
				prev[key] = oVal;
			}
		} );

		return prev;
	}, {} );
}

const getCssClasses = ( function () {
	// inside closure so that the inner functions don't need regeneration on every call.
	function normalize( str ) {
		if ( !str )  return '';
		str = String( str ).replace( /\s*([>~+])\s*/g, ' $1 ' );  //Normalize symbol spacing.
		return str.replace( /(\s+)/g, ' ' ).trim();           //Normalize whitespace
	}

	function split( str, on ) {               //Split, Trim, and remove empty elements
		return str.split( on ).map( x => x.trim() ).filter( x => x );
	}

	function containsAny( selText, ors ) {
		return selText ? ors.some( x => selText.indexOf( x ) >= 0 ) : false;
	}

	return function ( selector ) {
		const logicalORs = split( normalize( selector ), ',' );
		const sheets = Array.from( window.document.styleSheets );
		const ruleArrays = sheets.map( ( x ) => Array.from( x.rules || x.cssRules || [] ) );
		const allRules = ruleArrays.reduce( ( all, x ) => all.concat( x ), [] );
		return allRules.filter( ( x ) => containsAny( normalize( x.selectorText ), logicalORs ) );
	};
} )();

export {
	isDefined,
	isUndefined,
	isEmptyString,
	mergeConfig,
	getCssClasses
};
