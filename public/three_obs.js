import * as THREE from 'three';
import flvjs from 'flv.js';
import App from './App.js';

window.addEventListener( 'load', () => {
	new Experience();
} );

class Experience {
	constructor() {
		this.app = new App( this.updateVideo.bind( this ) );
		this.renderer = this.app.renderer;
		this.camera = this.app.camera;
		this.scene = this.app.scene;
		this.createVideoElementFlvJs();
		this.createScreen();
	}

	updateVideo() {
		if ( this.videoTexture )
		{
			return true;
		}

	}

	createVideoElementFlvJs() {
		this.videoElement = document.createElement( 'video' );
		this.videoElement.setAttribute( 'class', 'video' );
		//this.videoElement.volume = 0;
		this.videoElement.muted = true;
		this.videoElement.autoplay = true;

		document.body.appendChild( this.videoElement );

		const flvPlayer = flvjs.createPlayer( {
			type: 'flv',
			isLive:true,
			url: 'https://192.168.1.100:8001/livetest/test.flv'
		}, {
			enableWorker: false,
			lazyLoadMaxDuration: 3 * 60,
			seekType: 'range',
		} );
		flvPlayer.attachMediaElement( this.videoElement );
		flvPlayer.load();
		flvPlayer.play();
	}

	createScreen() {
		this.videoTexture = new THREE.VideoTexture( this.videoElement );
		this.videoTexture.encoding = THREE.sRGBEncoding;
		this.videoTexture.needsUpdate = true;
		//videoTexture.minFilter = THREE.LinearFilter;
		//videoTexture.magFilter = THREE.LinearFilter;
		const width = 4;
		const height = width * 0.5625;
		const geometry = new THREE.PlaneGeometry( width, height );
		const material = new THREE.MeshBasicMaterial( { map: this.videoTexture } );
		const mesh = new THREE.Mesh( geometry, material );
		mesh.position.set( 0, 2.4 - ( height / 2 ), -4.9 );

		//material.map.needsUpdate = true;
		//material.needsUpdate = true;

		this.scene.add( mesh );
	}
}


