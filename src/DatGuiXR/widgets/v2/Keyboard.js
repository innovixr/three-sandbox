import * as THREE from 'three';
import * as PIXI from 'pixi.js';
import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import { Keymap } from '../../utils/Keymap.js';
import { Object3D } from '../../three/Object3D.js';
import '../../pixi/center.js';
import { InteractiveGroup } from './InteractiveGroup.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min';

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

console.clear();

class Keyboard {

	constructor( config, context ) {

		config = config || {};
		this.config = config;

		this.canvasWidth = config.width || 1024 * 8; // max multiplier = 12
		this.layout = config.layout || 'fr';
		this.scale = config.scale || 0.8; // 1.5 for webxr
		this.keysScaleZ = 1.2;
		this.keysDepth = ( config.keysDepth || 0.003 ) * this.keysScaleZ;
		this.debugPixiCanvas = config.debugPixiCanvas || false;
		this.debugTexture = config.debugTexture || false;
		this.debugThreeCanvas = config.debugThreeCanvas || false;
		this.debugThreeTexture = config.debugThreeTexture || false;

		// display top/left/right/bottom/center of keys
		// in the pixijs canvas texture
		this.debugPosition = config.debugPosition || false;

		// threejs context i.e scene, camera, renderer, controls
		this.context = context;

		// load keyboard layout
		this.keyLayout = Keymap.get( this.layout );
		console.assert( this.keyLayout?.length > 0, true );
		this.keyLines = Keymap.get( this.layout )[ 0 ];

		// colors
		const mainColor = 0x121eca;
		const buttonColor = 0x010101;
		const buttonColorHover = 0x020202;
		const backdropColor = 0x000000;

		this.backdropColor = this.colorToThree( backdropColor );
		this.buttonColor = this.colorToThree( buttonColor );
		this.buttonHoverColor = this.colorToThree( buttonColorHover );
		this.buttonBorderColor = this.colorToThree( mainColor );
		this.buttonFontColor = this.colorToThree( mainColor );

		console.log( this.colorToScreen( this.buttonColor ) );
		console.log( this.colorToScreen( this.buttonHoverColor ) );

		///////////////
		// pixi
		///////////////

		this.pixiButtons = [];

		this.backdropPadding = this.getCanvasPercentWidth( 1.3 );
		this.backdropRadius = this.getCanvasPercentWidth( 2 );

		this.buttonMargin = this.getCanvasPercentWidth( 1 );
		this.buttonBaseWidth = this.getButtonBaseWidth();
		this.buttonRadius = this.getCanvasPercentWidth( 1 );
		this.buttonBaseHeight = this.buttonBaseWidth;
		this.buttonFont = { fontFamily: 'Verdana', fontSize: this.canvasWidth / 40 };
		this.canvasHeight = this.getCanvasHeight();

		this.filters = {
			bloom: {
				threshold: 0.09,
				bloomScale: 1,
				brightness: 1,
				blur: 40,
				quality: 9
			},
			colorOverlay: {
				color: this.colorToScreen( this.buttonColor )
			}
		};



		this.bloomEffect = new AdvancedBloomFilter( this.filters.bloom );
		this.colorOverlay = new ColorOverlayFilter( this.filters.colorOverlay );

		this.canvasEl = this.createCanvas( this.canvasWidth, this.canvasHeight );
		document.body.appendChild( this.canvasEl );

		this.drawPixiElements();

		///////////////
		// threejs
		///////////////

		this.threeButtons = [];

		// keyboard pixi materials
		this.materialPixiKeyboardConfig = {
			transparent: false,
			opacity: 0.999,
			alphaTest: 0.1,
			wireframe: false,
			visible: true
		};

		this.panelWidth = 0.6 * this.scale;
		this.panelHeight = 0.2475 * this.scale;
		this.panelDepth = 0;
		this.panelRatio = this.panelHeight / this.panelWidth;

		this.keyboardRadius = 0.001;
		this.keyboardDepth = 0;

		this.ratioCanvasPanelWidth = this.canvasWidth / this.panelWidth;
		this.ratioCanvasPanelHeight = this.canvasHeight / this.panelHeight;
		this.ratioCanvasPanelWidth = Math.round( this.ratioCanvasPanelWidth * 100 ) / 100;
		this.ratioCanvasPanelHeight = Math.round( this.ratioCanvasPanelHeight * 100 ) / 100;

		this.textureSpacerZ = -0.0001;
		//this.textureSpacerZ = -0.05;

		this.buttonMaterialBorder = new THREE.MeshBasicMaterial( { color: this.buttonBorderColor.convertSRGBToLinear() } );

		this.drawThreeElements();
		this.showDebugPanel();
		this.needsUpdate = true;
	}

