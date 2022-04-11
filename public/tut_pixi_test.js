import * as THREE from 'three';
import App from './App.js';
import * as PIXI from 'pixi.js-legacy';
import { SmoothGraphics as Graphics } from '@pixi/graphics-smooth';

window.addEventListener( 'load', init );

let app, camera, scene, renderer, controls, gui, raycasterObjects, pixiRenderer;

function init() {
	app = new App();
	renderer = app.renderer;
	camera = app.camera;
	scene = app.scene;
	controls = app.controls;
	raycasterObjects = app.raycasterObjects;
	initApp();
	renderer.setAnimationLoop( animate );
}

function animate( delta ) {
	gui && gui.update( delta );
	controls && controls.update( delta );
	renderer && renderer.render( scene, camera );
}

function initApp() {
	gui = new DatGuiXRPixijs( {
		scene,
		camera,
		renderer,
		controls,
		raycasterObjects,
		width: 1,
		//position: new THREE.Vector3( 0, 0, 0 ),
		scale: 1.0,
		//font: loaded_font,
	} );

	gui.add();
	//gui.add( myFunctions, 'RESET_EVENT' ).name( 'Reset Position' );

}

class DatGuiXR {

	constructor( opts ) {
		this.scene = opts.scene;
		this.camera = opts.camera;
		this.renderer = opts.renderer;
		this.controls = opts.controls;
		this.raycasterObjects = opts.raycasterObjects;
		this.width = typeof this.width !== 'undefined' ? this.width : 1;
		this.position = typeof this.position !== 'undefined' ? this.position : new THREE.Vector3( -2, 0, 0 );
		this.scale = typeof this.scale !== 'undefined' ? this.scale : 1.0;

		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

		const planeWidth = 0.4;
		const planeHeight = 0.3;
		const planeRatio = planeHeight / planeWidth;
		const planeMaterial = new THREE.MeshStandardMaterial( {
			transparent: true,
			opacity: 0.999,
			side: THREE.DoubleSide,
		} );
		const planeGeometry = new THREE.PlaneGeometry( planeWidth, planeHeight );
		this.mesh = new THREE.Mesh( planeGeometry, planeMaterial );
		this.mesh.position.set( 0, 1.6, -0.6 );
		//this.mesh.rotateY( Math.PI );
		this.scene.add( this.mesh );

		this.raycasterObjects.push( this.mesh );

		const size = 1024;
		const canvasWidth = size;
		const canvasHeight = size * planeRatio;
		this.#createCanvas( canvasWidth, canvasHeight );

		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;

		this.pixiApp = new PIXI.Application( {
			//legacy: true,
			//clearBeforeRender: true,
			//forceCanvas:true,
			//interactive:true,
			//autoResize: true,
			//powerPreference: 'high-performance',
			view: this.canvas,
			backgroundAlpha:0,
			backgroundColor: 0x010101,
			width: canvasWidth,
			height: canvasHeight
		} );

		this.threeJsPixiTexture = new THREE.CanvasTexture( this.pixiApp.view );
		this.mesh.material.map = this.threeJsPixiTexture;
		app.registerHoverCallback( 'myhovercallback', item => {

			const x = item.uv.x * canvasWidth;
			const y = item.uv.y * canvasHeight;

			console.log( 'myhovercallback', item.uv, x, y );

			const ev = new MouseEvent( 'mousemove', {
				bubbles: true,
				cancelable: true,
				clientX: x,
				clientY: y
			} );

			this.threeJsPixiTexture.image.dispatchEvent( ev );


		} );

		const cbt = new PIXI.Container();
		this.pixiApp.stage.addChild( cbt );
		//cbt.interactive = true;
		cbt.on( 'mousemove', event => { console.log( 'cbt mousemove', event ); } );

		let text = new PIXI.Text( 'Press me', {
			fontFamily : 'Arial',
			fontSize: 24,
			align : 'center'
		} );
		text.anchor.set( 0.5, 0.5 );
		text.position.set( 110, 35 );

		let padding = 10;
		const bt = new Graphics();
		bt.lineStyle( 2, 0x4f7bff, 1 );
		bt.beginFill( 0x005eff, 1 );
		bt.drawRoundedRect( padding, padding, 200, 50, 16 );
		bt.endFill();
		//bt.interactive = true;
		bt.buttonMode = true;
		bt.pivot.set( 100, 35 );
		bt.position.set( 500, 500 * planeRatio );
		bt.addChild( text );

		bt.on( 'mousemove', event => { console.log( 'bt mousemove', event ); } );
		bt.on( 'mousedown', event => { console.log( 'bt mousedown', event ); } );
		bt.on( 'pointerdown', event => { console.log( 'bt pointerdown', event ); } );
		bt.on( 'click', event => { console.log( 'bt clicked', event ); } );

		// backdrop
		const textbg = new PIXI.Graphics();
		textbg.beginFill( 0x111111, 0.8 );
		textbg.drawRoundedRect( 0, 0, canvasWidth, canvasHeight, 20 );
		textbg.endFill();
		this.pixiApp.stage.addChild( textbg );

		textbg.addChild( bt );

		if ( this.controls ) {
			this.controls.target = this.mesh.position;
		}

		//this.pixiApp.ticker.add( ( delta ) => {} );

		this.bt = bt;
		this.needsUpdate = true;

		//setInterval( this.simulateClick.bind( this ) , 1000 );

		window.addEventListener( 'resizeend', this.onWindowResizeEnd.bind( this ) );
	}

	onWindowResizeEnd() {

	}

	simulateClick( mode ) {
		console.log( 'click interval' );
		const x = 20;
		const y = 20;
		const ev = new MouseEvent( 'mousedown', {
			//view: window,
			bubbles: true,
			cancelable: true,
			clientX: x,
			clientY: y
		} );

		if ( mode ) {
			document.elementFromPoint( x, y ).dispatchEvent( ev );
		} else {
			this.threeJsPixiTexture.image.dispatchEvent( ev );
		}
	}

	#createCanvas( width, height ) {
		this.canvas = document.createElement( 'canvas' );
		this.canvas.width = width;
		this.canvas.height = height;
		this.canvas.style = 'position:absolute;top:5px;left:5px;z-index:10;zoom:0.3';
		//document.body.appendChild( this.canvas );
		this.threeClock = new THREE.Clock();
		this.increase = Math.PI * 2 / 100;
		this.counter = 0;
	}

	draw() {
		//this.bt.direction = Math.random() * Math.PI * 2;
		if ( !this.needsUpdate ) return;
		this.needsUpdate = false;
	}

	add() {
		console.log( 'DatGuiXR', 'add' );
	}

	update( delta ) {
		this.pixiApp.renderer.clear();
		this.bt.position.y += Math.sin( this.counter );
		this.bt.rotation += 0.01;
		this.counter += this.increase;
		this.draw();
		this.threeJsPixiTexture.needsUpdate = true;
		this.pixiApp.renderer.render( this.pixiApp.stage, { clear: false } );

	}

}

class DatGuiXRPixijs extends DatGuiXR {
	constructor( opts ) {
		super( opts );
	}
}
