import * as THREE from 'three';

class Mesh {

	toFloor( mesh ) {
		mesh.position.z += new THREE.Box3().setFromObject( mesh ).getSize().z * 0.5;
	}

}

export { Mesh };
