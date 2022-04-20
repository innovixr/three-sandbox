
class Test {

	static isDefined( value ) {
		return typeof value !== 'undefined';
	}

	static isUndefined( value ) {
		return typeof value === 'undefined';
	}

	static isEmptyString( value ) {
		if ( value === undefined ) return true;
		if ( value === null ) return true;
		if ( value === '' ) return true;
		return false;
	}

	static isNumber( value ) {
		return !Number.isNaN( parseFloat( value ) );
	}
}

export { Test };
