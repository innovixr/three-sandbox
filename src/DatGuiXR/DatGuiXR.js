import * as THREE from 'three';
import { SmoothGraphics as Graphics } from '@pixi/graphics-smooth';
import * as PIXI from 'pixi.js-legacy';
import { ControllersManager } from './controllers/Manager.js';

PIXI.InteractionManager.prototype.onPointerDown = () => { console.log( 'onPointerDown' ); };


class DatGuiXR {

	constructor( opts ) {
		this.scene = opts.scene;
		this.camera = opts.camera;
		this.renderer = opts.renderer;
		this.controls = opts.controls;
		this.raycasterObjects = opts.raycasterObjects;
		this.panelWidth = typeof this.panelWidth !== 'undefined' ? this.panelWidth : 0.4;
		this.panelHeight = typeof this.panelHeight !== 'undefined' ? this.panelHeight : 0.3;
		this.panelRatio = Math.round( this.panelHeight / this.panelWidth );
		this.position = typeof this.position !== 'undefined' ? this.position : new THREE.Vector3( -2, 0, 0 );
		this.scale = typeof this.scale !== 'undefined' ? this.scale : 1.0;

		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
		//PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;

		const controllerConfig = {
			controllerMode: null,
			mouseHandler: null,
		};

		this.renderer.controllersManager = this.renderer.controllersManager || new ControllersManager( this, controllerConfig );

		this.createPanel();
		//this.override();
		this.createPixi();
		window.addEventListener( 'resizeend', this.onWindowResizeEnd.bind( this ) );

	}

	override() {
		PIXI.InteractionManager.prototype.onPointerMove = ( ev ) => {
			console.log( 'PIXI.InteractionManager.prototype.onPointerMove', ev );
		};

	}

	createBoxWithRoundedEdges( width, height, depth, radius0, smoothness ) {
		let shape = new THREE.Shape();
		let eps = 0.00001;
		let radius = radius0 - eps;
		shape.absarc( eps, eps, eps, -Math.PI / 2, -Math.PI, true );
		shape.absarc( eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true );
		shape.absarc( width - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true );
		shape.absarc( width - radius * 2, eps, eps, 0, -Math.PI / 2, true );
		let geometry = new THREE.ExtrudeBufferGeometry( shape, {
			amount: depth - radius0 * 2,
			bevelEnabled: true,
			bevelSegments: smoothness * 2,
			steps: 1,
			bevelSize: radius,
			bevelThickness: radius0,
			curveSegments: smoothness
		} );

		geometry.center();

		return geometry;
	}

	createPanel() {
		console.log( 'createPanel', this.panelWidth, this.panelHeight );
		this.panelMaterialDisplay = new THREE.MeshPhongMaterial( {
			transparent: true,
			opacity: 0.999,

			roughness: 0.8,
			color: 0xffffff,
			metalness: 0.2,
			bumpScale: 0.0005

			//emissive: 0xffffee,
			//emissiveIntensity: 0.1,
			//color: 0xFFFFFF
		} );

		let geometry;
		const useBox = false;

		if ( useBox )
		{
			const materialBlack = new THREE.MeshPhongMaterial( { transparent: false, opacity: 0.999, color: 0x111111 } );
			const materialBlue = new THREE.MeshPhongMaterial( { transparent: false, opacity: 0.999, color: 'darkblue' } );
			//geometry = this.createBoxWithRoundedEdges( this.panelWidth, this.panelHeight, 0.01, 0.005, 1 )
			geometry = new THREE.BoxGeometry( this.panelWidth, this.panelHeight, 0.01 );
			this.mesh = new THREE.Mesh( geometry, [ materialBlue, materialBlue, materialBlue, materialBlue, this.panelMaterialDisplay, materialBlack ] );
		} else
		{
			geometry = new THREE.PlaneGeometry( this.panelWidth, this.panelHeight );
			this.mesh = new THREE.Mesh( geometry, this.panelMaterialDisplay );
		}

		this.mesh.position.set( 0, 1.6, -0.6 );
		//this.mesh.rotateY( Math.PI );
		this.scene.add( this.mesh );
		this.raycasterObjects.push( this.mesh );
	}

