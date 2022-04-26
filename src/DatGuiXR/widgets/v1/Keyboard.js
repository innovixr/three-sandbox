import * as THREE from 'three';
import * as PIXI from 'pixi.js-legacy';
import '../../pixi/center.js';

import { SmoothGraphics as Graphics } from '@pixi/graphics-smooth';
import { Object3D } from '../../three/Object3D.js';
import { Keymap } from '../../utils/Keymap.js';
import { shared } from '../../shared.js';
import { Card } from './Card.js';

const SCALE = 1;

class Keyboard {

	constructor( config, opts ) {
		this.config = config || {};
		this.config.layout = 'fr';
		this.keyLines = Keymap.get( this.config.layout )[ 0 ];

		this.scene = opts.scene;
		this.camera = opts.camera;
		this.renderer = opts.renderer;
		this.controls = opts.controls;
		this.raycasterObjects = opts.raycasterObjects;
		this.scale = typeof this.scale !== 'undefined' ? this.scale : SCALE;

		const w = 0.6;
		const s = 0.2475 / w;
		const h = w * s;

		this.panelWidth = ( Math.round( ( w  ) * 100 ) / 100 ) * this.scale;
		this.panelHeight = ( Math.round( ( h ) * 100 ) / 100 ) * this.scale;
		this.panelDepth = 0;
		this.panelRatio = this.panelHeight / this.panelWidth;
		this.resolution = opts.resolution || shared.defaults.resolution;
		this.canvasSize = this.canvasResolution;
		this.canvasWidth = this.canvasSize;
		this.canvasHeight = Math.round( this.canvasSize * this.panelRatio );
		this.ratioCanvasPanelWidth = this.canvasWidth / this.panelWidth;
		this.ratioCanvasPanelHeight = this.canvasHeight / this.panelHeight;
		this.ratioCanvasPanelWidth = Math.round( this.ratioCanvasPanelWidth * 100 ) / 100;
		this.ratioCanvasPanelHeight = Math.round( this.ratioCanvasPanelHeight * 100 ) / 100;
		this.shapeType = 'box';
		this.textureSpacerZ = -0.05;

		this.backdropColor = 0x030303;
		this.backdropMargin = 0;
		//this.backdropPadding = ( this.canvasHeight * 0.027 );
		this.backdropPadding = ( this.canvasHeight * 0.04 ) * this.scale;
		this.backdropRadius = 60;
		this.backdropWidth = this.canvasWidth - this.backdropMargin;
		this.backdropHeight = this.canvasHeight - this.backdropMargin;

		//console.log( 'k', this.backdropPadding, this.canvasHeight, this.backdropRadius );

		this.buttonColor = 0x050505;
		this.buttonColorText = 0x444444;
		this.buttonBaseHeight = this.canvasHeight / ( this.keyLines.length * this.resolution );
		this.buttonBaseHeight -= ( this.buttonBaseHeight * 0.15 );
		this.buttonBaseWidth = this.buttonBaseHeight;
		this.buttonDepth = 0.02;

		this.buttonHeight = this.buttonBaseHeight * this.resolution;
		this.mesh = null;
		this.meshKeyboard = null;
		this.meshVisible = true;
		this.useRealButtons = true;

		this.needsUpdate = true;
		console.log( `Keyboard(${this.panelWidth}, ${this.panelHeight}, ratio ${this.panelRatio})` );

		this.createMesh();
		this.createTexture();

	}

	createMesh() {
		console.log( 'Keyboard: createMesh', this.panelWidth, this.panelHeight );

		// @TODO: should be in config

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
		this.material = new material( materialConfig );
		this.material2 = new material( materialConfig );

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
		this.raycasterObjects.push( this.meshKeyboard );
	}

	get canvasResolution() {
		console.log( 'Keyboard: canvasResolution', this.resolution, shared.resolutions[ this.resolution ] );
		return shared.resolutions[ this.resolution ];
	}

