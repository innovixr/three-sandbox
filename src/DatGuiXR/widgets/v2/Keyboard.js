import * as THREE from 'three';
import * as PIXI from 'pixi.js-legacy';
import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';
import { Keymap } from '../../utils/Keymap.js';
import { Object3D } from '../../three/Object3D.js';
import '../../pixi/center.js';


PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

class Keyboard {

	constructor( config, context ) {

		config = config || {};
		this.config = config;

		this.canvasWidth = config.width || 8192;
		this.layout = config.layout || 'fr';
		this.showCanvas = config.showCanvas || false;

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

		this.backdropPadding = this.getCanvasPercentWidth( 1.3 );
		this.backdropRadius = this.getCanvasPercentWidth( 2 );

		this.buttonMargin = this.getCanvasPercentWidth( 1 );
		this.buttonBaseWidth = this.getButtonBaseWidth();
		this.buttonRadius = this.getCanvasPercentWidth( 1 );
		this.buttonBaseHeight = this.buttonBaseWidth;

		this.buttonFont = { fontFamily: 'Verdana', fontSize: this.canvasWidth / 40 };

		this.filters = {
			bloom: {
				enable: false,
				threshold: 0.3,
				bloomScale: 1,
				brightness: 1,
				blur: 2,
				quality: 4
			}
		};

		this.canvasHeight = this.getCanvasHeight();

		this.createCanvas( this.canvasWidth, this.canvasHeight );
		this.createPixiApp();
		this.createPixiBackdrop( this.canvasWidth, this.canvasHeight, this.backdropRadius, this.backdropColor );
		this.createPixiButtons();

		///////////////
		// threejs
		///////////////

		const w = 0.6;
		const s = 0.2475 / w;
		const h = w * s;

		this.panelWidth = ( Math.round( ( w ) * 100 ) / 100 );
		this.panelHeight = ( Math.round( ( h ) * 100 ) / 100 );
		this.panelDepth = 0;
		this.panelRatio = this.panelHeight / this.panelWidth;
		this.meshVisible = true;
		this.textureSpacerZ = -0.05;

		this.createThreeMaterials();
		this.createThreeMesh();
		this.createThreeButtons();

		this.needsUpdate = true;

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
		let style = '';
		style += `position:absolute;width:${width}px;height:${height}px;`;
		style += 'margin:auto; top:0; left:0; right:0; bottom:0;';
		style += 'background-color: transparent; opacity: 0.999;';
		//style += 'zoom: 0.5;';
		if ( !show )
			style += 'visibility:hidden; z-index: 1000;';
		canvasEl.style = style;

		document.body.appendChild( canvasEl );
		this.canvasEl = canvasEl;
		return canvasEl;
	}

