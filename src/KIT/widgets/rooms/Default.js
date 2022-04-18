import * as THREE from 'three';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';

class Default {
	constructor( width, height ) {
		this.mesh = new THREE.LineSegments(
			new BoxLineGeometry( width, width, width, width, width, width ),
			new THREE.LineBasicMaterial( { color: 0x808080 } )
		);
		this.mesh.geometry.center();
		this.mesh.position.y += width / 4;
	}
}

export { Default };
