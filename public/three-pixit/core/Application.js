import * as deepmerge from 'deepmerge';
import { Canvas } from './Canvas.js';
import { PixiWorker } from './PixiWorker.js';

const APPLICATION_DEFAULTS = {
	canvas: {
		width: 1024
	},
	worker: {
		enable: true,
		file: './WorkerInstance.js'
	}
};

class Application {
	constructor( config ) {
		config = config || APPLICATION_DEFAULTS;
		this.config = deepmerge( config, APPLICATION_DEFAULTS );

		this.canvasInstance = new Canvas( {
			width: this.config.width,
			height: this.config.height
		} );

		if ( this.config.worker.enable )
		{
			this.canvasOffscreen = this.canvasInstance.canvas.transferControlToOffscreen();

			const welcomeMessage = {
				canvas: this.canvasOffscreen,
				width: this.config.canvas.width,
				height: this.config.canvas.height,
			};

			this.worker = new PixiWorker(
				this.config.worker.file,
				welcomeMessage,
				[ this.canvasOffscreen ]
			);
		}
	}
}

export { Application };
