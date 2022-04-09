import * as THREE from 'three';
import SimpleDateGuiControl from './SimpleDateGuiControl.js';

const SimpleDateGui = function( parameters ) {

	console.log( 'DatGuiXR  98' );

	// Assign mandatory parameter
	if ( ( typeof parameters === 'undefined' ) ||
        ( typeof parameters.scene === 'undefined' ) ) {
		console.err( 'DatGuiXR - missing parameter scene' );
	}

	if ( ( typeof parameters.camera === 'undefined' ) ) {
		console.err( 'DatGuiXR - missing parameter camera' );
	}

	if ( 'PerspectiveCamera' !== parameters.camera.type ) {
		console.warn( 'DatGuiXR - non perspective camera supported' );
	}

	if ( ( typeof parameters.renderer === 'undefined' ) ) {
		console.err( 'DatGuiXR - missing parameter renderer' );
	}

	if ( ( typeof parameters.font === 'undefined' ) ) {
		console.err( 'DatGuiXR - missing parameter font' );
	}

	this.scene = parameters.scene;
	this.camera = parameters.camera;
	this.renderer = parameters.renderer;
	this.font = parameters.font;

	// Assign optional parameter
	this.width = ( parameters.width !== undefined ) ? parameters.width * parameters.scale : 300;
	this.position = ( parameters.position !== undefined ) ? parameters.position : new THREE.Vector3( -150, 100, 150 );
	this.rotation = ( parameters.rotation !== undefined ) ? parameters.rotation : new THREE.Vector3( 0, 0, 0 );
	this.scale = ( parameters.scale !== undefined ) ? parameters.scale : 1;
	this.automatic = ( parameters.automatic !== undefined ) ? parameters.automatic : false;
	this.mouse = ( parameters.mouse !== undefined ) ? parameters.mouse : null;

	// For internal use only
	this._options = this.getOptions();
	this._private = new SimpleDateGui.__internals( this );
};

/**
 * Same method as in DAT.GUI
 */
SimpleDateGui.prototype.addFolder = function( name ) {

	let result = new SimpleDateGuiControl( null, name, 0, 0, this, false, false, this._options );
	this._private.children.push( result );
	return result;
};

/**
 * Same method as in DAT.GUI
 */
SimpleDateGui.prototype.setPosition = function( position ) {

	this.rotation = position;

};

SimpleDateGui.prototype.setAutomatic = function( automatic ) {

	this.automatic = automatic;
};

/**
 * Same method as in DAT.GUI
 */
SimpleDateGui.prototype.add = function( object, property, minValue, maxValue ) {
	let result = new SimpleDateGuiControl( object, property, minValue, maxValue, this, false, true, this._options );
	this._private.children.push( result );
	return result;
};

/**
 * Same method as in DAT.GUI
 */
SimpleDateGui.prototype.close = function() {

	this._private.closed = true;
	return this;
};

/**
 * Difference to DAT.GUI - hide gui
 */
SimpleDateGui.prototype.hide = function() {

	this._private.hidden = true;
	return this;
};

/**
 * Difference to DAT.GUI - hide gui
 */
SimpleDateGui.prototype.isHidden = function() {

	return this._private.hidden;
};

/**
 * Difference to DAT.GUI - show GUI
 */
SimpleDateGui.prototype.show = function() {

	this._private.hidden = false;
	return this;
};

/**
 * Difference to DAT.GUI - Because all the rendering is done in the scene this
 * method should be called before the rendering. In this function for each
 * element there happens the update of visibility, color and sensitivity to
 * mouse events.
 */
