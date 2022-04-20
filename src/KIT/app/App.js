import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
import CameraControls from 'camera-controls';

CameraControls.install( { THREE: THREE } );

class App {
	constructor( extraLoop ) {
		this.raycasterMeshes = [];
		this.raycasterIntersects = [];
		this.raycasterEventsCallback = {};
		this.meshes = [];
		this.extraLoop = extraLoop;

		this.getScreenDimension();

		this.addScene();
		this.addRenderer();
		this.addCamera();
		this.setupXR();
		this.addMouseHandler();
		this.addMouseRaycaster();
		//this.addOrbitControl();
		this.addCameraControl();
		this.addWindowResizeEndEvent();

		this.addLights();
		this.addRoom();

		this.clock = new THREE.Clock();
		this.loop = this.loop.bind( this );
		this.renderer.setAnimationLoop( this.loop.bind( this ) );

	}

	loop() {

		const delta = this.clock.getDelta();
		//const elapsed = this.clock.getElapsedTime();
		const updated = this.controls.update( delta );

		this.extraLoop && this.extraLoop( delta );

		if ( this.renderer.xr?.isPresenting || updated )
		{
			this.renderer.render( this.scene, this.camera );
		}
	}


	getScreenDimension() {
		this.screenWidth = window.innerWidth;
		this.screenHeight = window.innerHeight;
	}

	addScene() {
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0x333333 );

