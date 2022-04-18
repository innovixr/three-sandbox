import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh';
import { InteractiveGroup } from 'three/examples/jsm/interactive/InteractiveGroup';

import App from './App.js';

window.addEventListener( 'load', () => {
	new Experience();
} );

class Experience {
	constructor() {
		this.app = new App();
		this.renderer = this.app.renderer;
		this.camera = this.app.camera;
		this.scene = this.app.scene;

		const group = new InteractiveGroup( this.renderer, this.camera );
		this.scene.add( group );

		const div = document.createElement( 'div' );
		div.style = 'color:white;font-family:arial;padding-top:10px;text-align:center;height:20px;font-size:15px;width:200px;';
		div.innerHTML = 'HTML Mesh basic test';
		document.body.appendChild( div );

		const mesh = new HTMLMesh( div );
		mesh.position.x = 0;
		mesh.position.y = 1.6;
		mesh.position.z = 0;
		group.add( mesh );

	}
}


