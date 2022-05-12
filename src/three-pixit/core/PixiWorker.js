class PixiWorker {
	constructor( file, message, options ) {
		this.createWorker( file, message, options );
	}
	createWorker( file, message, options ) {
		// pixijs will run in a webworker, in a separated thread, no more lags.
		console.log( 'Worker: createWorker', file, message, options );
		this.worker = new Worker( './pixi_keyboard_v3.worker.js' );
		this.worker.postMessage( message, options );
	}
}

export { PixiWorker };
