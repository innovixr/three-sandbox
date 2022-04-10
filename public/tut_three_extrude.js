import * as THREE from 'three';
import App from './App.js';

window.addEventListener( 'load', init );

let app, camera, scene, renderer, controls, gui;

function init() {
	app = new App();
	renderer = app.renderer;
	camera = app.camera;
	scene = app.scene;
	controls = app.controls;

	initApp();
	renderer.setAnimationLoop( animate );
}

function animate() {
	gui && gui.update();
	controls && controls.update();
	renderer.render( scene, camera );
}

function initApp() {
	const planeMaterial = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0.999 } );
	const planeGeometry = new THREE.PlaneGeometry( 0.5, 0.5 );
	const plane  = new THREE.Mesh( planeGeometry, planeMaterial );
	plane.position.set( 0, 1.4, -0.4 );
	scene.add( plane );
}
