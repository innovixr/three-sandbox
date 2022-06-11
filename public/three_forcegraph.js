import App from './App.js';
import ThreeForceGraph from 'three-forcegraph';
import SpriteText from 'three-spritetext';
//import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';
import { InteractiveGroup } from 'three/examples/jsm/interactive/InteractiveGroup';
import { GUI } from 'lil-gui';

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
			text: 'webrtc.innovacode.com',
			type: 'subdomain',
			color: '#00CCFF',
			val: 0.5
		},
		{
			id: 3,
			text: 'npm.innovacode.com',
			type: 'subdomain',
			color: '#00CCFF',
			val: 0.5
		},
		{
			id: 4,
			text: 'www.innovacode.com',
			type: 'subdomain',
			color: '#00CCFF',
			val: 0.5
		},
		{
			id: 5,
			text: '46.105.124.12',
			type: 'ipv4',
			val: 0.3,
			color: '#CC00FF',
		},
		{
			id: 6,
			text: '443\nhttps',
			type: 'port',
			val: 0.1,
			color: '#CCFF00',
		},
		{
			id: 7,
			text: '80\nhttp',
			type: 'port',
			val: 0.1,
			color: '#CCFF00',
		},
	],
	links: [
		{ source: 1, target: 2 },
		{ source: 1, target: 3 },
		{ source: 1, target: 4 },
		{ source: 2, target: 5 },
		{ source: 3, target: 5 },
		{ source: 4, target: 5 },
		{ source: 5, target: 6 },
		{ source: 5, target: 7 },
	]
};

class Experience {

	constructor() {

		this.app = new App( { grid: true } );
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
			.linkDirectionalParticles( 3 )
			.linkDirectionalParticleSpeed( d => 0.001 )
			.linkDirectionalParticleWidth( 0.8 )
			.linkDirectionalParticleResolution( 4 )
			.linkDirectionalParticleColor( () => '#6666AA' )
			.linkWidth( 0.2 )
			.nodeThreeObject( this.sphereMesh.bind( this ) )
			.linkOpacity( 0.4 )
			.linkColor( () => 'rgba(100,100,255,0.5)' )
			//.onNodeClick( this.removeNode.bind( this ) )
			.graphData( data );



		this.graph.scale.x = 0.005;
		this.graph.scale.y = 0.005;
		this.graph.scale.z = 0.005;

		this.graph.position.z = -0.6;
		this.graph.position.y = 1.2;

		this.app.scene.add( this.graph );
		this.app.addTicker( this.loop.bind( this ) );

		// main light
		this.light = new THREE.PointLight( 0xFFFFFF, 0.2, 5 );
		this.light.position.set( 0, 1.2, 0 );
		this.app.scene.add( this.light );

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

		let i = 8;
		const ct = setInterval( () => {
			i++;
			if ( i === 8 + 5 ) clearInterval( ct );
			data.nodes.push( {
				id: i,
				text: Date.now() + '.innovacode.com',
				type: 'subdomain',
				val: 0.5,
				color: '#00CCFF',
			} );
			data.links.push( {
				source: 1,
				target: i
			} );
			this.graph.graphData( data );

		}, 1000 );

		//const group = new InteractiveGroup( this.app.renderer, this.app.camera );
		//group.add( this.graph );
		//this.app.scene.add( group );
	}

	loop() {
		this.graph.tickFrame();
		this.graph.rotation.y += 0.002;
		return true;
	}

	focus( node ) {
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
	}

	sphereMesh( node ) {
		// Glow sphere mesh.
		const c = 5;
		const glowSize = ( node.val * c ) + 0.8;
		const sphereSize = node.val * c;

		const geometry = new THREE.SphereBufferGeometry( glowSize, this.resolution, this.resolution );
		const material = new THREE.MeshPhongMaterial( {
			color: node.color || '#FF0000',
			transparent: true,
			opacity: 0.3
		} );
		const glowEffect = new THREE.Mesh( geometry, material );
		glowEffect.name = 'glow';

		// Smaller solid sphere mesh.
		const geometrySolid = new THREE.SphereBufferGeometry( sphereSize, this.resolution, this.resolution );
		const materialSolid = new THREE.MeshPhongMaterial( {
			color: node.color || '#FF0000',
			transparent: false,
			opacity: 1.0
		} );
		const mesh = new THREE.Mesh( geometrySolid, materialSolid );
		mesh.name = 'node';
		mesh.castShadow = true;

		// Place the smaller solid sphere inside the large glow sphere.
		const group = new THREE.Group();
		group.add( mesh );
		group.add( glowEffect );

		const sprite = new SpriteText( node.text );
		sprite.color = '#FFFFFF77';
		sprite.backgroundColor = '#FFFFFF05';
		sprite.fontSize = 90;
		sprite.fontWeight = 'normal'; // weight
		//sprite.borderWidth = 0.5;
		//sprite.borderRadius = 5;
		sprite.borderColor = '#00AAFF66';
		sprite.padding = 2;
		sprite.textHeight = 1 * ( node.val * 4 );
		sprite.center.y = 1.7;
		//sprite.position.z = 8;

		sprite.castShadow = true;
		group.add( sprite );

		return group;
	}

	textMesh( node ) {
		const sprite = new SpriteText( node.text );
		sprite.color = '#FFFFFFFF';
		sprite.backgroundColor = '#FFFFFF22';
		sprite.fontSize = 90;
		sprite.fontWeight = 'normal'; // weight
		sprite.borderWidth = 0.5;
		//sprite.borderRadius = 5;
		sprite.borderColor = '#00AAFF66';
		sprite.padding = 3;
		sprite.textHeight = 8;
		sprite.center.y = 1.7;

		return sprite;
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