	drawPixiElements() {
		this.createPixiApp();
		this.createPixiBackdrop( this.canvasWidth, this.canvasHeight, this.backdropRadius, this.backdropColor.getHex() );
		this.createPixiButtons();
	}

	drawThreeElements() {
		this.createKeyboardMaterials();
		this.createPixiBaseKeyboard();
		this.createThreeKeyboard();
	}

	colorToThree( color ) {
		return new THREE.Color( color ).convertLinearToSRGB();
	}

	colorToScreen( color ) {
		return color.getHex();
	}

	showDebugPanel() {

		const self = this;
		const itemKeys = this.debugPanel.addFolder( 'Keys' );
		itemKeys.add( this, 'keysScaleZ' ).min( 0 ).max( 10.0 ).step( 0.001 ).onChange( v => { onChangeKeysPropertie( 'keysScaleZ', v ); } );
		itemKeys.addColor( { buttonColor: this.colorToScreen( this.buttonColor ) }, 'buttonColor' ).onChange( onChangeButtonColor );
		itemKeys.addColor( { buttonBorderColor: this.colorToScreen( this.buttonBorderColor ) }, 'buttonBorderColor' ).onChange( onChangeButtonBorderColor );
		itemKeys.addColor( { buttonFontColor: this.colorToScreen( this.buttonFontColor ) }, 'buttonFontColor' ).onChange( onChangeButtonFontColor );

		const filterBloomAttributes = Object.keys( self.filters.bloom );
		//const colorOverlayAttributes = Object.keys( self.filters.colorOverlay );

		let pixiBtInstance;

		function onChangeTexture( attrName, value ) {
			self.threeButtons.map( bt => {

				if ( !bt || !bt.pixiEl || !bt.pixiEl.filters?.length ) return;
				pixiBtInstance = bt.pixiEl;
				pixiBtInstance.filters.map( filter => {
					if ( filter instanceof AdvancedBloomFilter )
					{
						filterBloomAttributes.map( ( attr ) => {
							if ( attr === attrName )
							{
								pixiBtInstance.filters[ 0 ][ attr ] = value;
							}
						} );
					}
				} );
				bt.texture.needsUpdate = true;
			} );
			self.needsUpdate = true;
		}

		function onChangeKeysPropertie( attrName, value ) {
			self.threeButtons.map( bt => {
				bt.scale.z = value;
			} );
			self.needsUpdate = true;
		}

		function onChangeButtonBorderColor( value ) {
			self.buttonBorderColor = new THREE.Color().setHex( value );
			self.buttonMaterialBorder.color = new THREE.Color().setHex( value );
			self.needsUpdate = true;
		}

		function onChangeButtonColor( value ) {
			console.log( 'onChangeButtonColor', value );
			self.buttonColor = new THREE.Color().setHex( value );
			self.drawPixiElements();
			self.threeButtons.map( bt => {
				bt.texture.needsUpdate = true;
			} );


			self.needsUpdate = true;
		}

		function onChangeButtonFontColor( value ) {
			console.log( 'onChangeButtonFontColor', value );
			self.buttonFontColor = new THREE.Color().setHex( value );
			self.threeButtons.map( bt => {
				bt.pixiEl.text.style.fill = self.buttonFontColor.getHex();
				bt.texture.needsUpdate = true;
			} );
			self.needsUpdate = true;
		}

		if ( this.debugTexture )
		{
			const itemTexture = this.debugPanel.addFolder( 'Texture' );
			itemTexture.add( this.filters.bloom, 'threshold' ).min( 0 ).max( 1.0 ).step( 0.001 ).onChange( v => { onChangeTexture( 'threshold', v ); } );
			itemTexture.add( this.filters.bloom, 'bloomScale' ).min( 0 ).max( 5 ).step( 0.01 ).onChange( v => { onChangeTexture( 'bloomScale', v ); } );
			//itemTexture.add( this.filters.bloom, 'brightness' ).min( 0 ).max( 5 ).step( 0.01 ).onChange( v => { onChangeTexture( 'brightness', v ); } );
			itemTexture.add( this.filters.bloom, 'blur' ).min( -20.0 ).max( 100.0 ).step( 1 ).onChange( v => { onChangeTexture( 'blur', v ); } );
			itemTexture.add( this.filters.bloom, 'quality' ).min( -1 ).max( 50 ).step( 0.1 ).onChange( v => { onChangeTexture( 'quality', v ); } );
			itemTexture.open();
		}
	}