	createPixiApp() {
		this.pixiApp = new PIXI.Application( {
			view: this.canvasEl,
			backgroundAlpha: 0,
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
		this.backdrop = this.createPanel( width, height, radius, fillColor );
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
				if ( firstLine ) accumulateY = this.backdropPadding;
				if ( firstKey ) accumulateX = this.backdropPadding;

				// compute button width
				key.width = key.width * 10;
				width = this.buttonBaseWidth * ( key.width );
				width += this.buttonMargin * ( key.width - 1 );

				// create button
				const str = key.chars[ charset ].lowerCase || key.chars[ charset ].icon || 'undif';
				button = this.createButton( width, height, radius, this.buttonColor, str );

				// position the button
				button.position.x = accumulateX;
				button.position.y = accumulateY;

				// add the button to his container
				this.backdrop.addChild( button );

				const tbt = {};

				if ( !this.config.flat )
				{
					tbt.x = this.convertPixelToMeterX( button.position.x, button.width );
					tbt.y = this.convertPixelToMeterY( button.position.y, button.height );
					/*
					if ( count < 2 )
					{
						console.log( `pixi  button#${count} x=${bt.pixi.position.x}, y=${bt.pixi.position.y}, w=${bt.pixi.width}, h=${bt.pixi.height}` );
						console.log( `three button#${count} x=${bt.three.x}, y=${bt.three.y}` );
					}
					*/
					tbt.width = button.width / this.ratioCanvasPanelWidth;
					tbt.height = button.height / this.ratioCanvasPanelHeight;
					tbt.depth = this.buttonDepth;
					tbt.offsetX = this.convertPixelToPercentX( button.position.x );
					tbt.offsetY = this.convertPixelToPercentY( button.position.y );

					tbt.material = this.materialKeys;
					tbt.texture = this.canvasTextureKeys;

					tbt.instance = this.createThreeButton( tbt );
					tbt.instance.mesh.position.x = tbt.x;
					tbt.instance.mesh.position.y = tbt.y;
					tbt.instance.mesh.position.z = this.textureSpacerZ;
					this.mesh.add( tbt.instance.mesh );
				}

				firstKey = false;
				accumulateX += width + this.buttonMargin;
			} );
			firstLine = false;
			accumulateY += height + this.buttonMargin;
		} );
	}


	convertPixelToMeterX( x, w ) {
		return (
			( x / this.ratioCanvasPanelWidth ) -
			( this.panelWidth / 2 ) +
			( this.backdropPadding / this.ratioCanvasPanelWidth ) +
			( ( ( w - 100 ) / 2 ) / this.ratioCanvasPanelWidth )
		);
	}

	convertPixelToMeterY( y, h ) {
		return (
			( this.panelHeight / 2 ) -
			( y / this.ratioCanvasPanelHeight ) -
			( this.backdropPadding / this.ratioCanvasPanelHeight ) -
			( ( ( h - 100 ) / 2 ) / this.ratioCanvasPanelHeight )
		);
	}

	convertPixelToPercentX( x ) {
		return (
			( ( x * 100 )  / this.canvasWidth ) / 100
		);
	}

	convertPixelToPercentY( y ) {
		return (
			1 - ( ( ( y * 100 ) / this.canvasHeight ) / 100 ) - 0.21
		);
	}

	createPanel( width, height, radius, fillColor ) {
		const panel = new PIXI.Graphics();
		//panel.lineStyle( { alignment: 0, width: 5, color: 0x2222FF, alpha: 0.2 } );
		panel.beginFill( fillColor, 0.8 );
		panel.drawRoundedRect( 0, 0, width, height, radius );
		panel.endFill();
		return panel;
	}

	createButton( width, height, radius, fillColor, str ) {
		const button = this.createPanel( width, height, radius, fillColor );

		if ( this.filters?.bloom )
		{
			button.filters = [ new AdvancedBloomFilter( this.filters.bloom ) ];
		}

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

	createThreeButton( { value = '.', width = 0.1, height = 0.1, depth = 0.1, material, texture, offsetX, offsetY } ) {
		return {
			mesh: {
				position: {}
			}
		};
		const cardConfig = {
			name: value,
			width,
			height,
			offsetX,
			offsetY,
			depth,
			radius: 0.005,
			frontColor: 0x222222,
			material,
			texture
		};

		const threeButton = new Card( cardConfig );
		return threeButton;
	}

	createThreeMesh() {
		console.log( 'Keyboard: createMesh', this.panelWidth, this.panelHeight );

		// setup geometry
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
		this.context?.raycasterObjects.push( this.meshKeyboard );
	}

	createThreeMaterials() {

		// setup material
		const materialConfig = {
			transparent: false,
			opacity: 0.999,
			alphaTest: 0.1,
			wireframe: false,
			visible: this.meshVisible
		};

		//const material = THREE.MeshPhongMaterial;
		const material = THREE.MeshBasicMaterial;

		// material for main plane
		this.material = new material( materialConfig );
		this.canvasTexture = new THREE.CanvasTexture( this.canvasEl );
		this.canvasTexture.wrapS = THREE.ClampToEdgeWrapping;
		this.canvasTexture.wrapT = THREE.ClampToEdgeWrapping;
		this.canvasTexture.anisotropy = 16;
		this.material.map = this.canvasTexture;

		// material for keys
		this.materialKeys = new material( materialConfig );
		this.canvasTextureKeys = new THREE.CanvasTexture( this.canvasEl );
		this.canvasTextureKeys.anisotropy = 16;
		//this.materialKeys.map = this.canvasTexture;
		//this.materialKeys.map = this.canvasTextureKeys;

	}

	createThreeButtons() {

	}


	/*
	round2( v ) {
		return Math.round( v * 100 ) / 100;
	}
	*/

	update( /*delta*/ ) {

		//console.log( this.pixiApp );

		if ( !this.needsUpdate ) return false;

		// this will update the texture threejs side
		this.canvasTexture.needsUpdate = true;
		this.canvasTextureKeys.needsUpdate = true;

		this.needsUpdate = false;

		// this will update pixi app
		this.pixiApp.renderer.render( this.pixiApp.stage, { clear: true } );
		return true;
	}
}

export { Keyboard };
