import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
import CameraControls from 'camera-controls';

import * as holdEvent from 'hold-event';
import Stats from 'three/examples/jsm/libs/stats.module';
import XRControl from './XR.js';

import { Test } from '../src/three-pixit/utils/utils.js';

CameraControls.install( { THREE: THREE } );

class App {
	constructor( opts ) {
		this.opts = opts || {};
		this.opts.lights = Test.isDefined( this.opts.lights ) ? this.opts.lights : true;
		this.opts.lightsIntensity = Test.isDefined( this.opts.lightsIntensity ) ? this.opts.lightsIntensity : 1;
		this.raycasterMeshes = [];
		this.raycasterIntersects = [];
		this.raycasterEventsCallback = {};
		this.meshes = [];

		this.getScreenDimension();

		this.addScene();
		this.addRenderer();
		this.addCamera();
		if ( this.opts.grid )
		{
			this.addGrid();
		} else
		{
			this.addLights();
			this.addRoom();
		}
		//this.addMouseHandler();
		//this.addMouseRaycaster();
		//this.addOrbitControl();
		this.addCameraControl();

		this.addWindowResizeEndEvent();
		this.setupXR();

		//this.clock = new THREE.Clock();
		this.loop = this.loop.bind( this );
		this.renderer.setAnimationLoop( this.loop.bind( this ) );

		this.stats = Stats();
		document.body.appendChild( this.stats.dom );
		this.stats.dom.style.opacity = 0.4;

	}

	addTicker( extraLoop ) {
		this.extraLoop = extraLoop;
	}

	loop( delta ) {

		//const delta = this.clock.getDelta();
		//const elapsed = this.clock.getElapsedTime();

		let updated = false;

		if ( this.controls )
		{
			updated = this.controls.update( delta );
		}

		if ( this.extraLoop )
			updated = this.extraLoop( delta ) || updated;

		//this.meshes.room.material.needsUpdate = true;
		//this.meshes.room.needsUpdate = true;

		if ( updated || this.renderer.xr?.isPresenting )
		{
			this.update();
		}

		if ( !this.renderer.xr?.isPresenting )
		{
			this.stats.update();
		}

	}

	update() {
		this.renderer.render( this.scene, this.camera );
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

		if ( !this.opts.lights ) return;

		let container = new THREE.Object3D();

		//let object3d = new THREE.AmbientLight( new THREE.Color( 0x040404 ), 1 * this.opts.lightsIntensity );
		//object3d.name = 'Ambient light';
		//container.add( object3d );

		const red = new THREE.PointLight( new THREE.Color( 0xAA2200 ), 0.1 * this.opts.lightsIntensity, 4 , 0.5 );
		red.position.set( -3, 2, -3 );
		//red.castShadow = true;
		container.add( red );

		const blue = new THREE.PointLight( new THREE.Color( 0x1133FF ), 0.3 * this.opts.lightsIntensity, 10, 0.5 );
		blue.position.set( 3, 2, -3 );
		//blue.castShadow = true;
		container.add( blue );

		//const back = new THREE.PointLight( new THREE.Color( 0xAAAAAA ), 0.3, 5, 0.5 );
		//back.position.set( 0, 1.3, 1 );
		//back.rotation.set( 1, 0, 0 );
		//back.castShadow = true;
		//container.add( back );

		//this.scene.add( new THREE.PointLightHelper( back ) );
		this.scene.add( container );

	}

	addCamera() {
		const EPS = 1e-5;
		this.cameraDefault = new THREE.PerspectiveCamera( 60, this.screenWidth / this.screenHeight, 0.001, 100 );
		this.cameraDefault.name = 'cameraDefault';
		this.cameraDefault.position.set( 0, EPS, 0 );
		this.camera = this.cameraDefault;
		this.scene.add( this.camera );
	}

