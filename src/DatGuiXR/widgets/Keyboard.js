import * as THREE from 'three';
import * as PIXI from 'pixi.js-legacy';
import '../pixi/center.js';

import { SmoothGraphics as Graphics } from '@pixi/graphics-smooth';
import { Object3D } from '../three/Object3D.js';
import { Keymap } from '../utils/Keymap.js';
import { shared } from '../shared.js';
import { Card } from './Card.js';
import { RoundedBoxGeometry } from './jsm/geometries/RoundedBoxGeometry.js';

class Keyboard {

	constructor( config, opts ) {
		this.config = config || {};
		this.config.layout = 'fr';

		this.scene = opts.scene;
		this.camera = opts.camera;
		this.renderer = opts.renderer;
		this.controls = opts.controls;
		this.raycasterObjects = opts.raycasterObjects;
		this.scale = 1.5;
		this.panelWidth = Math.round( ( 0.4 * this.scale ) * 100 ) / 100;
		this.panelHeight = Math.round( ( 0.165 * this.scale ) * 100 ) / 100;
		this.panelDepth = 0;
		this.panelRatio = this.panelHeight / this.panelWidth;
		this.shapeType = 'box';
		this.scale = typeof this.scale !== 'undefined' ? this.scale : 1.0;
		this.needsUpdate = true;
		this.resolution = opts.resolution || shared.defaults.resolution;
		this.backdropColor = 0x030303;
		this.buttonColor = 0x050505;
		this.buttonColorText = 0x444444;
		this.buttonBaseWidth = 90;
		this.buttonBaseHeight = 90;
		this.buttonHeight = this.buttonBaseHeight * this.resolution;
		this.mesh = null;
		this.meshKeyboard = null;

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
			wireframe:false
		};

		//const material = THREE.MeshPhongMaterial;
		const material = THREE.MeshBasicMaterial;
		this.material = new material( materialConfig );

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

		this.canvasSize = this.canvasResolution;
		this.canvasWidth = this.canvasSize;
		this.canvasHeight = Math.round( this.canvasSize * this.panelRatio );

		this.ratioCanvasPanelWidth = this.canvasWidth / this.panelWidth;
		this.ratioCanvasPanelHeight = this.canvasHeight / this.panelHeight;

		this.ratioCanvasPanelWidth = Math.round( this.ratioCanvasPanelWidth * 100 ) / 100;
		this.ratioCanvasPanelHeight = Math.round( this.ratioCanvasPanelHeight * 100 ) / 100;

		console.log( this.ratioCanvasPanelWidth );
		console.log( this.ratioCanvasPanelHeight );

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

		this.canvasTexture = new THREE.CanvasTexture( this.pixiApp.view );
		this.canvasTexture.wrapS = THREE.RepeatWrapping;
		this.canvasTexture.wrapT = THREE.RepeatWrapping;
		this.canvasTexture.anisotropy = 16;
		//this.canvasTexture.repeat.set( 100, 100 );

		this.material.map = this.canvasTexture;
		//app.registerEvents( 'handleEvents', this.handleEvents.bind( this ) );

		// backdrop
		const backdrop = new PIXI.Graphics();
		const backdropMargin = 0 * this.resolution / 2;
		const backdropPadding = 34 * this.resolution / 2;
		const backdropRadius = 40 * this.resolution / 2;
		const backdropWidth = this.canvasWidth - backdropMargin;
		const backdropHeight = this.canvasHeight - backdropMargin;

		this.backdropPadding = backdropPadding;

		backdrop.lineStyle( {
			alignment:0,
			width: 5 * this.resolution,
			color: 0x2222FF,
			alpha:0.05
		} );
		backdrop.beginFill( this.backdropColor, 0.8 ); this.canvasWidth - backdropMargin;
		backdrop.drawRoundedRect( backdropMargin, backdropMargin, backdropWidth, backdropHeight, backdropRadius );
		backdrop.endFill();

		const keyLines = Keymap.get( this.config.layout )[ 0 ];
		const charset = 0;
		const buttonPadding = 5 * this.resolution / 2;