	onPointerMove( ev ) {
		//console.log( `Keyboard.js: ${Date.now()} ${ev.type} ${ev.target.name} ` );

		if ( this.movedOn != ev.target )
		{

			if ( this.movedOn ) this.onPointerLeave( this.movedOn );
			this.movedOn = ev.target;
			this.onPointerEnter( this.movedOn );
		}
	}

	onPointerDown( ev ) {
		if ( ev.target.name === 'plane' ) return;
		console.log( `Keyboard.js: ${Date.now()} ${ev.type} ${ev.target.name} ` );
		this.selectedKeyMesh = ev.target;
		new TWEEN.Tween( this.selectedKeyMesh.scale ).to( { z: 0.4 }, 50 ).start();
		this.needsUpdate = true;
	}

	onPointerUp( ev ) {
		if ( ev.target.name === 'plane' ) return;
		if ( !this.selectedKeyMesh ) return;
		console.log( `Keyboard.js: ${Date.now()} ${ev.type} ${ev.target.name} ` );
		new TWEEN.Tween( this.selectedKeyMesh.scale ).to( { z: 1 }, 50 ).start();
		this.selectedKeyMesh = null;
		this.needsUpdate = true;
	}

	onPointerEnter( threeEl ) {
		if ( this.selectedKeyMesh ) return;
		if ( threeEl.name === 'plane' ) return;
		console.log( `Keyboard.js: ${Date.now()} pointerenter ${threeEl.name} `, threeEl.pixiEl );
		const button = threeEl.pixiEl;
		if ( !button ) return;
		this.context.renderer.domElement.style.cursor = 'pointer';

		button.filters = [];
		button.textContainer.filters = [];

		if ( this.filters.bloom )
		{
			button.filters.push( new AdvancedBloomFilter( this.filters.bloom ) );
			threeEl.texture.needsUpdate = true;
			this.needsUpdate = true;
		}

		if ( this.filters.colorOverlay )
		{
			const f = new ColorOverlayFilter();
			f.color = this.colorToScreen( this.buttonHoverColor );
			button.textContainer.filters.push( f );
			threeEl.texture.needsUpdate = true;
			this.needsUpdate = true;
		}
	}

	onPointerLeave( threeEl ) {
		if ( this.selectedKeyMesh ) return;
		if ( threeEl.name === 'plane' ) return;
		console.log( `Keyboard.js: ${Date.now()} pointerleave ${threeEl.name} ` );
		this.context.renderer.domElement.style.cursor = 'auto';
		const button = threeEl.pixiEl;
		if ( !button ) return;
		button.filters = [];
		button.textContainer.filters = [];
		threeEl.texture.needsUpdate = true;
		this.needsUpdate = true;
	}

	onSelect() {
		console.log( 'onSelect' );
	}

	onSelectStart() {
		console.log( 'onSelectStart' );
	}

	onSelectEnd() {
		console.log( 'onSelectEnd' );
	}

	onMove() {
		console.log( 'onMove' );
	}