SimpleDateGui.prototype.update = function( parameters ) {

	// This can be used in cases the window resizes
	if ( parameters !== undefined &&
        parameters.position !== undefined ) {
		this.position = parameters.position;
		this._options.POSITION = this.position;
	}

	// UPDATE RENDERING OF ALL CONTROLS

	let indexOfVisibleControls = -1;
	this._private.children.forEach( child => {
		if ( !child.isElementHidden ) {
			indexOfVisibleControls++;
		}
		if ( child !== 'undefined' ) {
			child.updateRendering( indexOfVisibleControls, this._private.isClosed() || this._private.hidden );

			child._private.children.forEach( element => {
				if ( !element.isElementHidden ) {
					indexOfVisibleControls++;
				}
				element.updateRendering( indexOfVisibleControls, this._private.isClosed() || this._private.hidden );
			} );
		}
	} );

	// JUST VISIBLE CONTROLS INTERACT WITH MOUSE
	this._private.mouseBindings = [];

	if ( !this._private.isClosed() && !this._private.hidden ) {
		this._private.children.forEach( child => {

			// ALL CONTROLS
			child._private.children.forEach( element => {
				if ( !element.isElementHidden ) {
					if ( element.isComboBoxControl() ) {
						for ( let i = 0; i < element.wComboBoxListFields.length; i++ ) {
							this._private.mouseBindings.push( element.wComboBoxListFields[i] );
						}
						this._private.mouseBindings.push( element.wComboBoxTextField );
					} else if ( element.isPropertyNumber() ) {
						this._private.mouseBindings.push( element.wValueSliderField );
						this._private.mouseBindings.push( element.wValueTextField );
					} else {
						this._private.mouseBindings.push( element.wArea );
					}
				}
			} );

			// ALL VISIBLE FOLDER
			if ( !child.isElementHidden ) {
				if ( child.isComboBoxControl() ) {
					for ( let i = 0; i < child.wComboBoxListFields.length; i++ ) {
						this._private.mouseBindings.push( child.wComboBoxListFields[i] );
					}
					this._private.mouseBindings.push( child.wComboBoxTextField );
				} else if ( !this.isElementFolder && child.isPropertyNumber() ) {
					this._private.mouseBindings.push( child.wValueSliderField );
					this._private.mouseBindings.push( child.wValueTextField );
				} else {
					this._private.mouseBindings.push( child.wArea );
				}
			}
		} );
	}
};

/**
 * Difference to DAT.GUI - the opacity makes the complete interface transparent.
 * This is just an optional feature which is helpful in some situations.
 */
SimpleDateGui.prototype.setOpacity = function( opacity ) {

	this._private.opacityGui = Math.max( 20, Math.min( 100, opacity ) );
	return this;
};