		const increments = {
			pixi: {
				x: backdropPadding,
				y: backdropPadding
			}
		};

		let char, width, pixiButton, threeButton;
		let count = 0;

		// eslint-disable-next-line no-unused-vars
		keyLines.map( ( keys, lineNumber ) => {
			// X coordinates of the first button on this new line
			increments.pixi.x = backdropPadding;

			keys.map( ( key ) => {
				// specific local width adjustement
				width = ( key.width || 0.1 ) * 10;

				// get char
				char = key.chars[ charset ].lowerCase || key.chars[ charset ].icon || 'undif';

				// create buttons
				pixiButton = this.createPixiButton( char, width );
				pixiButton.position.x = increments.pixi.x;
				pixiButton.position.y = increments.pixi.y;

				threeButton = this.createThreeButton( char, pixiButton.width, pixiButton.height );
				threeButton.mesh.position.x = this.convertXToMeter( pixiButton.position.x, pixiButton.width );
				threeButton.mesh.position.y = this.convertYToMeter( pixiButton.position.y, pixiButton.height );
				threeButton.mesh.position.z = 0.01;
				this.mesh.add( threeButton.mesh );
				//console.log( `x${count}`, pixiButton.position.x, threeButton.mesh.position.x );

				count++;
				backdrop.addChild( pixiButton );

				// increment
				increments.pixi.x += pixiButton.width + ( buttonPadding * 4 );

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

	convertXToMeter( x, w ) {
		return (
			( x / this.ratioCanvasPanelWidth ) -
			( this.panelWidth / 2 ) +
			( this.backdropPadding / this.ratioCanvasPanelWidth ) +
			( ( ( w - 100 ) / 2 ) / this.ratioCanvasPanelWidth )
		);
	}

	convertYToMeter( y, h ) {
		return (
			( this.panelHeight / 2 ) -
			( y / this.ratioCanvasPanelHeight ) -
			( this.backdropPadding / this.ratioCanvasPanelHeight ) -
			( ( ( h - 100 ) / 2 ) / this.ratioCanvasPanelHeight )
		);
	}

	createThreeButton( char, width, height ) {

		width = width  / this.ratioCanvasPanelWidth;
		height = height / this.ratioCanvasPanelHeight;

		const cardConfig = {
			name: char,
			width,
			height,
			radius: 0.005,
			frontColor: 0x222222
		};

		const threeButton = new Card( cardConfig );
		return threeButton;
	}

	createPixiButton( txt, width ) {

		const button = new Graphics();
		const padding = 40 * this.resolution / 2;
		let buttonWidth = width * this.buttonBaseWidth * this.resolution;
		buttonWidth += ( ( buttonWidth / ( this.buttonBaseWidth * this.resolution ) ) - 1 ) * ( padding / 2 ) ;

		//const btLineColor = 0x000066;
		//bt.lineStyle( 2, btLineColor, 1 );
		button.beginFill( this.buttonColor, 1 );
		button.drawRoundedRect( 0, 0, buttonWidth, this.buttonHeight, 10 * this.resolution );
		button.endFill();

		const text = new PIXI.Text( txt, {
			fontFamily: 'Arial',
			fontSize: 24 * this.resolution,
		} );

		text.style.fill = this.buttonColorText;

		button.addChild( text );

		//bt.on( 'mousemove', event => { console.log( 'bt mousemove', event ); } );
		//bt.on( 'mousedown', ev => { console.log( 'bt mousedown', ev ); } );
		//bt.on( 'mouseclick', ev => { console.log( 'bt mouseclick', ev ); } );
		//bt.on( 'pointerdown', ev => { console.log( 'bt pointerdown', ev ); } );
		//bt.on( 'click', ev => { console.log( 'bt clicked', ev ); } );

		text.centerXY();

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
		this.needsUpdate = false;

		// this will update pixi app
		this.pixiApp.renderer.render( this.pixiApp.stage, { clear: true } );
		return true;
	}

}

export {
	Keyboard
};

