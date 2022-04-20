import * as THREE from 'three';
import * as PIXI from 'pixi.js-legacy';
import '../pixi/center.js';

import { SmoothGraphics as Graphics } from '@pixi/graphics-smooth';
import { Object3D } from '../three/Object3D.js';
import { Keymap } from '../utils/Keymap.js';
import { shared } from '../shared.js';

class Keyboard {

	constructor( config, opts ) {
		this.config = config || {};
		this.config.layout = 'fr';

		this.scene = opts.scene;
		this.camera = opts.camera;
		this.renderer = opts.renderer;
		this.controls = opts.controls;
		this.raycasterObjects = opts.raycasterObjects;
		this.panelWidth = 0.4;
		this.panelHeight = 0.17;
		this.panelDepth = 0;
		this.panelRatio = this.panelHeight / this.panelWidth;
		this.shapeType = 'box';
		this.scale = typeof this.scale !== 'undefined' ? this.scale : 1.0;
		this.needsUpdate = true;
		this.backdropColor = 0x030303;
		this.buttonColor = 0x050505;
		this.buttonColorText = 0x444444;
		this.buttonBaseWidth = 90;
		this.buttonBaseHeight = 90;
		this.mesh = null;
		this.resolution = opts.resolution || shared.defaults.resolution;
		console.log( `Keyboard(${this.panelWidth}, ${this.panelHeight}, ratio ${this.panelRatio})` );

		this.createMesh();
		this.createTexture();

	}

	createMesh() {
		console.log( 'Keyboard: createMesh', this.panelWidth, this.panelHeight );

		this.panelMaterialDisplayPhong = new THREE.MeshPhongMaterial( {
			transparent: true,
			opacity: 0.999,
			alphaTest: 0.1,
			//side: THREE.DoubleSide,
			//color: 0x000000,
			//roughness: 0.8,
			//shininess: 1,
			//metalness: 0.2,
			//bumpScale: 0.0005,
			//emissive: 0x020202,
			//emissiveIntensity: 1,
			//color: 0xFFFFFF
		} );

		this.panelMaterialDisplayBasic = new THREE.MeshBasicMaterial( {
			transparent: true,
			opacity: 0.999,
			alphaTest: 0.1,
			//side: THREE.DoubleSide,
			//color: 0x000000,
			//roughness: 0.8,
			//shininess: 1,
			//metalness: 0.2,
			//bumpScale: 0.0005,
			//emissive: 0x020202,
			//emissiveIntensity: 1,
			//color: 0xFFFFFF
		} );

		this.panelMaterialDisplay = this.panelMaterialDisplayBasic;

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

			this.mesh = new THREE.Mesh( geometry, [ materialBlue, materialBlue, materialBlue, materialBlue, this.panelMaterialDisplay, materialBlack ] );
		} else
		{
			geometry = new THREE.PlaneGeometry( this.panelWidth, this.panelHeight );
			this.mesh = new THREE.Mesh( geometry, this.panelMaterialDisplay );
		}

		this.raycasterObjects.push( this.mesh );
	}

	get canvasResolution() {
		console.log( 'Keyboard: canvasResolution', this.resolution, shared.resolutions[ this.resolution ] );
		return shared.resolutions[ this.resolution ];
	}

	createTexture() {

		this.canvasSize = this.canvasResolution;
		this.canvasWidth = this.canvasSize;
		this.canvasHeight = Math.round( this.canvasSize * this.panelRatio );
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

		this.pixiApp.renderer.plugins.interaction.on( 'mousemove', ( event ) => {
			//console.log( 'pixiApp.renderer.plugins.interaction.on mousemove', event );
		} );

		this.canvasTexture = new THREE.CanvasTexture( this.pixiApp.view );
		this.canvasTexture.wrapS = THREE.RepeatWrapping;
		this.canvasTexture.wrapT = THREE.RepeatWrapping;
		this.canvasTexture.anisotropy = 16;
		//this.canvasTexture.repeat.set( 100, 100 );

		this.panelMaterialDisplay.map = this.canvasTexture;
		//app.registerEvents( 'handleEvents', this.handleEvents.bind( this ) );

		// backdrop
		const backdrop = new PIXI.Graphics();
		const paddingBackdrop = 40 * this.resolution / 2;
		backdrop.beginFill( this.backdropColor, 0.8 );
		backdrop.drawRoundedRect( paddingBackdrop, paddingBackdrop, this.canvasWidth - paddingBackdrop * 2, this.canvasHeight - paddingBackdrop * 2, paddingBackdrop );
		backdrop.endFill();

		const keyLines = Keymap.get( this.config.layout )[ 0 ];
		const backdropPadding = 42 * this.resolution / 2;
		let previousX;
		const charset = 0;

		keyLines.map( ( keys, lineNumber ) => {
			previousX = backdropPadding;
			keys.map( ( key, keyNumber ) => {
				console.log( lineNumber, keyNumber, key );
				const width = ( key.width || 0.1 ) * 10;
				const char = key.chars[ charset ].lowerCase || key.chars[ charset ].icon || 'undif';
				const bt = this.createButton( char, width );
				const btWidth = ( ( this.buttonBaseWidth * width ) + 5 ) * this.resolution ;
				bt.position.x = previousX;
				bt.position.y = backdropPadding + ( lineNumber * ( this.buttonBaseWidth + 5 ) * this.resolution );
				previousX += btWidth;

				backdrop.addChild( bt );
			} );
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

	createButton( txt, width ) {

		const bt = new Graphics();
		width = width * this.buttonBaseWidth;
		const padding = 20 * this.resolution / 2;
		const btWidth = width * this.resolution;
		const btHeight = this.buttonBaseWidth * this.resolution;
		const btLineColor = 0x000066;
		const btFillColor = this.buttonColor;

		//bt.lineStyle( 2, btLineColor, 1 );
		bt.beginFill( btFillColor, 1 );
		bt.drawRoundedRect( padding, padding, btWidth, btHeight, 10 * this.resolution );
		bt.endFill();

		const text = new PIXI.Text( txt, {
			fontFamily: 'Arial',
			fontSize: 24 * this.resolution,
		} );

		text.style.fill = this.buttonColorText;

		bt.addChild( text );

		//bt.on( 'mousemove', event => { console.log( 'bt mousemove', event ); } );
		//bt.on( 'mousedown', ev => { console.log( 'bt mousedown', ev ); } );
		//bt.on( 'mouseclick', ev => { console.log( 'bt mouseclick', ev ); } );
		//bt.on( 'pointerdown', ev => { console.log( 'bt pointerdown', ev ); } );
		//bt.on( 'click', ev => { console.log( 'bt clicked', ev ); } );

		text.centerXY();

		return bt;

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

	update( delta ) {

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