SimpleDateGui.prototype.getOptions = function() {

	let scale = this.scale;
	let font = this.font;
	let area_size = new THREE.Vector3( this.width, 20 * scale, 2.0 * scale );
	let delta_z = 0.3 * scale;
	let delta_z_order = 0.4 * scale;
	let font_size = 8 * scale;
	let rightBorder = 4 * scale;
	let text_offset_x = 2 * scale;
	let text_field_size = new THREE.Vector3( 0.6 * area_size.x - rightBorder, 14 * scale, delta_z );
	let valueFiledSize = new THREE.Vector3( 0.2 * area_size.x, 14 * scale, delta_z );
	let labelTab1 = new THREE.Vector3( 0.4 * area_size.x, 20 * scale, delta_z );
	let labelTab2 = new THREE.Vector3( area_size.x - rightBorder - valueFiledSize.x, 20 * scale, delta_z );
	let slider_field_size = new THREE.Vector3( labelTab2.x - labelTab1.x - rightBorder, 14 * scale, delta_z );
	let marker_size = new THREE.Vector3( 3 * scale, area_size.y, area_size.z );
	let checkbox_filed_size = new THREE.Vector3( 10 * scale, 10 * scale, delta_z );
	let matrial = {
		transparent: true
	};
	let font_param = {
		font: font,
		size: font_size,
		height: delta_z
	};
	let quaternion = new THREE.Quaternion();
	let euler = new THREE.Euler();
	euler.set( this.rotation.x, this.rotation.y, this.rotation.z, 'YXZ' );
	quaternion.setFromEuler( euler );

	return {
		SCALE: scale,
		AREA: area_size,
		CHECKBOX: checkbox_filed_size,
		DELTA_Z: delta_z,
		DELTA_Z_ORDER: delta_z_order,
		FONT: font_size,
		MARKER: marker_size,
		NUMBER: valueFiledSize,
		OFFSET_X: text_offset_x,
		POSITION: this.position,
		ROTATION: this.rotation,
		QUATERION: quaternion,
		RIGHT_BORDER: rightBorder,
		SLIDER: slider_field_size,
		TAB_1: labelTab1,
		TAB_2: labelTab2,
		TEXT: text_field_size,
		LABEL_OFFSET_Y: 4 * scale,
		MATERIAL: matrial,
		FONT_PARAM: font_param,
		GLOBAL_FONT: font,
		COLOR_VALUE_FIELD: '0x303030',
		COLOR_CURSOR: '0xFFFF00',
		COLOR_LABEL: '0xFFFFFF',
		COLOR_TEXT: '0x1ed36f',
		COLOR_COMBOBOX_AREA: '0xFFFFFF',
		COLOR_COMBOBOX_AREA_SELECTED: '0x33FF66',
		COLOR_COMBOBOX_AREA_SELECTED_FRAME: '0x33FF66',
		COLOR_COMBOBOX_TEXT: '0x111111',
		COLOR_CHECKBOX_TEXT: '0x222222',
		COLOR_COMBOBOX_ARROW: '0x000000',
		COLOR_BASE_CLOSE_BUTTON: '0x121212',
		COLOR_SELECTED: '0x010101',
		COLOR_MARKER_BUTTON: '0xe61d5f',
		COLOR_MARKER_CHECKBOX: '0x806787',
		COLOR_MARKER_TEXT: '0x1ed36f',
		COLOR_MARKER_NUMBER: '0x2fa1d6',
		COLOR_MARKER_CLOSE_SELECTED: '0x010101',
		COLOR_MARKER_CLOSE: '0x121212',
		COLOR_BODER: '0x060606'
	};
};


/**
 * Internal implementation may change - please don't access directly
 */
SimpleDateGui.__internals = function( gui ) {

	this.gui = gui;

	let that = this;

	// Status
	this.hidden = false;
	this.closed = false;
	this.opacityGui = 100;
	this.shiftPressed = false;
	this.mouseDown = false;

	// Active controls
	this.selected = null;
	this.focus = null;
	this.comboBox = null;
	this.children = [];
	this.mouseBindings = [];

	// Create all event listeners
	gui.renderer.domElement.addEventListener( 'mousemove', function( event ) {
		if ( gui._private.mouseDown ) {
			gui._private.handleEventOnScrollBar( event );
		}
		gui._private.onMouseMoveEvt( event );
	}.bind( gui ) );

	gui.renderer.domElement.addEventListener( 'mousedown', function( event ) {
		gui._private.mouseDown = true;
		gui._private.onMouseDownEvt( event );
	}.bind( gui ) );

	gui.renderer.domElement.addEventListener( 'mouseup', function() {
		gui._private.mouseDown = false;
	}.bind( gui ) );

	window.addEventListener( 'keypress', function( event ) {
		gui._private.onKeyPressEvt( event );
	}.bind( gui ) );

	window.addEventListener( 'touchstart', function( event ) {
		gui._private.mouseDown = true;
		gui._private.onMouseDownEvt( event );
	}.bind( gui ) );

	window.addEventListener( 'keyup', function( event ) {
		if ( this._private.isKeyShift( that.getCharacterCode( event ) ) ) {
			that.shiftPressed = false;
		}
	}.bind( gui ) );

	window.addEventListener( 'keydown', function( event ) {
		if ( this._private.isKeyShift( that.getCharacterCode( event ) ) ) {
			that.shiftPressed = true;
		}
		gui._private.onKeyDownEvt( event );
	}.bind( gui ) );
};

