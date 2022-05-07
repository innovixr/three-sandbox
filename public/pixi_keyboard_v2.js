import * as PIXI from 'pixi.js';
import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';
import '../src/DatGuiXR/pixi/center.js';

window.addEventListener( 'load', init );

console.clear();

const lines = [
	[
		{ width: 1, chars: 'A' },
		{ width: 1, chars: 'Z' },
		{ width: 1, chars: 'E' },
		{ width: 1, chars: 'R' },
		{ width: 1, chars: 'T' },
		{ width: 1, chars: 'Y' },
		{ width: 1, chars: 'U' },
		{ width: 1, chars: 'I' },
		{ width: 1, chars: 'O' },
		{ width: 1, chars: 'P' }
	],
	[
		{ width: 1, chars: 'Q' },
		{ width: 1, chars: 'S' },
		{ width: 1, chars: 'D' },
		{ width: 1, chars: 'F' },
		{ width: 1, chars: 'G' },
		{ width: 1, chars: 'H' },
		{ width: 1, chars: 'J' },
		{ width: 1, chars: 'K' },
		{ width: 1, chars: 'L' },
		{ width: 1, chars: 'M' }
	],
	[
		{ width: 2, chars: 'up' },
		{ width: 1, chars: 'W' },
		{ width: 1, chars: 'X' },
		{ width: 1, chars: 'C' },
		{ width: 1, chars: 'V' },
		{ width: 1, chars: 'B' },
		{ width: 1, chars: 'N' },
		{ width: 2, chars: 'back' }
	],
	[
		{ width: 2, chars: '.?12' },
		{ width: 1, chars: ',' },
		{ width: 4, chars: 'space' },
		{ width: 1, chars: '.' },
		{ width: 2, chars: 'enter' }
	]
];

class Keyboard {

	constructor( opts ) {
		opts = opts || {};
		this.opts = opts;
		this.canvasWidth = opts.width || 1024;
		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

		this.backdropPadding = this.getCanvasPercentWidth( 1.3 );
		this.backdropRadius = this.getCanvasPercentWidth( 2 );
		this.backdropColor = 0x222222;

		this.buttonMargin = 0;
		this.buttonPadding = this.getCanvasPercentWidth( 2 );
		this.buttonBaseWidth = this.getButtonBaseWidth();
		this.buttonRadius = this.getCanvasPercentWidth( 1 );
		this.buttonBaseHeight = this.buttonBaseWidth;
		this.buttonColor = 0x333333;
		this.buttonColorText = 0xa8b2ff;
		this.buttonFont = { fontFamily: 'Verdana', fontSize: this.canvasWidth / 40 };
		this.canvasHeight = this.getCanvasHeight();

		this.filters = {
			bloom: {
				enable: false,
				threshold: 0.3,
				bloomScale: 1,
				brightness: 1,
				blur: 2,
				quality: 4
			}
		};

		this.createCanvas( this.canvasWidth, this.canvasHeight, opts.showCanvas );
		this.createPixiApp();
		this.createBackdrop( this.canvasWidth, this.canvasHeight, this.backdropRadius, this.backdropPadding, this.backdropColor );
		this.createButtons();
		this.installListeners();

		this.pixiApp.renderer.render( this.pixiApp.stage, { clear: true } );

		//console.log( `base width = ${this.buttonBaseWidth}, height = ${this.buttonBaseHeight}, canvas height = ${this.canvasHeight}` );
		document.body.style.backgroundColor = '#132350';
	}

	installListeners() {
		this.canvasEl.addEventListener( 'pointerup', this.onPointerUp.bind( this ) );
		this.canvasEl.addEventListener( 'pointerdown', this.onPointerDown.bind( this ) );
		//this.canvasEl.addEventListener( 'pointermove', this.onPointerMove.bind( this ) );
		window.addEventListener( 'pointermove', this.onPointerMove.bind( this ) );
		this.pixiMouse = new PIXI.Point();
	}

	onPointerDown( ev ) {
		const k = this.pixiApp.renderer.plugins.interaction.hitTest( this.pixiMouse );
		if ( k ) console.log( 'pointerdown', k.name );
	}

	onPointerUp( ev ) {
		console.log( 'pointerup' );
	}

	onPointerMove( ev ) {

		this.pixiMouse.x = ev.offsetX;
		this.pixiMouse.y = ev.offsetY;

		// exit: moving outside the canvas
		if ( ev.target != this.canvasEl )
		{
			// reset hovered
			if ( this.hovered ) this.onElementLeave( this.hovered );
			return;
		}

		const hovered = this.pixiApp.renderer.plugins.interaction.hitTest( this.pixiMouse );

		// exit: mouse over the same element
		if ( this.hovered && this.hovered === hovered ) return;

		// reset previously hovered
		if ( this.hovered )
		{
			this.onElementLeave( this.hovered );
		}

		if ( !hovered )
		{
			return;
		}

		this.hovered = hovered;
		this.onElementEnter( hovered );

		//console.log( 'pointermove', hitted.name );
	}

	onElementEnter( el ) {
		if ( el.name === 'backdrop' ) return;
		console.log( 'onElementEnter', el.name );
		this.canvasEl.style.cursor = 'pointer';
		el.filters = [ new AdvancedBloomFilter( this.filters.bloom ) ];
	}

