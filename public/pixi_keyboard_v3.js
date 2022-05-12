import * as PIXIT from 'three-pixit';

const app = new PIXIT.Application( {
	worker: {
		file: './pixi_keyboard_v3.worker.js'
	}
} );

console.log( 'PIXIT App', app );
