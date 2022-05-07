const canvas = document.createElement( 'canvas' );
canvas.width = 500;
canvas.height = 500;

let style = '';
style += 'position:absolute;width:500px;height:500px;';
style += 'margin-left:auto; ;margin-right:auto; top:10%; left:0; right:0; ';
style += 'border:1px solid rgba(255, 255, 255, 0.5);background-color: white; opacity: 0.999;z-index: 10;';

canvas.style = style;

document.body.appendChild( canvas );

const offscreen = canvas.transferControlToOffscreen();
const pixiWorker = new Worker( new URL( './pixi_worker.js', import.meta.url ) );

pixiWorker.postMessage( {
	canvas: offscreen,
	width: 500,
	height: 500,
}, [ offscreen ] );
