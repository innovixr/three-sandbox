import * as THREE from 'three';
import SimpleDateGuiTextHelper from './SimpleDateGuiTextHelper.js';

const SimpleDateGuiControl = function( object, property, minValue, maxValue, parent, isCloseButton, isRootControl, options ) {

	// This is used for internal functions
	this._private = new SimpleDateGuiControl.__internals( this );

	// ATTRIBUTES
	this._options = options;
	this.object = object;
	this.property = property;
	this.propertyType = ( object != null ) ? typeof object[property] : 'folder';
	this.label = property;
	this.onChangeCallback = null;
	this.isCloseButton = isCloseButton;

	// MANAGE COMBOBOX
	let getKeys = function( obj ) {
		let keys = [];
		for ( let key in obj ) {
			keys.push( key );
		}
		return keys;
	};

	this.isAcceptedValues = ( minValue instanceof Array );
	this.isNamedValues = ( typeof minValue === 'object' ) && !this.isAcceptedValues;
	this.isCombobox = this.isNamedValues || this.isAcceptedValues;
	this.comboBoxList = ( this.isNamedValues ) ? getKeys( minValue ) : minValue;
	this.selectedFieldText = '';

	// MANAGE NUMBER INPUT
	this.minValue = minValue | 0.0;
	this.maxValue = maxValue | 1000.0;

	// MANAGE TEXT INPUT
	this.textHelper = new SimpleDateGuiTextHelper( this._options );
	this.newText = '';

	// RELATIVES
	this.parent = parent;
	this._private.children = [];

	// STATE
	this.isRootControl = isRootControl;
	this.isFolderCollapsed = true;
	this.isElementFolder = this.propertyType === 'folder';
	this.isElementHidden = ( !this.isRootControl ) ? !this.isElementFolder : false;
	this.isOnChangeExisting = false;
	this.scaling = 1.0;
	this.hasFocus = false;
	this.isClosed = false;

	// LISTEN WITH A TIMER
	this.updateTimer;
	this.lastValue;

	// CREATE NEEDED CONTROLS
	this._private.createArea();
	this._private.createMarker();
	this._private.createLabel( this.label );

	if ( !this.isCloseButton ) {
		// this._private.createFrame();
	}

	if ( this.isComboBoxControl() ) {
		this.object = object;
		this.property = property;
		this.newText = '';
		this.minValue = minValue;
		if ( this.isAcceptedValues ) {
			this.newText = object[property];
		} else {
			for ( let index = 0; index < this.comboBoxList.length; index++ ) {
				let key = this.comboBoxList[index];
				let value = minValue[key];
				if ( object[property] === value ) {
					this.newText = key;
					break;
				}
			}
		}
		this.selectedFieldText = this.newText;
		this.textHelper.calculateLeftAlignText( this.newText );
		this._private.createComboBoxField();
		this._private.createComboBoxListFields();
		this._private.createComboBoxText();
		this._private.createComboBoxMarker();
		this._private.createComboBoxFrame();
	} else if ( this.isElementFolder && !this.isCloseButton ) {
		this._private.createLabelMarker();
	} else if ( this.isFunctionControl() ) {
		this.onChangeCallback = object[property];
	} else if ( this.isCheckBoxControl() ) {
		this.object = object;
		this.property = property;
		this.minValue = minValue;
		this._private.createCheckBoxes();
	} else if ( this.isTextControl() ) {

		this.object = object;
		this.property = property;

		if ( this.isPropertyNumber() ) {
			this.minValue = minValue;
			this.maxValue = maxValue;
			this.newText = '' + object[property];
			this._private.createValueSliderField();
			this.scaling = ( object[property] - this.minValue ) / ( this.maxValue - this.minValue );
			this._private.createValueSliderBar( this.scaling );
			this.selectedFieldText = this.newText;
			this.textHelper.calculateLeftAlignText( this.newText );
			this._private.createTextValue( object[property] );
		} else {
			this.newText = object[property];
			this.selectedFieldText = this.newText;
			this.textHelper.calculateLeftAlignText( this.newText );
			this._private.createTextValue( this.newText );
		}

		this._private.createValueTextField();
		this._private.createCursor();
	}

	this.listenInternal();
};

SimpleDateGuiControl.__internals = function( control ) {

	this.control = control;
};

