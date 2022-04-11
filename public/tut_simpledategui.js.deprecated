import { FontLoader, Vector3 } from 'three';
import App from './App.js';
import SimpleDateGui from './libs/SimpleDateGui/SimpleDateGui.js';

window.addEventListener( 'load', init );

let app, camera, scene, renderer, controls, gui;

function init() {
	app = new App();
	renderer = app.renderer;
	camera = app.camera;
	scene = app.scene;
	controls = app.controls;

	initApp();

	renderer.setAnimationLoop( () => {
		gui && gui.update();
		controls.update();
		renderer.render( scene, camera );
	} );

}

//

function initApp() {
	//const container = new ThreeDatGuiXR();
	//container.position.set( 0, 1, -1.8 );
	//container.rotation.x = -0.55;
	//scene.add( container );

	let myFunctions = {
		RESET_EVENT : function() {
			console.log( 'ici' );
		}
	};

	const loader = new FontLoader();
	loader.load(
		'assets/helvetiker_regular.typeface.json',
		function ( loaded_font ) {
			gui =
				new SimpleDateGui( {
					scene: scene,
					camera: camera,
					renderer: renderer,
					width: 1,
					position: new Vector3( -2, 0, 0 ),
					scale: 1.0,
					font: loaded_font,
				} );

			gui.add( myFunctions, 'RESET_EVENT' ).name( 'Reset Position' );

		}
	);
}

