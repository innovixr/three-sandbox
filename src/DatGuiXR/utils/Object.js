class Object {
	static merge( ...objects ) {
		const isObject = obj => obj && typeof obj === 'object';

		return objects.reduce( ( prev, obj ) => {
			Object.keys( obj ).forEach( key => {
				const pVal = prev[ key ];
				const oVal = obj[ key ];

				if ( Array.isArray( pVal ) && Array.isArray( oVal ) )
				{
					// use this line to contact object rather than replace
					//prev[key] = pVal.concat(...oVal);
					// in our case, don't concat but just replace
					prev[ key ] = oVal;
				} else if ( isObject( pVal ) && isObject( oVal ) )
				{
					prev[ key ] = this.merge( pVal, oVal );
				} else
				{
					prev[ key ] = oVal;
				}
			} );

			return prev;
		}, {} );
	}
}

export { Object };

