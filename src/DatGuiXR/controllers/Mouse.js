import { Vector2, Camera, WebGLRenderer } from 'three';

class MouseController {

	constructor( ctx, config ) {

		this._name = 'MouseController';
		this.ctx = ctx;
		this.config = config;
		this.isMouseDown = false;

		console.assert( typeof config === 'object', `${this.constructor.name}: "config" should be an object` );
		console.assert( this.ctx.camera instanceof Camera, `${this.constructor.name}: "config.camera" should be an instance of THREE.Camera` );
		console.assert( this.ctx.renderer instanceof WebGLRenderer, `${this.constructor.name}: "config.renderer" should be an instance of THREE.Renderer` );

		const allowedMouseHandlers = [
			'follow',
			// @TODO: 'capture'
		];

		if ( !this.config.mouseHandler ) this.config.mouseHandler = 'follow';

		if ( !allowedMouseHandlers.includes( this.config.mouseHandler ) ) {
			//console.warn( `${this.constructor.name}: "config.mouseHandler" unexpected value, only 'follow' is allowed at the moment` );
			return;
		}


		this.mouse = new Vector2();
		this.renderSize = new Vector2();
		this.handleMouse = this.handleMouse.bind( this );

		this.installMouseListeners();
		this.installScreenListener();
		this.installXRListener();
		this.initWindowSize();

	}

	bindMethods() {
		this.handleMouse = this.handleMouse.bind( this );
		this.initWindowSize = this.initWindowSize.bind( this );
		this.onXRSessionStart = this.onXRSessionStart.bind( this );
		this.onXRSessionEnd = this.onXRSessionEnd.bind( this );
	}

	installScreenListener() {
		window.addEventListener( 'resize', this.initWindowSize, false );
	}

	installMouseListeners() {
		this.ctx.renderer.domElement.addEventListener( 'mousedown', this.handleMouse, false );
		this.ctx.renderer.domElement.addEventListener( 'mouseup', this.handleMouse, false  );
		this.ctx.renderer.domElement.addEventListener( 'mousemove', this.handleMouse, false  );
	}

	removeMouseListeners() {
		this.ctx.renderer.domElement.addEventListener( 'mousedown', this.handleMouse, false );
		this.ctx.renderer.domElement.addEventListener( 'mouseup', this.handleMouse, false  );
		this.ctx.renderer.domElement.addEventListener( 'mousemove', this.handleMouse, false  );
	}

	installXRListener() {
		this.ctx.renderer.xr.addEventListener( 'sessionstart', this.onXRSessionStart );
		this.ctx.renderer.xr.addEventListener( 'sessionend', this.onXRSessionEnd );
	}

	initWindowSize() {
		this.ctx.renderer.getSize( this.renderSize );
	}

	onXRSessionStart() {
		this.removeMouseListeners();
	}

	onXRSessionEnd() {
		this.installMouseListeners();
	}

	handleMouse( event ) {
		this.mouse.x = event.clientX / this.renderSize.x * 2 - 1;
		this.mouse.y = - ( event.clientY / this.renderSize.y ) * 2 + 1;

		this.ctx.raycaster.setFromCamera( this.mouse, this.ctx.camera );

		const index = 0;

		if ( event.type === 'mousemove' ) {
			//console.debug( `${this.constructor.name}: handleMouse: mousemove (isMouseDown ${this.isMouseDown})` );
			this.ctx.controllersManager.testRaycasterIntersects( this.ctx, index, this.isMouseDown );
		} else if ( event.type === 'mousedown' ) {
			this.isMouseDown = true;
			this.config.selectstart && this.config.selectstart( this.ctx, event );
			this.config.select && this.config.select( this.ctx, event );
			//console.debug( `${this.constructor.name}: handleMouse: mousedown (isMouseDown ${this.isMouseDown})` );
		} else if ( event.type === 'mouseup' ) {
			this.isMouseDown = false;
			this.config.selectend && this.config.selectend( this.ctx, event );
			//console.debug( `${this.constructor.name}: handleMouse: mouseup (isMouseDown ${this.isMouseDown})` );
		}
		this.previousEvent = event.type;
	}

}

export { MouseController };