SimpleDateGuiControl.__internals.prototype.createArea = function() {

	console.log( 'createArea' );

	let internal = this;
	let that = this.control;
	let $ = that._options;

	let _geometry = new THREE.BoxGeometry( $.AREA.x, $.AREA.y, $.AREA.z );
	let _material = new THREE.MeshBasicMaterial( $.MATERIAL );
	that.wArea = new THREE.Mesh( _geometry, _material );
	that.wArea.WebGLElement = that;
	that.wArea.updateRendering = function( index ) {

		let x = $.AREA.x / 2;
		let y = -$.AREA.y / 2 - $.AREA.y * index;
		let z = $.AREA.z / 2;
		internal.rotateAndTranslateElement( this, $, x, y, z );

		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.material.visible = that.isVisible() && !that.isClosed;
		if ( that.parent._private.selected === that && ( that.isCheckBoxControl() || that.isFunctionControl() || that.isElementFolder ) ) {
			this.material.color.setHex( $.COLOR_SELECTED );
		} else {
			this.material.color.setHex( $.COLOR_BASE_CLOSE_BUTTON );
		}
	};
	that.parent.scene.add( that.wArea );
};

SimpleDateGuiControl.__internals.prototype.createTextValue = function( value ) {

	console.log( 'createTextValue' );

	let internal = this;
	let that = this.control;
	let $ = that._options;

	if ( that.isPropertyNumber() ) {
		let newValue = ( typeof value === 'number' ) ? value : 0;
		let digits = ( parseInt( newValue ) === newValue ) ? 0 : 1;
		value = newValue.toFixed( digits );
		if ( value === 'NaN' ) {
			return;
		}
	}

	if ( typeof that.wTextValue !== 'undefined' ) {
		that.parent.scene.remove( that.wTextValue );
	}

	let _geometry = new THREE.ShapeGeometry( $.GLOBAL_FONT.generateShapes( that.textHelper.truncated, $.FONT, $.DELTA_Z ) );
	that.wTextValue = new THREE.Mesh( _geometry, new THREE.MeshBasicMaterial( $.MATERIAL ) );
	that.wTextValue.updateRendering = function( index ) {

		if ( that.isPropertyNumber() ) {
			const x = $.TAB_2.x + that.textHelper.residiumX;
			const y = $.AREA.y * ( -0.5 - index ) - $.LABEL_OFFSET_Y;
			const z = $.AREA.z + $.DELTA_Z_ORDER * 2;
			internal.rotateAndTranslateElement( this, $, x, y, z );
			this.material.color.setHex( that.parent._private.focus === that ? $.COLOR_LABEL : $.COLOR_MARKER_NUMBER );
		} else {
			const x = $.TAB_1.x + that.textHelper.residiumX;
			const y = $.AREA.y * ( -0.5 - index ) - $.LABEL_OFFSET_Y;
			const z = $.AREA.z + $.DELTA_Z_ORDER * 2;
			internal.rotateAndTranslateElement( this, $, x, y, z );
			this.material.color.setHex( that.parent._private.focus === that ? $.COLOR_LABEL : $.COLOR_TEXT );
		}

		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.visible = that.isVisible() && that.isTextControl() && !that.isClosed;
	};
	that.parent.scene.add( that.wTextValue );
};

SimpleDateGuiControl.__internals.prototype.createValueTextField = function() {

	console.log( 'createValueTextField' );

	let internal = this;
	let that = this.control;
	let $ = that._options;

	let fieldSize = that.isPropertyNumber() ? $.NUMBER : $.TEXT;
	let _geometry = new THREE.BoxGeometry( fieldSize.x, fieldSize.y, fieldSize.z );
	let _material = new THREE.MeshBasicMaterial( $.MATERIAL );
	that.wValueTextField = new THREE.Mesh( _geometry, _material );
	that.wValueTextField.visible = false;
	that.wValueTextField.isTextValueField = false;
	that.wValueTextField.WebGLElement = that;
	that.wValueTextField.material.color.setHex( $.COLOR_VALUE_FIELD );
	that.wValueTextField.updateRendering = function( index ) {
		let x, y, z;
		if ( that.isPropertyNumber() ) {
			x = $.TAB_2.x + $.NUMBER.x / 2;
			y = $.AREA.y * ( -0.5 - index );
			z = $.AREA.z + $.DELTA_Z_ORDER;
			internal.rotateAndTranslateElement( this, $, x, y, z );
		} else {
			x = $.TAB_1.x + $.TEXT.x / 2;
			y = $.AREA.y * ( -0.5 - index );
			z = $.AREA.z + $.DELTA_Z_ORDER;
			internal.rotateAndTranslateElement( this, $, x, y, z );
		}

		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.visible = that.isVisible() && that.isTextControl() && !that.isClosed;
	};
	that.parent.scene.add( that.wValueTextField );
};

