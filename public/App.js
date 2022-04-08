import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

class App {
	constructor() {
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0x505050 );

		this.camera = new THREE.PerspectiveCamera( 60, WIDTH / HEIGHT, 0.1, 100 );

		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( WIDTH, HEIGHT );
		this.renderer.xr.enabled = true;
		document.body.appendChild( VRButton.createButton( this.renderer ) );
		document.body.appendChild( this.renderer.domElement );

		this.controls = new OrbitControls( this.camera, this.renderer.domElement );
		this.camera.position.set( 0, 1.6, 0 );
		this.controls.target = new THREE.Vector3( 0, 1, -1.8 );
		this.controls.update();

		// ROOM
		const room = new THREE.LineSegments(
			new BoxLineGeometry( 6, 6, 6, 10, 10, 10 ).translate( 0, 3, 0 ),
			new THREE.LineBasicMaterial( { color: 0x808080 } )
		);

		this.scene.add( room );

		window.addEventListener( 'resize', this.onWindowResize.bind( this ) );

	}

	// handles resizing the renderer when the viewport is resized
	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
	}
}

export default App;

