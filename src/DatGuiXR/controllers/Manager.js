import { Raycaster } from 'three';
import { MouseController } from './Mouse.js';
import { XRControllers } from './XR.js';
import { Test } from '../utils/Test.js';

class ControllersManager {

	constructor( ctx, config ) {
		//console.assert( rootPanel instanceof CanvasUI, `${this.constructor.name}: constructor: "rootPanel" should be an instance of CanvasUI` );

		this.ctx = ctx;
		this.ctx.controllersManager = this;
		this.config = config;
		this.renderer = ctx.renderer;

		// store datGuiXR instances, related to intersects
		this.datGuiXRInstances = [];
		this.intersectsDatGuiXRMeshes = [];

		// a unique raycaster
		this.raycaster = this.ctx.raycaster = new Raycaster();

		// 0(left)/1(right) controller hovered element. Mouse is index 0;
		this.intersects = [ undefined, undefined ];
		this.hoveredElements = [ undefined, undefined ];
		this.scrollData = [ undefined, undefined ];
		this.selectPressed = [ false, false ];

		this.initControllers();
	}

	initControllers() {

		const controllerConfig = {
			select: this.onControllerSelectDelayed.bind( this ),
			selectstart: this.onControllerSelectStart.bind( this ),
			selectend: this.onControllerSelectEnd.bind( this )
		};

		this.xrControllers = new XRControllers( this.ctx,  controllerConfig );
		this.mouseController = Test.isDefined( this.config.mouseHandler ) ?  new MouseController( this.ctx, controllerConfig ) : undefined;
	}

	intersectInclude( instance ) {
		//console.debug( `${this.constructor.name}: intersectInclude`, instance );
		this.datGuiXRInstances.unshift( instance );
		this.intersectsDatGuiXRMeshes.unshift( instance.mesh );
	}

	intersectExclude( instance ) {
		//console.debug( `${this.constructor.name}: intersectExclude ${instance}` );
		let p = this.intersectsDatGuiXRMeshes.indexOf( instance );
		if ( p > -1 ) {
			this.intersectsDatGuiXRMeshes.splice( p, 1 );
		}
	}

	getAllMeshes() {
		return this.meshes;
	}

	isHovered( widget ) {
		if (
			this.hoveredElements[0] &&
            this.hoveredElements[0].el === widget
		) return true;

		if (
			this.hoveredElements[1] &&
            this.hoveredElements[1].el === widget
		) return true;

		return false;
	}

	getCurrentHoveredEl( index ) {
		if ( this.hoveredElements[index] ) {
			return this.hoveredElements[index].el;
		}
	}

	getCurrentHoveredItem( index ) {
		return this.hoveredElements[index];
	}

	hover( instance, index = 0, uv ) {
		const currentHoveredItem = this.getCurrentHoveredItem( index );

		if ( !Test.isDefined( uv ) ) {
			if ( currentHoveredItem ) {
				this.raycasterLeaveElement( instance, currentHoveredItem, index );
			}
			return;
		}

		const pixelCanvasCoordinate = this.getPixelCanvasCoordinate( instance, uv );
		const hoveredEl = this.getElementAtLocation( instance.config , pixelCanvasCoordinate.x, pixelCanvasCoordinate.y );
		//console.debug( `hover uv:${uv.x.toFixed(2)},${uv.y.toFixed(2)}>>texturePos:${x.toFixed(0)}, ${y.toFixed(0)}`);

		//console.debug( `${this.constructor.name}: hover`, hoveredEl );

		if ( hoveredEl === null ) {
			if ( Test.isDefined( currentHoveredItem ) ) {
				this.raycasterLeaveElement( instance, currentHoveredItem, index );
			}
			return;
		}

		if ( Test.isDefined( currentHoveredItem ) ) {
			if ( currentHoveredItem.el !== hoveredEl ) {
				this.raycasterLeaveElement( instance, currentHoveredItem, index );
			}
		} else {
			this.raycasterEnterElement( instance, hoveredEl, index );
		}
	}