SimpleDateGui.__internals.prototype.onMouseMoveEvt = function( event ) {

	let intersects = this.getIntersectingObjects( event );
	if ( null != intersects &&
        intersects.length > 0 ) {

		// Stop other event listeners from receiving this event
		event.stopImmediatePropagation();

		let element = intersects[0].object.WebGLElement;
		if ( element.isComboBoxControl() &&
            element.isComboBoxExpanded() ) {
			if ( typeof intersects[0].object.text !== 'undefined' ) {
				element.selectedFieldText = intersects[0].object.text;
			}
			this.comboBox = element;
		} else {
			this.gui._private.selected = element;
		}

		if ( this.gui.mouse == null ) {
			if ( element.isComboBoxControl() ) {
				this.gui.renderer.domElement.style.cursor = 'pointer';
			} else if ( element.isPropertyNumber() &&
                typeof intersects[0].object.isTextValueField === 'undefined' ) {
				this.gui.renderer.domElement.style.cursor = 'ew-resize';
				this.gui._private.focus = null;
			} else if ( element.isTextControl() ) {
				this.gui.renderer.domElement.style.cursor = 'text';
			} else {
				this.gui.renderer.domElement.style.cursor = 'pointer';
			}
		} else {
			if ( element.isComboBoxControl() ) {
				this.gui.mouse.setMouse( 'default' );
			} else if ( element.isPropertyNumber() &&
                typeof intersects[0].object.isTextValueField === 'undefined' ) {
				this.gui.mouse.setMouse( 'ew-resize' );
			} else if ( element.isTextControl() ) {
				this.gui.mouse.setMouse( 'text' );
			} else {
				this.gui.mouse.setMouse( 'pointer' );
			}
		}
	} else {
		this.gui._private.selected = null;
		this.activeComboBox = null;
		if ( this.gui.mouse == null ) {
			this.gui.renderer.domElement.style.cursor = 'default';
		} else {
			this.gui.mouse.setMouse( 'default' );
		}
	}
};

SimpleDateGui.__internals.prototype.onMouseDownEvt = function( event ) {

	if ( event.which === 1 /* Left mouse button */ ) {

		let intersects = this.getIntersectingObjects( event );
		if ( null != intersects &&
            intersects.length > 0 ) {

			// Stop other event listeners from receiving this event. On iOS this should not be
			// done, because the keyboard closes
			let iOS = ( navigator.userAgent.match( /(iPad|iPhone|iPod)/g ) ? true : false );
			if ( !iOS ) {
				event.stopImmediatePropagation();
			}

			// Set focus and selection on this control
			let element = intersects[0].object.WebGLElement;
			this.gui._private.focus = element;
			this.gui._private.selected = element;

			if ( element.isComboBoxControl() &&
                element.isComboBoxExpanded() ) {
				let oldText = element.newText;
				if ( element.isAcceptedValues ) {
					element.newText = element.selectedFieldText;
					element.object[element.property] = element.newText;
				} else {
					let value = element.minValue[element.selectedFieldText];
					element.object[element.property] = value;
					element.newText = element.selectedFieldText;
				}
				this.activeComboBox = null;
				if ( typeof element.newText !== 'undefined' ) {
					element.textHelper.calculateLeftAlignText( element.newText );
					element._private.createComboBoxText();
					if ( oldText !== element.newText ) {
						element.executeCallback();
					}
				}
				return;
			}

			if ( element.isComboBoxControl() ) {
				this.activeComboBox = element;
			} else if ( element.isFunctionControl() ) {
				element.executeCallback();
			} else if ( element.isTextControl() ) {
				if ( typeof intersects[0].object.sliderType === 'undefined' ) {
					this.setNewCursorFromMouseDownEvt( intersects );
					this.createDummyTextInputToShowKeyboard( event.clientY );
				} else {
					this.handleEventOnScrollBar( event );
				}
			} else if ( element.isCheckBoxControl() ) {
				element.object[element.property] = !element.object[this.gui._private.focus.property];
				element.executeCallback();
			} else if ( element.isElementFolder ) {
				element.executeCallback();
			}
		}
	}
};

