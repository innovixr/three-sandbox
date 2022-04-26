//import * as THREE from 'three';
import * as PIXI from 'pixi.js-legacy';

import { ControllersManager } from './controllers/Manager.js';
import { Keyboard } from './widgets/v2/Keyboard.js';

class DatGuiXR {

	constructor( opts ) {
		this.scene = opts.scene;
		this.camera = opts.camera;
		this.renderer = opts.renderer;
		this.controls = opts.controls;
		this.raycasterObjects = opts.raycasterObjects;
		this.components = [];

		this.setupControllers();
		this.setupPIXI();
		this.setupEvents();
		this.showFps();

		const keyboard = new Keyboard( { layout: 'fr', flat:false }, opts );
		this.mesh = keyboard.mesh;
		this.components.push( keyboard );

		//setInterval( () => { console.log( this.renderer.info.render.triangles ); }, 1000 );
	}

	setupControllers() {
		const controllerConfig = {
			controllerMode: null,
			mouseHandler: null
		};

		// only one controller per renderer
		// @TODO use instanceof
		this.renderer.controllersManager = this.renderer.controllersManager || new ControllersManager( this, controllerConfig );
	}

	setupPIXI() {
		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
		//PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;

		//PIXI.InteractionManager.prototype.onPointerDown = () => { console.log( 'PIXI.InteractionManager.prototype.onPointerDown' ); };
		//PIXI.InteractionManager.prototype.onPointerMove = ( ev ) => { console.log( 'PIXI.InteractionManager.prototype.onPointerMove', ev ); };
	}

	setupEvents() {
		window.addEventListener( 'resizeend', this.onWindowResizeEnd.bind( this ) );
	}

	showFps() {

		const times = [];
		let fps;

		function refreshLoop() {
			window.requestAnimationFrame( () => {
				const now = performance.now();
				while ( times.length > 0 && times[ 0 ] <= now - 1000 )
				{
					times.shift();
				}
				times.push( now );
				fps = times.length;
				refreshLoop();
			} );
		}

		//setInterval( () => { console.log( 'fps', fps ); }, 1000 );

		refreshLoop();
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

	add() {
		console.log( 'DatGuiXR', 'add' );
	}

	update( delta ) {
		this.needsUpdate = false;

		this.components.map( component => {
			this.needsUpdate = this.needsUpdate || component.update( delta );
		} );

		return this.needsUpdate;
	}

}

export default DatGuiXR;
