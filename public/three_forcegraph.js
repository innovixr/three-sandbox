import App from './App.js';
import ThreeForceGraph from 'three-forcegraph';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';
import { GUI } from 'lil-gui';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

window.addEventListener( 'load', () => {
	new Experience();
} );

const data = {
	nodes: [
		{
			id: 1,
			text: 'innovacode.com',
			type: 'domain',
			val: 1,
			color:'#0055FF',
		},
		{
			id: 2,
			text: '46.105.124.12',
			type: 'ipv4',
			val: 0.5,
			color: '#CC00FF',
		},
		{
			id: 3,
			text: 'webrtc',
			type: 'subdomain',
			color: '#00CCFF',
			val: 0.5
		},
		{
			id: 4,
			text: 'npm',
			type: 'subdomain',
			color: '#00CCFF',
			val: 0.5
		},
		{
			id: 5,
			text: 'www',
			type: 'subdomain',
			color: '#00CCFF',
			val: 0.5
		},
		{
			id: 6,
			text: '443\nhttps',
			type: 'port',
			val: 0.5,
			color: '#CCFF00',
		},
		{
			id: 7,
			text: '80\nhttp',
			type: 'port',
			val: 0.5,
			color: '#CCFF00',
		},
	],
	links: [
		{ source: 1, target: 2 },
		{ source: 2, target: 3 },
		{ source: 2, target: 4 },
		{ source: 2, target: 5 },
		{ source: 3, target: 6 },
		{ source: 3, target: 7 },
		{ source: 4, target: 6 },
		{ source: 4, target: 7 },
		{ source: 5, target: 6 },
		{ source: 5, target: 7 },
	]
};

const gdata = {
	nodes: [],
	links: []
};

class Experience {

	constructor() {

		this.app = new App( { grid: true } );
		//setTimeout( this.addData.bind( this ) );
		this.app.addTicker( this.loop.bind( this ) );

		this.app.raycasterRegisterEvents( 'graph event', this.onRaycasterEvent.bind( this ) );

		// create an AudioListener and add it to the camera
		const listener = new THREE.AudioListener();
		this.app.camera.add( listener );

		// create a global audio source
		this.sounds = {
			bg: new THREE.Audio( listener )
		};

		this.addGraph();

		// load a sound and set it as the Audio object's buffer
		const audioLoader = new THREE.AudioLoader();
		/*
		audioLoader.load( 'assets/sounds/bg_cricket2.mp3', buffer => {
			this.sounds.bg.setBuffer( buffer );
			this.sounds.bg.setLoop( true );
			this.sounds.bg.setVolume( 0.02 );
			this.sounds.bg.play();
		} );
		*/
		audioLoader.load( 'assets/sounds/hover4.wav', buffer => {
			this.graph.children.forEach( child => {
				if ( child.name != 'groupnode' ) return;
				const audio = new THREE.PositionalAudio( listener );
				audio.setBuffer( buffer );
				audio.setVolume( 1 );
				//console.log( 'adding sound to child', child );
				child.add( audio );
				child.audio = audio;
			} );
		} );

		//this.addExrBackground();

	}

	addExrBackground() {
		const pmremGenerator = new THREE.PMREMGenerator( this.app.renderer );
		pmremGenerator.compileEquirectangularShader();

		new EXRLoader()
			.load( 'assets/moonless_golf_4k.exr', texture => {
				const exrCubeRenderTarget = pmremGenerator.fromEquirectangular( texture );
				this.app.scene.background = exrCubeRenderTarget.texture;
				this.app.scene.environment = exrCubeRenderTarget.texture;
				texture.dispose();
			} );
	}

	addGraph() {

		this.resolution = 16;
		this.dagMode = 'td';
		this.graph = new ThreeForceGraph()
			//.onNodeHover( this.focus.bind( this ) )
			.nodeResolution( this.resolution )
			// td, bu, lr, rl, zin, zout, radialin, radialout
			//.dagMode( 'zout' )
			//.forceEngine( 'd3' )
			//.d3VelocityDecay( 0.9 )
			//d3AlphaDecay( 0.01 )
			.dagMode( this.dagMode )
			.dagLevelDistance( 30 )
			//.linkDirectionalParticles( 3 )
			//.linkDirectionalParticleSpeed( d => 0.001 )
			//.linkDirectionalParticleWidth( 0.8 )
			//.linkDirectionalParticleResolution( 4 )
			//.linkDirectionalParticleColor( () => '#6666AA' )
			.nodeThreeObject( this.sphereMesh.bind( this ) )
			.linkWidth( 0.4 )
			.linkOpacity( 0.4 )
			.linkColor( () => 'rgba(100,100,255,0.8)' )
			//.onNodeClick( this.removeNode.bind( this ) )
			.graphData( data );

		this.graph.scale.x = 0.005;
		this.graph.scale.y = 0.005;
		this.graph.scale.z = 0.005;

		this.graph.position.z = -0.6;
		this.graph.position.y = 1.2;

		this.app.scene.add( this.graph );

		// main light
		//this.light = new THREE.PointLight( 0xFFFFFF, 10, 5 );
		//this.light.position.set( 0, 5.2, 0 );
		//this.app.scene.add( this.light );

		const GUIForceGraph = this.gui.addFolder( 'Force Graph' );
		GUIForceGraph.add(
			this,
			'dagMode',
			{
				td: 'td',
				bu: 'bu',
				lr: 'lr',
				rl: 'rl',
				zin: 'zin',
				zout: 'zout',
				radialin: 'radialin',
				radialout: 'radialout'
			}
		).onChange( value => {
			this.graph.dagMode( value );
		} );

	}

