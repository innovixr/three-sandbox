import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';

class App {
	constructor() {

		this.raycasterObjects = [];
		this.raycasterIntersects = [];

		this.getScreenDimension();
		this.addScene();
		this.addCamera();
		this.addRoom();
		this.addRenderer();
		this.addMouseHandler();
		this.addMouseRaycaster();
		this.addControls();
		window.addEventListener( 'resize', this.onWindowResizeEvent.bind( this ) );
		window.addEventListener( 'resizeend', this.onWindowResizeEnd.bind( this ) );
	}

	getScreenDimension() {
		this.screenWidth = window.innerWidth;
		this.screenHeight = window.innerHeight;
	}

	addRenderer() {
		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( this.screenWidth, this.screenHeight );
		this.renderer.shadowMap.enabled = true;
		this.renderer.outputEncoding = THREE.sRGBEncoding;
		this.renderer.xr.enabled = true;
		document.body.appendChild( VRButton.createButton( this.renderer ) );
		document.body.appendChild( this.renderer.domElement );
	}

	addControls() {
		this.controls = new OrbitControls( this.camera, this.renderer.domElement );
		this.controls.autoRotate = true;
		this.controls.autoRotateSpeed = 0.4;
		this.controls.enableDamping = true;
		this.controls.enableZoom = true;
		this.controls.maxDistance = 0.45;
	}

	addScene() {
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0x00051c );
	}

	addCamera() {
		this.camera = new THREE.PerspectiveCamera( 60, this.screenWidth / this.screenHeight, 0.1, 100 );
		this.camera.position.set( 0, 0, 2 );
	}

	addRoom() {
		const room = new THREE.LineSegments(
			new BoxLineGeometry( 5, 5, 5, 10, 10, 10 ),
			new THREE.LineBasicMaterial( { color: 0x808080 } )
		);
		this.scene.add( room );
	}

	addMouseHandler() {

		this.mouse = new THREE.Vector2( 1, 1 );

		const onMouseMove = ( event ) => {
			this.mouse.x = ( event.clientX / this.screenWidth ) * 2 - 1;
			this.mouse.y = - ( event.clientY / this.screenHeight ) * 2 + 1;
			console.log( 'threejs canvas onMouseMove', this.mouse.x, this.mouse.y );
			this.handlerMouseRaycaster();
		};

		const onMouseDown = () => {
			console.log( 'threejs canvas onMouseDown' );
		};

		this.renderer.domElement.addEventListener( 'mousemove', onMouseMove );
		this.renderer.domElement.addEventListener( 'mousedown', onMouseDown );
	}

	handlerMouseRaycaster() {
		if ( !this.raycasterObjects.length ) return;
		this.mouseRaycaster.setFromCamera( this.mouse, this.camera );
		this.raycasterIntersects = this.mouseRaycaster.intersectObjects( this.raycasterObjects );
		if ( this.raycasterIntersects.length !== 0 ) {
			let firstItem = this.raycasterIntersects[ 0 ];
			console.log( 'handlerMouseRaycaster: hovered ', firstItem.point );
			firstItem.object.material.color.set( 0xffff00 );
		}
	}

	addMouseRaycaster() {
		this.mouseRaycaster = new THREE.Raycaster();
	}

	// handles resizing the renderer when the viewport is resized

	onWindowResize() {
		const ev = new MouseEvent( 'resizeend', {
			view: window,
			bubbles: true,
			cancelable: true
		} );

		window.dispatchEvent( ev );
	}

	onWindowResizeEnd() {
		this.screenWidth = window.innerWidth;
		this.screenHeight = window.innerHeight;

		this.camera.aspect = this.screenWidth / this.screenHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( this.screenWidth, this.screenHeight );
	}

	onWindowResizeEvent() {
		clearTimeout( this.timerWindowResize );
		this.timerWindowResize = setTimeout( this.onWindowResize.bind( this ), 50 );
	}

}

export default App;