SimpleDateGui.__internals.prototype.handleEventOnScrollBar = function( event ) {
	let intersects = this.getIntersectingObjects( event );
	if ( null != intersects &&
        intersects.length > 0 ) {
		let element = intersects[0].object.WebGLElement;
		if ( typeof element.wValueSliderField !== 'undefined' &&
            element.wValueSliderField.sliderType === 'field' ) {
			let deltaX = ( Math.pow( Math.pow( intersects[0].point.x +
                        element.wValueSliderField.position.x, 2 ) +
                    Math.pow( intersects[0].point.y -
                        element.wValueSliderField.position.y, 2 ) + Math.pow( intersects[0].point.z -
                        element.wValueSliderField.position.z, 2 ), 0.5 ) ) /
                this.gui._options.SLIDER.x;

			let numberOfSteps = ( element.maxValue - element.minValue ) /
                element.step;
			deltaX *= numberOfSteps;
			deltaX -= deltaX % 1;

			element.object[element.property] = element.minValue +
                element.step * deltaX;
			element.executeCallback();
			this.gui._private.focus = null;
		}
	}
};

/**
 * Insert new character at cursor position
 */
SimpleDateGui.__internals.prototype.onKeyPressEvt = function( event ) {

	// Don't process the control keys is needed for Firefox
	if ( this.isKeyTab( event.keyCode ) ||
        this.isKeyEnter( event.keyCode ) || this.isKeyPos1( event.keyCode ) || this.isKeyEnd( event.keyCode ) ||
        this.isKeyLeft( event.keyCode ) || this.isKeyRight( event.keyCode ) || this.isKeyEnf( event.keyCode ) ||
        this.isKeyBackspace( event.keyCode ) ) {
		return;
	}

	// Just in the case the focus is in a text control
	let focus = this.gui._private.focus;
	if ( focus !== null &&
        focus.isTextControl() ) {

		// Insert new character
		let cursor = focus.textHelper.cursor;
		let oldText = focus.newText;
		let oldTextFirst = oldText.substring( 0, cursor );
		let oldTextSecond = oldText.substring( cursor, oldText.length );
		let newCharacter = String.fromCharCode( this.getCharacterCode( event ) );
		focus.newText = oldTextFirst +
            newCharacter + oldTextSecond;

		// Truncate text if needed
		focus.textHelper.cursor = cursor + 1;
		focus.textHelper.calculateAlignTextLastCall( focus.newText );

		// Render new text
		focus._private.createTextValue( focus.textHelper.truncated );
	}
};

/**
 * Get and handle state of special keys
 */
SimpleDateGui.__internals.prototype.onKeyDownEvt = function( event ) {

	// Just in the case the focus is in a text control
	let focus = this.gui._private.focus;
	if ( focus !== null ) {
		if ( focus.isTextControl() ) {
			let charCode = this.getCharacterCode( event );
			if ( this.isKeyTab( charCode ) ||
                this.isKeyEnter( charCode ) ) {
				this.acknowledgeInput();
			} else if ( this.isKeyPos1( charCode ) ) {
				this.moveCursorToFirstCharacter();
			} else if ( this.isKeyEnd( charCode ) ) {
				this.moveCursorToLastCharacter();
			} else if ( this.isKeyLeft( charCode ) ) {
				this.moveCursorToPreviousCharacter( event );
			} else if ( this.isKeyRight( charCode ) ) {
				this.moveCursorToNextCharacter( event );
			} else if ( this.isKeyEnf( charCode ) ) {
				this.deleteNextCharacter();
			} else if ( this.isKeyBackspace( charCode ) ) {
				this.deletePreviousCharacter();
				event.preventDefault();
			}
		}
	}
};

/**
 * Ensures compatibility between different browsers, i.e. Chrome, Firefox, IE
 */
SimpleDateGui.__internals.prototype.getCharacterCode = function( event ) {

	event = event ||
        window.event;
	let charCode = ( typeof event.which === 'number' ) ? event.which : event.keyCode;
	return charCode;
};

SimpleDateGui.__internals.prototype.isKeyTab = function( code ) {

	return code === 9;
};

SimpleDateGui.__internals.prototype.isKeyEnter = function( code ) {

	return code === 13;
};

SimpleDateGui.__internals.prototype.isKeyPos1 = function( code ) {

	return code === 36;
};