	addCameraXR() {
		this.cameraXR = new THREE.PerspectiveCamera( 60, this.screenWidth / this.screenHeight, 0.001, 100 );
		this.cameraXR.name = 'cameraXR';
		this.cameraXRDolly = new THREE.Object3D();
		this.cameraXRDolly.add( this.cameraXR );
		this.cameraXRDolly.position.set( 0, 0, 0 );
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

		this.xrControl = new XRControl( this.renderer, this.cameraXR, this.scene );
		this.scene.add( this.xrControl.controllerGrips[ 0 ] );
		this.scene.add( this.xrControl.controllers[ 0 ] );
		this.scene.add( this.xrControl.controllerGrips[ 1 ] );
		this.scene.add( this.xrControl.controllers[ 1 ] );
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

	addGrid() {

		const scene = this.scene;

		scene.background = new THREE.Color( 0x050505 );
		scene.fog = new THREE.Fog( 0x1E26F0, 0.5, 100 );

		// Lights

		//scene.add( new THREE.AmbientLight( 0x444444 ) );

		const spotLight = new THREE.SpotLight( 0xaaaaaa );
		spotLight.intensity = 1;
		spotLight.angle = Math.PI / 4;
		spotLight.penumbra = 0.2;
		spotLight.position.set( 0, 5, 6 );
		spotLight.castShadow = true;
		spotLight.shadow.camera.near = 7;
		spotLight.shadow.camera.far = 12;
		spotLight.shadow.mapSize.width = 1024;
		spotLight.shadow.mapSize.height = 1024;
		spotLight.shadow.bias = - 0.0002;
		spotLight.shadow.radius = 0.9;
		scene.add( spotLight );
		//scene.add( new THREE.CameraHelper( spotLight.shadow.camera ) );

		const ground = new THREE.Mesh(
			new THREE.PlaneGeometry( 100, 100 ),
			new THREE.MeshPhongMaterial( {
				color: 0x11111f,
				side: THREE.DoubleSide,
				opacity: .95,
				transparent: true
			} )
		);

		//const ground = new THREE.Mesh( planeGeometry, planeMaterial );
		ground.rotation.x = - Math.PI / 2;
		ground.scale.multiplyScalar( 3 );
		ground.castShadow = true;
		ground.receiveShadow = true;
		scene.add( ground );

	}

	addRoomCube( width, height ) {
		const geometry = new THREE.BoxGeometry( width, height, width );
		const material = new THREE.MeshPhongMaterial( {
			color: 0x999999,
			side: THREE.DoubleSide,
			dithering:true
			//roughness: 0.8,
			//metalness: 0.2,
			//bumpScale: 0.0005
		} );
		const cube = new THREE.Mesh( geometry, material );
		//cube.receiveShadow = true;
		this.scene.add( cube );
		cube.geometry.center();
		cube.position.y += height / 2;
		return cube;
	}

	addRoomSegments( width, height, depth ) {
		if ( !height ) height = width;
		if ( !depth ) depth = width;

		const room = new THREE.LineSegments(
			new BoxLineGeometry( width, height, depth, width, height, depth ),
			new THREE.LineBasicMaterial( { color: 0x808080 } )
		);
		//room.receiveShadow = true;
		room.geometry.center();
		room.position.y += width / 8;
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
		this.renderer.shadowMap.type = THREE.VSMShadowMap;
		//this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		//this.renderer.toneMapping = THREE.LinearToneMapping;
		//this.renderer.toneMapping = THREE.ReinhardToneMapping;
		//this.renderer.toneMapping = THREE.CineonToneMapping;
		//this.renderer.toneMappingExposure = 2.2;
		//this.renderer.colorManagement = true;
		//this.renderer.physicallyCorrectLights = false;
		//this.renderer.outputEncoding = THREE.sRGBEncoding;

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
		this.controls.azimuthRotateSpeed = 0.5; // negative value to invert rotation direction
		this.controls.polarRotateSpeed = 0.5; // negative value to invert rotation direction
		this.controls.truckSpeed = 0.01;
		this.controls.dampingFactor = 0.2;
		this.controls.mouseButtons.wheel = CameraControls.ACTION.ZOOM;
		this.controls.touches.two = CameraControls.ACTION.TOUCH_ZOOM_TRUCK;
		this.controls.saveState();
		this.controls.moveTo( 0, 1.2, 0 );

		const center = new THREE.Object3D();
		center.position.set( 0, 1.2, -0.5 );
		this.scene.add( center );
		this.controls.setTarget( center.position.x, center.position.y, center.position.z );
		this.renderer.render( this.scene, this.camera );
		this.addCameraMouseControl();
		this.addCameraKeyboardControl();
	}

	onMouseDown( /*event*/ ) {
		//this.controls.setTarget( event.clientX, event.clientY );
		this.renderer.domElement.addEventListener( 'mouseup', this.onMouseUp.bind( this ) );
		this.renderer.domElement.removeEventListener( 'mousedown', this.onMouseDown.bind( this ) );
	}

	onMouseUp( /*event*/ ) {
		this.renderer.domElement.addEventListener( 'mousedown', this.onMouseDown.bind( this ) );
		this.renderer.domElement.removeEventListener( 'mouseup', this.onMouseUp.bind( this ) );
	}

	addCameraMouseControl() {
		this.renderer.domElement.addEventListener( 'mousedown', this.onMouseDown.bind( this ) );
	}

	addCameraKeyboardControl() {
		const KEYCODE = {
			arrows: {
				left: 37,
				up: 38,
				right: 39,
				down: 40,
			},
			fr: {
				forward: 90,	// a
				backward: 83,	// z
				left: 81,		// q
				right: 68,		// d

			},
			en: {
				forward: 87,	// z
				backward: 83,	// s
				left: 65,		// q
				right: 68		// d
			}
		};

		const arrows = KEYCODE.arrows;
		const keys = KEYCODE[ 'fr' ];

		// handle move forward, backward, left, right
		const keyForward = new holdEvent.KeyboardKeyHold( keys.forward, 16.666 );
		const keyLeft = new holdEvent.KeyboardKeyHold( keys.left, 16.666 );
		const keyBackward = new holdEvent.KeyboardKeyHold( keys.backward, 16.666 );
		const keyRight = new holdEvent.KeyboardKeyHold( keys.right, 16.666 );
		const moveAnimation = true;
		const ratio = 0.001;
		const walkSpeed = 0.5;
		const runSpeed = 2;

		keyLeft.addEventListener( 'holding', event => {
			const multiplier = event.originalEvent.shiftKey ? runSpeed : walkSpeed;
			this.controls.truck( - ( ratio * multiplier ) * event.deltaTime, 0, moveAnimation );
		} );
		keyRight.addEventListener( 'holding', event => {
			const multiplier = event.originalEvent.shiftKey ? runSpeed : walkSpeed;
			this.controls.truck( ( ratio * multiplier ) * event.deltaTime, 0, moveAnimation );
		} );
		keyForward.addEventListener( 'holding', event => {
			const multiplier = event.originalEvent.shiftKey ? runSpeed : walkSpeed;
			this.controls.forward( ( ratio * multiplier ) * event.deltaTime, moveAnimation );
		} );
		keyBackward.addEventListener( 'holding', event => {
			const multiplier = event.originalEvent.shiftKey ? runSpeed : walkSpeed;
			this.controls.forward( - ( ratio * multiplier ) * event.deltaTime, moveAnimation );
		} );

		// handle look left,right,up,down
		const keyTurnLeft = new holdEvent.KeyboardKeyHold( arrows.left, 100 );
		const keyTurnRight = new holdEvent.KeyboardKeyHold( arrows.right, 100 );
		const keyUp = new holdEvent.KeyboardKeyHold( arrows.up, 100 );
		const keyDown = new holdEvent.KeyboardKeyHold( arrows.down, 100 );
		const lookAnimation = true;

		keyTurnRight.addEventListener( 'holding', event => { this.controls.rotate( - 0.1 * THREE.MathUtils.DEG2RAD * event.deltaTime, 0, lookAnimation ); } );
		keyTurnLeft.addEventListener( 'holding', event => { this.controls.rotate( 0.1 * THREE.MathUtils.DEG2RAD * event.deltaTime, 0, lookAnimation ); } );
		keyDown.addEventListener( 'holding', event => { this.controls.rotate( 0, - 0.05 * THREE.MathUtils.DEG2RAD * event.deltaTime, lookAnimation ); } );
		keyUp.addEventListener( 'holding', event => { this.controls.rotate( 0, 0.05 * THREE.MathUtils.DEG2RAD * event.deltaTime, lookAnimation ); } );
	}

	addOrbitControl() {
		this.controls = new OrbitControls( this.camera, this.renderer.domElement );
		this.controls.autoRotate = false;
		this.controls.autoRotateSpeed = 1;
		this.controls.enableDamping = true;
		this.controls.enableZoom = true;
		this.controls.maxDistance = 0.45;
		this.camera.position.y = 1.2;
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
		if ( this.raycasterIntersects.length !== 0 ) {
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
		this.renderer.render( this.scene, this.camera );
	}

	onWindowResizeEvent() {
		clearTimeout( this.timerWindowResize );
		this.timerWindowResize = setTimeout( this.onWindowResize.bind( this ), 50 );
	}

}

export default App;

