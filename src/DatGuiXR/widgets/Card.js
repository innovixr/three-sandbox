import * as THREE from 'three';
//import { LinearMipMapLinearFilter } from 'three';
import { GUI } from 'lil-gui';

let count = 0;


class Card {
	constructor( opts ) {
		opts = opts || {};

		this.material = opts.material;
		this.texture = opts.texture;
		this.usePlane = false;
		count += 1;

		const name = opts.name || `card-${Date.now()}`;
		const x = opts.x || 0;
		const y = opts.y || 0;
		const width = opts.width || 0.4;
		const height = opts.height || ( width * 0.36 );
		const radius = opts.radius || 0.02;

		// @TODO: think about colors
		// from Cat (threejs discord)
		// "if you're trying to match an object in the scene to a #4285F4 color in your HTML/CSS,
		// the material actually needs to be material.color.setHex( 0x4285f4 ).convertSRGBToLinear()
		// see https://www.donmccurdy.com/2020/06/17/color-management-in-threejs/ for more"

		const frontColor = opts.frontColor || 0x444444;
		const backColor = opts.backColor || 0x000000;
		const hoverColor = opts.hoverColor || 0x0000FF;
		const depth = opts.depth || 0.002;

		if ( this.usePlane ) {
			this.geometry = new THREE.PlaneGeometry( width, height, 2, 2 );

		} else {
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
				steps: 2,
				segments: 3,
				curveSegments: 4,
				depth,
				bevelEnabled: false,
				//bevelThickness: 1,
				//bevelSize: 1,
				//bevelOffset: 0,
				//bevelSegments: 1
			};

			this.geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
		}

		//const vertices = this.geometry.attributes.position.array;
		//console.log( vertices );

		let matFront;


		if ( this.texture ) {
			matFront = new THREE.MeshBasicMaterial( {
				map: this.texture.clone(),
				transparent: false,
				opacity: 0.999,
				alphaTest: 0.1,
				wireframe: false
			} );

			const ratio = this.texture.image.width / this.texture.image.height;
			const scale = 1.65;
			matFront.map.repeat.set( scale, scale * ratio );
			matFront.map.offset.x = 0.015;
			matFront.map.offset.y = 0.045;
			matFront.map.offset.x = opts.offsetX;
			matFront.map.offset.y = opts.offsetY;

			// franck

			//console.log( `u=${u}, v=${v}` );
			//matFront.map.offset.set( 10,0 );

			if ( count === 1 ) {
				console.log( matFront.map.offset );
				const f = this.gui.addFolder( 'Texture' );
				f.add( matFront.map.repeat, 'x' ).min( -10.0 ).max( 10 ).step( 0.1 );
				f.add( matFront.map.repeat, 'y' ).min( -10.0 ).max( 10 ).step( 0.1 );
				f.add( matFront.map.offset, 'x' ).min( -1.0 ).max( 1.0 ).step( 0.00001 );
				f.add( matFront.map.offset, 'y' ).min( -1.0 ).max( 1.0 ).step( 0.00001 );
				f.open();
			}

		} else {

			matFront = new THREE.MeshBasicMaterial( { color: frontColor } );
		}

		/*
		if ( !window.blah )
		{
			window.blah = setInterval( () => {
				matFront.map.offset.x += 0.01;
				matFront.map.offset.y -= 0.01;
				matFront.map.repeat.x -= 0.20;
				matFront.map.repeat.y = matFront.map.repeat.x / this.panelRatio;
				console.log( matFront.map.offset );
			}, 10 );
		}
		*/

		const matBack = new THREE.MeshBasicMaterial( { color: backColor } );
		const matHover = new THREE.MeshBasicMaterial( { color: hoverColor } );

		matFront.color.convertSRGBToLinear();
		matBack.color.convertSRGBToLinear();
		matHover.color.convertSRGBToLinear();

		const mesh = new THREE.Mesh( this.geometry, [ matBack, matFront, matHover ] );

		this.assignMaterial();
		this.geometry.center();
		mesh.card = this;
		mesh.name = name;

		this.mesh = mesh;
		this.material = matFront;

		//this.onRaycasterEvent = this.onRaycasterEvent.bind( this );
		//this.onRaycasterEnter = this.onRaycasterEnter.bind( this );
		//this.onRaycasterMove = this.onRaycasterMove.bind( this );
		//this.onRaycasterLeave = this.onRaycasterLeave.bind( this );
	}

	assignMaterial() {

		if ( this.usePlane ) {
			// make all faces use matBack
			for ( let i = 0; i < this.geometry.faces.length; i++ ) {
				this.geometry.faces[i].materialIndex = 0;
			}
			this.geometry.faces[0].materialIndex = 1;
		} else {
			// make all faces use matBack
			for ( let i = 0; i < this.geometry.groups.length; i++ ) {
				this.geometry.groups[i].materialIndex = 0;
			}

			// make front face use matFront
			this.geometry.groups[0].materialIndex = 1;
		}

	}
}

Card.prototype.gui = new GUI();
Card.prototype.count = 0;

export { Card };
