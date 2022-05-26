import * as THREE from 'three';
import App from './App.js';
import { GUI } from 'lil-gui';

window.addEventListener( 'load', () => {
	new Experience();
} );


class Experience {

	constructor() {
		this.app = new App( {
			//lights: false,
			lightsIntensity:0.3
		} );
		this.app.addTicker( this.loop.bind( this ) );
		this.renderer = this.app.renderer;
		this.camera = this.app.camera;
		this.scene = this.app.scene;

		this.torusPositionZ = -1;
		this.whiteLightDistance = 1;
		this.addShader();
		this.addTorus();
		this.addLights();

		this.count = 0;
		this.t = 0;
	}

	loop() {
		this.loopTexture();
		this.loopLights();
		this.app.update();
	}

	loopTexture() {
		const ratio = 0.2;
		this.texture.offset.x += 0.001 * ratio;
		this.texture.offset.y += 0.01 * ratio;
	}

	loopLights() {
		this.t += 0.02;
		this.lightGroup.position.x = this.whiteLightDistance * Math.cos( this.t ) + 0;
		this.lightGroup.position.z = this.whiteLightDistance * Math.sin( this.t ) - 0;
		this.whiteLight.intensity = Math.cos( this.t ) / 5 + 1;
	}

	onTextureLoaded() {
		this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;
		const r = 1;
		this.texture.repeat.set( r * 1.5, r * 2 ); // or whatever you like
		this.app.update();
	}

	addShader() {

		const BLOOM_VERTEX_SHADER = `
			varying vec3 vNormal;
			void main()
			{
				vNormal = normalize( normalMatrix * normal );
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 0.9 );
			}`;

		const BLOOM_VERTEX_FRAGMENT = `
			varying vec3 vNormal;
			void main()
			{
				float intensity = pow( 1.0 - dot( vNormal, vec3( 0.0, 0.0, 0.87 ) ), 0.95 );
    			gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 ) * intensity;
			}`;


		this.shaderMaterialRed = new THREE.ShaderMaterial( {
			uniforms: {},
			vertexShader: BLOOM_VERTEX_SHADER,
			fragmentShader: BLOOM_VERTEX_FRAGMENT,
			side: THREE.FrontSide,
			blending: THREE.AdditiveBlending,
			transparent: true
		} );

		this.shaderMaterialWhite = new THREE.ShaderMaterial( {
			uniforms: {},
			vertexShader: BLOOM_VERTEX_SHADER,
			fragmentShader: BLOOM_VERTEX_FRAGMENT,
			side: THREE.FrontSide,
			blending: THREE.AdditiveBlending,
			transparent: true
		} );
	}

	addTorusBloom() {

		const torusBloomGeometry = new THREE.TorusBufferGeometry( 0.39, 0.08, 32, 64 );
		torusBloomGeometry.center();
		this.torusBloom = new THREE.Mesh( torusBloomGeometry, this.shaderMaterialRed );
		//this.torusBloom.scale.set( 0.90, 0.95, 2 );
		this.torus.add( this.torusBloom );

	}

	addTorus() {

		const geometry = new THREE.TorusBufferGeometry( 0.4, 0.1, 16, 98 );
		geometry.center();

		const texture = new THREE.TextureLoader().load( 'assets/torus11.png', this.onTextureLoaded.bind( this ) );
		texture.encoding = THREE.sRGBEncoding;

		this.texture = texture;

		const material = new THREE.MeshStandardMaterial( {
			transparent: true,
			opacity:0.9,
			alphaMap: texture,
			alphaTest: 0.8,
			side: THREE.DoubleSide
		} );

		const torus = new THREE.Mesh( geometry, material );
		this.torus = new THREE.Object3D();
		this.torus.add( torus );
		this.scene.add( this.torus );
		this.torus.position.set( 0, 1.2, this.torusPositionZ );

		this.addTorusBloom();

	}

	addLights() {

		// main light
		this.light = new THREE.PointLight( 0xFF0000, 1, 1.25 );
		this.light.position.set( 0, 1.2, this.torusPositionZ + 1 );
		this.scene.add( this.light );

		// moving white light
		this.lightGroup = new THREE.Group();
		this.torus.add( this.lightGroup );

		const geometry = new THREE.SphereGeometry( 0.02, 32, 16 );
		this.whiteLightSphere = new THREE.Mesh( geometry, this.shaderMaterialWhite );
		this.lightGroup.add( this.whiteLightSphere );

		this.whiteLight = new THREE.PointLight( new THREE.Color( 0x560000 ), 0.3, 3 );
		this.lightGroup.add( this.whiteLight );

		//const pointLightHelper = new THREE.PointLightHelper( this.whiteLight, 0.2 );
		//this.lightGroup.add( pointLightHelper );
		//this.lightGroup.position.y = -0.6;

		const whiteLightFolder = this.gui.addFolder( 'whitelight' );
		whiteLightFolder.add( this.whiteLight, 'intensity', 0, 20, 0.1 );
		whiteLightFolder.addColor( this.whiteLight, 'color' );
		whiteLightFolder.open();

	}
}

Experience.prototype.gui = new GUI();