	testRaycasterIntersects( instance, index, pointerDown ) {

		//console.assert( instance instanceof CanvasUI, `${this.constructor.name}: testRaycasterIntersects: instance should be an instance of CanvasUI` );
		//console.assert( instance.raycaster instanceof Raycaster, `${this.constructor.name}: testRaycasterIntersects: instance.raycaster should be an instance of THREE.Raycaster` );

		// we use recursive intersectObjects with potential hidden canvasUImeshes (like input+keyboard)
		const intersects = instance.raycaster.intersectObjects( this.intersectsDatGuiXRMeshes, false );

		let intersectData = {};
		for ( intersectData of intersects ) {
			if ( !intersectData.object.visible ) {
				intersectData = {};
				continue;
			} else {
				break;
			}
		}

		let hoveredInstance = null;
		if ( intersectData && intersectData.object && intersectData.object.canvasUIInstance ) {
			hoveredInstance = intersectData.object.canvasUIInstance;
		}

		if ( hoveredInstance === null ) {
			this.hover( instance, index );
			this.intersects[index] = undefined;
			this.scroll( instance, index );
			return;
		}


		const hoveredEl = this.getCurrentHoveredEl( index );
		//console.debug( `${this.constructor.name}: testRaycasterIntersects`, hoveredEl);

		this.hover( hoveredInstance, index, intersectData.uv );
		this.intersects[index] = intersectData;
		this.scroll( hoveredInstance, index );

		if ( hoveredEl ) this.handleScroll( instance, index, hoveredEl );

	}

	getPixelCanvasCoordinate( instance, uv ) {
		const x = uv.x * instance.config.width;
		const y = ( 1 - uv.y ) * instance.config.height;
		return { x, y };
	}

	hoverElementUnset( index ) {
		this.hoveredElements[index] = undefined;
	}

	hoverElementSet( index, instance, el ) {
		this.hoveredElements[index] = { el, instance };
	}

	raycasterEnterElement( instance, item, index ) {
		if ( !Test.isDefined( item ) ) return;
		console.debug( `${this.constructor.name}: raycasterEnterElement`, item );

		//this.setcontrollerRepeatMode( instance.config.controllerRepeatMode );

		item.onRaycasterEnter && item.onRaycasterEnter();
		this.hoverElementSet( index, instance, item );
		instance.needsUpdate = true;
		document.body.style.cursor = 'pointer';
	}

	raycasterLeaveElement( instance, item, index ) {
		if ( !Test.isDefined( item ) ) return;
		console.debug( `${this.constructor.name}: raycasterLeaveElement`, item.el );
		item.el.onRaycasterLeave && item.el.onRaycasterLeave();
		//this.setcontrollerRepeatMode();

		this.hoverElementUnset( index );
		instance.needsUpdate = true;
		document.body.style.cursor = 'default';
	}

	intersectMeshShowAt( instance, index, position ) {
		if ( instance.intersectMesh ) {
			instance.intersectMesh[index].visible = true;
			instance.intersectMesh[index].position.copy( position );
		}
	}

	intersectMeshHide( instance, index ) {
		if ( instance.intersectMesh && instance.intersectMesh[index].visible ) {
			instance.intersectMesh[index].visible = false;
		}
	}

	scroll( instance, index ) {

	}

	select( instance, index = 0 ) {
		const hoveredEl = this.getCurrentHoveredEl( index );
		if ( Test.isDefined( hoveredEl ) ) {
			if ( hoveredEl.onSelect ) hoveredEl.onSelect();
			if ( hoveredEl.type === 'input-text' ) {
				instance.keyboard.visible = true;
			} else {
				if ( hoveredEl.type != 'button' ) {
					instance.hoveredElements[index] = undefined;
				}
			}
		}
	}

	getControllerEventIndex( event ) {
		let index = 0; // mouse index is 0
		if ( this.renderer.xr.isPresenting ) {
			index = ( event.target === this.controller ) ? 0 : 1;
		}
		return index;
	}



	onControllerSelect( instance, event, firstTime ) {
		const index = this.getControllerEventIndex( event );
		const hoveredEl = this.getCurrentHoveredEl( index );
		if ( !Test.isDefined( hoveredEl ) ) {
			//this.setcontrollerRepeatMode();
			//console.debug( `${this.constructor.name}: onControllerSelect not select, no element hovered !` );
			return;
		}

		console.debug( `${this.constructor.name}: onControllerSelect`, event.type, hoveredEl );

		if ( hoveredEl.type === 'button' ) {
			this.select( instance, index );
			return;
		}

		if ( hoveredEl.type === 'picker' ) {
			const coordinates = this.getIntersect( instance, index );
			hoveredEl.picker.onSelect( coordinates );
			instance.needsUpdate = true;
			return;
		}

		if ( hoveredEl.type === 'slider' ) {
			if ( this.selectPressed[index] ) {
				hoveredEl.slider.setValueFromPos( this.getIntersectX( instance, index ) );
				instance.needsUpdate = true;
			}
			return;
		}

		if ( hoveredEl.type == 'input-text' ) {
			if ( instance.keyboard ) {
				if ( Test.isEmptyString( instance.content[ hoveredEl.contentName ] ) ) {
					// remove placeholder
					instance.updateElement( hoveredEl.contentName, '' );
				}
				instance.keyboard.toggleVisibility( instance, hoveredEl );
			}
		}

		this.handleScroll( instance, index, hoveredEl );

	}