SimpleDateGuiControl.__internals.prototype.createValueSliderField = function() {

	console.log( 'createValueSliderField' );

	let internal = this;
	let that = this.control;
	let $ = that._options;

	let _geometry = new THREE.BoxGeometry( $.SLIDER.x, $.SLIDER.y, $.SLIDER.z );
	let _material = new THREE.MeshBasicMaterial( $.MATERIAL );
	that.wValueSliderField = new THREE.Mesh( _geometry, _material );
	that.wValueSliderField.sliderType = 'field';
	that.wValueSliderField.WebGLElement = that;
	that.wValueSliderField.material.color.setHex( $.COLOR_VALUE_FIELD );
	that.wValueSliderField.updateRendering = function( index ) {
		let x = $.TAB_1.x + $.SLIDER.x / 2;
		let y = $.AREA.y * ( -0.5 - index );
		let z = $.AREA.z + $.DELTA_Z_ORDER;
		internal.rotateAndTranslateElement( this, $, x, y, z );

		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.visible = that.isTextControl() && that.isPropertyNumber() && that.isVisible() && !that.isClosed;
	};
	that.parent.scene.add( that.wValueSliderField );
};

SimpleDateGuiControl.__internals.prototype.createValueSliderBar = function( scaling ) {

	console.log( 'createValueSliderBar' );

	let internal = this;
	let that = this.control;
	let $ = that._options;

	if ( typeof that.wValueSliderBar !== 'undefined' ) {
		that.parent.scene.remove( that.wValueSliderBar );
	}

	let _geometry = new THREE.BoxGeometry( $.SLIDER.x * scaling, $.SLIDER.y, $.SLIDER.z );
	let _material = new THREE.MeshBasicMaterial( $.MATERIAL );
	that.wValueSliderBar = new THREE.Mesh( _geometry, _material );
	that.wValueSliderBar.sliderType = 'bar';
	that.wValueSliderBar.WebGLElement = that;
	that.wValueSliderBar.material.color.setHex( $.COLOR_MARKER_NUMBER );
	that.wValueSliderBar.updateRendering = function( index ) {
		let x = $.TAB_1.x + $.SLIDER.x / 2 - $.SLIDER.x * ( 1 - that.scaling ) / 2;
		let y = $.AREA.y * ( -0.5 - index );
		let z = $.AREA.z + $.DELTA_Z_ORDER * 2;
		internal.rotateAndTranslateElement( this, $, x, y, z );

		this.material.opacity = that.parent._private.opacityGui * 0.01;
		let isSliderBarNeeded = ( that.object[that.property] > that.minValue );
		this.visible = that.isTextControl() && that.isPropertyNumber() && that.isVisible() && isSliderBarNeeded && !that.isClosed;
	};
	that.parent.scene.add( that.wValueSliderBar );
};

SimpleDateGuiControl.__internals.prototype.createCheckBoxes = function() {

	console.log( 'createCheckBoxes' );

	let internal = this;
	let control = this.control;
	let _options = control._options;

	// CREATE CHECKBOX AREA
	let _geometry = new THREE.BoxGeometry( _options.CHECKBOX.x, _options.CHECKBOX.y, _options.CHECKBOX.z );
	control.wBoxUnChecked = new THREE.Mesh( _geometry, new THREE.MeshBasicMaterial( _options.MATERIAL ) );
	control.wBoxUnChecked.visible = false;
	control.wBoxUnChecked.updateRendering = function( index ) {
		let x = _options.TAB_1.x + _options.CHECKBOX.x / 2;
		let y = _options.AREA.y * ( -0.5 - index );
		let z = _options.AREA.z + _options.DELTA_Z_ORDER;

		internal.rotateAndTranslateElement( this, _options, x, y, z );

		this.material.opacity = control.parent._private.opacityGui * 0.01;
		this.visible = control.isVisible() && control.isClosed;
	};
	control.parent.scene.add( control.wBoxUnChecked );

	// CREATE CHECKBOX MARKER
	_geometry = new THREE.ShapeGeometry( _options.GLOBAL_FONT.generateShapes( 'x', _options.FONT, _options.DELTA_Z ) );
	control.wBoxChecked = new THREE.Mesh( _geometry, new THREE.MeshBasicMaterial( _options.MATERIAL ) );
	control.wBoxChecked.visible = false;
	control.wBoxChecked.material.color.setHex( _options.COLOR_CHECKBOX_TEXT );
	control.wBoxChecked.updateRendering = function( index ) {
		let x = _options.TAB_1.x + _options.CHECKBOX.x / 2 - 3 * _options.SCALE;
		let y = _options.AREA.y * ( -0.5 - index ) - 3.5 * _options.SCALE;
		let z = _options.AREA.z + _options.DELTA_Z_ORDER * 3;
		internal.rotateAndTranslateElement( this, _options, x, y, z );

		this.material.opacity = control.parent._private.opacityGui * 0.01;
		this.visible = control.isVisible() && control.object[control.property] && !control.isClosed;
	};
	control.parent.scene.add( control.wBoxChecked );
};