	onRaycasterEvent( el, ev ) {
		if ( !el )
		{
			if ( this.nodeHovered )
			{
				this.onRaycasterLeave( this.nodeHovered );
				this.nodeHovered = null;
			}
			return;
		}

		if ( !el.object.name ) return;

		if ( this.nodeHovered != el.object.parent )
		{
			if ( this.nodeHovered ) this.onRaycasterLeave( this.nodeHovered );
			this.nodeHovered = el.object.parent;
			this.onRaycasterEnter( this.nodeHovered );
		}
	}

	onRaycasterEnter( nodeGroup ) {
		console.log( 'onRaycasterEnter', nodeGroup );
		this.app.renderer.domElement.style.cursor = 'pointer';
		this.hoverNodeScale = this.hoverNodeScale || new THREE.Vector3( 2, 2, 2 );
		this.hoverAnimation = this.hoverAnimation || TWEEN.Easing.Quartic.Out;
		nodeGroup.tween = new TWEEN.Tween( nodeGroup.scale )
			.to( this.hoverNodeScale )
			.easing( this.hoverAnimation )
			.start();
		nodeGroup.audio.play();
	}

	onRaycasterLeave( nodeGroup ) {
		console.log( 'onRaycasterLeave', nodeGroup );
		this.app.renderer.domElement.style.cursor = 'default';
		this.hoverNodeScaleDefault = this.hoverNodeScaleDefault || new THREE.Vector3( 1, 1, 1 );
		nodeGroup.tween?.stop();
		nodeGroup.audio?.stop();
		new TWEEN.Tween( nodeGroup.scale )
			.to( this.hoverNodeScaleDefault )
			.easing( this.hoverAnimation )
			.start();
	}

	addData() {

		/*
		data.nodes.push( {
			id: i,
			text: Date.now(),
			type: 'subdomain',
			val: 0.5,
			color: '#00CCFF',
		} );

		data.links.push( {
			source: 1,
			target: i
		} );

		data.links.push( {
			source: i,
			target: 5
		} );

		this.graph.graphData( data );
		*/
	}

	loop( ) {
		this.graph.tickFrame();
		this.graph.rotation.y += 0.002;
		TWEEN.update();
		return true;
	}

	focus( node ) {
		/*
		const distance = 40;
		const distRatio = 1 + distance / Math.hypot( node.x, node.y, node.z );

		const newPos = node.x || node.y || node.z
			? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }
			: { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

		this.graph.cameraPosition(
			newPos, // new position
			node, // lookAt ({ x, y, z })
			3000  // ms transition duration
		);
			*/
		node.__threeObj.scale.x = 2;
	}

	sphereMesh( node ) {
		const c = 5;
		const sphereGlowSize = ( node.val * c ) + 0.6;
		const sphereSize = node.val * c;

		// Glow sphere mesh.
		const geometry = new THREE.SphereBufferGeometry( sphereGlowSize, this.resolution, this.resolution );
		const material = new THREE.MeshPhongMaterial( { color: node.color || '#FF0000', transparent: true, opacity: 0.4 } );
		const sphereGlow = new THREE.Mesh( geometry, material );
		sphereGlow.name = 'sphereGlow';

		// Smaller solid sphere mesh.
		const d = 1;
		const geometrySolid = new THREE.SphereBufferGeometry( sphereSize, this.resolution / d, this.resolution / d );
		const materialSolid = new THREE.MeshBasicMaterial( { color: node.color || '#FF0000', transparent: false, opacity: 1 } );
		const sphere = new THREE.Mesh( geometrySolid, materialSolid );
		sphere.name = 'sphere';

		const sprite = new SpriteText( node.text );
		sprite.color = '#FFFFFF77';
		sprite.backgroundColor = '#111111CC';
		sprite.fontSize = 90;
		sprite.fontWeight = 'normal'; // weight
		//sprite.borderWidth = 0.5;
		//sprite.borderRadius = 5;
		sprite.borderColor = '#00AAFF66';
		sprite.padding = 2;
		sprite.textHeight = 1 * ( node.val * 4 );
		sprite.center.y = 1.7;
		//sprite.position.z = 8;
		sprite.name = 'label ' + node.text;

		// Place the smaller solid sphere inside the large glow sphere.
		const group = new THREE.Group();
		group.add( sphere );
		group.add( sphereGlow );
		group.add( sprite );

		group.node = node;
		group.name = 'groupnode';

		this.app.raycasterIncludeMesh( group );
		return group;
	}

	removeNode( node ) {
		let { nodes, links } = this.graph.graphData();
		// Remove links attached to node
		links = links.filter( l => l.source !== node && l.target !== node );

		// Remove node
		nodes.splice( node.id, 1 );

		// Reset node ids to array index
		nodes.forEach( ( n, idx ) => { n.id = idx; } );
		this.graph.graphData( { nodes, links } );
	}

}

Experience.prototype.gui = new GUI();
