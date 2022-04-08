//import * as THREE from 'three';
//import ThreeDatGuiXR from 'three-datgui-xr';
import App from './App.js';

window.addEventListener( 'load', init );

//

let app;

function init() {
	app = new App();
	app.renderer.setAnimationLoop( () => {
		//ThreeDatGuiXR.update();
		app.controls.update();
		app.renderer.render( app.scene, app.camera );
	} );
	initApp();
}

//

function initApp() {
	//const container = new ThreeDatGuiXR();
	//container.position.set( 0, 1, -1.8 );
	//container.rotation.x = -0.55;
	//scene.add( container );
}

