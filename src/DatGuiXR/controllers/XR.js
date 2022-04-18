import { WebGLRenderer } from 'three';

class XRControllers {

	/**
    * @param config             Object containing CanvasUI config.
    * @param config.renderer    instance of THREE.WebGLRenderer (mandatory)
    * @param config.events      Object instance of THREE.Camera (mandatory)
    */
	constructor( ctx, config ) {

		this._name = 'XRControllers';

		//console.assert( rootPanel instanceof CanvasUI, `${this.constructor.name}: "rootPanel" first argument should be an instance of CanvasUI` );
		console.assert( ctx.renderer instanceof WebGLRenderer, `${this.constructor.name}: "ctx.renderer" should be an instance of THREE.WebGLRenderer` );
		console.assert( typeof config === 'object', `${this.constructor.name}: "config" should be an object` );

		this.config = config;
		this.ctx = ctx;
	}

	init() {
		this.controller = this.ctx.renderer.xr.getController( 0 );
		this.controller1 = this.ctx.renderer.xr.getController( 1 );

		const allowedEvents = [ 'select', 'selectstart', 'selectend' ];

		Object.keys( this.events, eventName => {

			if ( !allowedEvents.includes( eventName ) ) {
				console.warn( `${this.constructor.name}: event ${eventName} not implemented, ignoring` );
				return;
			}

			this.controller && this.controller.addEventListener( eventName, this.events[eventName] );
			this.controller1 && this.controller1.addEventListener( eventName, this.events[eventName] );

		} );
	}


	handleController( controller, index ) {
		if ( !controller ) return;
		this.mat4.identity().extractRotation( controller.matrixWorld );
		this.raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
		this.raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( this.mat4 );

		window.canvasUIManager.testRaycasterIntersects( this.ctx, index );
	}

	update() {
		if ( !this.ctx.renderer.isPresenting ) return;
		this.handlerControler( this.controller, 0 );
		this.handlerControler( this.controller1, 1 );
	}
}

export { XRControllers };
