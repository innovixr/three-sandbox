import * as THREE from 'three';
import * as PIXI from 'pixi.js';
import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';
import { Keymap } from '../../utils/Keymap.js';
import { Object3D } from '../../three/Object3D.js';
import '../../pixi/center.js';
import { InteractiveGroup } from './InteractiveGroup.js';

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

class Keyboard {

	constructor( config, context ) {

		config = config || {};
		this.config = config;

		this.canvasWidth = config.width || 1024 * 8; // max multiplier = 12
		this.layout = config.layout || 'fr';
		this.showCanvas = config.showCanvas || false;
		this.scale = config.scale || 1.5;
		this.keysDepth = config.keysDepth || 0.005;

		// threejs context i.e scene, camera, renderer, controls
		this.context = context;

		// tmp
		this.decal = true;

		// load keyboard layout
		this.keyLayout = Keymap.get( this.layout );
		console.assert( this.keyLayout?.length > 0, true );
		this.keyLines = Keymap.get( this.layout )[ 0 ];

		// colors
		this.backdropColor = 0x030303;
		this.buttonColor = 0x050505;
		this.buttonColorText = 0x444444;

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

		this.filters = {
			bloom: {
				enable: true,
				threshold: 0.1,
				bloomScale: 2.9,
				brightness: 1,
				blur:8,
				quality: 4
			}
		};

		this.canvasHeight = this.getCanvasHeight();

		this.createCanvas( this.canvasWidth, this.canvasHeight, this.showCanvas );
		this.createPixiApp();
		this.createPixiBackdrop( this.canvasWidth, this.canvasHeight, this.backdropRadius, this.backdropColor );
		this.createPixiButtons();

		///////////////
		// threejs
		///////////////

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

		this.ratioCanvasPanelWidth = this.canvasWidth / this.panelWidth;
		this.ratioCanvasPanelHeight = this.canvasHeight / this.panelHeight;
		this.ratioCanvasPanelWidth = Math.round( this.ratioCanvasPanelWidth * 100 ) / 100;
		this.ratioCanvasPanelHeight = Math.round( this.ratioCanvasPanelHeight * 100 ) / 100;

		this.textureSpacerZ = -0.05;

		this.createKeyboardMaterials();
		this.createKeyboardMesh();
		this.createThreeButtons();

		this.needsUpdate = true;

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
		console.log( `Keyboard.js: ${Date.now()} ${ev.type} ${ev.target.name} ` );
	}

	onPointerUp( ev ) {
		console.log( `Keyboard.js: ${Date.now()} ${ev.type} ${ev.target.name} ` );
	}

	onPointerEnter( threeEl ) {
		console.log( `Keyboard.js: ${Date.now()} pointerenter ${threeEl.name} `, threeEl.pixiEl );

		const button = threeEl.pixiEl;
		if ( !button ) return;
		button.filters = [];
		if ( this.filters?.bloom && this.filters?.bloom.enable )
		{
			console.log( 'adding bloom', this.filters.bloom );
			button.filters.push( new AdvancedBloomFilter( this.filters.bloom ) );
			//this.pixiApp.renderer.render( this.pixiApp.stage, { clear: true } );
			threeEl.texture.needsUpdate = true;
			this.needsUpdate = true;
		}

	}