	createPixi() {
		this.canvasSize = 1024;
		this.canvasWidth = this.canvasSize;
		this.canvasHeight = this.canvasSize * this.panelRatio;
		this.#createCanvas( this.canvasWidth, this.canvasHeight );
		console.log( 'createPixi', this.canvasWidth, this.canvasHeight, this.canvasEl );

		this.pixiApp = new PIXI.Application( {
			view: this.canvasEl,
			backgroundAlpha: 0,
			backgroundColor: 0x010101,
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
		this.canvasTexture.repeat.set( 100, 100 );

		this.panelMaterialDisplay.map = this.canvasTexture;
		//app.registerEvents( 'handleEvents', this.handleEvents.bind( this ) );

		const cbt = new PIXI.Container();
		this.pixiApp.stage.addChild( cbt );
		cbt.interactive = true;
		//cbt.on( 'mousemove', event => { console.log( 'cbt mousemove', event ); } );

		let text = new PIXI.Text( 'Press me', {
			fontFamily: 'Arial',
			fontSize: 24,
			align: 'center'
		} );
		text.anchor.set( 0.5, 0.5 );
		text.position.set( 110, 35 );

		let padding = 10;
		const bt = new Graphics();
		bt.lineStyle( 2, 0x4f7bff, 1 );
		bt.beginFill( 0x005eff, 1 );
		bt.drawRoundedRect( padding, padding, 200, 50, 16 );
		bt.endFill();
		bt.interactive = true;
		bt.buttonMode = true;
		bt.pivot.set( 100, 35 );
		bt.position.set( 500, 500 * this.panelRatio );
		bt.addChild( text );

		//bt.on( 'mousemove', event => { console.log( 'bt mousemove', event ); } );
		bt.on( 'mousedown', ev => { console.log( 'bt mousedown', ev ); } );
		bt.on( 'mouseclick', ev => { console.log( 'bt mouseclick', ev ); } );
		bt.on( 'pointerdown', ev => { console.log( 'bt pointerdown', ev ); } );
		bt.on( 'click', ev => { console.log( 'bt clicked', ev ); } );
		this.bt = bt;

		// backdrop
		const backdrop = new PIXI.Graphics();
		const paddingBackdrop = 20;
		backdrop.beginFill( 0x111111, 0.9 );
		backdrop.drawRoundedRect( paddingBackdrop, paddingBackdrop, this.canvasWidth - paddingBackdrop * 2, this.canvasHeight - paddingBackdrop * 2, paddingBackdrop );
		backdrop.endFill();
		backdrop.addChild( bt );

		this.pixiApp.stage.addChild( backdrop );

		if ( this.controls )
		{
			this.controls.target = this.mesh.position;
		}

		// not running in immersive mode ?
		//this.pixiApp.ticker.add( ( delta ) => {} );

		this.needsUpdate = true;

		setInterval( this.simulateClick.bind( this ), 500 );
		this.count = 0;
		this.pointer = document.createElement( 'div' );
		this.pointer.style = 'position:absolute;top:0px;left:0px;width:10px;height:10px;background-color:white;z-index:11;';
		document.body.appendChild( this.pointer );

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

		console.log( 'handleEvents', item.uv, x, y, opts );
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
			//console.log( 'click interval', x, y );
			this.pointer.style.left = x + 'px';
			this.pointer.style.top = y + 'px';
			this.canvasTexture.image.dispatchEvent( ev );
		}
	}

	#createCanvas( width, height ) {
		this.canvasEl = document.createElement( 'canvas' );
		this.canvasEl.width = width;
		this.canvasEl.height = height;
		this.canvasEl.style = 'position:absolute;top:5px;left:5px;z-index:10;zoom:0.3;visibility:hidden';
		document.body.appendChild( this.canvasEl );
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
		this.canvasTexture.needsUpdate = true;
		this.pixiApp.renderer.render( this.pixiApp.stage, { clear: false } );

	}

}

export default DatGuiXR;
