"use strict";

const boxedImmutable = require('./boxed-immutable');
const util = require('./util');

const isFunction = util.isFunction;
const UNDEFINED = void 0;

function isValidBox(box) {
    return util.isFunction(box) && box.hasOwnProperty('boxedContext') && util.isObject(box.boxedContext) && box.boxedContext.constructor === boxedImmutable.BoxedContext;
}

function getBoxed() {
    if (!this.boxed) {
        this.boxed = this.box.withBoxOptions(this.boxOnlyOptions, this.getState());
    }
    return this.boxed;
}

function saveBoxed() {
    const boxed = this.boxed;
    if (boxed) {
        const modified = boxed[boxedImmutable.BOXED_GET_THIS].valueOfModified();
        if (modified !== UNDEFINED) {
            this.boxed = UNDEFINED;
            if (this.saveState) {
                return this.saveState(modified, boxed);
            } else {
                throw "Save State Not Supported on this instance, saveState callback not provided";
            }
        }
    }
}

/**
 * Cancel changes and return modified so these could be applied later
 * for delayed update.
 * 
 * @return {*}
 */
function cancelBoxed() {
    const boxed = this.boxed;
    this.boxed = UNDEFINED;
    return boxed && boxed[boxedImmutable.BOXED_GET_THIS].unboxedDelta();
}

function boxOptions(boxOnlyOptions) {
    this.boxed = UNDEFINED;
    this.boxOnlyOptions = util.hasOwnProperties(boxOnlyOptions) && boxOnlyOptions;
    return this.proxiedThis;
}

/**
 * create a new Boxed property or object
 * @param getState     get state callback which returns state to use for boxing
 * @param saveState    save state callback (boxed.$_modified$, boxed), value returned from this callback is returned to caller of .commit()
 * @param options      box or options object
 *                     if options object:
 *                         box: box to use or global require('boxed-immutable').box
 *                         saveBoxedProp: property name to use for save, default 'save'
 *                         cancelBoxedProp:  property name to use for cancel, default 'cancel'
 */
function BoxedState(getState, saveState, options) {
    if (!isFunction(getState)) { 
        throw "InvalidArgument, getState must be a function, got " + getState;
    }
    if (saveState && !isFunction(saveState)) { 
        throw "InvalidArgument, saveState must be a function, got " + saveState;
    }
    
    options = options || {};

    let box;
    let boxOnlyOptions;

    if (isValidBox(options)) {
        box = options;
        options = {};
    } else {
        box = util.firstDefined(isValidBox(options.box) ? options.box : undefined, boxedImmutable.box);
        boxOnlyOptions = util.copyProperties(options, boxedImmutable.BOX_ONLY_PROPERTIES);
    }

    let saveBoxedProp = util.firstDefined(options.saveBoxedProp, 'save');
    let cancelBoxedProp = util.firstDefined(options.saveBoxedProp, 'cancel');
    let boxOptionsProp = util.firstDefined(options.boxOptionsProp, 'boxOptions');

    // add context
    this.box = box;
    this.context = this.box.boxedContext;
    this.saveBoxedProp = saveBoxedProp;
    this.cancelBoxedProp = cancelBoxedProp;
    this.boxOptionsProp = boxOptionsProp;
    this.getState = getState;
    this.saveState = saveState;
    this.boxed = UNDEFINED;
    this.proxiedThis = UNDEFINED;
    this.boxOnlyOptions = util.hasOwnProperties(boxOnlyOptions) && boxOnlyOptions;

    this.getBoxed = getBoxed.bind(this);
    this.saveBoxed = saveBoxed.bind(this);
    this.cancelBoxed = cancelBoxed.bind(this);
    this.boxOptions = boxOptions.bind(this);
}

// util.inherits(Boxed, InheritedClass);

BoxedState.prototype.getBoxed = getBoxed;
BoxedState.prototype.saveBoxed = saveBoxed;
BoxedState.prototype.cancelBoxed = cancelBoxed;
BoxedState.prototype.boxOptions = boxOptions;

