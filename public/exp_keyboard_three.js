import * as THREE from 'three';
import App from './App.js';

window.addEventListener( 'load', () => {
	new Experience();
} );

class Experience {

	constructor() {
		this.app = new App( this.loop.bind( this ) );
		this.scene = this.app.scene;
		this.controls = this.app.controls;
		this.t = 0;
		this.color1 = new THREE.Color( 0xFF0000 );
		this.color2 = new THREE.Color( 0x0000FF );
		this.increase = Math.PI * 2 / 70;
		this.counter = 0;
		this.initExperience();
	}

	loop( /*delta*/ ) {
		//this.counter += this.increase;
		//this.button.material.color.copy( this.color1 ).lerp( this.color2, Math.sin( this.counter ) );
		//if ( this.counter > 10 ) this.counter = 0;
	}

	initExperience() {

		const container = new Card( { name:'vkeyboard', radius: 0.01 } );
		container.mesh.position.set( 0, 1.6, 0.05 );
		container.mesh.rotation.set( -0.5, 0, 0 );

		this.button = new Card( { name:'key1', height: 0.02, width: 0.1, radius: 0.004, frontColor: 0x888888 } );
		this.button.mesh.position.set( 0.142, -0.055, 0.001 );

		//const day = new THREE.Color( 0xB8F4FF );
		//const duskdawn = new THREE.Color( 0xFF571F );
		//button.material.color.copy( day ).lerp( duskdawn, 0.5 * ( Math.sin( t ) + 1 ) );

		container.mesh.add( this.button.mesh );
		this.scene.add( container.mesh );

		this.app.raycasterIncludeMesh( container.mesh );
		this.app.raycasterIncludeMesh( this.button.mesh );
		this.app.raycasterRegisterEvents( 'vkeyboard event', this.onRaycasterEvent.bind( this ) );

		container.mesh.geometry.computeBoundingBox();
		const meshBBSize = container.mesh.geometry.boundingBox.getSize( new THREE.Vector3() );
		const meshBBWidth = meshBBSize.x;
		const meshBBHeight = meshBBSize.y;
		const meshBBDepth = meshBBSize.z;

		const self = this;
		function customFitTo() {

			const transition = false;

			const distanceToFit = self.controls.getDistanceToFitBox( meshBBWidth, meshBBHeight, meshBBDepth ) + 0.2;
			self.controls.moveTo(
				container.mesh.position.x,
				container.mesh.position.y,
				container.mesh.position.z + distanceToFit,
				transition
			);
			self.controls.rotateTo( 0, 90 * THREE.MathUtils.DEG2RAD, false );

		}

		customFitTo();

	}

	onRaycasterEvent( item, event ) {
		console.log( 'hovering', item.object.name, item.object.card, event.type );
		item.object.card.onRaycasterEnter( item, event );
	}

}

class Card {
	constructor( opts ) {

		opts = opts || {};
		const name = opts.name || `card-${Date.now()}`;
		const x = opts.x || 0;
		const y = opts.y || 0.1;
		const width = opts.width || 0.4;
		const height = opts.height || width * 0.36;
		const radius = opts.radius || 0.02;
		const frontColor = opts.frontColor || 0x444444;
		const backColor = opts.backColor || 0x000000;
		const hoverColor = opts.hoverColor || 0x0000FF;
		const depth = opts.depth || 0.002;

		const usePlane = false;

		if ( !usePlane )
		{
			// TODO: find a way to split quadraticCurveTo into steps
			const shape = new THREE.Shape()
				.moveTo( x, y + radius )
				.lineTo( x, y + height - radius )
				.quadraticCurveTo( x, y + height, x + radius, y + height )
				.lineTo( x + width - radius, y + height )
				.quadraticCurveTo( x + width, y + height, x + width, y + height - radius )
				.lineTo( x + width, y + radius )
				.quadraticCurveTo( x + width, y, x + width - radius, y )
				.lineTo( x + radius, y )
				.quadraticCurveTo( x, y, x, y + radius );

			const extrudeSettings = {
				steps: 0,
				depth,
				bevelEnabled: false,
				//bevelThickness: 1,
				//bevelSize: 1,
				//bevelOffset: 0,
				//bevelSegments: 1
			};

			this.geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
		} else
		{
			this.geometry = new THREE.PlaneGeometry( width, height, 2, 2 );
		}

		//const vertices = this.geometry.attributes.position.array;
		//console.log( vertices );

		const matFront = new THREE.MeshPhongMaterial( { color: frontColor } );
		const matBack = new THREE.MeshPhongMaterial( { color: backColor } );
		const matHover = new THREE.MeshPhongMaterial( { color: hoverColor } );

		matFront.color.convertSRGBToLinear();
		matBack.color.convertSRGBToLinear();
		matHover.color.convertSRGBToLinear();

		const mesh = new THREE.Mesh( this.geometry, [ matBack, matFront, matHover ] );

		console.log( mesh );

		if ( usePlane )
		{
			// make all faces use matBack
			for ( let i = 0; i < this.geometry.faces.length; i++ )
			{
				this.geometry.faces[ i ].materialIndex = 0;
			}
			this.geometry.faces[ 0 ].materialIndex = 1;
		} else
		{
			// make all faces use matBack
			for ( let i = 0; i < this.geometry.groups.length; i++ )
			{
				this.geometry.groups[ i ].materialIndex = 0;
			}

			// make front face use matFront
			this.geometry.groups[ 0 ].materialIndex = 1;
		}

		this.geometry.center();
		mesh.card = this;
		mesh.name = name;

		this.mesh = mesh;
		this.material = matFront;

		this.onRaycasterEvent = this.onRaycasterEvent.bind( this );
		this.onRaycasterEnter = this.onRaycasterEnter.bind( this );
		this.onRaycasterMove = this.onRaycasterMove.bind( this );
		this.onRaycasterLeave = this.onRaycasterLeave.bind( this );

	}

	onRaycasterEvent( item, event ) {
		console.log( 'hovering', item.object.id, item.object.name, item.object.card, event.type );
		console.log( this.hoveredMesh === item.object );
		if ( this.hoveredMesh === item.object )
		{	// raytracer is moving on the same mesh
			this.hoveredMesh.onRaycasterMove();
			return;
		}

		if ( this.hoveredMesh )
		{   // raytracer is moving on another one
			this.hoveredMesh.onRaycasterLeave();
			this.hoveredMesh = null;
		} else
		{
			this.hoveredMesh = item.object.card;
			this.hoveredMesh.onRaycasterEnter();
		}
	}

	onRaycasterEnter() {
		console.log( 'onRaycasterEnter' );
		// make front face use matFront
		this.geometry.groups[ 0 ].materialIndex = 2;
	}

	onRaycasterMove() {
		console.log( 'onRaycasterMove' );
		this.material.color = 'blue';
	}

	onRaycasterLeave() {
		console.log( 'onRaycasterLeave' );
		this.material.color = this.material.oldColor;
	}
}
