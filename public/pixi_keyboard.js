//import * as THREE from 'three';
//import App from './App.js';
//import KIT from 'three-kit';

import * as PIXI from 'pixi.js-legacy';
import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';
import '../src/DatGuiXR/pixi/center.js';

window.addEventListener( 'load', init );

console.clear();

const lines = [
	[
		{ width: 0.1, chars: 'A' },
		{ width: 0.1, chars: 'Z' },
		{ width: 0.1, chars: 'E' },
		{ width: 0.1, chars: 'R' },
		{ width: 0.1, chars: 'T' },
		{ width: 0.1, chars: 'Y' },
		{ width: 0.1, chars: 'U' },
		{ width: 0.1, chars: 'I' },
		{ width: 0.1, chars: 'O' },
		{ width: 0.1, chars: 'P' }
	],
	[
		{ width: 0.1, chars: 'Q' },
		{ width: 0.1, chars: 'S' },
		{ width: 0.1, chars: 'D' },
		{ width: 0.1, chars: 'F' },
		{ width: 0.1, chars: 'G' },
		{ width: 0.1, chars: 'H' },
		{ width: 0.1, chars: 'J' },
		{ width: 0.1, chars: 'K' },
		{ width: 0.1, chars: 'L' },
		{ width: 0.1, chars: 'M' }
	],
	[
		{ width: 0.2, chars: 'up' },
		{ width: 0.1, chars: 'W' },
		{ width: 0.1, chars: 'X' },
		{ width: 0.1, chars: 'C' },
		{ width: 0.1, chars: 'V' },
		{ width: 0.1, chars: 'B' },
		{ width: 0.1, chars: 'N' },
		{ width: 0.2, chars: 'back' }
	],
	[
		{ width: 0.2, chars: '.?12' },
		{ width: 0.1, chars: ',' },
		{ width: 0.4, chars: 'space' },
		{ width: 0.1, chars: '.' },
		{ width: 0.2, chars: 'enter' }
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
		this.backdropColor = 0x030303;

		this.buttonMargin = this.getCanvasPercentWidth( 1 );
		this.buttonBaseWidth = this.getButtonBaseWidth();
		this.buttonRadius = this.getCanvasPercentWidth( 1 );
		this.buttonBaseHeight = this.buttonBaseWidth;
		this.buttonColor = 0x444444;
		this.buttonColorText = 0xFFFFFF;
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
		this.createBackdrop( this.canvasWidth, this.canvasHeight, this.backdropRadius, this.backdropColor );
		this.createButtons();

		//console.log( `base width = ${this.buttonBaseWidth}, height = ${this.buttonBaseHeight}, canvas height = ${this.canvasHeight}` );
		document.body.style.backgroundColor = '#505050';
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

	createPixiApp() {
		this.pixiApp = new PIXI.Application( {
			view: this.canvasEl,
			backgroundAlpha: 0,
			backgroundColor: 0x000000,
			width: this.canvasWidth,
			height: this.canvasHeight,
			//legacy: true,
			//clearBeforeRender: true,
			//forceCanvas:true,
			//interactive:true,
			//autoResize: true,
			//powerPreference: 'high-performance'
		} );
	}

	createBackdrop( width, height, radius, fillColor ) {
		this.backdrop = this.createPanel( width, height, radius, fillColor );
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
				key.width = key.width * 10;
				width = this.buttonBaseWidth * ( key.width );
				width += this.buttonMargin * ( key.width - 1 );

				// create button
				button = this.createButton( width, height, radius, this.buttonColor, key.chars );

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

	createPanel( width, height, radius, fillColor ) {
		const panel = new PIXI.Graphics();
		//panel.lineStyle( { alignment: 0, width: 5, color: 0x2222FF, alpha: 0.2 } );
		panel.beginFill( fillColor, 0.8 );
		panel.drawRoundedRect( 0, 0, width, height, radius );
		panel.endFill();
		return panel;
	}


	createButton( width, height, radius, fillColor, str ) {
		const button = this.createPanel( width, height, radius, fillColor );

		if ( this.filters?.bloom )
		{
			button.filters = [ new AdvancedBloomFilter( this.filters.bloom ) ];
		}

		const text = new PIXI.Text( str, this.buttonFont );
		text.style.fill = this.buttonColorText;
		button.addChild( text );
		text.anchor.set( 0.5 );
		text.centerXY();
		return button;
	}

	getMaxButtons() {
		let max = 0;
		lines.forEach( ( line ) => {
			let tmp = 0;
			line.forEach( key => tmp += key.width * 10 );
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

