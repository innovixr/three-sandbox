import * as THREE from 'three';
import App from './App.js';
import DatGuiXR from 'DatGuiXR';

window.addEventListener( 'load', () => {
	new Experience();
} );

class Experience {
	constructor() {
		this.app = new App( this.animate.bind( this ) );

		this.gui = new DatGuiXR( {
			scene: this.app.scene,
			camera: this.app.camera,
			renderer: this.app.renderer,
			controls: this.app.controls,
			raycasterObjects: this.app.raycasterMeshes,
			panelWidth: 0.4,
			panelHeight: 0.4 * 0.36
			//position: new THREE.Vector3( 0, 0, 0 ),
			//font: loaded_font,
		} );

		this.app.scene.add( this.gui.mesh );
		this.gui.mesh.position.set( 0, 1.2, -0.4 );
		//this.gui.mesh.rotation.set( -0.5, 0, 0 );

		this.gui.add();
		//gui.add( myFunctions, 'RESET_EVENT' ).name( 'Reset Position' );
		if ( this.app.controls )
		{
			if ( this.app.controls.rotateTo )
			{
				// camera controls
				this.app.controls.rotateTo( 0, 90 * THREE.MathUtils.DEG2RAD, false );
				//this.customFitTo();

			} else
			{
				// orbit control
				throw new Error( 'orbit controls not implemented' );
			}
		}
	}

	customFitTo() {

		const transition = true;

		this.gui.mesh.geometry.computeBoundingBox();
		const bb = this.gui.mesh.geometry.boundingBox.getSize( new THREE.Vector3() );
		const width = bb.x;
		const height = bb.y;
		const depth = bb.z;


		const distanceToFit = this.app.controls.getDistanceToFitBox( width, height, depth ) * 2;
		this.app.controls.moveTo(
			this.gui.mesh.position.x,
			this.gui.mesh.position.y,
			this.gui.mesh.position.z + distanceToFit,
			transition
		);

		this.app.controls.rotateTo( 0, 90 * THREE.MathUtils.DEG2RAD, false );
	}

	animate( delta ) {
		//console.log( 'exp_three_pixi animate' );
		this.gui.update( delta );
		this.app.renderer.controllersManager.xrControllers.update( delta );
		return true;
	}
}
