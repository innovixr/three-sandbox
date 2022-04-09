import * as THREE from 'three';

const SimpleDateGuiTextHelper = function( options ) {

	this._options = options;
	this.start = 0;
	this.end = 0;
	this.cursor = 0;
	this.truncated = false;
	this.residiumX = 0.0;
	this.isLastCallLeft = false;
	this.isTruncated = false;
	this.possibleCursorPositons = [];
};

/**
 * This is a dirty workaround for the not always correct size of characters in
 * the font shapes. Replace all not working characters with similar size
 * characters.
 */
SimpleDateGuiTextHelper.prototype.createFontShapes = function( value ) {

	let valueNew = value;
	valueNew = valueNew.split( ' ' ).join( ']' );
	valueNew = valueNew.split( '"' ).join( '°' );
	valueNew = valueNew.split( '%' ).join( 'W' );
	valueNew = valueNew.split( '!' ).join( ',' );
	valueNew = valueNew.split( ':' ).join( ',' );
	valueNew = valueNew.split( '|' ).join( '2' );
	valueNew = valueNew.split( ';' ).join( ',' );
	valueNew = valueNew.split( '?' ).join( 's' );
	valueNew = valueNew.split( 'ö' ).join( 's' );
	valueNew = valueNew.split( 'ä' ).join( 's' );
	valueNew = valueNew.split( 'ü' ).join( 's' );
	valueNew = valueNew.split( 'ß' ).join( 's' );
	valueNew = valueNew.split( 'i' ).join( 'I' );
	valueNew = valueNew.split( 'j' ).join( 'l' );
	valueNew = valueNew.split( 'k' ).join( 'h' );

	let shapes = this._options.GLOBAL_FONT.generateShapes( valueNew, this._options.FONT, this._options.DELTA_Z );

	return shapes;
};

SimpleDateGuiTextHelper.prototype.calculateRightAlignText = function( value ) {

	// Start with the complete string
	this.isTruncated = false;
	this.truncated = value;
	this.residiumX = 0;
	this.end = value.length - 1;

	let fontshapesAll = this.createFontShapes( value );
	let size = this._options.TEXT.x;
	for ( let i = fontshapesAll.length - 1; i > 1; i-- ) {
		let textGeometry1 = new THREE.ShapeGeometry( fontshapesAll[i - 1] );
		textGeometry1.computeBoundingBox();
		let boundingBox1 = textGeometry1.boundingBox;

		let textGeometry2 = new THREE.ShapeGeometry( fontshapesAll[i] );
		textGeometry2.computeBoundingBox();
		let boundingBox2 = textGeometry1.boundingBox;

		let charWidth = boundingBox2.max.x - boundingBox1.max.x;
		size -= charWidth;
		if ( size < 30 &&
            !this.isTruncated ) {
			this.isTruncated = true;
			this.start = i - 2;
			this.truncated = value.substring( this.start, this.end + 1 );
		}
	}

	let fontshapesTruncated = this.createFontShapes( this.truncated );
	if ( fontshapesTruncated.length > 0 ) {
		const textGeometry = new THREE.ShapeGeometry( fontshapesTruncated[fontshapesTruncated.length - 1] );
		textGeometry.computeBoundingBox();
		const boundingBox = textGeometry.boundingBox;
		this.residiumX = this._options.TEXT.x - boundingBox.max.x;
	} else {
		this.residiumX = 0;
	}

	// ALL CURSOR POSITIONS
	this.possibleCursorPositons = [];
	this.possibleCursorPositons.push( { x: 0 } );
	for ( let i = 0; i < fontshapesTruncated.length; i++ ) {
		const textGeometry = new THREE.ShapeGeometry( fontshapesTruncated[i] );
		textGeometry.computeBoundingBox();
		const boundingBox = textGeometry.boundingBox;
		this.possibleCursorPositons.push( { x: boundingBox.max.x } );
	}

	this.isLastCallLeft = false;

	return this;
};

SimpleDateGuiTextHelper.prototype.calculateLeftAlignText = function( value ) {

	// Start with the complete string
	this.isTruncated = false;
	this.truncated = value;
	this.residiumX = 5;
	this.end = 0;

	let fontshapesAll = this.createFontShapes( value );
	for ( let i = 0; i < fontshapesAll.length - 1; i++ ) {
		const textGeometry = new THREE.ShapeGeometry( fontshapesAll[i] );
		textGeometry.computeBoundingBox();
		const boundingBox = textGeometry.boundingBox;

		if ( ( this._options.TEXT.x - boundingBox.max.x ) <= this.residiumX && !this.isTruncated ) {
			this.isTruncated = true;
			this.end = i;
			this.truncated = value.substring( this.start, this.end );
		}
	}

	// ALL CURSOR POSITIONS
	let fontshapesTruncated = this.createFontShapes( this.truncated );
	this.possibleCursorPositons = [];
	this.possibleCursorPositons.push( { x: 0 } );
	for ( let i = 0; i < fontshapesTruncated.length; i++ ) {
		const textGeometry = new THREE.ShapeGeometry( fontshapesTruncated[i] );
		textGeometry.computeBoundingBox();
		const boundingBox = textGeometry.boundingBox;
		this.possibleCursorPositons.push( { x: boundingBox.max.x } );
	}

	this.isLastCallLeft = true;

	return this;
};

SimpleDateGuiTextHelper.prototype.calculateAlignTextLastCall = function( value ) {

	if ( !this.isTruncated ) {
		return this.calculateLeftAlignText( value );
	}

	if ( this.cursor <= this.start ) {
		this.isLastCallLeft = true;
	}

	if ( this.cursor > this.end ) {
		this.isLastCallLeft = false;
	}

	if ( this.isLastCallLeft ) {
		return this.calculateLeftAlignText( value );
	} else {
		return this.calculateRightAlignText( value );
	}
};

export default SimpleDateGuiTextHelper;
