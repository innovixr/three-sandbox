import * as THREE from 'three';
import flvjs from 'flv.js';
import App from './App.js';

const RTMP_URL = 'wss://rtmp.innovacode.com:1933/livetest/test.flv';

window.addEventListener( 'load', () => {
	new Experience();
} );

class Experience {
	constructor() {
		this.app = new App( );
		this.app.addTicker( this.updateVideo.bind( this ) );
		this.renderer = this.app.renderer;
		this.camera = this.app.camera;
		this.scene = this.app.scene;
		this.createVideoElementFlvJs();
		this.createScreen();
		this.i = 0;
		this.max = 3;
	}

	updateVideo() {
		this.i++;

		if ( this.videoTexture && this.i === this.max )
		{
			this.i = 0;
			return true;
		}
	}

	startVideo() {
		this.flvPlayer.play();
	}

	createVideoElementFlvJs() {
		this.videoElement = document.createElement( 'video' );
		this.videoElement.setAttribute( 'class', 'video' );
		//this.videoElement.volume = 0;
		//this.videoElement.muted = true;
		this.videoElement.autoplay = false;

		document.body.appendChild( this.videoElement );
		document.addEventListener( 'pointerdown', this.startVideo.bind( this ) );

		const flvPlayer = flvjs.createPlayer( {
			type: 'flv',
			isLive: true,
			url: RTMP_URL
		}, {
			enableWorker: false,
			//enableStashBuffer: false,
			//stashInitialSize: 128,
			lazyLoadMaxDuration: 3 * 60,
			seekType: 'range',
		} );
		flvPlayer.attachMediaElement( this.videoElement );
		flvPlayer.load();
		this.flvPlayer = flvPlayer;
	}

	createScreen() {
		this.videoTexture = new THREE.VideoTexture( this.videoElement );
		this.videoTexture.encoding = THREE.sRGBEncoding;
		this.videoTexture.needsUpdate = true;
		this.videoTexture.minFilter = THREE.LinearFilter;
		this.videoTexture.magFilter = THREE.LinearFilter;
		const width = 2;
		const height = width * 0.5625;
		const geometry = new THREE.PlaneGeometry( width, height );
		const material = new THREE.MeshBasicMaterial( { map: this.videoTexture } );
		const mesh = new THREE.Mesh( geometry, material );
		mesh.position.set( 0, 1.8 - ( height / 2 ), -1.5 );

		//material.map.needsUpdate = true;
		//material.needsUpdate = true;

		this.scene.add( mesh );
	}
}