SimpleDateGuiControl.__internals.prototype.createLabel = function( name ) {
	console.log( 'createLabel' );

	let internal = this;
	let that = this.control;
	let $ = that._options;

	if ( typeof that.wLabel !== 'undefined' ) {
		that.parent.scene.remove( that.wLabel );
	}

	let _geometry = new THREE.ShapeGeometry( $.GLOBAL_FONT.generateShapes( name, $.FONT, $.DELTA_Z ) );
	//	var _geometry = new THREE.TextGeometry( name , $.FONT_PARAM );
	that.wLabel = new THREE.Mesh( _geometry, new THREE.MeshBasicMaterial( $.MATERIAL ) );
	that.wLabel.updateRendering = function( index ) {
		let WEBGL_CLOSE_LABEL_OFFSET_X = 30 * $.SCALE;
		let LABEL_OFFSET_X = 10 * $.SCALE;
		let folderOffset = ( that.isElementFolder ) ? 8 * $.SCALE : 0;
		let x = ( ( that.isCloseButton ) ? ( $.AREA.x / 2 - WEBGL_CLOSE_LABEL_OFFSET_X ) : ( LABEL_OFFSET_X + folderOffset ) );
		let y = $.AREA.y * ( -0.5 - index ) - $.LABEL_OFFSET_Y;
		let z = $.AREA.z + $.DELTA_Z_ORDER;
		internal.rotateAndTranslateElement( this, $, x, y, z );

		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.material.visible = that.isVisible() && !that.isClosed;
	};
	that.parent.scene.add( that.wLabel );
};

SimpleDateGuiControl.__internals.prototype.createLabelMarker = function() {

	console.log( 'createLabelMarker' );

	let internal = this;
	let that = this.control;
	let $ = that._options;

	let v1 = new THREE.Vector3( -2 * $.SCALE, 2 * $.SCALE, $.MARKER.z );
	let v3 = new THREE.Vector3( 2 * $.SCALE, 2 * $.SCALE, $.MARKER.z );
	let v2 = new THREE.Vector3( 2 * $.SCALE, -2 * $.SCALE, $.MARKER.z );
	let _material = new THREE.MeshBasicMaterial( $.MATERIAL );

	let vertices = [];
	vertices.push( v1 );
	vertices.push( v2 );
	vertices.push( v3 );
	let _geometry = new THREE.BufferGeometry().setFromPoints( vertices );
	_geometry.computeBoundingBox();
	_geometry.computeVertexNormals();
	that.wLabelMarker = new THREE.Mesh( _geometry, _material );

	that.wLabelMarker.material.color.setHex( $.COLOR_LABEL );
	that.wLabelMarker.updateRendering = function( index ) {
		let x = 10 * $.SCALE;
		let y = -$.AREA.y / 2 - $.AREA.y * index;
		let z = $.AREA.z / 2 + $.DELTA_Z_ORDER;
		internal.rotateAndTranslateElement( this, $, x, y, z );

		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.material.visible = that.isVisible() && !that.isClosed;
		this.rotation.z += ( that.folderIsHidden ) ? -Math.PI / 4 * 3 : -Math.PI / 4;
	};
	that.parent.scene.add( that.wLabelMarker );
};

SimpleDateGuiControl.__internals.prototype.createMarker = function() {

	console.log( 'createMarker' );

	let internal = this;
	let that = this.control;
	let $ = that._options;

	let _geometry = new THREE.BoxGeometry( $.MARKER.x, $.MARKER.y, $.MARKER.z );
	let _material = new THREE.MeshBasicMaterial( $.MATERIAL );
	that.wMarker = new THREE.Mesh( _geometry, _material );

	if ( that.isCheckBoxControl() ) {
		that.wMarker.material.color.setHex( $.COLOR_MARKER_CHECKBOX );
	} else if ( that.isTextControl() ) {
		that.wMarker.material.color.setHex( $.COLOR_MARKER_TEXT );
	} else if ( that.isComboBoxControl() ) {
		that.wMarker.material.color.setHex( that.isAcceptedValues ? $.COLOR_MARKER_TEXT : $.COLOR_MARKER_NUMBER );
	} else if ( that.isPropertyNumber() ) {
		that.wMarker.material.color.setHex( $.COLOR_MARKER_NUMBER );
	} else if ( that.isFunctionControl() ) {
		that.wMarker.material.color.setHex( $.COLOR_MARKER_BUTTON );
	}
	that.wMarker.updateRendering = function( index ) {
		let x = $.MARKER.x / 2 - 0.1 * $.SCALE;
		let y =  -$.AREA.y / 2 - $.AREA.y * index;
		let z =   $.AREA.z / 2 + $.DELTA_Z_ORDER;
		internal.rotateAndTranslateElement( this, $, x, y, z );

		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.material.visible = that.isVisible() && !that.isClosed;
		if ( that.isCloseButton ) {
			let isSelected = ( that.parent._private != null ) ? that.parent._private.selected === that : false;
			that.wMarker.material.color.setHex( ( isSelected ) ? $.COLOR_MARKER_CLOSE_SELECTED : $.COLOR_MARKER_CLOSE );
		}
	};
	that.parent.scene.add( that.wMarker );
};