	createThreeKeyboard() {
		// console.log( 'createThreeButtons', this.pixiButtons.lengh );

		this.onPointerMove = this.onPointerMove.bind( this );
		this.onPointerDown = this.onPointerDown.bind( this );
		this.onPointerUp = this.onPointerUp.bind( this );
		this.onPointerEnter = this.onPointerEnter.bind( this );
		this.onPointerLeave = this.onPointerLeave.bind( this );
		this.onSelect = this.onSelect.bind( this );
		this.onSelectStart = this.onSelectStart.bind( this );
		this.onSelectEnd = this.onSelectEnd.bind( this );
		this.onMove = this.onMove.bind( this );

		const group = new InteractiveGroup( this.context.renderer, this.context.camera );

		////////////////////////////////////
		// keyboard panel background
		////////////////////////////////////

		let texture = this.canvasTexture;
		const material = new THREE.MeshBasicMaterial( {
			map: texture,
			transparent: true, // for rounded corner
			//opacity: 1,
			//alphaTest: 0.1,
			wireframe: false
		} );


		if ( material.map )
		{
			//material.transparent = true;
			//material.opacity = 0.8;
		}

		let geometry;
		if ( this.keyboardDepth > 0 )
		{
			geometry = this.createButtonExtrudedGeometry( 0, 0, this.panelWidth, this.panelHeight, this.keyboardRadius, this.keyboardDepth );
			geometry.center();
		} else
		{
			geometry = new THREE.PlaneGeometry( this.panelWidth, this.panelHeight );
		}

		const keyboardPlane = new THREE.Mesh( geometry, material );
		keyboardPlane.position.z = -0.001;
		keyboardPlane.name = 'plane';

		keyboardPlane.addEventListener( 'pointerdown', this.onPointerDown );
		keyboardPlane.addEventListener( 'pointerup', this.onPointerUp );
		keyboardPlane.addEventListener( 'pointermove', this.onPointerMove );
		keyboardPlane.addEventListener( 'select', this.onSelect );
		keyboardPlane.addEventListener( 'selectstart', this.onSelectStart );
		keyboardPlane.addEventListener( 'selectend', this.onSelectEnd );
		keyboardPlane.addEventListener( 'move', this.onMove );

		group.add( keyboardPlane );
		this.mesh.add( group );

		if ( this.debugThreeCanvas )
			group.position.y = 0.1 * this.scale;

		if ( this.debugThreeTexture )
			return;

		//////////////
		// keys
		/////////////

		const hoverColor = 0xFF00FF;
		// eslint-disable-next-line no-unused-vars
		this.pixiButtons.forEach( ( bt, idx ) => {

			let x = this.pixelToThreeDimensionX( bt.position.x );
			let y = this.pixelToThreeDimensionY( bt.position.y );

			let width = this.pixelToThreeDimensionX( bt.width );
			let height = this.pixelToThreeDimensionY( bt.height );
			let radius = this.pixelToThreeDimensionY( this.buttonRadius );

			x = x - ( this.panelWidth / 2 );	// adjust center
			y = y - ( this.panelHeight / 2 );	// adjust center
			y = - y - ( height / 2 );			// inverse y
			y -= height / 2;					// adjust center

			let texture = this.canvasTexture.clone();

			const matFront = new THREE.MeshBasicMaterial( {
				map: texture,
				transparent: false,
				opacity: 1,
				alphaTest: 0.01,
				wireframe: false
			} );

			if ( matFront.map )
			{
				let ratio = texture.image.width / texture.image.height;
				let scale = this.scale * ratio;

				//console.log( 'scale', scale );
				matFront.map.wrapS = THREE.RepeatWrapping;
				matFront.map.wrapT = THREE.RepeatWrapping;

				matFront.map.repeat.set( scale, scale * ratio );
				matFront.map.offset.x = this.pixelToPercentX( bt.position.x );
				matFront.map.offset.y = this.pixelToPercentY( bt.position.y );
			} else
			{
				matFront.color = new THREE.Color( 0xFFFFFF );
			}

			const matHover = new THREE.MeshBasicMaterial( { color: hoverColor } );
			const geometry = this.createButtonExtrudedGeometry( 0, 0, width, height, radius, this.keysDepth );
			const keyMesh = new THREE.Mesh( geometry, [ this.buttonMaterialBorder, matFront, matHover ] );
			keyMesh.name = `key ${bt.value}`;
			keyMesh.pixiEl = bt;
			keyMesh.texture = texture;
			group.add( keyMesh );

			keyMesh.addEventListener( 'pointerdown', this.onPointerDown );
			keyMesh.addEventListener( 'pointerup', this.onPointerUp );
			keyMesh.addEventListener( 'pointermove', this.onPointerMove );
			keyMesh.addEventListener( 'select', this.onSelect );
			keyMesh.addEventListener( 'selectstart', this.onSelectStart );
			keyMesh.addEventListener( 'selectend', this.onSelectEnd );
			keyMesh.addEventListener( 'move', this.onMove );

			keyMesh.position.x = x;
			keyMesh.position.y = y;
			keyMesh.position.z = -this.textureSpacerZ;
			this.assignMaterial( geometry );

			this.threeButtons.push( keyMesh );


			/*
			if ( idx === 0 )
			{
				let toggle = false;
				setInterval( () => {
					if ( !toggle ) {
						this.onPointerEnter( keyMesh );
						toggle = true;
					} else {
						this.onPointerLeave( keyMesh );
						toggle = false;
					}
				}, 5000 );
			}
			*/

		} );
	}

