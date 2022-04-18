import App from './App.js';
import DatGuiXR from 'DatGuiXR';

window.addEventListener( 'load', init );

let app, camera, scene, renderer, controls, gui, raycasterObjects;

function init() {
	app = new App( animate );
	renderer = app.renderer;
	camera = app.camera;
	scene = app.scene;
	controls = app.controls;
	raycasterObjects = app.raycasterMeshes;
	initApp();
}

function animate( delta ) {
	renderer.controllersManager.xrControllers.update( delta );
}

function initApp() {
	gui = new DatGuiXR( {
		scene,
		camera,
		renderer,
		controls,
		raycasterObjects,
		//position: new THREE.Vector3( 0, 0, 0 ),
		scale: 1.0,
		//font: loaded_font,
	} );

	gui.add();

	//gui.add( myFunctions, 'RESET_EVENT' ).name( 'Reset Position' );

}