	onElementLeave( el ) {
		if ( el.name === 'backdrop' ) return;
		console.log( 'onElementLeave', el.name );
		this.hovered = null;
		this.canvasEl.style.cursor = 'default';
	}

	getButtonBaseWidth() {
		const maxButtons = this.getMaxButtons();
		const buttonMargins = this.backdropPadding + ( this.buttonMargin * ( maxButtons - 1 ) ) + this.backdropPadding;
		const freeSpace = this.canvasWidth - buttonMargins;
		const buttonWidth = freeSpace / maxButtons;
		return buttonWidth;
	}

	getCanvasHeight() {
		const totalPaddingCanvas = ( this.backdropPadding * 2 );
		const totalPaddingLines = this.buttonMargin * ( lines.length - 1 );
		const buttonsHeight = this.buttonBaseHeight * lines.length;
		const canvasHeight = totalPaddingCanvas + totalPaddingLines + buttonsHeight;
		return canvasHeight;
	}

	getCanvasPercentWidth( percent ) {
		return ( percent * this.canvasWidth / 100 );
	}


	createCanvas( width, height, show ) {
		const canvasEl = document.createElement( 'canvas' );
		canvasEl.width = width;
		canvasEl.height = height;

		//const context = canvasEl.getContext( 'bitmaprenderer' );

		let style = '';
		style += `position:absolute;width:${width}px;height:${height}px;`;
		style += 'margin:auto; top:0; left:0; right:0; bottom:0;';
		style += 'background-color: transparent; opacity: 0.999;';
		//style += 'zoom: 0.5;';
		if ( !show )
			style += 'visibility:hidden; z-index: 1000;';
		canvasEl.style = style;

		document.body.appendChild( canvasEl );
		this.canvasEl = canvasEl;

		return canvasEl;
	}

	isWebWorker() {
		// run this in global scope of window or worker. since window.self = window, we're ok
		// eslint-disable-next-line no-undef
		if ( typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope ) return true;
		return false;
	}

	createPixiApp() {

		// disable pixijs pointer/mouse/touch listeners
		PIXI.InteractionManager.prototype.addEvents = new Function();
		PIXI.InteractionManager.prototype.removeEvents = new Function();

		this.pixiApp = new PIXI.Application( {
			view: this.canvasEl,
			backgroundAlpha: 0,
			backgroundColor: 0x000000,
			width: this.canvasWidth,
			height: this.canvasHeight,
			autoStart: false,
			interactive: true
			//legacy: true,
			//clearBeforeRender: true,
			//forceCanvas:true,
			//interactive:true,
			//autoResize: true,
			//powerPreference: 'high-performance'
		} );
	}

	createBackdrop( width, height, radius, padding, fillColor ) {
		this.backdrop = this.createPanel( width, height, radius, padding, fillColor );
		this.backdrop.name = 'backdrop';
		this.pixiApp.stage.addChild( this.backdrop );
	}

	createButtons() {
		let firstLine = true;
		let firstKey = true;
		let accumulateX = 0;
		let accumulateY = 0;
		let button;
		let width = this.buttonBaseWidth;
		let height = this.buttonBaseHeight;
		let radius = this.buttonRadius;

		lines.forEach( ( line ) => {
			firstKey = true;
			line.forEach( ( key ) => {
				if ( firstLine ) accumulateY = this.backdropPadding;
				if ( firstKey ) accumulateX = this.backdropPadding;

				// compute button width
				width = this.buttonBaseWidth * ( key.width );
				width += this.buttonMargin * ( key.width - 1 );

				// create button
				button = this.createButton( width, height, radius, this.buttonPadding, this.buttonColor, key.chars );

				// position the button
				button.position.x = accumulateX;
				button.position.y = accumulateY;

				// add the button to his container
				this.backdrop.addChild( button );

				firstKey = false;
				accumulateX += width + this.buttonMargin;
			} );
			firstLine = false;
			accumulateY += height + this.buttonMargin;
		} );
	}

	createPanel( width, height, radius, padding, fillColor ) {
		const panel = new PIXI.Graphics();
		panel.boundsPadding = 100;

		panel.lineStyle( { alignment: 0, width: 1, color: 0x5a28C6, alpha: 0.8 } );
		panel.beginFill( fillColor, 1 );
		panel.drawRoundedRect( padding, padding, width - padding, height - padding, radius );
		panel.endFill();
		panel.interactive = true;
		return panel;
	}


	createButton( width, height, radius, padding, fillColor, str ) {
		const button = this.createPanel( width, height, radius, padding, fillColor );
		button.name = 'key ' + str;

		// text
		button.text = new PIXI.Text( str, this.buttonFont );
		button.text.interactive = false;
		button.text.style.fill = this.buttonColorText;

		// center the text.
		// please do not move lines order
		button.addChild( button.text );
		button.text.anchor.set( 0.5 );
		button.text.centerXY();

		return button;
	}

	getMaxButtons() {
		let max = 0;
		lines.forEach( ( line ) => {
			let tmp = 0;
			line.forEach( key => tmp += key.width );
			if ( tmp > max ) max = tmp;
		} );
		return max;
	}

	round2( v ) {
		return Math.round( v * 100 ) / 100;
	}

}

function init() {
	new Keyboard( {
		showCanvas: true
	} );
}

