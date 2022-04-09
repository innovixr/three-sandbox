//import * as THREE from 'three';
import App from './App.js';

window.addEventListener( 'load', init );

//

let app, camera, scene, renderer, controls;

function init() {
	app = new App();

	renderer = app.renderer;
	camera = app.camera;
	scene = app.scene;
	controls = app.controls;

	initApp();

	renderer.setAnimationLoop( () => {
		controls.update();
		renderer.render( scene, camera );
	} );
}

//

function initApp() {
	// code here
}