	pixelToPercentX( x ) {
		return (
			//( ( ( x * 100 ) / this.canvasWidth ) / 100 ) + 0.0035
			( ( ( x * 100 ) / this.canvasWidth ) / 100 ) + ( 0.004375 * this.scale )
		);
	}

	pixelToPercentY( y ) {
		return (
			//( ( ( y * 100 ) / this.canvasHeight ) / 100 )
			( ( ( ( this.canvasHeight - y - ( this.backdropRadius * 4 ) ) * 100 ) / this.canvasHeight ) / 100 ) - ( 0.0185 * this.scale )
		);
	}

	assignMaterial( geometry ) {
		// make all faces use matBack
		for ( let i = 0; i < geometry.groups.length; i++ )
			geometry.groups[ i ].materialIndex = 0;

		// make front face use matFront
		geometry.groups[ 0 ].materialIndex = 1;
	}

	pixelToThreeDimensionX( v ) {
		let percentV = ( 100 * v ) / this.canvasWidth;
		v = ( percentV * this.panelWidth ) / 100;
		return v;
	}

	pixelToThreeDimensionY( v ) {
		let percentV = ( 100 * v ) / this.canvasHeight;
		v = ( percentV * this.panelHeight ) / 100;
		return v;
	}

	createButtonExtrudedGeometry( x, y, width, height, radius, depth ) {
		const shape = new THREE.Shape();

		shape.moveTo( x, y + radius );										// bottom left + radius
		shape.lineTo( x, y + height - radius );								// left border
		shape.quadraticCurveTo( x, y + height, x + radius, y + height ); 	// top left curve
		shape.lineTo( x + width - radius, y + height );						// top border
		shape.quadraticCurveTo( x + width, y + height, x + width, y + height - radius ); // top right curve
		shape.lineTo( x + width, y + radius );								// right border
		shape.quadraticCurveTo( x + width, y, x + width - radius, y );		// bottom right curve
		shape.lineTo( x + radius, y );										// bottom border
		shape.quadraticCurveTo( x, y, x, y + radius );						// bottom left curve

		const extrudeSettings = {
			steps: 2,
			segments: 3,
			curveSegments: 4,
			depth,
			bevelEnabled: false,
			//bevelThickness: 1,
			//bevelSize: 1,
			//bevelOffset: 0,
			//bevelSegments: 1
		};

		const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
		return geometry;
	}

	getButtonBaseWidth() {
		const maxButtons = this.getMaxButtons();
		const buttonMargins = this.backdropPadding + ( this.buttonMargin * ( maxButtons - 1 ) ) + this.backdropPadding;
		const freeSpace = this.canvasWidth - buttonMargins;
		const buttonWidth = freeSpace / maxButtons;
		return buttonWidth;
	}

	getCanvasHeight() {
		const totalPaddingCanvas = ( this.backdropPadding * 2 );
		const totalPaddingLines = this.buttonMargin * ( this.keyLines.length - 1 );
		const buttonsHeight = this.buttonBaseHeight * this.keyLines.length;
		return totalPaddingCanvas + totalPaddingLines + buttonsHeight;
	}

