import * as THREE from 'three';

class Box {
	constructor( width, height ) {
		const geometry = new THREE.BoxGeometry( width, height, width );
		const material = new THREE.MeshPhongMaterial( {
			color: 0x999999,
			side: THREE.DoubleSide,
			//roughness: 0.8,
			//metalness: 0.2,
			//bumpScale: 0.0005
		} );

		const mesh = new THREE.Mesh( geometry, material );
		mesh.receiveShadow = true;
		mesh.geometry.center();
		mesh.position.y += height / 2;
		this.mesh = mesh;
	}
}

export { Box };

