/*!
 * hold-event
 * https://github.com/yomotsu/hold-event
 * (c) 2020 @yomotsu
 * Released under the MIT License.
 */
var HOLD_EVENT_TYPE;
(function (HOLD_EVENT_TYPE) {
    HOLD_EVENT_TYPE["HOLD_START"] = "holdStart";
    HOLD_EVENT_TYPE["HOLD_END"] = "holdEnd";
    HOLD_EVENT_TYPE["HOLDING"] = "holding";
})(HOLD_EVENT_TYPE || (HOLD_EVENT_TYPE = {}));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var EventDispatcher = (function () {
    function EventDispatcher() {
        this._listeners = {};
    }
    EventDispatcher.prototype.addEventListener = function (type, listener) {
        var listeners = this._listeners;
        if (listeners[type] === undefined)
            listeners[type] = [];
        if (listeners[type].indexOf(listener) === -1)
            listeners[type].push(listener);
    };
    EventDispatcher.prototype.removeEventListener = function (type, listener) {
        var listeners = this._listeners;
        var listenerArray = listeners[type];
        if (listenerArray !== undefined) {
            var index = listenerArray.indexOf(listener);
            if (index !== -1)
                listenerArray.splice(index, 1);
        }
    };
    EventDispatcher.prototype.dispatchEvent = function (event) {
        var listeners = this._listeners;
        var listenerArray = listeners[event.type];
        if (listenerArray !== undefined) {
            event.target = this;
            var array = listenerArray.slice(0);
            for (var i = 0, l = array.length; i < l; i++) {
                array[i].call(this, event);
            }
        }
    };
    return EventDispatcher;
}());

var Hold = (function (_super) {
    __extends(Hold, _super);
    function Hold(holdIntervalDelay) {
        var _this = _super.call(this) || this;
        _this._enabled = true;
        _this._holding = false;
        _this._intervalId = -1;
        _this._deltaTime = 0;
        _this._elapsedTime = 0;
        _this._lastTime = 0;
        _this._holdStart = function (event) {
            if (!_this._enabled)
                return;
            if (_this._holding)
                return;
            _this._deltaTime = 0;
            _this._elapsedTime = 0;
            _this._lastTime = performance.now();
            console.log("_holdStart", event);
            _this.dispatchEvent({
                type: HOLD_EVENT_TYPE.HOLD_START,
                deltaTime: _this._deltaTime,
                elapsedTime: _this._elapsedTime,
                originalEvent: event,
            });
            _this._holding = true;
            var cb = function () {
                _this._intervalId = !!_this.holdIntervalDelay ?
                    window.setTimeout(cb, _this.holdIntervalDelay) :
                    window.requestAnimationFrame(cb);
                var now = performance.now();
                _this._deltaTime = now - _this._lastTime;
                _this._elapsedTime += _this._deltaTime;
                _this._lastTime = performance.now();
                _this.dispatchEvent({
                    type: HOLD_EVENT_TYPE.HOLDING,
                    deltaTime: _this._deltaTime,
                    elapsedTime: _this._elapsedTime,
                    originalEvent: event,
                });
            };
            _this._intervalId = !!_this.holdIntervalDelay ?
                window.setTimeout(cb, _this.holdIntervalDelay) :
                window.requestAnimationFrame(cb);
        };
        _this._holdEnd = function (event) {
            if (!_this._enabled)
                return;
            if (!_this._holding)
                return;
            var now = performance.now();
            _this._deltaTime = now - _this._lastTime;
            _this._elapsedTime += _this._deltaTime;
            _this._lastTime = performance.now();
            _this.dispatchEvent({
                type: HOLD_EVENT_TYPE.HOLD_END,
                deltaTime: _this._deltaTime,
                elapsedTime: _this._elapsedTime,
                originalEvent: event,
            });
            window.clearTimeout(_this._intervalId);
            window.cancelAnimationFrame(_this._intervalId);
            _this._holding = false;
        };
        _this.holdIntervalDelay = holdIntervalDelay;
        return _this;
    }
    Object.defineProperty(Hold.prototype, "enabled", {
        get: function () {
            return this._enabled;
        },
        set: function (enabled) {
            if (this._enabled === enabled)
                return;
            this._enabled = enabled;
            if (!this._enabled)
                this._holdEnd();
        },
        enumerable: false,
        configurable: true
    });
    return Hold;
}(EventDispatcher));

var ElementHold = (function (_super) {
    __extends(ElementHold, _super);
    function ElementHold(element, holdIntervalDelay) {
        var _this = _super.call(this, holdIntervalDelay) || this;
        _this._holdStart = _this._holdStart.bind(_this);
        _this._holdEnd = _this._holdEnd.bind(_this);
        var onPointerDown = _this._holdStart;
        var onPointerUp = _this._holdEnd;
        element.addEventListener('mousedown', onPointerDown);
        document.addEventListener('mouseup', onPointerUp);
        window.addEventListener('blur', _this._holdEnd);
        return _this;
    }
    return ElementHold;
}(Hold));

var KeyboardKeyHold = (function (_super) {
    __extends(KeyboardKeyHold, _super);
    function KeyboardKeyHold(keyCode, holdIntervalDelay) {
        var _this = _super.call(this, holdIntervalDelay) || this;
        _this._holdStart = _this._holdStart.bind(_this);
        _this._holdEnd = _this._holdEnd.bind(_this);
        var onKeydown = function (event) {
            if (isInputEvent(event))
                return;
            if (event.keyCode !== keyCode)
                return;
            _this._holdStart(event);
        };
        var onKeyup = function (event) {
            if (event.keyCode !== keyCode)
                return;
            _this._holdEnd(event);
        };
        document.addEventListener('keydown', onKeydown);
        document.addEventListener('keyup', onKeyup);
        window.addEventListener('blur', _this._holdEnd);
        return _this;
    }
    return KeyboardKeyHold;
}(Hold));
function isInputEvent(event) {
    var target = event.target;
    return (target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable);
}

export { ElementHold, HOLD_EVENT_TYPE, KeyboardKeyHold };