	getCanvasPercentWidth( percent ) {
		return ( percent * this.canvasWidth / 100 );
	}

	createCanvas( width, height ) {
		const canvasEl = document.createElement( 'canvas' );
		canvasEl.width = width;
		canvasEl.height = height;

		let style = '';
		style += `position:absolute;width:${width}px;height:${height}px;`;
		style += 'margin-left:auto; ;margin-right:auto; top:10%; left:0; right:0; ';
		style += 'border:1px solid rgba(255, 255, 255, 0.5);background-color: white; opacity: 0.999;z-index: 10;';
		style += 'zoom: 0.07;';
		if ( !this.debugPixiCanvas )
			style += 'visibility:hidden;';
		canvasEl.style = style;
		this.canvasEl = canvasEl;
		return canvasEl;
	}

	createPixiApp() {

		if ( this.pixiApp )
		{
			for ( let i = this.pixiApp.stage.children.length - 1; i >= 0; i-- ) { this.pixiApp.stage.removeChild( this.pixiApp.stage.children[ i ] ); }
			this.pixiApp.renderer.render( this.pixiApp.stage, { clear: true } );
			return;
		}

		this.pixiApp = new PIXI.Application( {
			view: this.canvasEl,
			backgroundAlpha: 0,
			autoStart:false,
			backgroundColor: 0x000000,
			width: this.canvasWidth,
			height: this.canvasHeight,
			//legacy: true,
			//clearBeforeRender: true,
			//forceCanvas:true,
			//interactive:true,
			//autoResize: true,
			//powerPreference: 'high-performance'
		} );
	}

	createPixiBackdrop( width, height, radius, fillColor ) {
		this.backdrop = this.createPixiPanel( width, height, radius, fillColor );
		this.pixiApp.stage.addChild( this.backdrop );
	}

	createPixiButtons() {
		let firstLine = true;
		let firstKey = true;
		let accumulateX = 0;
		let accumulateY = 0;
		let button;
		let width = this.buttonBaseWidth;
		let height = this.buttonBaseHeight;
		let radius = this.buttonRadius;

		const charset = 0;

		this.keyLines.forEach( ( line ) => {
			firstKey = true;
			line.forEach( ( key ) => {

				// if it's the first line, take backdrop padding as the first Y position
				if ( firstLine ) accumulateY = this.backdropPadding;

				// if it's the first key, take backdrop padding as the first X position
				if ( firstKey ) accumulateX = this.backdropPadding;

				// compute button width
				key.width = key.width * 10;
				width = this.buttonBaseWidth * ( key.width );
				width += this.buttonMargin * ( key.width - 1 );

				// create pixi button
				const str = key.chars[ charset ].lowerCase || key.chars[ charset ].icon || 'undif';
				button = this.createPixiButton( width, height, radius, this.buttonColor, str );

				// move the top left button position
				button.position.x = accumulateX;
				button.position.y = accumulateY;
				button.value = str;

				if ( this.debugTexture )
				{
					button.filters = [ this.bloomEffect ];
					button.filters = [ this.colorOverlay ];
					//threeEl.texture.needsUpdate = true;
					//this.needsUpdate = true;
				}

				// add the button to his container
				this.backdrop.addChild( button );
				this.pixiButtons.push( button );

				if ( this.debugPosition )
					this.buttonPositionHelper( button );

				firstKey = false;
				accumulateX += width + this.buttonMargin;
			} );
			firstLine = false;
			accumulateY += height + this.buttonMargin;
		} );
	}