SimpleDateGui.__internals.prototype.isKeyEnd = function( code ) {

	return code === 35;
};

SimpleDateGui.__internals.prototype.isKeyLeft = function( code ) {

	return code === 37;
};

SimpleDateGui.__internals.prototype.isKeyRight = function( code ) {

	return code === 39;
};

SimpleDateGui.__internals.prototype.isKeyEnf = function( code ) {

	return code === 46;
};

SimpleDateGui.__internals.prototype.isKeyBackspace = function( code ) {

	return code === 8;
};

SimpleDateGui.__internals.prototype.isKeyShift = function( code ) {

	return code === 16;
};

SimpleDateGui.__internals.prototype.isClosed = function() {

	return this.gui._private.closed;
};

SimpleDateGui.__internals.prototype.toggleClosed = function() {

	this.gui._private.closed = !this.gui._private.closed;
};

SimpleDateGui.__internals.prototype.acknowledgeInput = function() {

	let focus = this.gui._private.focus;
	focus.lastValue = focus.newText;

	if ( focus.isPropertyNumber() ) {
		let value = parseFloat( focus.newText );
		value = Math.min( Math.max( value, focus.minValue ), focus.maxValue );
		focus.object[focus.property] = value;
		focus._private.createValueSliderBar( focus.scaling );
	} else {
		focus.object[focus.property] = focus.newText;
	}

	focus.executeCallback();

	// Deactivate focus
	this.gui._private.focus = null;

	// Deactivate focus - workaround to hide keyboard on iOS
	document.getElementById( 'simple_dat_gui_dummy_text_input' ).blur();
};

SimpleDateGui.__internals.prototype.moveCursorToFirstCharacter = function() {

	let focus = this.gui._private.focus;
	let textHelper = focus.textHelper;
	textHelper.cursor = 0;
	textHelper.start = 0;
	textHelper.calculateLeftAlignText( focus.newText );
	focus._private.createTextValue( focus.textHelper.truncated );
};

SimpleDateGui.__internals.prototype.moveCursorToLastCharacter = function() {

	let focus = this.gui._private.focus;
	let textHelper = focus.textHelper;
	let value = focus.newText;
	textHelper.cursor = value.length;
	textHelper.end = value.length - 1;
	textHelper.calculateAlignTextLastCall( focus.newText );
	focus._private.createTextValue( focus.textHelper.truncated );
};

SimpleDateGui.__internals.prototype.moveCursorToNextCharacter = function() {

	let focus = this.gui._private.focus;
	let textHelper = focus.textHelper;
	let value = focus.newText;
	if ( textHelper.cursor < value.length ) {
		textHelper.cursor += 1;
		if ( textHelper.cursor > focus.textHelper.end ) {
			textHelper.calculateAlignTextLastCall( focus.newText );
		}
	}
	focus._private.createTextValue( focus.textHelper.truncated );
};

SimpleDateGui.__internals.prototype.moveCursorToPreviousCharacter = function() {

	let focus = this.gui._private.focus;
	let textHelper = this.gui._private.focus.textHelper;
	if ( textHelper.cursor > 0 ) {
		textHelper.cursor -= 1;
	}
	if ( textHelper.start > textHelper.cursor ) {
		if ( textHelper.start > 0 ) {
			textHelper.start--;
		}
		textHelper.calculateAlignTextLastCall( focus.newText );
	}
	focus._private.createTextValue( focus.textHelper.truncated );
};

SimpleDateGui.__internals.prototype.deletePreviousCharacter = function() {

	let focus = this.gui._private.focus;
	let textHelper = focus.textHelper;
	let value = focus.object[focus.property];
	if ( textHelper.cursor > 0 ) {
		value = focus.newText;
		focus.newText = value.substring( 0, textHelper.cursor - 1 ) +
            value.substring( textHelper.cursor, value.length );
		textHelper.cursor -= 1;
		textHelper.calculateAlignTextLastCall( focus.newText );
		focus._private.createTextValue( textHelper.truncated );
	}
};