SimpleDateGuiControl.__internals.prototype.createFrame = function() {

	console.log( 'createFrame' );

	let cubeGeometry2LineGeometry = function( input, material ) {
		let vertices = [];
		for ( let i = 0; i < input.faces.length; i += 2 ) {
			let face1 = input.faces[i];
			let face2 = input.faces[i + 1];
			let c1 = input.vertices[face1.c].clone();
			let a1 = input.vertices[face1.a].clone();
			let a2 = input.vertices[face2.a].clone();
			let b2 = input.vertices[face2.b].clone();
			let c2 = input.vertices[face2.c].clone();
			vertices.push( c1, a1, a2, b2, b2, c2 );
		}
		let _geometry = new THREE.BufferGeometry().setFromPoints( vertices );
		let line = new THREE.LineSegments( _geometry, material );
		line.computeLineDistances();
		return line;
	};

	let internal = this;
	let that = this.control;
	let $ = that._options;

	let _geometryBox = new THREE.BoxGeometry( $.AREA.x, $.AREA.y, 0.1 );
	that.wFrame = cubeGeometry2LineGeometry( _geometryBox, $.MATERIAL );
	that.wFrame.material.color.setHex( $.COLOR_BODER );
	that.wFrame.updateRendering = function( index ) {
		let x = $.AREA.x / 2 - 0.1;
		let y = -$.AREA.y / 2 - $.AREA.y * index;
		let z = $.AREA.z + $.DELTA_Z_ORDER * 2;
		internal.rotateAndTranslateElement( this, $, x, y, z );

		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.material.visible = that.isVisible() &&
            !that.isClosed;
	};
	that.parent.scene.add( this.control.wFrame );
};

SimpleDateGuiControl.__internals.prototype.createCursor = function() {

	let internal = this;
	let that = this.control;
	let $ = that._options;

	let _geometry = new THREE.BoxGeometry( 0.5 * $.SCALE, $.TEXT.y * 0.8, 0.1 );
	let _material = new THREE.MeshBasicMaterial( $.MATERIAL );
	that.wCursor = new THREE.Mesh( _geometry, _material );
	that.wCursor.material.color.setHex( $.COLOR_CURSOR );
	that.wCursor.updateRendering = function( index ) {
		let possiblePositon = that.textHelper.possibleCursorPositons[that.textHelper.cursor - that.textHelper.start];
		if ( typeof possiblePositon !== 'undefined' ) {
			let x = 0;
			if ( that.isPropertyNumber() ) {
				x = $.TAB_2.x + that.textHelper.residiumX + possiblePositon.x + 0.25 * $.SCALE;
			} else {
				x = $.TAB_1.x + that.textHelper.residiumX + possiblePositon.x + 0.25 * $.SCALE;
			}
			let y = $.AREA.y * ( -0.5 - index );
			let z = $.AREA.z + $.DELTA_Z_ORDER * 2;
			internal.rotateAndTranslateElement( this, $, x, y, z );

			this.material.opacity = that.parent._private.opacityGui * 0.01;
			this.material.visible = that.isVisible() && that.isTextControl() && ( that.parent._private.focus === that ) && !that.isClosed;
		} else {
			that.wCursor.material.visible = false;
		}
	};
	that.parent.scene.add( this.control.wCursor );
};

SimpleDateGuiControl.__internals.prototype.createComboBoxField = function() {

	console.log( 'createComboField' );

	let internal = this;
	let that = this.control;
	let $ = that._options;

	let _geometry = new THREE.BoxGeometry( $.TEXT.x, $.TEXT.y, $.TEXT.z );
	let _material = new THREE.MeshBasicMaterial( $.MATERIAL );
	_material.color.setHex( $.COLOR_COMBOBOX_AREA );
	that.wComboBoxTextField = new THREE.Mesh( _geometry, _material );
	that.wComboBoxTextField.visible = false;
	that.wComboBoxTextField.WebGLElement = that;
	that.wComboBoxTextField.updateRendering = function( index ) {
		let x = $.TAB_1.x + $.TEXT.x / 2;
		let y = $.AREA.y * ( -0.5 - index );
		let z = $.AREA.z + $.DELTA_Z_ORDER * 3;
		internal.rotateAndTranslateElement( this, $, x, y, z );

		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.visible = that.isVisible() && !that.isClosed;
	};
	that.parent.scene.add( that.wComboBoxTextField );
};