	buttonPositionHelper( button ) {

		const crossColor = 0xFF0000;
		const topLeftColor = 0x0000FF;

		// top left point
		const topLeft = new PIXI.Graphics();
		topLeft.beginFill( topLeftColor, 1 );
		topLeft.drawRect( 0, 0, 5, 5 );
		topLeft.endFill();

		// center cross
		const size = 200;
		const x = 32; // size multiplier
		const crossOpacity = 0.1;

		const centerH = new PIXI.Graphics();
		centerH.beginFill( crossColor, crossOpacity );
		centerH.drawRect( 0, 0, size / x, size );
		centerH.endFill();
		centerH.position.x = ( button.width / 2 )  - ( size / x / 2  );
		centerH.position.y = ( button.height / 2 ) - ( size / 2 );

		const centerV = new PIXI.Graphics();
		centerV.beginFill( crossColor, crossOpacity );
		centerV.drawRect( 0, 0, size, size / x );
		centerV.endFill();
		centerV.position.x = ( button.width / 2 ) - ( size / 2 );
		centerV.position.y = ( button.height / 2 ) - ( size / x / 2 );

		button.addChild( topLeft );
		button.addChild( centerH );
		button.addChild( centerV );

	}

	createPixiPanel( width, height, radius, fillColor ) {
		const panel = new PIXI.Graphics();
		//panel.lineStyle( { alignment: 0, width: 3, color: this.buttonBorderColor.getHex(), alpha: 0.9 } );
		panel.beginFill( fillColor, 0.8 );
		panel.drawRoundedRect( 0, 0, width, height, radius );
		panel.endFill();
		return panel;
	}

	createPixiButton( width, height, radius, fillColor, str ) {
		const button = this.createPixiPanel( width, height, radius, fillColor.getHex() );

		const textContainer = this.createPixiPanel( width, height, radius, this.filters.colorOverlay.color );
		button.addChild( textContainer );

		const text = new PIXI.Text( str, this.buttonFont );
		text.style.fill = this.buttonFontColor.getHex();
		textContainer.addChild( text );
		text.anchor.set( 0.5 );
		text.centerXY();

		button.text = text;
		button.textContainer = textContainer;

		return button;
	}

	getMaxButtons() {
		let max = 0;
		this.keyLines.forEach( ( line ) => {
			let tmp = 0;
			line.forEach( key => tmp += key.width * 10 );
			if ( tmp > max ) max = tmp;
		} );
		return max;
	}

	createPixiBaseKeyboard() {
		let geometry;

		if ( this.panelDepth )
		{
			const materialBlack = new THREE.MeshPhongMaterial( { transparent: false, opacity: 0.999, color: 0x111111 } );
			const materialBlue = new THREE.MeshPhongMaterial( { transparent: false, opacity: 0.999, color: 'darkblue' } );
			if ( this.shapeType === 'box' )
			{
				geometry = new THREE.BoxGeometry( this.panelWidth, this.panelHeight, 0.01 );
			} else
			{
				geometry = Object3D.roundedBox1( this.panelWidth, this.panelHeight, 0.01, 0.005, 1 );
			}

			this.meshKeyboard = new THREE.Mesh( geometry, [ materialBlue, materialBlue, materialBlue, materialBlue, this.keyboardMaterial, materialBlack ] );
		} else
		{
			geometry = new THREE.PlaneGeometry( this.panelWidth, this.panelHeight );
			this.meshKeyboard = new THREE.Mesh( geometry, this.keyboardMaterial );
		}

		this.meshKeyboard.visible = false;
		if ( this.debugThreeCanvas )
		{
			this.meshKeyboard.visible = true;
		}
		this.mesh = new THREE.Group();
		this.mesh.add( this.meshKeyboard );

		if ( this.debugThreeCanvas )
		{
			this.meshKeyboard.position.y -= 0.17 * this.scale;
		}

		this.context?.raycasterObjects.push( this.meshKeyboard );
	}

	createKeyboardMaterials() {
		const material = THREE.MeshBasicMaterial;

		// material for main plane
		this.canvasTexture = new THREE.CanvasTexture( this.canvasEl );
		this.keyboardMaterial = new material( this.materialPixiKeyboardConfig );
		this.keyboardMaterial.map = this.canvasTexture;
	}

	update() {

		this.needsUpdate = this.needsUpdate || TWEEN.update();

		if ( !this.needsUpdate ) return false;

		// this will update the texture threejs side
		this.canvasTexture.needsUpdate = true;
		this.needsUpdate = false;

		// this will update pixi app
		this.pixiApp.renderer.render( this.pixiApp.stage, { clear: true } );
		return true;
	}
}

Keyboard.prototype.debugPanel = new GUI();

export { Keyboard };