function isBoxedState(arg) {
    return util.isObject(arg) && arg.constructor === BoxedState;
}

const BOXED_GET_THIS = boxedImmutable.BOXED_GET_THIS;

const BoxedStateHandler = {
    // target is the object with on demand boxed property
    get: function (target, prop, receiver) {
        if (isBoxedState(target)) {
            if (prop === BOXED_GET_THIS) return target;
            if (prop === target.saveBoxedProp) return target.saveBoxed;
            if (prop === target.cancelBoxedProp) return target.cancelBoxed;
            if (prop === target.boxOptionsProp) return target.boxOptions;
            return target.getBoxed()[prop];
        }
        throw "BoxedStateHandler: IllegalArgument expected BoxedState target";
    },

    set: function (target, prop, value, receiver) {
        if (isBoxedState(target)) {
            if (prop === target.saveBoxedProp) return false;
            if (prop === target.cancelBoxedProp) return false;
            if (prop === target.boxOptionsProp) return false;
            return Reflect.set(target.getBoxed(), prop, value, receiver);
        }
        throw "BoxedStateHandler: IllegalArgument expected BoxedState target";
    },

    deleteProperty: function (target, prop) {
        if (isBoxedState(target)) {
            if (prop === target.saveBoxedProp) return false;
            if (prop === target.cancelBoxedProp) return false;
            if (prop === target.boxOptionsProp) return false;
            return Reflect.deleteProperty(target.getBoxed(), prop);
        }
        throw "BoxedStateHandler: IllegalArgument expected BoxedState target";
    },

    has: function (target, prop) {
        if (isBoxedState(target)) {
            if (prop === target.saveBoxedProp) return true;
            if (prop === target.cancelBoxedProp) return true;
            if (prop === target.boxOptionsProp) return true;
            return Reflect.has(target.getBoxed(), prop);
        }
        throw "BoxedStateHandler: IllegalArgument expected BoxedState target";
    },

    ownKeys: function (target) {
        if (isBoxedState(target)) {
            const keys = Reflect.ownKeys(target.getBoxed());
            return util.deleteItems(keys, target.saveBoxedProp, target.cancelBoxedProp, target.boxOptionsProp);
        }
        throw "BoxedStateHandler: IllegalArgument expected BoxedState target";
    },

    getOwnPropertyDescriptor: function (target, prop) {
        if (isBoxedState(target)) {
            if (prop === target.saveBoxedProp) return { value: target.saveBoxed, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };
            if (prop === target.cancelBoxedProp) return { value: target.cancelBoxed, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };
            if (prop === target.boxOptionsProp) return { value: target.boxOptions, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };
            return Reflect.getOwnPropertyDescriptor(target.getBoxed(), prop);
        }
        throw "BoxedStateHandler: IllegalArgument expected BoxedState attached target";
    },

    // Not needed.
    // apply: function (target, thisArg, argumentsList) {
    //     return target.apply(thisArg, argumentsList);
    // },
};

/**
 * Create a boxed on demand property with save and cancel functions
 * ._$ - returns boxed state, will always return the same state until saved or cancelled
 * .$_commit$() - saves modifications and clears boxed so next demand will create a new boxed
 * .$_cancel$() - cancels mods, clears boxed so next demand will create a new boxed
 *
 * @param getState   callback returning state to box
 * @param saveState  callback taking (modified, boxed) of the state on .$_save$()
 * @param options function for creating box or object containing {box: boxFunction} if not defined then global boxed-immutable.box will be used.
 * @return proxy which reflects fresh immutable state with commit/cancel on mods.
 */
function boxState(getState, saveState, options) {
    let boxed = new BoxedState(getState, saveState, options);
    boxed.proxiedThis = new Proxy(boxed, BoxedStateHandler);
    return boxed.proxiedThis;
}

// create customized context
module.exports.BoxedState = BoxedState;
module.exports.boxState = boxState;
