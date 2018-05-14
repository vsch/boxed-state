"use strict";

const boxedImmutable = require('boxed-immutable');
const objEachBreak = require('obj-each-break');
const utilTypeFuncs = require('util-type-funcs');

const isFunction = utilTypeFuncs.isFunction;
const isObjectLike = utilTypeFuncs.isObjectLike;
const firstDefined = utilTypeFuncs.firstDefined;
const deleteItems = objEachBreak.deleteItems;

const getBoxOnlyOptions = boxedImmutable.getBoxOnlyOptions;

const UNDEFINED = void 0;

function isValidBox(box) {
    return isFunction(box) && box.hasOwnProperty('boxedContext') && isObjectLike(box.boxedContext) && box.boxedContext.constructor === boxedImmutable.BoxedContext;
}

function getBoxed() {
    if (!this.boxed) {
        this.boxed = this.box.withBoxOptions(this.boxOnlyOptions, this.getState());
    }
    return this.boxed;
}

/**
 * save modified state
 * @param onDoneCallback    function to call on save complete
 * @return {*}
 */
function saveBoxed(onDoneCallback = UNDEFINED) {
    const boxed = this.boxed;
    if (boxed) {
        const modified = boxed[boxedImmutable.BOXED_GET_THIS].valueOfModified();
        if (modified !== UNDEFINED) {
            this.boxed = UNDEFINED;
            if (this.saveState) {
                return this.saveState(modified, boxed, onDoneCallback);
            } else {
                throw new TypeError("Save State Not Supported on this instance, saveState callback not provided");
            }
        }
    } else if (onDoneCallback) {
        onDoneCallback();
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

function boxOptions(options) {
    this.boxOnlyOptions = getBoxOnlyOptions(options);
    this.boxed = UNDEFINED;
    return this.proxiedThis;
}

/**
 * create a new Boxed property or object
 * @param getState     get state callback which returns state to use for boxing
 * @param saveState    save state callback saveState(boxed.$_modified$, boxed, onDoneCallback),
 *                     value returned from this callback is returned to caller of .save(onDoneCallback)
 * @param options      box or options object
 *                     if options object:
 *                         box: box to use or global require('boxed-immutable').box
 *                         saveBoxedProp: property name to use for save, default 'save'
 *                         cancelBoxedProp:  property name to use for cancel, default 'cancel'
 *
 *                        + additional box only options for creating the box
 *
 */
function BoxedState(getState, saveState, options) {
    if (!isFunction(getState)) {
        throw new TypeError("InvalidArgument, getState must be a function, got " + getState);
    }
    if (saveState && !isFunction(saveState)) {
        throw new TypeError("InvalidArgument, saveState must be a function, got " + saveState);
    }

    options = options || {};

    let box;

    if (isValidBox(options)) {
        box = options;
        options = {};
    } else {
        box = firstDefined(isValidBox(options.box) ? options.box : undefined, boxedImmutable.box);
    }

    let saveBoxedProp = firstDefined(options.saveBoxedProp, 'save');
    let cancelBoxedProp = firstDefined(options.saveBoxedProp, 'cancel');
    let boxOptionsProp = firstDefined(options.boxOptionsProp, 'boxOptions');

    // add context
    this.box = box;
    this.saveBoxedProp = saveBoxedProp;
    this.cancelBoxedProp = cancelBoxedProp;
    this.boxOptionsProp = boxOptionsProp;
    this.getState = getState;
    this.saveState = saveState;
    this.boxOnlyOptions = getBoxOnlyOptions(options);
    this.boxed = UNDEFINED;
    this.proxiedThis = UNDEFINED;

    this.getBoxed = this.getBoxed.bind(this);
    this.saveBoxed = this.saveBoxed.bind(this);
    this.cancelBoxed = this.cancelBoxed.bind(this);
    this.boxOptions = this.boxOptions.bind(this);
}

BoxedState.prototype.getBoxed = getBoxed;
BoxedState.prototype.saveBoxed = saveBoxed;
BoxedState.prototype.cancelBoxed = cancelBoxed;
BoxedState.prototype.boxOptions = boxOptions;

function isBoxedState(arg) {
    return isObjectLike(arg) && arg.constructor === BoxedState;
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
        throw new TypeError("BoxedStateHandler: IllegalArgument expected BoxedState target");
    },

    set: function (target, prop, value, receiver) {
        if (isBoxedState(target)) {
            if (prop === target.saveBoxedProp) return false;
            if (prop === target.cancelBoxedProp) return false;
            if (prop === target.boxOptionsProp) return false;
            return Reflect.set(target.getBoxed(), prop, value, receiver);
        }
        throw new TypeError("BoxedStateHandler: IllegalArgument expected BoxedState target");
    },

    deleteProperty: function (target, prop) {
        if (isBoxedState(target)) {
            if (prop === target.saveBoxedProp) return false;
            if (prop === target.cancelBoxedProp) return false;
            if (prop === target.boxOptionsProp) return false;
            return Reflect.deleteProperty(target.getBoxed(), prop);
        }
        throw new TypeError("BoxedStateHandler: IllegalArgument expected BoxedState target");
    },

    has: function (target, prop) {
        if (isBoxedState(target)) {
            if (prop === target.saveBoxedProp) return true;
            if (prop === target.cancelBoxedProp) return true;
            if (prop === target.boxOptionsProp) return true;
            return Reflect.has(target.getBoxed(), prop);
        }
        throw new TypeError("BoxedStateHandler: IllegalArgument expected BoxedState target");
    },

    ownKeys: function (target) {
        if (isBoxedState(target)) {
            const keys = Reflect.ownKeys(target.getBoxed());
            return deleteItems.call(keys, target.saveBoxedProp, target.cancelBoxedProp, target.boxOptionsProp);
        }
        throw new TypeError("BoxedStateHandler: IllegalArgument expected BoxedState target");
    },

    getOwnPropertyDescriptor: function (target, prop) {
        if (isBoxedState(target)) {
            if (prop === target.saveBoxedProp) return { value: target.saveBoxed, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };
            if (prop === target.cancelBoxedProp) return { value: target.cancelBoxed, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };
            if (prop === target.boxOptionsProp) return { value: target.boxOptions, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };
            return Reflect.getOwnPropertyDescriptor(target.getBoxed(), prop);
        }
        throw new TypeError("BoxedStateHandler: IllegalArgument expected BoxedState attached target");
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
 * @param saveState  callback taking (modified, boxed, onDoneCallback) of the state on .save(onDoneCallback)
 * @param options function for creating box or object containing {box: boxFunction}
 *                if not defined then global boxed-immutable.box will be used.
 * @return proxy which reflects fresh immutable state with commit/cancel on mods.
 */
function boxState(getState, saveState, options) {
    let boxed = new BoxedState(getState, saveState, options);
    boxed.proxiedThis = new Proxy(boxed, BoxedStateHandler);
    return boxed.proxiedThis;
}

// make it available for testing
module.exports.BoxedState = BoxedState;

// create customized context
module.exports.boxState = boxState;

