class Css {

	#split( str, on ) {
		//Split, Trim, and remove empty elements
		return str.split( on ).map( x => x.trim() ).filter( x => x );
	}

	#normalize( str ) {
		if ( !str ) return '';
		str = String( str ).replace( /\s*([>~+])\s*/g, ' $1 ' );  //Normalize symbol spacing.
		return str.replace( /(\s+)/g, ' ' ).trim();           //Normalize whitespace
	}

	#containsAny( selText, ors ) {
		return selText ? ors.some( x => selText.indexOf( x ) >= 0 ) : false;
	}

	static getCssClasses( selector ) {
		const logicalORs = this.#split( this.#normalize( selector ), ',' );
		const sheets = Array.from( window.document.styleSheets );
		const ruleArrays = sheets.map( ( x ) => Array.from( x.rules || x.cssRules || [] ) );
		const allRules = ruleArrays.reduce( ( all, x ) => all.concat( x ), [] );
		return allRules.filter( ( x ) => this.#containsAny( this.#normalize( x.selectorText ), logicalORs ) );
	}
}


export { Css };