SimpleDateGuiControl.__internals.prototype.createComboBoxListFields = function() {

	console.log( 'createComboListFields' );

	let internal = this;
	let that = this.control;
	let $ = that._options;

	that.wComboBoxListTexts = [];
	that.wComboBoxListFields = [];

	for ( let filedIndex = 0; filedIndex < that.comboBoxList.length; filedIndex++ ) {

		let text = that.comboBoxList[filedIndex];

		// Background
		let _geometry = new THREE.BoxGeometry( $.TEXT.x, $.TEXT.y, $.TEXT.z );
		let _material = new THREE.MeshBasicMaterial( $.MATERIAL );
		_material.color.setHex( $.COLOR_COMBOBOX_AREA );
		let wComboBoxListField = new THREE.Mesh( _geometry, _material );
		wComboBoxListField.visible = false;
		wComboBoxListField.WebGLElement = that;
		wComboBoxListField.text = text;
		wComboBoxListField.updateRendering = function( index, fIndex ) {
			let x = $.TAB_1.x + $.TEXT.x / 2;
			let y = $.AREA.y * ( -0.5 - index ) - ( 1 + fIndex ) * $.TEXT.y;
			let z = $.AREA.z + $.DELTA_Z_ORDER * ( that.isComboBoxExpanded() ? 5 : -1 );
			internal.rotateAndTranslateElement( this, $, x, y, z );

			this.material.opacity = that.parent._private.opacityGui * 0.01;
			this.visible = that.isVisible() && that.isComboBoxExpanded() && !that.isClosed;
			this.material.color.setHex( ( that.selectedFieldText === that.comboBoxList[fIndex] ) ? $.COLOR_COMBOBOX_AREA_SELECTED : $.COLOR_COMBOBOX_AREA );
		};
		that.parent.scene.add( wComboBoxListField );
		that.wComboBoxListFields.push( wComboBoxListField );

		// Text
		_geometry = new THREE.TextGeometry( text, $.FONT_PARAM );
		let wComboBoxTextValue = new THREE.Mesh( _geometry, new THREE.MeshBasicMaterial( $.MATERIAL ) );
		wComboBoxTextValue.material.color.setHex( $.COLOR_COMBOBOX_TEXT );
		wComboBoxTextValue.updateRendering = function( index, filedIndex ) {
			let x = $.TAB_1.x + that.textHelper.residiumX;
			let y = $.AREA.y * ( -0.5 - index ) - $.LABEL_OFFSET_Y - ( 1 + filedIndex ) * $.TEXT.y;
			let z = $.AREA.z + $.DELTA_Z_ORDER * ( that.isComboBoxExpanded() ? 6 : -1 );
			internal.rotateAndTranslateElement( this, $, x, y, z );

			this.material.opacity = that.parent._private.opacityGui * 0.01;
			this.visible = that.isVisible() && that.isComboBoxExpanded() && !that.isClosed;
		};
		that.parent.scene.add( wComboBoxTextValue );
		that.wComboBoxListTexts.push( wComboBoxTextValue );
	}

};

SimpleDateGuiControl.__internals.prototype.createComboBoxText = function() {

	console.log( 'createComboBoxText' );

	let internal = this;
	let that = this.control;
	let $ = that._options;

	if ( typeof that.wComboBoxText !== 'undefined' ) {
		that.parent.scene.remove( that.wComboBoxText );
	}

	let _geometry = new THREE.TextGeometry( that.textHelper.truncated, $.FONT_PARAM );
	that.wComboBoxText = new THREE.Mesh( _geometry, new THREE.MeshBasicMaterial( $.MATERIAL ) );
	that.wComboBoxText.material.color.setHex( $.COLOR_COMBOBOX_TEXT );
	that.wComboBoxText.updateRendering = function( index ) {
		let x = $.TAB_1.x + that.textHelper.residiumX;
		let y = $.AREA.y * ( -0.5 - index ) - $.LABEL_OFFSET_Y;
		let z = $.AREA.z + $.DELTA_Z_ORDER * 4;
		internal.rotateAndTranslateElement( this, $, x, y, z );

		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.visible = that.isVisible() && !that.isClosed;
	};
	that.parent.scene.add( that.wComboBoxText );
};

