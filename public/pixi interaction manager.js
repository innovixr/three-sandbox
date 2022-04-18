/**
 * The interaction manager deals with mouse, touch and pointer events.
 *
 * Any DisplayObject can be interactive if its `interactive` property is set to true.
 *
 * This manager also supports multitouch.
 *
 * An instance of this class is automatically created by default, and can be found at `renderer.plugins.interaction`
 *
 * @memberof PIXI
 */
let InteractionManager = /** @class */ ( function ( _super ) {
	__extends( InteractionManager, _super );
	/**
     * @param {PIXI.CanvasRenderer|PIXI.Renderer} renderer - A reference to the current renderer
     * @param options - The options for the manager.
     * @param {boolean} [options.autoPreventDefault=true] - Should the manager automatically prevent default browser actions.
     * @param {number} [options.interactionFrequency=10] - Maximum frequency (ms) at pointer over/out states will be checked.
     * @param {number} [options.useSystemTicker=true] - Whether to add {@link tickerUpdate} to {@link PIXI.Ticker.system}.
     */
	function InteractionManager( renderer, options ) {
		let _this = _super.call( this ) || this;
		options = options || {};
		_this.renderer = renderer;
		_this.autoPreventDefault = options.autoPreventDefault !== undefined ? options.autoPreventDefault : true;
		_this.interactionFrequency = options.interactionFrequency || 10;
		_this.mouse = new InteractionData();
		_this.mouse.identifier = MOUSE_POINTER_ID;
		// setting the mouse to start off far off screen will mean that mouse over does
		//  not get called before we even move the mouse.
		_this.mouse.global.set( -999999 );
		_this.activeInteractionData = {};
		_this.activeInteractionData[ MOUSE_POINTER_ID ] = _this.mouse;
		_this.interactionDataPool = [];
		_this.eventData = new InteractionEvent();
		_this.interactionDOMElement = null;
		_this.moveWhenInside = false;
		_this.eventsAdded = false;
		_this.tickerAdded = false;
		_this.mouseOverRenderer = !( 'PointerEvent' in globalThis );
		_this.supportsTouchEvents = 'ontouchstart' in globalThis;
		_this.supportsPointerEvents = !!globalThis.PointerEvent;
		// this will make it so that you don't have to call bind all the time
		_this.onPointerUp = _this.onPointerUp.bind( _this );
		_this.processPointerUp = _this.processPointerUp.bind( _this );
		_this.onPointerCancel = _this.onPointerCancel.bind( _this );
		_this.processPointerCancel = _this.processPointerCancel.bind( _this );
		_this.onPointerDown = _this.onPointerDown.bind( _this );
		_this.processPointerDown = _this.processPointerDown.bind( _this );
		_this.onPointerMove = _this.onPointerMove.bind( _this );
		_this.processPointerMove = _this.processPointerMove.bind( _this );
		_this.onPointerOut = _this.onPointerOut.bind( _this );
		_this.processPointerOverOut = _this.processPointerOverOut.bind( _this );
		_this.onPointerOver = _this.onPointerOver.bind( _this );
		_this.cursorStyles = {
			default: 'inherit',
			pointer: 'pointer',
		};
		_this.currentCursorMode = null;
		_this.cursor = null;
		_this.resolution = 1;
		_this.delayedEvents = [];
		_this.search = new TreeSearch();
		_this._tempDisplayObject = new _pixi_display__WEBPACK_IMPORTED_MODULE_2__.TemporaryDisplayObject();
		_this._eventListenerOptions = { capture: true, passive: false };
		/**
         * Fired when a pointer device button (usually a mouse left-button) is pressed on the display
         * object.
         *
         * @event PIXI.InteractionManager#mousedown
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
         * on the display object.
         *
         * @event PIXI.InteractionManager#rightdown
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device button (usually a mouse left-button) is released over the display
         * object.
         *
         * @event PIXI.InteractionManager#mouseup
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device secondary button (usually a mouse right-button) is released
         * over the display object.
         *
         * @event PIXI.InteractionManager#rightup
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device button (usually a mouse left-button) is pressed and released on
         * the display object.
         *
         * @event PIXI.InteractionManager#click
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
         * and released on the display object.
         *
         * @event PIXI.InteractionManager#rightclick
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device button (usually a mouse left-button) is released outside the
         * display object that initially registered a
         * [mousedown]{@link PIXI.InteractionManager#event:mousedown}.
         *
         * @event PIXI.InteractionManager#mouseupoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device secondary button (usually a mouse right-button) is released
         * outside the display object that initially registered a
         * [rightdown]{@link PIXI.InteractionManager#event:rightdown}.
         *
         * @event PIXI.InteractionManager#rightupoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device (usually a mouse) is moved while over the display object
         *
         * @event PIXI.InteractionManager#mousemove
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device (usually a mouse) is moved onto the display object
         *
         * @event PIXI.InteractionManager#mouseover
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device (usually a mouse) is moved off the display object
         *
         * @event PIXI.InteractionManager#mouseout
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device button is pressed on the display object.
         *
         * @event PIXI.InteractionManager#pointerdown
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device button is released over the display object.
         * Not always fired when some buttons are held down while others are released. In those cases,
         * use [mousedown]{@link PIXI.InteractionManager#event:mousedown} and
         * [mouseup]{@link PIXI.InteractionManager#event:mouseup} instead.
         *
         * @event PIXI.InteractionManager#pointerup
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when the operating system cancels a pointer event
         *
         * @event PIXI.InteractionManager#pointercancel
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device button is pressed and released on the display object.
         *
         * @event PIXI.InteractionManager#pointertap
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device button is released outside the display object that initially
         * registered a [pointerdown]{@link PIXI.InteractionManager#event:pointerdown}.
         *
         * @event PIXI.InteractionManager#pointerupoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device is moved while over the display object
         *
         * @event PIXI.InteractionManager#pointermove
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device is moved onto the display object
         *
         * @event PIXI.InteractionManager#pointerover
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device is moved off the display object
         *
         * @event PIXI.InteractionManager#pointerout
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a touch point is placed on the display object.
         *
         * @event PIXI.InteractionManager#touchstart
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a touch point is removed from the display object.
         *
         * @event PIXI.InteractionManager#touchend
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when the operating system cancels a touch
         *
         * @event PIXI.InteractionManager#touchcancel
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a touch point is placed and removed from the display object.
         *
         * @event PIXI.InteractionManager#tap
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a touch point is removed outside of the display object that initially
         * registered a [touchstart]{@link PIXI.InteractionManager#event:touchstart}.
         *
         * @event PIXI.InteractionManager#touchendoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a touch point is moved along the display object.
         *
         * @event PIXI.InteractionManager#touchmove
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device button (usually a mouse left-button) is pressed on the display.
         * object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#mousedown
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
         * on the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#rightdown
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device button (usually a mouse left-button) is released over the display
         * object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#mouseup
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device secondary button (usually a mouse right-button) is released
         * over the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#rightup
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device button (usually a mouse left-button) is pressed and released on
         * the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#click
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
         * and released on the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#rightclick
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device button (usually a mouse left-button) is released outside the
         * display object that initially registered a
         * [mousedown]{@link PIXI.DisplayObject#event:mousedown}.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#mouseupoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device secondary button (usually a mouse right-button) is released
         * outside the display object that initially registered a
         * [rightdown]{@link PIXI.DisplayObject#event:rightdown}.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#rightupoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device (usually a mouse) is moved while over the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#mousemove
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device (usually a mouse) is moved onto the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#mouseover
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device (usually a mouse) is moved off the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#mouseout
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device button is pressed on the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointerdown
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device button is released over the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointerup
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when the operating system cancels a pointer event.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointercancel
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device button is pressed and released on the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointertap
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device button is released outside the display object that initially
         * registered a [pointerdown]{@link PIXI.DisplayObject#event:pointerdown}.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointerupoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device is moved while over the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointermove
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device is moved onto the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointerover
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a pointer device is moved off the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointerout
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a touch point is placed on the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#touchstart
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a touch point is removed from the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#touchend
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when the operating system cancels a touch.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#touchcancel
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a touch point is placed and removed from the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#tap
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a touch point is removed outside of the display object that initially
         * registered a [touchstart]{@link PIXI.DisplayObject#event:touchstart}.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#touchendoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		/**
         * Fired when a touch point is moved along the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#touchmove
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
		_this._useSystemTicker = options.useSystemTicker !== undefined ? options.useSystemTicker : true;
		_this.setTargetElement( _this.renderer.view, _this.renderer.resolution );
		return _this;
	}
	Object.defineProperty( InteractionManager.prototype, 'useSystemTicker', {
		/**
         * Should the InteractionManager automatically add {@link tickerUpdate} to {@link PIXI.Ticker.system}.
         *
         * @default true
         */
		get: function () {
			return this._useSystemTicker;
		},
		set: function ( useSystemTicker ) {
			this._useSystemTicker = useSystemTicker;
			if ( useSystemTicker )
			{
				this.addTickerListener();
			}
			else
			{
				this.removeTickerListener();
			}
		},
		enumerable: false,
		configurable: true
	} );
	Object.defineProperty( InteractionManager.prototype, 'lastObjectRendered', {
		/**
         * Last rendered object or temp object.
         *
         * @readonly
         * @protected
         */
		get: function () {
			return this.renderer._lastObjectRendered || this._tempDisplayObject;
		},
		enumerable: false,
		configurable: true
	} );
	/**
     * Hit tests a point against the display tree, returning the first interactive object that is hit.
     *
     * @param globalPoint - A point to hit test with, in global space.
     * @param root - The root display object to start from. If omitted, defaults
     * to the last rendered root of the associated renderer.
     * @return - The hit display object, if any.
     */
	InteractionManager.prototype.hitTest = function ( globalPoint, root ) {
		// clear the target for our hit test
		hitTestEvent.target = null;
		// assign the global point
		hitTestEvent.data.global = globalPoint;
		// ensure safety of the root
		if ( !root )
		{
			root = this.lastObjectRendered;
		}
		// run the hit test
		this.processInteractive( hitTestEvent, root, null, true );
		// return our found object - it'll be null if we didn't hit anything
		return hitTestEvent.target;
	};
	/**
     * Sets the DOM element which will receive mouse/touch events. This is useful for when you have
     * other DOM elements on top of the renderers Canvas element. With this you'll be bale to delegate
     * another DOM element to receive those events.
     *
     * @param element - the DOM element which will receive mouse and touch events.
     * @param resolution - The resolution / device pixel ratio of the new element (relative to the canvas).
     */
	InteractionManager.prototype.setTargetElement = function ( element, resolution ) {
		if ( resolution === void 0 ) { resolution = 1; }
		this.removeTickerListener();
		this.removeEvents();
		this.interactionDOMElement = element;
		this.resolution = resolution;
		this.addEvents();
		this.addTickerListener();
	};
	/** Adds the ticker listener. */
	InteractionManager.prototype.addTickerListener = function () {
		if ( this.tickerAdded || !this.interactionDOMElement || !this._useSystemTicker )
		{
			return;
		}
		_pixi_ticker__WEBPACK_IMPORTED_MODULE_1__.Ticker.system.add( this.tickerUpdate, this, _pixi_ticker__WEBPACK_IMPORTED_MODULE_1__.UPDATE_PRIORITY.INTERACTION );
		this.tickerAdded = true;
	};
	/** Removes the ticker listener. */
	InteractionManager.prototype.removeTickerListener = function () {
		if ( !this.tickerAdded )
		{
			return;
		}
		_pixi_ticker__WEBPACK_IMPORTED_MODULE_1__.Ticker.system.remove( this.tickerUpdate, this );
		this.tickerAdded = false;
	};
	/** Registers all the DOM events. */
	InteractionManager.prototype.addEvents = function () {
		if ( this.eventsAdded || !this.interactionDOMElement )
		{
			return;
		}
		let style = this.interactionDOMElement.style;
		if ( globalThis.navigator.msPointerEnabled )
		{
			style.msContentZooming = 'none';
			style.msTouchAction = 'none';
		}
		else if ( this.supportsPointerEvents )
		{
			style.touchAction = 'none';
		}
		/*
         * These events are added first, so that if pointer events are normalized, they are fired
         * in the same order as non-normalized events. ie. pointer event 1st, mouse / touch 2nd
         */
		if ( this.supportsPointerEvents )
		{
			globalThis.document.addEventListener( 'pointermove', this.onPointerMove, this._eventListenerOptions );
			this.interactionDOMElement.addEventListener( 'pointerdown', this.onPointerDown, this._eventListenerOptions );
			// pointerout is fired in addition to pointerup (for touch events) and pointercancel
			// we already handle those, so for the purposes of what we do in onPointerOut, we only
			// care about the pointerleave event
			this.interactionDOMElement.addEventListener( 'pointerleave', this.onPointerOut, this._eventListenerOptions );
			this.interactionDOMElement.addEventListener( 'pointerover', this.onPointerOver, this._eventListenerOptions );
			globalThis.addEventListener( 'pointercancel', this.onPointerCancel, this._eventListenerOptions );
			globalThis.addEventListener( 'pointerup', this.onPointerUp, this._eventListenerOptions );
		}
		else
		{
			globalThis.document.addEventListener( 'mousemove', this.onPointerMove, this._eventListenerOptions );
			this.interactionDOMElement.addEventListener( 'mousedown', this.onPointerDown, this._eventListenerOptions );
			this.interactionDOMElement.addEventListener( 'mouseout', this.onPointerOut, this._eventListenerOptions );
			this.interactionDOMElement.addEventListener( 'mouseover', this.onPointerOver, this._eventListenerOptions );
			globalThis.addEventListener( 'mouseup', this.onPointerUp, this._eventListenerOptions );
		}
		// always look directly for touch events so that we can provide original data
		// In a future version we should change this to being just a fallback and rely solely on
		// PointerEvents whenever available
		if ( this.supportsTouchEvents )
		{
			this.interactionDOMElement.addEventListener( 'touchstart', this.onPointerDown, this._eventListenerOptions );
			this.interactionDOMElement.addEventListener( 'touchcancel', this.onPointerCancel, this._eventListenerOptions );
			this.interactionDOMElement.addEventListener( 'touchend', this.onPointerUp, this._eventListenerOptions );
			this.interactionDOMElement.addEventListener( 'touchmove', this.onPointerMove, this._eventListenerOptions );
		}
		this.eventsAdded = true;
	};
	/** Removes all the DOM events that were previously registered. */
	InteractionManager.prototype.removeEvents = function () {
		if ( !this.eventsAdded || !this.interactionDOMElement )
		{
			return;
		}
		let style = this.interactionDOMElement.style;
		if ( globalThis.navigator.msPointerEnabled )
		{
			style.msContentZooming = '';
			style.msTouchAction = '';
		}
		else if ( this.supportsPointerEvents )
		{
			style.touchAction = '';
		}
		if ( this.supportsPointerEvents )
		{
			globalThis.document.removeEventListener( 'pointermove', this.onPointerMove, this._eventListenerOptions );
			this.interactionDOMElement.removeEventListener( 'pointerdown', this.onPointerDown, this._eventListenerOptions );
			this.interactionDOMElement.removeEventListener( 'pointerleave', this.onPointerOut, this._eventListenerOptions );
			this.interactionDOMElement.removeEventListener( 'pointerover', this.onPointerOver, this._eventListenerOptions );
			globalThis.removeEventListener( 'pointercancel', this.onPointerCancel, this._eventListenerOptions );
			globalThis.removeEventListener( 'pointerup', this.onPointerUp, this._eventListenerOptions );
		}
		else
		{
			globalThis.document.removeEventListener( 'mousemove', this.onPointerMove, this._eventListenerOptions );
			this.interactionDOMElement.removeEventListener( 'mousedown', this.onPointerDown, this._eventListenerOptions );
			this.interactionDOMElement.removeEventListener( 'mouseout', this.onPointerOut, this._eventListenerOptions );
			this.interactionDOMElement.removeEventListener( 'mouseover', this.onPointerOver, this._eventListenerOptions );
			globalThis.removeEventListener( 'mouseup', this.onPointerUp, this._eventListenerOptions );
		}
		if ( this.supportsTouchEvents )
		{
			this.interactionDOMElement.removeEventListener( 'touchstart', this.onPointerDown, this._eventListenerOptions );
			this.interactionDOMElement.removeEventListener( 'touchcancel', this.onPointerCancel, this._eventListenerOptions );
			this.interactionDOMElement.removeEventListener( 'touchend', this.onPointerUp, this._eventListenerOptions );
			this.interactionDOMElement.removeEventListener( 'touchmove', this.onPointerMove, this._eventListenerOptions );
		}
		this.interactionDOMElement = null;
		this.eventsAdded = false;
	};
	/**
     * Updates the state of interactive objects if at least {@link interactionFrequency}
     * milliseconds have passed since the last invocation.
     *
     * Invoked by a throttled ticker update from {@link PIXI.Ticker.system}.
     *
     * @param deltaTime - time delta since the last call
     */
	InteractionManager.prototype.tickerUpdate = function ( deltaTime ) {
		this._deltaTime += deltaTime;
		if ( this._deltaTime < this.interactionFrequency )
		{
			return;
		}
		this._deltaTime = 0;
		this.update();
	};
	/** Updates the state of interactive objects. */
	InteractionManager.prototype.update = function () {
		if ( !this.interactionDOMElement )
		{
			return;
		}
		// if the user move the mouse this check has already been done using the mouse move!
		if ( this._didMove )
		{
			this._didMove = false;
			return;
		}
		this.cursor = null;
		// Resets the flag as set by a stopPropagation call. This flag is usually reset by a user interaction of any kind,
		// but there was a scenario of a display object moving under a static mouse cursor.
		// In this case, mouseover and mouseevents would not pass the flag test in dispatchEvent function
		for ( let k in this.activeInteractionData )
		{
			// eslint-disable-next-line no-prototype-builtins
			if ( this.activeInteractionData.hasOwnProperty( k ) )
			{
				let interactionData = this.activeInteractionData[ k ];
				if ( interactionData.originalEvent && interactionData.pointerType !== 'touch' )
				{
					let interactionEvent = this.configureInteractionEventForDOMEvent( this.eventData, interactionData.originalEvent, interactionData );
					this.processInteractive( interactionEvent, this.lastObjectRendered, this.processPointerOverOut, true );
				}
			}
		}
		this.setCursorMode( this.cursor );
	};
	/**
     * Sets the current cursor mode, handling any callbacks or CSS style changes.
     *
     * @param mode - cursor mode, a key from the cursorStyles dictionary
     */
	InteractionManager.prototype.setCursorMode = function ( mode ) {
		mode = mode || 'default';
		let applyStyles = true;
		// offscreen canvas does not support setting styles, but cursor modes can be functions,
		// in order to handle pixi rendered cursors, so we can't bail
		if ( globalThis.OffscreenCanvas && this.interactionDOMElement instanceof OffscreenCanvas )
		{
			applyStyles = false;
		}
		// if the mode didn't actually change, bail early
		if ( this.currentCursorMode === mode )
		{
			return;
		}
		this.currentCursorMode = mode;
		let style = this.cursorStyles[ mode ];
		// only do things if there is a cursor style for it
		if ( style )
		{
			switch ( typeof style )
			{
			case 'string':
				// string styles are handled as cursor CSS
				if ( applyStyles )
				{
					this.interactionDOMElement.style.cursor = style;
				}
				break;
			case 'function':
				// functions are just called, and passed the cursor mode
				style( mode );
				break;
			case 'object':
				// if it is an object, assume that it is a dictionary of CSS styles,
				// apply it to the interactionDOMElement
				if ( applyStyles )
				{
					Object.assign( this.interactionDOMElement.style, style );
				}
				break;
			}
		}
		else if ( applyStyles && typeof mode === 'string' && !Object.prototype.hasOwnProperty.call( this.cursorStyles, mode ) )
		{
			// if it mode is a string (not a Symbol) and cursorStyles doesn't have any entry
			// for the mode, then assume that the dev wants it to be CSS for the cursor.
			this.interactionDOMElement.style.cursor = mode;
		}
	};
	/**
     * Dispatches an event on the display object that was interacted with.
     *
     * @param displayObject - the display object in question
     * @param eventString - the name of the event (e.g, mousedown)
     * @param eventData - the event data object
     */
	InteractionManager.prototype.dispatchEvent = function ( displayObject, eventString, eventData ) {
		// Even if the event was stopped, at least dispatch any remaining events
		// for the same display object.
		if ( !eventData.stopPropagationHint || displayObject === eventData.stopsPropagatingAt )
		{
			eventData.currentTarget = displayObject;
			eventData.type = eventString;
			displayObject.emit( eventString, eventData );
			if ( displayObject[ eventString ] )
			{
				displayObject[ eventString ]( eventData );
			}
		}
	};
	/**
     * Puts a event on a queue to be dispatched later. This is used to guarantee correct
     * ordering of over/out events.
     *
     * @param displayObject - the display object in question
     * @param eventString - the name of the event (e.g, mousedown)
     * @param eventData - the event data object
     */
	InteractionManager.prototype.delayDispatchEvent = function ( displayObject, eventString, eventData ) {
		this.delayedEvents.push( { displayObject: displayObject, eventString: eventString, eventData: eventData } );
	};
	/**
     * Maps x and y coords from a DOM object and maps them correctly to the PixiJS view. The
     * resulting value is stored in the point. This takes into account the fact that the DOM
     * element could be scaled and positioned anywhere on the screen.
     *
     * @param point - the point that the result will be stored in
     * @param x - the x coord of the position to map
     * @param y - the y coord of the position to map
     */
	InteractionManager.prototype.mapPositionToPoint = function ( point, x, y ) {
		let rect;
		// IE 11 fix
		if ( !this.interactionDOMElement.parentElement )
		{
			rect = {
				x: 0,
				y: 0,
				width: this.interactionDOMElement.width,
				height: this.interactionDOMElement.height,
				left: 0,
				top: 0
			};
		}
		else
		{
			rect = this.interactionDOMElement.getBoundingClientRect();
		}
		let resolutionMultiplier = 1.0 / this.resolution;
		point.x = ( ( x - rect.left ) * ( this.interactionDOMElement.width / rect.width ) ) * resolutionMultiplier;
		point.y = ( ( y - rect.top ) * ( this.interactionDOMElement.height / rect.height ) ) * resolutionMultiplier;
	};
	/**
     * This function is provides a neat way of crawling through the scene graph and running a
     * specified function on all interactive objects it finds. It will also take care of hit
     * testing the interactive objects and passes the hit across in the function.
     *
     * @protected
     * @param interactionEvent - event containing the point that
     *  is tested for collision
     * @param displayObject - the displayObject
     *  that will be hit test (recursively crawls its children)
     * @param func - the function that will be called on each interactive object. The
     *  interactionEvent, displayObject and hit will be passed to the function
     * @param hitTest - indicates whether we want to calculate hits
     *  or just iterate through all interactive objects
     */
	InteractionManager.prototype.processInteractive = function ( interactionEvent, displayObject, func, hitTest ) {
		let hit = this.search.findHit( interactionEvent, displayObject, func, hitTest );
		let delayedEvents = this.delayedEvents;
		if ( !delayedEvents.length )
		{
			return hit;
		}
		// Reset the propagation hint, because we start deeper in the tree again.
		interactionEvent.stopPropagationHint = false;
		let delayedLen = delayedEvents.length;
		this.delayedEvents = [];
		for ( let i = 0; i < delayedLen; i++ )
		{
			let _a = delayedEvents[ i ], displayObject_1 = _a.displayObject, eventString = _a.eventString, eventData = _a.eventData;
			// When we reach the object we wanted to stop propagating at,
			// set the propagation hint.
			if ( eventData.stopsPropagatingAt === displayObject_1 )
			{
				eventData.stopPropagationHint = true;
			}
			this.dispatchEvent( displayObject_1, eventString, eventData );
		}
		return hit;
	};
	/**
     * Is called when the pointer button is pressed down on the renderer element
     *
     * @param originalEvent - The DOM event of a pointer button being pressed down
     */
	InteractionManager.prototype.onPointerDown = function ( originalEvent ) {
		// if we support touch events, then only use those for touch events, not pointer events
		if ( this.supportsTouchEvents && originalEvent.pointerType === 'touch' )
		{ return; }
		let events = this.normalizeToPointerData( originalEvent );
		/*
         * No need to prevent default on natural pointer events, as there are no side effects
         * Normalized events, however, may have the double mousedown/touchstart issue on the native android browser,
         * so still need to be prevented.
         */
		// Guaranteed that there will be at least one event in events, and all events must have the same pointer type
		if ( this.autoPreventDefault && events[ 0 ].isNormalized )
		{
			let cancelable = originalEvent.cancelable || !( 'cancelable' in originalEvent );
			if ( cancelable )
			{
				originalEvent.preventDefault();
			}
		}
		let eventLen = events.length;
		for ( let i = 0; i < eventLen; i++ )
		{
			let event = events[ i ];
			let interactionData = this.getInteractionDataForPointerId( event );
			let interactionEvent = this.configureInteractionEventForDOMEvent( this.eventData, event, interactionData );
			interactionEvent.data.originalEvent = originalEvent;
			this.processInteractive( interactionEvent, this.lastObjectRendered, this.processPointerDown, true );
			this.emit( 'pointerdown', interactionEvent );
			if ( event.pointerType === 'touch' )
			{
				this.emit( 'touchstart', interactionEvent );
			}
			// emit a mouse event for "pen" pointers, the way a browser would emit a fallback event
			else if ( event.pointerType === 'mouse' || event.pointerType === 'pen' )
			{
				let isRightButton = event.button === 2;
				this.emit( isRightButton ? 'rightdown' : 'mousedown', this.eventData );
			}
		}
	};
	/**
     * Processes the result of the pointer down check and dispatches the event if need be
     *
     * @param interactionEvent - The interaction event wrapping the DOM event
     * @param displayObject - The display object that was tested
     * @param hit - the result of the hit test on the display object
     */
	InteractionManager.prototype.processPointerDown = function ( interactionEvent, displayObject, hit ) {
		let data = interactionEvent.data;
		let id = interactionEvent.data.identifier;
		if ( hit )
		{
			if ( !displayObject.trackedPointers[ id ] )
			{
				displayObject.trackedPointers[ id ] = new InteractionTrackingData( id );
			}
			this.dispatchEvent( displayObject, 'pointerdown', interactionEvent );
			if ( data.pointerType === 'touch' )
			{
				this.dispatchEvent( displayObject, 'touchstart', interactionEvent );
			}
			else if ( data.pointerType === 'mouse' || data.pointerType === 'pen' )
			{
				let isRightButton = data.button === 2;
				if ( isRightButton )
				{
					displayObject.trackedPointers[ id ].rightDown = true;
				}
				else
				{
					displayObject.trackedPointers[ id ].leftDown = true;
				}
				this.dispatchEvent( displayObject, isRightButton ? 'rightdown' : 'mousedown', interactionEvent );
			}
		}
	};
	/**
     * Is called when the pointer button is released on the renderer element
     *
     * @param originalEvent - The DOM event of a pointer button being released
     * @param cancelled - true if the pointer is cancelled
     * @param func - Function passed to {@link processInteractive}
     */
	InteractionManager.prototype.onPointerComplete = function ( originalEvent, cancelled, func ) {
		let events = this.normalizeToPointerData( originalEvent );
		let eventLen = events.length;
		// if the event wasn't targeting our canvas, then consider it to be pointerupoutside
		// in all cases (unless it was a pointercancel)
		let eventAppend = originalEvent.target !== this.interactionDOMElement ? 'outside' : '';
		for ( let i = 0; i < eventLen; i++ )
		{
			let event = events[ i ];
			let interactionData = this.getInteractionDataForPointerId( event );
			let interactionEvent = this.configureInteractionEventForDOMEvent( this.eventData, event, interactionData );
			interactionEvent.data.originalEvent = originalEvent;
			// perform hit testing for events targeting our canvas or cancel events
			this.processInteractive( interactionEvent, this.lastObjectRendered, func, cancelled || !eventAppend );
			this.emit( cancelled ? 'pointercancel' : 'pointerup' + eventAppend, interactionEvent );
			if ( event.pointerType === 'mouse' || event.pointerType === 'pen' )
			{
				let isRightButton = event.button === 2;
				this.emit( isRightButton ? 'rightup' + eventAppend : 'mouseup' + eventAppend, interactionEvent );
			}
			else if ( event.pointerType === 'touch' )
			{
				this.emit( cancelled ? 'touchcancel' : 'touchend' + eventAppend, interactionEvent );
				this.releaseInteractionDataForPointerId( event.pointerId );
			}
		}
	};
	/**
     * Is called when the pointer button is cancelled
     *
     * @param event - The DOM event of a pointer button being released
     */
	InteractionManager.prototype.onPointerCancel = function ( event ) {
		// if we support touch events, then only use those for touch events, not pointer events
		if ( this.supportsTouchEvents && event.pointerType === 'touch' )
		{ return; }
		this.onPointerComplete( event, true, this.processPointerCancel );
	};
	/**
     * Processes the result of the pointer cancel check and dispatches the event if need be
     *
     * @param interactionEvent - The interaction event wrapping the DOM event
     * @param displayObject - The display object that was tested
     */
	InteractionManager.prototype.processPointerCancel = function ( interactionEvent, displayObject ) {
		let data = interactionEvent.data;
		let id = interactionEvent.data.identifier;
		if ( displayObject.trackedPointers[ id ] !== undefined )
		{
			delete displayObject.trackedPointers[ id ];
			this.dispatchEvent( displayObject, 'pointercancel', interactionEvent );
			if ( data.pointerType === 'touch' )
			{
				this.dispatchEvent( displayObject, 'touchcancel', interactionEvent );
			}
		}
	};
	/**
     * Is called when the pointer button is released on the renderer element
     *
     * @param event - The DOM event of a pointer button being released
     */
	InteractionManager.prototype.onPointerUp = function ( event ) {
		// if we support touch events, then only use those for touch events, not pointer events
		if ( this.supportsTouchEvents && event.pointerType === 'touch' )
		{ return; }
		this.onPointerComplete( event, false, this.processPointerUp );
	};
	/**
     * Processes the result of the pointer up check and dispatches the event if need be
     *
     * @param interactionEvent - The interaction event wrapping the DOM event
     * @param displayObject - The display object that was tested
     * @param hit - the result of the hit test on the display object
     */
	InteractionManager.prototype.processPointerUp = function ( interactionEvent, displayObject, hit ) {
		let data = interactionEvent.data;
		let id = interactionEvent.data.identifier;
		let trackingData = displayObject.trackedPointers[ id ];
		let isTouch = data.pointerType === 'touch';
		let isMouse = ( data.pointerType === 'mouse' || data.pointerType === 'pen' );
		// need to track mouse down status in the mouse block so that we can emit
		// event in a later block
		let isMouseTap = false;
		// Mouse only
		if ( isMouse )
		{
			let isRightButton = data.button === 2;
			let flags = InteractionTrackingData.FLAGS;
			let test = isRightButton ? flags.RIGHT_DOWN : flags.LEFT_DOWN;
			let isDown = trackingData !== undefined && ( trackingData.flags & test );
			if ( hit )
			{
				this.dispatchEvent( displayObject, isRightButton ? 'rightup' : 'mouseup', interactionEvent );
				if ( isDown )
				{
					this.dispatchEvent( displayObject, isRightButton ? 'rightclick' : 'click', interactionEvent );
					// because we can confirm that the mousedown happened on this object, flag for later emit of pointertap
					isMouseTap = true;
				}
			}
			else if ( isDown )
			{
				this.dispatchEvent( displayObject, isRightButton ? 'rightupoutside' : 'mouseupoutside', interactionEvent );
			}
			// update the down state of the tracking data
			if ( trackingData )
			{
				if ( isRightButton )
				{
					trackingData.rightDown = false;
				}
				else
				{
					trackingData.leftDown = false;
				}
			}
		}
		// Pointers and Touches, and Mouse
		if ( hit )
		{
			this.dispatchEvent( displayObject, 'pointerup', interactionEvent );
			if ( isTouch )
			{ this.dispatchEvent( displayObject, 'touchend', interactionEvent ); }
			if ( trackingData )
			{
				// emit pointertap if not a mouse, or if the mouse block decided it was a tap
				if ( !isMouse || isMouseTap )
				{
					this.dispatchEvent( displayObject, 'pointertap', interactionEvent );
				}
				if ( isTouch )
				{
					this.dispatchEvent( displayObject, 'tap', interactionEvent );
					// touches are no longer over (if they ever were) when we get the touchend
					// so we should ensure that we don't keep pretending that they are
					trackingData.over = false;
				}
			}
		}
		else if ( trackingData )
		{
			this.dispatchEvent( displayObject, 'pointerupoutside', interactionEvent );
			if ( isTouch )
			{ this.dispatchEvent( displayObject, 'touchendoutside', interactionEvent ); }
		}
		// Only remove the tracking data if there is no over/down state still associated with it
		if ( trackingData && trackingData.none )
		{
			delete displayObject.trackedPointers[ id ];
		}
	};
	/**
     * Is called when the pointer moves across the renderer element
     *
     * @param originalEvent - The DOM event of a pointer moving
     */
	InteractionManager.prototype.onPointerMove = function ( originalEvent ) {
		// if we support touch events, then only use those for touch events, not pointer events
		if ( this.supportsTouchEvents && originalEvent.pointerType === 'touch' )
		{ return; }
		let events = this.normalizeToPointerData( originalEvent );
		if ( events[ 0 ].pointerType === 'mouse' || events[ 0 ].pointerType === 'pen' )
		{
			this._didMove = true;
			this.cursor = null;
		}
		let eventLen = events.length;
		for ( let i = 0; i < eventLen; i++ )
		{
			let event = events[ i ];
			let interactionData = this.getInteractionDataForPointerId( event );
			let interactionEvent = this.configureInteractionEventForDOMEvent( this.eventData, event, interactionData );
			interactionEvent.data.originalEvent = originalEvent;
			this.processInteractive( interactionEvent, this.lastObjectRendered, this.processPointerMove, true );
			this.emit( 'pointermove', interactionEvent );
			if ( event.pointerType === 'touch' )
			{ this.emit( 'touchmove', interactionEvent ); }
			if ( event.pointerType === 'mouse' || event.pointerType === 'pen' )
			{ this.emit( 'mousemove', interactionEvent ); }
		}
		if ( events[ 0 ].pointerType === 'mouse' )
		{
			this.setCursorMode( this.cursor );
			// TODO BUG for parents interactive object (border order issue)
		}
	};
	/**
     * Processes the result of the pointer move check and dispatches the event if need be
     *
     * @param interactionEvent - The interaction event wrapping the DOM event
     * @param displayObject - The display object that was tested
     * @param hit - the result of the hit test on the display object
     */
	InteractionManager.prototype.processPointerMove = function ( interactionEvent, displayObject, hit ) {
		let data = interactionEvent.data;
		let isTouch = data.pointerType === 'touch';
		let isMouse = ( data.pointerType === 'mouse' || data.pointerType === 'pen' );
		if ( isMouse )
		{
			this.processPointerOverOut( interactionEvent, displayObject, hit );
		}
		if ( !this.moveWhenInside || hit )
		{
			this.dispatchEvent( displayObject, 'pointermove', interactionEvent );
			if ( isTouch )
			{ this.dispatchEvent( displayObject, 'touchmove', interactionEvent ); }
			if ( isMouse )
			{ this.dispatchEvent( displayObject, 'mousemove', interactionEvent ); }
		}
	};
	/**
     * Is called when the pointer is moved out of the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer being moved out
     */
	InteractionManager.prototype.onPointerOut = function ( originalEvent ) {
		// if we support touch events, then only use those for touch events, not pointer events
		if ( this.supportsTouchEvents && originalEvent.pointerType === 'touch' )
		{ return; }
		let events = this.normalizeToPointerData( originalEvent );
		// Only mouse and pointer can call onPointerOut, so events will always be length 1
		let event = events[ 0 ];
		if ( event.pointerType === 'mouse' )
		{
			this.mouseOverRenderer = false;
			this.setCursorMode( null );
		}
		let interactionData = this.getInteractionDataForPointerId( event );
		let interactionEvent = this.configureInteractionEventForDOMEvent( this.eventData, event, interactionData );
		interactionEvent.data.originalEvent = event;
		this.processInteractive( interactionEvent, this.lastObjectRendered, this.processPointerOverOut, false );
		this.emit( 'pointerout', interactionEvent );
		if ( event.pointerType === 'mouse' || event.pointerType === 'pen' )
		{
			this.emit( 'mouseout', interactionEvent );
		}
		else
		{
			// we can get touchleave events after touchend, so we want to make sure we don't
			// introduce memory leaks
			this.releaseInteractionDataForPointerId( interactionData.identifier );
		}
	};
	/**
     * Processes the result of the pointer over/out check and dispatches the event if need be.
     *
     * @param interactionEvent - The interaction event wrapping the DOM event
     * @param displayObject - The display object that was tested
     * @param hit - the result of the hit test on the display object
     */
	InteractionManager.prototype.processPointerOverOut = function ( interactionEvent, displayObject, hit ) {
		let data = interactionEvent.data;
		let id = interactionEvent.data.identifier;
		let isMouse = ( data.pointerType === 'mouse' || data.pointerType === 'pen' );
		let trackingData = displayObject.trackedPointers[ id ];
		// if we just moused over the display object, then we need to track that state
		if ( hit && !trackingData )
		{
			trackingData = displayObject.trackedPointers[ id ] = new InteractionTrackingData( id );
		}
		if ( trackingData === undefined )
		{ return; }
		if ( hit && this.mouseOverRenderer )
		{
			if ( !trackingData.over )
			{
				trackingData.over = true;
				this.delayDispatchEvent( displayObject, 'pointerover', interactionEvent );
				if ( isMouse )
				{
					this.delayDispatchEvent( displayObject, 'mouseover', interactionEvent );
				}
			}
			// only change the cursor if it has not already been changed (by something deeper in the
			// display tree)
			if ( isMouse && this.cursor === null )
			{
				this.cursor = displayObject.cursor;
			}
		}
		else if ( trackingData.over )
		{
			trackingData.over = false;
			this.dispatchEvent( displayObject, 'pointerout', this.eventData );
			if ( isMouse )
			{
				this.dispatchEvent( displayObject, 'mouseout', interactionEvent );
			}
			// if there is no mouse down information for the pointer, then it is safe to delete
			if ( trackingData.none )
			{
				delete displayObject.trackedPointers[ id ];
			}
		}
	};
	/**
     * Is called when the pointer is moved into the renderer element.
     *
     * @param originalEvent - The DOM event of a pointer button being moved into the renderer view.
     */
	InteractionManager.prototype.onPointerOver = function ( originalEvent ) {
		let events = this.normalizeToPointerData( originalEvent );
		// Only mouse and pointer can call onPointerOver, so events will always be length 1
		let event = events[ 0 ];
		let interactionData = this.getInteractionDataForPointerId( event );
		let interactionEvent = this.configureInteractionEventForDOMEvent( this.eventData, event, interactionData );
		interactionEvent.data.originalEvent = event;
		if ( event.pointerType === 'mouse' )
		{
			this.mouseOverRenderer = true;
		}
		this.emit( 'pointerover', interactionEvent );
		if ( event.pointerType === 'mouse' || event.pointerType === 'pen' )
		{
			this.emit( 'mouseover', interactionEvent );
		}
	};
	/**
     * Get InteractionData for a given pointerId. Store that data as well.
     *
     * @param event - Normalized pointer event, output from normalizeToPointerData.
     * @return - Interaction data for the given pointer identifier.
     */
	InteractionManager.prototype.getInteractionDataForPointerId = function ( event ) {
		let pointerId = event.pointerId;
		let interactionData;
		if ( pointerId === MOUSE_POINTER_ID || event.pointerType === 'mouse' )
		{
			interactionData = this.mouse;
		}
		else if ( this.activeInteractionData[ pointerId ] )
		{
			interactionData = this.activeInteractionData[ pointerId ];
		}
		else
		{
			interactionData = this.interactionDataPool.pop() || new InteractionData();
			interactionData.identifier = pointerId;
			this.activeInteractionData[ pointerId ] = interactionData;
		}
		// copy properties from the event, so that we can make sure that touch/pointer specific
		// data is available
		interactionData.copyEvent( event );
		return interactionData;
	};
	/**
     * Return unused InteractionData to the pool, for a given pointerId
     *
     * @param pointerId - Identifier from a pointer event
     */
	InteractionManager.prototype.releaseInteractionDataForPointerId = function ( pointerId ) {
		let interactionData = this.activeInteractionData[ pointerId ];
		if ( interactionData )
		{
			delete this.activeInteractionData[ pointerId ];
			interactionData.reset();
			this.interactionDataPool.push( interactionData );
		}
	};
	/**
     * Configure an InteractionEvent to wrap a DOM PointerEvent and InteractionData
     *
     * @param interactionEvent - The event to be configured
     * @param pointerEvent - The DOM event that will be paired with the InteractionEvent
     * @param interactionData - The InteractionData that will be paired
     *        with the InteractionEvent
     * @return - the interaction event that was passed in
     */
	InteractionManager.prototype.configureInteractionEventForDOMEvent = function ( interactionEvent, pointerEvent, interactionData ) {
		interactionEvent.data = interactionData;
		this.mapPositionToPoint( interactionData.global, pointerEvent.clientX, pointerEvent.clientY );
		// Not really sure why this is happening, but it's how a previous version handled things
		if ( pointerEvent.pointerType === 'touch' )
		{
			pointerEvent.globalX = interactionData.global.x;
			pointerEvent.globalY = interactionData.global.y;
		}
		interactionData.originalEvent = pointerEvent;
		interactionEvent.reset();
		return interactionEvent;
	};
	/**
     * Ensures that the original event object contains all data that a regular pointer event would have
     *
     * @param {TouchEvent|MouseEvent|PointerEvent} event - The original event data from a touch or mouse event
     * @return - An array containing a single normalized pointer event, in the case of a pointer
     *  or mouse event, or a multiple normalized pointer events if there are multiple changed touches
     */
	InteractionManager.prototype.normalizeToPointerData = function ( event ) {
		let normalizedEvents = [];
		if ( this.supportsTouchEvents && event instanceof TouchEvent )
		{
			for ( let i = 0, li = event.changedTouches.length; i < li; i++ )
			{
				let touch = event.changedTouches[ i ];
				if ( typeof touch.button === 'undefined' )
				{ touch.button = event.touches.length ? 1 : 0; }
				if ( typeof touch.buttons === 'undefined' )
				{ touch.buttons = event.touches.length ? 1 : 0; }
				if ( typeof touch.isPrimary === 'undefined' )
				{
					touch.isPrimary = event.touches.length === 1 && event.type === 'touchstart';
				}
				if ( typeof touch.width === 'undefined' )
				{ touch.width = touch.radiusX || 1; }
				if ( typeof touch.height === 'undefined' )
				{ touch.height = touch.radiusY || 1; }
				if ( typeof touch.tiltX === 'undefined' )
				{ touch.tiltX = 0; }
				if ( typeof touch.tiltY === 'undefined' )
				{ touch.tiltY = 0; }
				if ( typeof touch.pointerType === 'undefined' )
				{ touch.pointerType = 'touch'; }
				if ( typeof touch.pointerId === 'undefined' )
				{ touch.pointerId = touch.identifier || 0; }
				if ( typeof touch.pressure === 'undefined' )
				{ touch.pressure = touch.force || 0.5; }
				if ( typeof touch.twist === 'undefined' )
				{ touch.twist = 0; }
				if ( typeof touch.tangentialPressure === 'undefined' )
				{ touch.tangentialPressure = 0; }
				// TODO: Remove these, as layerX/Y is not a standard, is deprecated, has uneven
				// support, and the fill ins are not quite the same
				// offsetX/Y might be okay, but is not the same as clientX/Y when the canvas's top
				// left is not 0,0 on the page
				if ( typeof touch.layerX === 'undefined' )
				{ touch.layerX = touch.offsetX = touch.clientX; }
				if ( typeof touch.layerY === 'undefined' )
				{ touch.layerY = touch.offsetY = touch.clientY; }
				// mark the touch as normalized, just so that we know we did it
				touch.isNormalized = true;
				normalizedEvents.push( touch );
			}
		}
		// apparently PointerEvent subclasses MouseEvent, so yay
		else if ( !globalThis.MouseEvent
            || ( event instanceof MouseEvent && ( !this.supportsPointerEvents || !( event instanceof globalThis.PointerEvent ) ) ) )
		{
			let tempEvent = event;
			if ( typeof tempEvent.isPrimary === 'undefined' )
			{ tempEvent.isPrimary = true; }
			if ( typeof tempEvent.width === 'undefined' )
			{ tempEvent.width = 1; }
			if ( typeof tempEvent.height === 'undefined' )
			{ tempEvent.height = 1; }
			if ( typeof tempEvent.tiltX === 'undefined' )
			{ tempEvent.tiltX = 0; }
			if ( typeof tempEvent.tiltY === 'undefined' )
			{ tempEvent.tiltY = 0; }
			if ( typeof tempEvent.pointerType === 'undefined' )
			{ tempEvent.pointerType = 'mouse'; }
			if ( typeof tempEvent.pointerId === 'undefined' )
			{ tempEvent.pointerId = MOUSE_POINTER_ID; }
			if ( typeof tempEvent.pressure === 'undefined' )
			{ tempEvent.pressure = 0.5; }
			if ( typeof tempEvent.twist === 'undefined' )
			{ tempEvent.twist = 0; }
			if ( typeof tempEvent.tangentialPressure === 'undefined' )
			{ tempEvent.tangentialPressure = 0; }
			// mark the mouse event as normalized, just so that we know we did it
			tempEvent.isNormalized = true;
			normalizedEvents.push( tempEvent );
		}
		else
		{
			normalizedEvents.push( event );
		}
		return normalizedEvents;
	};
	/** Destroys the interaction manager. */
	InteractionManager.prototype.destroy = function () {
		this.removeEvents();
		this.removeTickerListener();
		this.removeAllListeners();
		this.renderer = null;
		this.mouse = null;
		this.eventData = null;
		this.interactionDOMElement = null;
		this.onPointerDown = null;
		this.processPointerDown = null;
		this.onPointerUp = null;
		this.processPointerUp = null;
		this.onPointerCancel = null;
		this.processPointerCancel = null;
		this.onPointerMove = null;
		this.processPointerMove = null;
		this.onPointerOut = null;
		this.processPointerOverOut = null;
		this.onPointerOver = null;
		this.search = null;
	};
	return InteractionManager;
}( _pixi_utils__WEBPACK_IMPORTED_MODULE_3__.EventEmitter ) );
