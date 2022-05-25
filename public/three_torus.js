import * as THREE from 'three';
import App from './App.js';

window.addEventListener( 'load', () => {
	new Experience();
} );


class Experience {
	constructor() {
		this.app = new App( this.loop.bind( this ) );
		this.renderer = this.app.renderer;
		this.camera = this.app.camera;
		this.scene = this.app.scene;

		this.torusPositionZ = -1;
		this.addShader();
		this.addTorus();
		this.addLight();

		this.count = 0;

	}

	loop() {
		const ratio = 0.2;
		this.texture.offset.x += 0.001 * ratio;
		this.texture.offset.y += 0.01 * ratio;
		this.app.update();
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


		this.shaderMaterial = new THREE.ShaderMaterial( {
			uniforms: {},
			vertexShader: BLOOM_VERTEX_SHADER,
			fragmentShader: BLOOM_VERTEX_FRAGMENT,
			side: THREE.FrontSide,
			blending: THREE.AdditiveBlending,
			transparent: true
		} );
	}

	addTorusBloom() {

		const torusBloomGeometry = new THREE.TorusBufferGeometry( 0.45, 0.05, 16, 98 );
		torusBloomGeometry.center();
		this.torusBloom = new THREE.Mesh( torusBloomGeometry, this.shaderMaterial );
		this.torusBloom.position.set( 0, 1.2, this.torusPositionZ );
		this.torusBloom.scale.set( 0.90, 0.95, 2 );
		this.scene.add( this.torusBloom );
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

		this.torus = new THREE.Mesh( geometry, material );
		this.torus.position.set( 0, 1.2, this.torusPositionZ );
		this.scene.add( this.torus );

		this.addTorusBloom();

	}

	addLight() {

		this.light = new THREE.PointLight( 0xFF0000, 1, 1.25 );
		this.light.position.set( 0, 1.2, this.torusPositionZ + 1 );
		this.light.castShadow = true;
		this.scene.add( this.light );
	}
}