	onPointerLeave( threeEl ) {
		console.log( `Keyboard.js: ${Date.now()} pointerleave ${threeEl.name} ` );
		const button = threeEl.pixiEl;
		if ( !button ) return;
		button.filters = [];
		this.needsUpdate = true;
		threeEl.texture.needsUpdate = true;
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

	createThreeButtons() {
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

		let texture;
		//texture = this.canvasTextureKeys.clone();

		let material = new THREE.MeshBasicMaterial( {
			map: texture,
			transparent: true,
			opacity: 0.7,
			alphaTest: 0.1,
			wireframe: false
		} );

		if ( material.map )
		{
			material.opacity = 0.999;

			// not good
			let ratio = texture.image.width / texture.image.height;
			let scale1 = this.scale * 0.715; // ?????
			let scale2 = scale1 * ratio;

			material.map.wrapS = THREE.RepeatWrapping;
			material.map.wrapT = THREE.RepeatWrapping;
			material.map.repeat.set( scale1, scale2 );
			material.map.offset.x = 0;
			material.map.offset.y = 0.02;
		} else
		{
			material.color = new THREE.Color( 0x000000 );
		}

		//const geometry = new THREE.PlaneGeometry( this.panelWidth, this.panelHeight );
		const geometry = this.createButtonExtrudedGeometry( 0, 0, this.panelWidth, this.panelHeight, 0.01, 0.005 );
		geometry.center();

		const keyboardPlane = new THREE.Mesh( geometry, material );
		keyboardPlane.position.z = -0.002;
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

		const backColor = 0xFF0000;
		const hoverColor = 0xFF00FF;

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

			let texture;
			texture = this.canvasTextureKeys.clone();

			const matFront = new THREE.MeshBasicMaterial( {
				map: texture,
				transparent: false,
				opacity: 0.999,
				alphaTest: 0.6,
				wireframe: false
			} );

			if ( matFront.map )
			{

				let ratio = texture.image.width / texture.image.height;
				let scale = 1.5 / this.scale; // ?????

				matFront.map.wrapS = THREE.RepeatWrapping;
				matFront.map.wrapT = THREE.RepeatWrapping;

				matFront.map.repeat.set( scale, scale * ratio );
				matFront.map.offset.x = this.pixelToPercentX( bt.position.x );
				matFront.map.offset.y = this.pixelToPercentY( bt.position.y );
			} else
			{
				matFront.color = new THREE.Color( 0x222222 );
			}

			const matBack = new THREE.MeshBasicMaterial( { color: backColor } );
			const matHover = new THREE.MeshBasicMaterial( { color: hoverColor } );

			matFront.color.convertSRGBToLinear();
			matBack.color.convertSRGBToLinear();
			matHover.color.convertSRGBToLinear();

			const geometry = this.createButtonExtrudedGeometry( 0, 0, width, height, radius, this.keysDepth );
			const keyMesh = new THREE.Mesh( geometry, [ matBack, matFront, matHover ] );
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
			//keyMesh.position.z = -this.textureSpacerZ;
			this.assignMaterial( geometry );


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
				}, 1000 );
			}

		} );

		if ( this.decal )
		{
			group.position.x = 0.32 * this.scale;
		}
	}


	pixelToPercentX( x ) {
		return (
			( ( x * 100 ) / this.canvasWidth ) / 100
		);
	}

	pixelToPercentY( y ) {
		return (
			1 - ( ( ( y * 100 ) / this.canvasHeight ) / 100 ) - 0.21
		);
	}

	assignMaterial( geometry ) {
		if ( this.usePlane )
		{
			// make all faces use matBack
			for ( let i = 0; i < geometry.faces.length; i++ )
				geometry.faces[ i ].materialIndex = 0;
			geometry.faces[ 0 ].materialIndex = 1;
			return;
		}

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
		const canvasHeight = totalPaddingCanvas + totalPaddingLines + buttonsHeight;
		return canvasHeight;
	}

	getCanvasPercentWidth( percent ) {
		return ( percent * this.canvasWidth / 100 );
	}

	createCanvas( width, height, show ) {
		const canvasEl = document.createElement( 'canvas' );
		canvasEl.width = width;
		canvasEl.height = height;

		const ctx = canvasEl.getContext( 'webgl' );
		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = 'lighter';

		let style = '';
		style += `position:absolute;width:${width}px;height:${height}px;`;
		style += 'margin:auto; top:0; left:0; right:0; bottom:0;';
		style += 'border:1px solid rgba(255, 255, 255, 0.5);background-color: red; opacity: 0.999;';
		style += 'zoom: 0.1;';
		if ( !show ) style += 'visibility:hidden; z-index: 1000;';

		canvasEl.style = style;

		document.body.appendChild( canvasEl );
		this.canvasEl = canvasEl;

		// https://github.com/yomotsu/camera-controls/issues/80
		// canvasEl.setAttribute( 'tabindex', '0' );
		// canvasEl.focus();

		return canvasEl;
	}

	createPixiApp() {
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

				// add the button to his container
				this.backdrop.addChild( button );
				this.pixiButtons.push( button );

				//this.buttonPositionHelper( button );

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
		//panel.lineStyle( { alignment: 0, width: 5, color: 0x2222FF, alpha: 0.2 } );
		panel.beginFill( fillColor, 0.8 );
		panel.drawRoundedRect( 0, 0, width, height, radius );
		panel.endFill();
		return panel;
	}

	createPixiButton( width, height, radius, fillColor, str ) {
		const button = this.createPixiPanel( width, height, radius, fillColor );
		const text = new PIXI.Text( str, this.buttonFont );
		text.style.fill = this.buttonColorText;
		button.addChild( text );
		text.anchor.set( 0.5 );
		text.centerXY();
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

	createKeyboardMesh() {
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

			this.meshKeyboard = new THREE.Mesh( geometry, [ materialBlue, materialBlue, materialBlue, materialBlue, this.material, materialBlack ] );
		} else
		{
			geometry = new THREE.PlaneGeometry( this.panelWidth, this.panelHeight );
			this.meshKeyboard = new THREE.Mesh( geometry, this.material );
		}

		this.mesh = new THREE.Group();
		this.mesh.add( this.meshKeyboard );
		if ( this.decal ) this.meshKeyboard.position.x -= 0.3 * this.scale;
		this.context?.raycasterObjects.push( this.meshKeyboard );
	}

	createKeyboardMaterials() {
		const material = THREE.MeshBasicMaterial;

		// material for main plane
		this.material = new material( this.materialPixiKeyboardConfig );
		this.canvasTexture = new THREE.CanvasTexture( this.canvasEl );
		this.canvasTexture.wrapS = THREE.ClampToEdgeWrapping;
		this.canvasTexture.wrapT = THREE.ClampToEdgeWrapping;
		this.canvasTexture.anisotropy = 16;
		this.material.map = this.canvasTexture;

		// material for keys
		this.materialKeys = new material( this.materialPixiKeyboardConfig );
		this.canvasTextureKeys = new THREE.CanvasTexture( this.canvasEl );
		this.canvasTextureKeys.anisotropy = 16;
	}

	/*
	round2( v ) {
		return Math.round( v * 100 ) / 100;
	}
	*/

	update( /*delta*/ ) {

		if ( !this.needsUpdate ) return false;

		console.log( 'updating' );

		// this will update the texture threejs side
		this.canvasTexture.needsUpdate = true;
		this.needsUpdate = false;

		// this will update pixi app
		this.pixiApp.renderer.render( this.pixiApp.stage, { clear: true } );
		return true;
	}
}

export { Keyboard };