SimpleDateGui.__internals.prototype.deleteNextCharacter = function() {

	let focus = this.gui._private.focus;
	let textHelper = focus.textHelper;
	let value = focus.newText;
	focus.newText = value.substring( 0, textHelper.cursor ) +
        value.substring( textHelper.cursor + 1, value.length );
	textHelper.calculateAlignTextLastCall( focus.newText );
	focus._private.createTextValue( focus.textHelper.truncated );
};

/**
 * Workaround to activate keyboard on iOS
 */
SimpleDateGui.__internals.prototype.createDummyTextInputToShowKeyboard = function( positionY ) {

	let element = document.getElementById( 'simple_dat_gui_dummy_text_input' );
	if ( element == null ) {
		let _div = document.createElement( 'div' );
		_div.setAttribute( 'id', 'div_simple_dat_gui_dummy_text_input' );
		let _form = document.createElement( 'form' );
		_div.appendChild( _form );
		let _input = document.createElement( 'input' );
		_input.setAttribute( 'type', 'text' );
		_input.setAttribute( 'id', 'simple_dat_gui_dummy_text_input' );
		_input.setAttribute( 'style', 'opacity: 0; width: 1px; font-size: 0px;' );
		_form.appendChild( _input );
		document.body.appendChild( _div );
	}
	document.getElementById( 'div_simple_dat_gui_dummy_text_input' ).setAttribute( 'style', 'position: absolute; top: ' +
        positionY + 'px; right: 0px;' );
	document.getElementById( 'simple_dat_gui_dummy_text_input' ).focus();
};

SimpleDateGui.__internals.prototype.getMousePositon = function( event ) {

	let domElement = this.gui.renderer.domElement;
	let mouse = {};
	mouse.x = ( ( event.clientX ) / ( window.innerWidth - domElement.offsetLeft ) ) * 2 - 1;
	mouse.y = -( ( event.clientY - domElement.offsetTop ) / ( domElement.clientHeight ) ) * 2 + 1;
	return mouse;
};

SimpleDateGui.__internals.prototype.getIntersectingObjects = function( event ) {
	let domElement = this.gui.renderer.domElement;
	let mouse = {};
	mouse.x = ( ( event.clientX ) / ( window.innerWidth - domElement.offsetLeft ) ) * 2 - 1;
	mouse.y = -( ( event.clientY - domElement.offsetTop ) / ( domElement.clientHeight ) ) * 2 + 1;
	let vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	vector.unproject( this.gui.camera );
	let raycaster = new THREE.Raycaster( this.gui.camera.position, vector.sub( this.gui.camera.position ).normalize() );
	return raycaster.intersectObjects( this.gui._private.mouseBindings );
};

SimpleDateGui.__internals.prototype.setNewCursorFromMouseDownEvt = function( intersects ) {

	let element = intersects[0].object.WebGLElement;
	let focus = this.gui._private.focus;
	let textHelper = element.textHelper;
	let value = focus.newText;
	this.gui._private.selected = element;

	let deltaX = Math.pow( Math.pow( intersects[0].point.x +
            element.textHelper.residiumX - element.wTextValue.position.x, 2 ) +
        Math.pow( intersects[0].point.y -
            element.wTextValue.position.y, 2 ) + Math.pow( intersects[0].point.z -
            element.wTextValue.position.z, 2 ), 0.5 );
	if ( deltaX > textHelper.possibleCursorPositons[textHelper.possibleCursorPositons.length - 1].x ) {
		textHelper.end = value.length - 1;
		textHelper.cursor = value.length;
		textHelper.calculateAlignTextLastCall( value );
	} else {
		for ( let i = 0; i < textHelper.possibleCursorPositons.length - 1; i++ ) {
			let minX = textHelper.possibleCursorPositons[i].x;
			let maxX = textHelper.possibleCursorPositons[i + 1].x;
			if ( deltaX > minX &&
                deltaX <= maxX ) {
				textHelper.cursor = i +
                    textHelper.start;
			}
		}
	}
};

export default SimpleDateGui;
