self.HTMLVideoElement = function HTMLVideoElement() { };
self.HTMLImageElement = function HTMLHTMLImageElement() { };
self.HTMLCanvasElement = self.OffscreenCanvas;

self.document = {
	createElement( type ) {
		if ( type === 'canvas' )
		{
			return new OffscreenCanvas( 0, 0 );
		}

		return {
			style: {}
		};
	},

	addEventListener() { },
};

self.window = {
	console: self.console,
	addEventListener() { },
	removeEventListener() { },
	navigator: {},
	document: self.document,

	/*
	 * This is necessary for PIXI.js to correctly detect that WebGL is present:
	 * https://github.com/pixijs/pixi.js/blob/f6f00047d6c523df2aa366cf3745eb831cec6ec5/src/core/utils/index.js#L314
	 */
	WebGLRenderingContext: self.WebGL2RenderingContext || self.WebGL2RenderingContext,
	requestAnimationFrame: self.requestAnimationFrame.bind( self ),

};


import * as PIXI from 'pixi.js';

self.addEventListener( 'message', ( d ) => {

	if ( !d.data.canvas ) return;

	const pixi = new PIXI.Application( {
		width: d.data.width,
		height: d.data.height,
		forceCanvas: false,
		view:d.data.canvas
	} );


	const fillColor = 0x333333;
	const padding = 10;
	const width = 200;
	const height = 100;
	const radius = 20;

	const panel = new PIXI.Graphics();
	panel.boundsPadding = 100;

	panel.lineStyle( { alignment: 0, width: 1, color: 0x5a28C6, alpha: 0.8 } );
	panel.beginFill( fillColor, 0.8 );
	panel.drawRoundedRect( padding, padding, width - padding, height - padding, radius );
	panel.endFill();

	pixi.stage.addChild( panel );

} );

