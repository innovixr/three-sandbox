import * as THREE from 'three';

class Card {
	constructor( opts ) {
		opts = opts || {};
		const name = opts.name || `card-${Date.now()}`;
		const x = opts.x || 0;
		const y = opts.y || 0;
		const width = opts.width || 0.4;
		const height = opts.height || ( width * 0.36 );
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

		//this.onRaycasterEvent = this.onRaycasterEvent.bind( this );
		//this.onRaycasterEnter = this.onRaycasterEnter.bind( this );
		//this.onRaycasterMove = this.onRaycasterMove.bind( this );
		//this.onRaycasterLeave = this.onRaycasterLeave.bind( this );
	}
}

export { Card };