SimpleDateGuiControl.__internals.prototype.createComboBoxMarker = function() {

	console.log( 'createComboBoxMarker' );

	let internal = this;
	let that = this.control;
	let $ = that._options;

	let v1 = new THREE.Vector3( -2 * $.SCALE, 2 * $.SCALE, $.AREA.z / 2 );
	let v3 = new THREE.Vector3( 2 * $.SCALE, 2 * $.SCALE, $.AREA.z / 2 );
	let v2 = new THREE.Vector3( 2 * $.SCALE, -2 * $.SCALE, $.AREA.z / 2 );
	let _material = new THREE.MeshBasicMaterial( $.MATERIAL );

	let vertices = [];
	vertices.push( v1 );
	vertices.push( v2 );
	vertices.push( v3 );
	let _geometry = new THREE.BufferGeometry().setFromPoints( vertices );
	_geometry.computeBoundingBox();
	_geometry.computeVertexNormals();

	that.wComboBoxMarker = new THREE.Mesh( _geometry, _material );
	that.wComboBoxMarker.material.color.setHex( $.COLOR_COMBOBOX_ARROW );
	that.wComboBoxMarker.updateRendering = function( index ) {
		let x = $.AREA.x - 12 * $.SCALE;
		let y = -$.AREA.y / 2 - $.AREA.y * index + 2 * $.SCALE;
		let z = $.AREA.z / 2 + $.DELTA_Z_ORDER * 5;
		internal.rotateAndTranslateElement( this, $, x, y, z );

		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.material.visible = that.isVisible() && !that.isClosed;
		this.rotation.z += -3 * Math.PI / 4;
	};
	that.parent.scene.add( that.wComboBoxMarker );
};

SimpleDateGuiControl.__internals.prototype.createComboBoxFrame = function() {

	console.log( 'createComboBoxFrame' );

	let cubeGeometry2LineGeometry = function( input, material ) {
		let vertices = [];
		for ( let i = 0; i < input.faces.length; i += 2 ) {
			let face1 = input.faces[i];
			let face2 = input.faces[i + 1];
			let c1 = input.vertices[face1.c].clone();
			let a1 = input.vertices[face1.a].clone();
			let a2 = input.vertices[face2.a].clone();
			let b2 = input.vertices[face2.b].clone();
			let c2 = input.vertices[face2.c].clone();
			vertices.push( c1, a1, a2, b2, b2, c2 );
		}
		let _geometry = new THREE.BufferGeometry().setFromPoints( vertices );
		let line = new THREE.LineSegments( _geometry, material );
		line.computeLineDistances();
		return line;
	};

	let internal = this;
	let that = this.control;
	let $ = that._options;

	let _geometryBox = new THREE.BoxGeometry( $.TEXT.x, $.TEXT.y, 0.2 );
	that.wComboBoxFrame = cubeGeometry2LineGeometry( _geometryBox, $.MATERIAL );
	//	that.wComboBoxFrame.material.color.setHex($.COLOR_COMBOBOX_AREA_SELECTED_FRAME);
	that.wComboBoxFrame.updateRendering = function( index ) {
		let x = $.TAB_1.x + $.TEXT.x / 2;
		let y = $.AREA.y * ( -0.5 - index );
		let z = $.AREA.z + $.DELTA_Z_ORDER * 5;
		internal.rotateAndTranslateElement( this, $, x, y, z );

		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.material.visible = that.isVisible() && !that.isClosed && that.isComboBoxExpanded();
	};
	that.parent.scene.add( that.wComboBoxFrame );
};

SimpleDateGuiControl.__internals.prototype.rotateAndTranslateElement = function( element, $, x, y, z ) {

	console.log( 'ici', element );
	if ( this.control.parent.automatic ) {
		element.rotation.x = this.control.parent.camera.rotation._x;
		element.rotation.y = this.control.parent.camera.rotation._y;
		element.rotation.z = this.control.parent.camera.rotation._z;

		let vector = new THREE.Vector3( $.POSITION.x + x, $.POSITION.y + y, $.POSITION.z + z );
		vector.applyQuaternion( $.QUATERION );

		element.position.x = vector.x;
		element.position.y = vector.y;
		element.position.z = vector.z;
	} else {
		element.rotation.x = $.ROTATION.x;
		element.rotation.y = $.ROTATION.y;
		element.rotation.z = $.ROTATION.z;
		element.position.x = $.POSITION.x + x;
		element.position.y = $.POSITION.y + y;
		element.position.z = $.POSITION.z + z;
	}
};

