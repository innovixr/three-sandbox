import * as THREE from 'three';
import App from './App.js';
import * as PIXI from 'pixi.js';

window.addEventListener( 'load', init );

let app, camera, scene, renderer, controls, gui, raycasterObjects

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

function animate() {
	gui && gui.update();
	controls && controls.update();
	renderer.render( scene, camera );
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
		const planeMaterial = new THREE.MeshBasicMaterial( {
			transparent: true,
			opacity: 0.999,
			side: THREE.DoubleSide,
			color:'white'
		} );
		const planeGeometry = new THREE.PlaneGeometry( planeWidth, planeHeight );
		this.mesh = new THREE.Mesh( planeGeometry, planeMaterial );
		this.mesh.position.set( 0, 1.6, -0.5 );
		//this.mesh.rotateY( Math.PI );
		this.scene.add( this.mesh );

		this.raycasterObjects.push( this.mesh );

		const size = 1024;
		const canvasWidth = size;
		const canvasHeight = size * planeRatio;
		this.#createCanvas( canvasWidth, canvasHeight );

		this.pixiApp = new PIXI.Application( {
			view: this.canvas,
			interactive:true,
			backgroundAlpha:0.5,
			backgroundColor:0xFF0000
		} );

		this.threeJsPixiTexture = new THREE.CanvasTexture( this.pixiApp.view );
		this.threeJsPixiTexture.wrapS = this.threeJsPixiTexture.wrapT = THREE.ClampToEdgeWrapping;
		this.mesh.material.map = this.threeJsPixiTexture;

		/*
		let repeatX, repeatY;
		let squareWidth = 1;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;

		if ( texture.image.height < texture.image.width ) {
			repeatX = squareWidth * texture.image.height / ( squareWidth * texture.image.width );
			repeatY = 1;
			texture.repeat.set( repeatX, repeatY );
			texture.offset.x = ( repeatX - 1 ) / 2 * -1;
		} else {
			repeatX = 1;
			repeatY = squareWidth * texture.image.width / ( squareWidth * texture.image.height );
			texture.repeat.set( repeatX, repeatY );
			texture.offset.y = ( repeatY - 1 ) / 2 * -1;
		}
		*/


		const cbt = new PIXI.Container();
		this.pixiApp.stage.addChild( cbt );

		let text = new PIXI.Text(
			'Press me',
			{
				fontFamily : 'Arial',
				fontSize: 24,
				fill : 0xff1010,
				align : 'center'
			}
		);
		text.anchor.set( 0.5, 0.5 );
		text.position.set( 120, 35 );

		let padding = 10;
		const bt = new PIXI.Graphics();
		bt.lineStyle( 2, 0xFF00FF, 1 );
		bt.beginFill( 0x650A5A, 0.25 );
		bt.drawRoundedRect( padding, padding, 200, 50, 16 );
		bt.endFill();
		bt.interactive = true;
		bt.buttonMode = true;
		bt.pivot.set( 50, 25 );
		bt.position.set( 120, 35 );
		bt.addChild( text );


		bt.on( 'mousedown', event => {
			console.log( 'bt mousedown', event );
		} );

		bt.on( 'pointerdown', event => {
			console.log( 'bt pointerdown', event );
		} );

		bt.on( 'click', event => {
			console.log( 'bt clicked', event );
		} );

		cbt.addChild( bt );

		this.pixiApp.ticker.add( ( delta ) => {
			bt.rotation += 0.001;
			this.threeJsPixiTexture.needsUpdate = true;
			this.needsUpdate = true;
		} );

		if ( this.controls ) {
			const appPos = new THREE.Vector3();
			//this.mesh.position.copy( appPos );
			this.controls.target = this.mesh.position;
		}

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
		const ev = new MouseEvent( 'pointerdown', {
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
		//this.canvas.style = 'position:absolute;top:5px;left:5px;z-index:10;zoom:0.3';
		//document.body.appendChild( this.canvas );
	}

	#draw() {
		//this.bt.direction = Math.random() * Math.PI * 2;
		if ( !this.needsUpdate ) return;
		this.needsUpdate = false;
	}

	add() {
		console.log( 'DatGuiXR', 'add' );
	}

	update() {
		this.#draw();
	}

}

class DatGuiXRPixijs extends DatGuiXR {
	constructor( opts ) {
		super( opts );
	}
}