	createTexture() {

		this.createCanvas( this.canvasWidth, this.canvasHeight );

		console.log( 'Keyboard: createTexture', this.canvasWidth, this.canvasHeight, this.canvasEl );

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

		/*
		this.pixiApp.renderer.plugins.interaction.on( 'mousemove', ( event ) => {
			console.log( 'pixiApp.renderer.plugins.interaction.on mousemove', event );
		} );
		*/

		this.canvasTexture = new THREE.CanvasTexture( this.canvasEl );
		this.canvasTexture.wrapS = THREE.ClampToEdgeWrapping;
		this.canvasTexture.wrapT = THREE.ClampToEdgeWrapping;
		this.canvasTexture.anisotropy = 16;

		this.canvasTexture2 = new THREE.CanvasTexture( this.canvasEl );
		this.canvasTexture2.anisotropy = 16;

		this.material.map = this.canvasTexture;
		this.material2.map = this.canvasTexture;

		//app.registerEvents( 'handleEvents', this.handleEvents.bind( this ) );

		// backdrop
		const backdrop = new PIXI.Graphics();

		//backdrop.lineStyle( { alignment: 0, width: 3 * this.resolution, color: 0x2222FF, alpha: 0.05 } );
		backdrop.beginFill( this.backdropColor, 0.8 );
		backdrop.drawRoundedRect( this.backdropMargin, this.backdropMargin, this.backdropWidth, this.backdropHeight, this.backdropRadius );
		backdrop.endFill();

		const charset = 0;
		const buttonPadding = 5 * this.resolution / 2;
		//const buttonPadding = ( this.canvasWidth * 0.0015 ) * this.resolution / 2;

		const increments = {
			pixi: {
				x: this.backdropPadding,
				y: this.backdropPadding
			}
		};

		//let count = 0;

		// eslint-disable-next-line no-unused-vars
		this.keyLines.map( ( keys, lineNumber ) => {
			// X coordinates of the first button on this new line
			increments.pixi.x = this.backdropPadding;

			keys.map( ( key ) => {
				let bt = {};

				// button padding
				bt.padding = ( 40 * this.resolution ) / 2;

				// specific local width adjustement
				bt.width = ( key.width || 0.1 ) * 10;
				bt.width = bt.width * this.buttonBaseWidth * this.resolution;
				bt.width += ( ( bt.width / ( this.buttonBaseWidth * this.resolution ) ) - 1 ) * ( bt.padding / 2 );
				bt.height = this.buttonHeight;

				// get char
				bt.value = key.chars[ charset ].lowerCase || key.chars[ charset ].icon || 'undif';

				// create buttons
				bt.pixi = this.createPixiButton( bt );
				bt.pixi.position.x = increments.pixi.x;
				bt.pixi.position.y = increments.pixi.y;
				bt.three = {};

				if ( !this.config.flat )
				{
					bt.three.x = this.convertPixelToMeterX( bt.pixi.position.x, bt.pixi.width );
					bt.three.y = this.convertPixelToMeterY( bt.pixi.position.y, bt.pixi.height );
					/*
					if ( count < 2 )
					{
						console.log( `pixi  button#${count} x=${bt.pixi.position.x}, y=${bt.pixi.position.y}, w=${bt.pixi.width}, h=${bt.pixi.height}` );
						console.log( `three button#${count} x=${bt.three.x}, y=${bt.three.y}` );
					}
					*/
					bt.three.width = bt.pixi.width / this.ratioCanvasPanelWidth;
					bt.three.height = bt.pixi.height / this.ratioCanvasPanelHeight;
					bt.three.depth = this.buttonDepth;
					bt.three.offsetX = this.convertPixelToPercentX( bt.pixi.position.x );
					bt.three.offsetY = this.convertPixelToPercentY( bt.pixi.position.y );

					bt.three.material = this.material2;
					bt.three.texture = this.canvasTexture2;

					bt.instance = this.createThreeButton( bt.three );
					bt.instance.mesh.position.x = bt.three.x;
					bt.instance.mesh.position.y = bt.three.y;
					bt.instance.mesh.position.z = this.textureSpacerZ;
					this.mesh.add( bt.instance.mesh );
				}
				//count++;
				//console.log( `x${count}`, pixiButton.position.x, threeButton.mesh.position.x );

				backdrop.addChild( bt.pixi );

				// increment
				increments.pixi.x += bt.pixi.width + ( buttonPadding * 4 );

			} );
			// Add button line height;
			increments.pixi.y += this.buttonHeight + ( buttonPadding * 4 );

		} );

		this.pixiApp.stage.addChild( backdrop );

		if ( this.controls )
		{
			this.controls.target = this.mesh.position;
		}

		// not running in immersive mode ?
		// this.pixiApp.ticker.add( ( delta ) => {} );

		this.needsUpdate = true;

		const simulateClick = false;
		if ( simulateClick )
		{
			setInterval( this.simulateClick.bind( this ), 500 );
			this.count = 0;
			this.pointer = document.createElement( 'div' );
			this.pointer.style = 'position:absolute;top:0px;left:0px;width:10px;height:10px;background-color:white;z-index:11;';
			document.body.appendChild( this.pointer );
		}

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

	createThreeButton( { value = '.', width = 0.1, height = 0.1, depth = 0.1,  material, texture, offsetX, offsetY } ) {

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

	createPixiButton( { value = '.', width = 270, height = 270, radius = 10 } ) {
		const button = new Graphics();

		//const btLineColor = 0x000066;
		//bt.lineStyle( 2, btLineColor, 1 );
		button.beginFill( this.buttonColor, 1 );
		button.drawRoundedRect( 0, 0, width, height, radius * this.resolution );
		button.endFill();

		const text = new PIXI.Text( value, {
			fontFamily: 'Verdana',
			fontSize: 24 * this.resolution,
		} );

		text.style.fill = this.buttonColorText;
		button.addChild( text );
		text.centerXY();

		//bt.on( 'mousemove', event => { console.log( 'bt mousemove', event ); } );
		//bt.on( 'mousedown', ev => { console.log( 'bt mousedown', ev ); } );
		//bt.on( 'mouseclick', ev => { console.log( 'bt mouseclick', ev ); } );
		//bt.on( 'pointerdown', ev => { console.log( 'bt pointerdown', ev ); } );
		//bt.on( 'click', ev => { console.log( 'bt clicked', ev ); } );


		return button;

	}

	onWindowResizeEnd() {

	}

	handleEvents( ev, item ) {

		const x = Math.floor( item.uv.x * this.canvasWidth );
		const y = Math.floor( item.uv.y * this.canvasHeight );

		const opts = {
			view: window,
			isTrusted: ev.isTrusted,
			bubbles: ev.bubbles,
			cancelable: ev.cancelable,
			currentTarget: this.canvasEl,
			screenX: x,
			screenY: y,
			clientX: x,
			clientY: y
		};

		console.log( 'Keyboard: handleEvents', item.uv, x, y, opts );
		const event = new MouseEvent( 'mousedown', opts );
		this.canvasTexture.image.dispatchEvent( event );
		this.canvasEl.dispatchEvent( event );
	}

	simulateClick( mode ) {
		let x = 640 + this.count;
		const y = 250;
		this.count += 50;
		if ( x > 1000 )
		{
			x = 640;
			this.count = 1;
		}

		const ev = new MouseEvent( 'click', {
			//view: window,
			bubbles: true,
			cancelable: true,
			clientX: x,
			clientY: y
		} );

		if ( mode )
		{
			document.elementFromPoint( x, y ).dispatchEvent( ev );
		} else
		{
			//console.log( 'Keyboard: click interval', x, y );
			this.pointer.style.left = x + 'px';
			this.pointer.style.top = y + 'px';
			this.canvasTexture.image.dispatchEvent( ev );
		}
	}

	createCanvas( width, height ) {
		this.canvasEl = document.createElement( 'canvas' );
		this.canvasEl.width = width;
		this.canvasEl.height = height;
		this.canvasEl.style = 'position:absolute;top:5px;left:5px;z-index:10;zoom:0.5;background-color:transparent;opacity:0.999';
		this.canvasEl.style += 'visibility:hidden';
		document.body.appendChild( this.canvasEl );
	}

	add() {
		console.log( 'DatGuiXR', 'add' );
	}

	update( /*delta*/ ) {

		//console.log( this.pixiApp );

		if ( !this.needsUpdate ) return false;

		// this will update the texture threejs side
		this.canvasTexture.needsUpdate = true;
		this.canvasTexture2.needsUpdate = true;

		this.needsUpdate = false;

		// this will update pixi app
		this.pixiApp.renderer.render( this.pixiApp.stage, { clear: true } );
		return true;
	}

}

export {
	Keyboard
};