SimpleDateGuiControl.prototype.updateRendering = function( index, isClosed ) {

	let quaternion = new THREE.Quaternion();
	let euler = new THREE.Euler();
	euler.set( this.parent.camera.rotation._x, this.parent.camera.rotation._y, this.parent.camera.rotation._z, 'XYZ' );
	quaternion.setFromEuler( euler );
	this._options.QUATERION = quaternion;

	this.isClosed = this.parent.hidden || isClosed;

	this.wArea.updateRendering( index );
	this.wLabel.updateRendering( index );
	this.wMarker.updateRendering( index );

	if ( !this.isCloseButton && this.wFrame !== 'undefined' ) {
		// this.wFrame.updateRendering(index);
	}

	if ( this.isElementFolder && !this.isCloseButton ) {
		this.wLabelMarker.updateRendering( index );
	} else if ( this.isCheckBoxControl() ) {
		this.wBoxChecked.updateRendering( index );
		this.wBoxUnChecked.updateRendering( index );
	} else if ( this.isComboBoxControl() ) {
		this.wComboBoxTextField.updateRendering( index );
		this.wComboBoxText.updateRendering( index );
		this.wComboBoxMarker.updateRendering( index );
		// this.wComboBoxFrame.updateRendering(index);
		for ( let i = 0; i < this.wComboBoxListFields.length; i++ ) {
			this.wComboBoxListTexts[i].updateRendering( index, i );
			this.wComboBoxListFields[i].updateRendering( index, i );
		}
	} else if ( this.isTextControl() ) {
		this.wValueTextField.updateRendering( index );
		this.wTextValue.updateRendering( index );
		this.wCursor.updateRendering( index );
		if ( this.isPropertyNumber() ) {
			this.wValueSliderField.updateRendering( index );
			this.wValueSliderBar.updateRendering( index );
		}
	}
};

SimpleDateGuiControl.prototype.onChange = function( value ) {

	this.isOnChangeExisting = true;
	this.onChangeCallback = value;
	return this;
};

SimpleDateGuiControl.prototype.add = function( object, property, minValue, maxValue ) {

	let element = new SimpleDateGuiControl( object, property, minValue, maxValue, this.parent, false, false,
		this._options );
	this._private.children.push( element );
	return element;
};

SimpleDateGuiControl.prototype.name = function( value ) {

	this.label = value;
	this._private.createLabel( this.label );
	return this;
};

SimpleDateGuiControl.prototype.executeCallback = function( ) {

	if ( this.isFunctionControl() ) {
		this.onChangeCallback( null );
	} else if ( this.isElementFolder ) {
		this.open();
	} else if ( this.isOnChangeExisting ) {
		if ( this.isCheckBoxControl() ) {
			this.onChangeCallback( this.object[this.property] );
		} else if ( this.isTextControl() ) {
			this.onChangeCallback( this.object[this.property] );
		} else if ( this.isComboBoxControl() ) {
			this.onChangeCallback( this.object[this.property] );
		}
	}
};

SimpleDateGuiControl.prototype.listen = function() {

	// console.warn('The listen method is deprecated.');
	return this;
};

SimpleDateGuiControl.prototype.listenInternal = function() {

	this.updateTimer = setInterval( () => {
		if ( this.isTextControl() ) {
			if ( this.lastValue !== this.object[this.property] ) {
				if ( this.isPropertyNumber() ) {
					let value = this.object[this.property];
					value = Math.min( Math.max( value, this.minValue ), this.maxValue );
					let newValue = ( typeof value === 'number' ) ? value : 0;
					let digits = ( parseInt( newValue ) === newValue ) ? 0 : 1;
					value = newValue.toFixed( digits );
					if ( value === 'NaN' ) {
						this.object[this.property] = ( this.minValue + this.maxValue ) / 2;
						value = this.object[this.property];
					}
					this.scaling = ( value - this.minValue ) / ( this.maxValue - this.minValue );
					this._private.createValueSliderBar( this.scaling );
					this.newText = '' + value;
				} else {
					this.newText = this.object[this.property];
				}
				this.textHelper.calculateAlignTextLastCall( this.newText );
				this._private.createTextValue( this.textHelper.truncated );
			}
			this.lastValue = this.object[this.property];
		}
	}, 500 );

	return this;
};

SimpleDateGuiControl.prototype.step = function( value ) {

	this.step = value;
	return this;
};

SimpleDateGuiControl.prototype.open = function() {

	if ( this.isElementFolder ) {
		this.folderIsHidden = !this.folderIsHidden;
		this.updateChildrenHidden();
	}
	return this;
};

SimpleDateGuiControl.prototype.updateChildrenHidden = function() {

	this._private.children.forEach( function( entry ) {
		entry.isElementHidden = !entry.isElementHidden;
	} );
};

SimpleDateGuiControl.prototype.isCheckBoxControl = function() {

	return this.propertyType === 'boolean';
};

SimpleDateGuiControl.prototype.isTextControl = function() {

	return ( this.propertyType === 'number' || this.propertyType === 'string' ) &&
        !this.isCombobox;
};

SimpleDateGuiControl.prototype.isComboBoxControl = function() {

	return this.isCombobox;
};

SimpleDateGuiControl.prototype.isPropertyNumber = function() {

	return this.propertyType === 'number';
};

SimpleDateGuiControl.prototype.isFunctionControl = function() {

	return this.propertyType === 'function';
};

SimpleDateGuiControl.prototype.isVisible = function() {

	return !this.isElementHidden;
};

SimpleDateGuiControl.prototype.isComboBoxExpanded = function() {

	return this === this.parent._private.activeComboBox;
};

export default SimpleDateGuiControl;