	onControllerSelectDelayed( instance, event ) {

		//console.debug( `${this.constructor.name}: onControllerSelect: (${this.controllerRepeatMode.intervalms}ms) in ${this.controllerRepeatMode.timeoutms}ms` );

		if ( event.type === 'mousemove' ) {
			console.log( this.previousEvent, event.type );

			if ( this.previousEvent === event.type ) {
				return;
			}
		}

		this.previousEvent = event.type;

		if ( !Test.isDefined( this.controllerRepeatMode?.timeoutms ) ) {
			if ( Test.isDefined( this.controllerRepeatMode?.intervalms ) ) {
				//console.debug( `${this.constructor.name}: onControllerSelectDelayed: start repeater #1 ${this.controllerRepeatModeDefaultString} (${this.controllerRepeatMode.intervalms}ms) in ${this.controllerRepeatMode.timeoutms}ms` );
				this.timerSelectRepeat = setInterval( () => {
					this.onControllerSelect( instance, event );
				}, this.controllerRepeatMode.intervalms );
				return;
			} else {
				//console.debug( `${this.constructor.name}: onControllerSelectDelayed: execute now` );
				this.onControllerSelect( instance, event );
				return;
			}
		}

		this.timerSelect = setTimeout( () => {
			//console.debug( `${this.constructor.name}: onControllerSelectDelayed: start repeater #2 ${this.controllerRepeatModeDefaultString} (${this.controllerRepeatMode.intervalms}ms) in ${this.controllerRepeatMode.timeoutms}ms` );
			this.timerSelectRepeat = setInterval( () => {
				this.onControllerSelect( instance, event );
			}, this.controllerRepeatMode.intervalms );
		}, this.controllerRepeatMode.timeoutms );
	}

	handleScroll( instance, index, hoveredEl ) {

		/*
		if ( hoveredEl.overflow === 'scroll' ) {
			this.scrollData[index] = {
				scrollY: hoveredEl.scrollY,
				rayY: this.getIntersectY( instance, index )
			};

			this.needsUpdate = true;
			instance.needsUpdate = true;
			console.log( 'handlescroll', this.scrollData[ index ] );
			this.scroll( instance, index );
		}
		*/
	}

	onControllerSelectStart( instance, event ) {
		const index = this.getControllerEventIndex( event );
		const hoveredEl = this.getCurrentHoveredEl( index );
		this.selectPressed[index] = true;

		if ( !Test.isDefined( hoveredEl ) ) {
			//console.debug( `${this.constructor.name}: onControllerSelectStart: no element hovered` );
			//this.setcontrollerRepeatMode();
			//return;
		}

		//console.debug( `${this.constructor.name}: onControllerSelectStart:`, event.type, hoveredEl );
		this.handleScroll( instance, index, hoveredEl );
	}

	onControllerSelectEnd( instance, event ) {
		const index = this.getControllerEventIndex( event );
		const hoveredEl = this.getCurrentHoveredEl( index );
		this.selectPressed[index] = false;
		//this.setcontrollerRepeatMode();

		if ( !Test.isDefined( hoveredEl ) ) {
			//console.debug( `${this.constructor.name}: onControllerSelectEnd, no element hovered` );
			return;
		}

		//console.debug( `${this.constructor.name}: onControllerSelectEnd`, event.type, hoveredEl );
		if ( hoveredEl.overflow === 'scroll' ) {
			this.scrollData[index] = undefined;
		}
	}

	getIntersectX( instance, index ) {
		const width = instance.config.width;
		const intersect = this.intersects[index];
		if ( intersect === undefined ) return 0;
		if ( intersect.uv === undefined ) return 0;
		return intersect.uv.x * width;
	}

	getIntersectY( instance, index ) {
		const height = instance.config.height;
		const intersect = this.intersects[index];

		if ( !Test.isDefined( intersect ) ) return 0;
		if ( !Test.isDefined( intersect.uv ) ) return 0;
		return ( 1 - intersect.uv.y ) * height;
	}

	getIntersect( instance, index ) {
		const width = instance.config.width;
		const height = instance.config.height;
		const intersect = this.intersects[index];
		const pt = { x:0, y:0 };
		if ( !Test.isDefined( intersect ) ) return pt;
		if ( !Test.isDefined( intersect.uv ) ) return pt;
		pt.x = intersect.uv.x * width;
		pt.y = ( 1 - intersect.uv.y ) * height;
		return pt;
	}

}

export {
	ControllersManager
};


