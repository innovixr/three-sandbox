import * as deepmerge from 'deepmerge';

const CANVAS_DEFAULTS = {
	width: 1024,
	height: 1024
};

class Canvas {

	constructor( config = CANVAS_DEFAULTS ) {
		this.config = deepmerge( CANVAS_DEFAULTS, config );
		this.canvas = document.createElement( 'canvas' );
		this.setSize( config.width, config.height );
		this.setDefaultStyle();
		this.addToDom();
	}

	setSize( width, height ) {
		this.canvas.width = width || 1024;
		this.canvas.height = height || 1024;
	}

	setDefaultStyle() {
		let style = '';
		style += 'position:absolute;width:500px;height:500px;';
		style += 'margin-left:auto; ;margin-right:auto; top:10%; left:0; right:0; ';
		style += 'border:1px solid rgba(255, 255, 255, 0.5);';
		style += 'background - color: white; opacity: 0.999; z - index: 10; ';

		this.canvas.style = style;
	}

	addToDom() {
		document.body.appendChild( this.canvas );
	}

	removeFromDrom() {
		document.body.removeChild( this.canvas );
	}

	destroy() {
		this.removeFromDrom();
	}
}

export { Canvas };