		//const axesHelper = new THREE.AxesHelper( 5 );
		//this.scene.add( axesHelper );

	}

	addLights() {
		let container = new THREE.Object3D();

		//let ambiant = new THREE.AmbientLight( 0xFFFFFF, 1 );
		//ambiant.name = 'Ambient light';
		//container.add( ambiant );

		const red = new THREE.PointLight( 0xFF1177, 0.1, 4, 0.5 );
		red.position.set( -3, 2, -3 );
		//red.castShadow = true;
		container.add( red );

		const blue = new THREE.PointLight( 0x1133FF, 0.1, 4, 0.5 );
		blue.position.set( 3, 2, -3 );
		//blue.castShadow = true;
		container.add( blue );

		const back = new THREE.PointLight( 0xFFFFFF, 0.1, 10, 0.5 );
		back.position.set( 0, 1, 0.4 );
		back.castShadow = true;
		container.add( back );

		this.scene.add( container );

	}

	addCamera() {
		const EPS = 1e-5;
		this.cameraDefault = new THREE.PerspectiveCamera( 60, this.screenWidth / this.screenHeight, 0.01, 100 );
		this.cameraDefault.name = 'cameraDefault';
		this.camera = this.cameraDefault;
		this.camera.position.set( 0, 1.6, 0.3 );
		this.scene.add( this.camera );
	}

	addCameraXR() {
		this.cameraXR = new THREE.PerspectiveCamera( 60, this.screenWidth / this.screenHeight, 0.1, 100 );
		this.cameraXR.name = 'cameraXR';
		this.cameraXRDolly = new THREE.Object3D();
		this.cameraXRDolly.add( this.cameraXR );
		this.cameraXRDolly.position.set( 0, 0, 0.5 );
		this.cameraXRDolly.visible = false;
		this.scene.add( this.cameraXRDolly );
	}

	setupXR() {
		this.addCameraXR();
		this.renderer.xr.enabled = true;
		//this.renderer.xr.setFramebufferScaleFactor( 1.1 );
		//this.renderer.xr.setReferenceSpaceType( 'local-floor' );
		this.renderer.xr.addEventListener( 'sessionstart', this.onXRSessionStart.bind( this ) );
		document.body.appendChild( VRButton.createButton( this.renderer ) );
	}

	addRoom() {

		//const grid = new THREE.GridHelper( 10, 10 );
		//this.scene.add( grid );

		const useCube = true;
		const width = 10;
		const height = 2.5;
		this.meshes.room = useCube ? this.addRoomCube( width, height ) : this.addRoomSegments( width, height );
		this.scene.add( this.meshes.room );

	}

	addRoomCube( width, height ) {
		const geometry = new THREE.BoxGeometry( width, height, width );
		const material = new THREE.MeshPhongMaterial( {
			color: 0x999999,
			side: THREE.DoubleSide,
			//roughness: 0.8,
			//metalness: 0.2,
			//bumpScale: 0.0005
		} );
		const cube = new THREE.Mesh( geometry, material );
		cube.receiveShadow = true;
		this.scene.add( cube );
		cube.geometry.center();
		cube.position.y += height / 2;
		return cube;
	}

	addRoomSegments( width, height ) {
		const room = new THREE.LineSegments(
			new BoxLineGeometry( width, width, width, width, width, width ),
			new THREE.LineBasicMaterial( { color: 0x808080 } )
		);
		room.geometry.center();
		room.position.y += width / 4;
		return room;
	}

	addRenderer() {
		let canvas = document.createElement( 'canvas' );
		document.body.appendChild( canvas );
		this.renderer = new THREE.WebGLRenderer( {
			antialias: true,
			width: window.innerWidth,
			height: window.innerHeight,
			canvas
		} );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( this.screenWidth, this.screenHeight );
		this.renderer.shadowMap.enabled = true;
		//this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		//this.renderer.toneMapping = THREE.LinearToneMapping;
		//this.renderer.toneMapping = THREE.ReinhardToneMapping;
		this.renderer.toneMapping = THREE.CineonToneMapping;
		this.renderer.toneMappingExposure = 2.2;
		this.renderer.outputEncoding = THREE.sRGBEncoding;

		document.body.appendChild( this.renderer.domElement );
	}

	addMouseHandler() {
		this.mouse = new THREE.Vector2( 1, 1 );
		this.renderer.domElement.addEventListener( 'pointermove', this.handlerMouseRaycaster.bind( this ) );
		this.renderer.domElement.addEventListener( 'pointerdown', this.handlerMouseRaycaster.bind( this ) );
		this.renderer.domElement.addEventListener( 'pointerdup', this.handlerMouseRaycaster.bind( this ) );
	}

	addMouseRaycaster() {
		this.mouseRaycaster = new THREE.Raycaster();
	}

	addCameraControl() {
		this.controls = new CameraControls( this.camera, this.renderer.domElement );
		this.controls.minDistance = this.controls.maxDistance = 1;
		//this.controls.azimuthRotateSpeed = - 0.3; // negative value to invert rotation direction
		//this.controls.polarRotateSpeed = - 0.3; // negative value to invert rotation direction
		//this.controls.truckSpeed = 10;
		this.controls.mouseButtons.wheel = CameraControls.ACTION.ZOOM;
		this.controls.touches.two = CameraControls.ACTION.TOUCH_ZOOM_TRUCK;
		this.controls.saveState();
		this.renderer.render( this.scene, this.camera );
	}

	addOrbitControl() {
		this.controls = new OrbitControls( this.camera, this.renderer.domElement );
		this.controls.autoRotate = false;
		this.controls.autoRotateSpeed = 1;
		this.controls.enableDamping = true;
		this.controls.enableZoom = true;
		this.controls.maxDistance = 0.45;
	}

	addWindowResizeEndEvent() {
		window.addEventListener( 'resize', this.onWindowResizeEvent.bind( this ) );
		window.addEventListener( 'resizeend', this.onWindowResizeEnd.bind( this ) );
	}

	onXRSessionStart() {
		this.camera = this.cameraXR;
		this.session = this.renderer.xr.getSession();
		this.glBinding = this.renderer.xr.getBinding();
		this.renderer.xr.addEventListener( 'sessionend', this.onXRSessionEnd.bind( this ) );
		this.renderer.xr.removeEventListener( 'sessionstart', this.onXRSessionStart.bind( this ) );
	}

	onXRSessionEnd() {
		this.camera = this.cameraDefault;
		this.session = null;
		this.glBinding = null;
		this.renderer.xr.removeEventListener( 'sessionend', this.onXRSessionEnd.bind( this ) );
		this.renderer.xr.addEventListener( 'sessionstart', this.onXRSessionStart.bind( this ) );
	}

	handlerMouseRaycaster( event ) {

		this.mouse.x = ( event.clientX / this.screenWidth ) * 2 - 1;
		this.mouse.y = - ( event.clientY / this.screenHeight ) * 2 + 1;

		if ( !this.raycasterMeshes.length ) return;
		this.mouseRaycaster.setFromCamera( this.mouse, this.camera );
		this.raycasterIntersects = this.mouseRaycaster.intersectObjects( this.raycasterMeshes );
		if ( this.raycasterIntersects.length !== 0 )
		{
			let item = this.raycasterIntersects[ 0 ];
			Object.values( this.raycasterEventsCallback ).map( callback => {
				callback( item, event );
			} );
		}
	}

	raycasterRegisterEvents( handlerId, handlerFn ) {
		//console.log( 'registerEvents', handlerId, handlerFn );
		this.raycasterEventsCallback[ handlerId ] = handlerFn;
		//console.log( this.eventsCallback );
	}

	raycasterIncludeMesh( mesh ) {
		this.raycasterMeshes.push( mesh );
	}

	onWindowResize() {
		// handles resizing the renderer when the viewport is resized
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

export { App };

