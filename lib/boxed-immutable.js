/** internal
 * class Boxed
 *
 * Implements boxed property functionality
 *
 **/

'use strict';

const util = require('./util');
const forEachKey = util.forEachKey;
const isNumericInteger = util.isNumericInteger;
const toNumericInteger = util.toNumericInteger;
const isArrayIndex = util.isArrayIndex;
const toArrayIndex = util.toArrayIndex;
const toNumberIfArrayIndex = util.toNumberIfArrayIndex;
const unwrap = util.unwrap;
const wrap = util.wrap;
const isWrapped = util.isWrapped;
const isFunction = util.isFunction;
const isObject = util.isObject;
const isArray = util.isArray;
const isString = util.isString;
const isNullOrUndefined = util.isNullOrUndefined;
const hasOwnProperties = util.hasOwnProperties;
const UNDEFINED = util.UNDEFINED;
const firstDefined = util.firstDefined;

const BOXED_GET_THIS = "@@BOXED_THIS";
module.exports.BOXED_GET_THIS = BOXED_GET_THIS;

// default inside and outside markers
const BOXED_INSIDE = "_$"; // also works as array end
const BOXED_OUTSIDE = "$_";

// reserved mappings, this is the Boxed instance for the call
// reserved props are not prefixed or suffixed

// Here this is the BoxedIn or the BoxedOut instance which are pure objects since they don't need inheritance
const RESERVED_PROPS = {
    _$: {  // BOXED_INSIDE, request boxedIn from parent
        getBoxedIn: function () {return this.boxedInProxy;},   // for performance optimization this is handled by proxy handler
        getBoxedOut: function () {return this.boxedInProxy;},  // for performance optimization this is handled by proxy handler
        set: function (value) {return this.setValueOf(value);},
        delete: function () {return this.deleteValueOf();},
        ownPropertyDescriptor: function () {return { value: this.boxedInProxy, writable: true, /*enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    $_: { // BOXED_OUTSIDE: request boxedOut from parent
        getBoxedIn: function () {return this.getBoxedOutValue();},
        getBoxedOut: function () {return this.getBoxedOutValue();}, // withBoxedOut is an object, cannot return ref to self, otherwise infinite loop is created when full depth is traversed.
        set: function (value) {return this.setValueOf(value);},
        delete: function () {return this.deleteValueOf();},
        ownPropertyDescriptor: function () {return { value: this.getBoxedOutValue(), writable: !!this.boxedOutProxy, /*enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    $_forEachKey: {
        getBoxedIn: function () {return this.forEachKey;},
        getBoxedOut: function () {return this.forEachKey;},
        set: function (value) {return false;},
        delete: function () {return false;},
        ownPropertyDescriptor: function () {return { value: this.forEachKey, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    $_if: {
        getBoxedIn: function () {return this.ifValueBoxedOut;},
        getBoxedOut: function () {return this.ifValueBoxedOut;},
        set: function (value) {return false;},
        delete: function () {return false;},
        ownPropertyDescriptor: function () {return { value: this.ifValueBoxedOut, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    if_$: {
        getBoxedIn: function () {return this.ifValueBoxedIn;},
        getBoxedOut: function () {return this.ifValueBoxedIn;},
        set: function (value) {return false;},
        delete: function () {return false;},
        ownPropertyDescriptor: function () {return { value: this.ifValueBoxedIn, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    $_ifValid: {
        getBoxedIn: function () {return this.ifValueValidBoxedOut;},
        getBoxedOut: function () {return this.ifValueValidBoxedOut;},
        set: function (value) {return false;},
        delete: function () {return false;},
        ownPropertyDescriptor: function () {return { value: this.ifValueValidBoxedOut, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    ifValid_$: {
        getBoxedIn: function () {return this.ifValueValidBoxedIn;},
        getBoxedOut: function () {return this.ifValueValidBoxedIn;},
        set: function (value) {return false;},
        delete: function () {return false;},
        ownPropertyDescriptor: function () {return { value: this.ifValueValidBoxedIn, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    $_ifArray: {
        getBoxedIn: function () {return this.ifValueArrayBoxedOut;},
        getBoxedOut: function () {return this.ifValueArrayBoxedOut;},
        set: function (value) {return false;},
        delete: function () {return false;},
        ownPropertyDescriptor: function () {return { value: this.ifValueArrayBoxedOut, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    ifArray_$: {
        getBoxedIn: function () {return this.ifValueArrayBoxedIn;},
        getBoxedOut: function () {return this.ifValueArrayBoxedIn;},
        set: function (value) {return false;},
        delete: function () {return false;},
        ownPropertyDescriptor: function () {return { value: this.ifValueArrayBoxedIn, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    $_ifObject: {
        getBoxedIn: function () {return this.ifValueObjectBoxedOut;},
        getBoxedOut: function () {return this.ifValueObjectBoxedOut;},
        set: function (value) {return false;},
        delete: function () {return false;},
        ownPropertyDescriptor: function () {return { value: this.ifValueObjectBoxedOut, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    ifObject_$: {
        getBoxedIn: function () {return this.ifValueObjectBoxedIn;},
        getBoxedOut: function () {return this.ifValueObjectBoxedIn;},
        set: function (value) {return false;},
        delete: function () {return false;},
        ownPropertyDescriptor: function () {return { value: this.ifValueObjectBoxedIn, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    $_ifDefined: {
        getBoxedIn: function () {return this.ifValueDefinedBoxedOut;},
        getBoxedOut: function () {return this.ifValueDefinedBoxedOut;},
        set: function (value) {return false;},
        delete: function () {return false;},
        ownPropertyDescriptor: function () {return { value: this.ifValueDefinedBoxedOut, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    ifDefined_$: {
        getBoxedIn: function () {return this.ifValueDefinedBoxedIn;},
        getBoxedOut: function () {return this.ifValueDefinedBoxedIn;},
        set: function (value) {return false;},
        delete: function () {return false;},
        ownPropertyDescriptor: function () {return { value: this.ifValueDefinedBoxedIn, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    forEachKey_$: {
        getBoxedIn: function () {return this.forEachKeyBoxed;},
        getBoxedOut: function () {return this.forEachKeyBoxed;},
        set: function (value) {return false;},
        delete: function () {return false;},
        ownPropertyDescriptor: function () {return { value: this.forEachKeyBoxed, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    default_$: {
        getBoxedIn: function () {return this.setValueOfBoxedInDefault;},
        getBoxedOut: function () {return this.setValueOfBoxedInDefault;},
        set: function (value) {return this.setValueOfDefaultMagic(value);},
        delete: function () {return false;},
        ownPropertyDescriptor: function () {return { value: this.setValueOfBoxedInDefault, writable: true, /*enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    $_default: {
        getBoxedIn: function () {return this.setValueOfBoxedOutDefault;},
        getBoxedOut: function () {return this.setValueOfBoxedOutDefault;},
        set: function (value) {return this.setValueOfDefaultMagic(value);},
        delete: function () {return false;},
        ownPropertyDescriptor: function () {return { value: this.setValueOfBoxedOutDefault, writable: true, /*enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    path_$: {
        getBoxedIn: function () {return this.boxedInOfPath;},
        getBoxedOut: function () {return this.boxedInOfPath;},
        set: function (value) {return false;},
        delete: function () {return false;},
        ownPropertyDescriptor: function () {return { value: this.boxedInOfPath, writable: false, /*enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    $_path: {
        getBoxedIn: function () {return this.valueOfPath;},
        getBoxedOut: function () {return this.valueOfPath;},
        set: function (value) {return false;},
        delete: function () {return false;},
        ownPropertyDescriptor: function () {return { value: this.valueOfPath, writable: false, /*enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    $_value: {
        getBoxedIn: function () {return this.valueOf();},
        getBoxedOut: function () {return this.valueOf();},
        set: function (value) {return this.setValueOf(value);},
        delete: function () {return this.deleteValueOf();},
        ownPropertyDescriptor: function () {return { value: this.value, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    $_modified: {
        getBoxedIn: function () {return this.valueOfModified();},
        getBoxedOut: function () {return this.valueOfModified();},
        set: function (value) {return this.setValueOfModified(value);},
        delete: function () {return this.deleteValueOfModified();},
        ownPropertyDescriptor: function () {return { value: this.isCopy ? this.value : UNDEFINED, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    $_delta: {
        getBoxedIn: function () {return this.unboxedDelta();},
        getBoxedOut: function () {return this.unboxedDelta();},
        set: function (value) {return this.setUnboxedDelta(value);},
        delete: function () {return this.deleteUnboxedDelta();},
        ownPropertyDescriptor: function () {return { value: this.isCopy ? this.unboxedDelta() : UNDEFINED, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    $_deepDelta: {
        getBoxedIn: function () {return this.unboxedDeepDelta();},
        getBoxedOut: function () {return this.unboxedDeepDelta();},
        set: function (value) {return this.setUnboxedDeepDelta(value);},
        delete: function () {return this.deleteUnboxedDeepDelta();},
        ownPropertyDescriptor: function () {return { value: this.isCopy ? this.unboxedDeepDelta() : UNDEFINED, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
};

const magicProps = {
    "_$|$_": RESERVED_PROPS, // default settings
};    // custom magic props

const BOX_ONLY_PROPERTIES = {
    setTransforms: null,
    getTransforms: null,
};

module.exports.BOX_ONLY_PROPERTIES = BOX_ONLY_PROPERTIES;

// boxed options context
function BoxContext(options, parent) {
    options = Object.assign({}, options || {});

    // don't allow suffix/prefix overrides if have parent, otherwise we cannot communicate
    if (parent) {
        options.boxedInSuffix = parent.boxedInSuffix;
        options.boxedOutPrefix = parent.boxedOutPrefix;
        this.globalBox = parent.context.globalBox;
    } else {
        this.globalBox = UNDEFINED; // will be set by box
    }

    // add options
    this.deleteEmptyCollections = firstDefined(options.deleteEmptyCollections, true);
    this.ignoreUndefinedProperties = firstDefined(options.ignoreUndefinedProperties, true);
    this.arrayDeltaObjects = firstDefined(options.arrayDeltaObjects, false);
    this.arrayDeltaPartials = firstDefined(options.arrayDeltaPartials, false);
    this.arrayDeltaObjectMarker = firstDefined(options.arrayDeltaObjectMarker, UNDEFINED);
    this.arrayDeltaObjectMarkerValue = firstDefined(options.arrayDeltaObjectMarkerValue, UNDEFINED);
    this.arrayDeepDeltaObjects = firstDefined(options.arrayDeepDeltaObjects, false);
    this.arrayDeepDeltaObjectMarker = firstDefined(options.arrayDeepDeltaObjectMarker, UNDEFINED);
    this.arrayDeepDeltaObjectMarkerValue = firstDefined(options.arrayDeepDeltaObjectMarkerValue, UNDEFINED);
    this.arrayDeepDeltaPartials = firstDefined(options.arrayDeepDeltaPartials, true);
    this.boxedInSuffix = (options.boxedInSuffix || BOXED_INSIDE);
    this.boxedOutPrefix = (options.boxedOutPrefix || BOXED_OUTSIDE);
    this.boxedArrayEnd = this.boxedInSuffix;

    const magicParamsKey = this.boxedOutPrefix + "|" + this.boxedInSuffix;  // _$|$_

    if (!util.hasOwnProperty(magicProps, magicParamsKey)) {
        let keys = Object.keys(RESERVED_PROPS);
        let i = keys.length;
        let reservedProps = {};

        while (i--) {
            let key = keys[i];
            // keep "" => "" it is the array end empty key
            reservedProps[key ? this.reWrapMagicProp(key) : key] = RESERVED_PROPS[key];
        }

        // save props based on our options.
        magicProps[magicParamsKey] = reservedProps;
    }
    this.reservedProps = magicProps[magicParamsKey];
    this.reservedPropsList = Object.keys(this.reservedProps);
}

module.exports.BoxedContext = BoxContext;

BoxContext.prototype.reWrapMagicProp = function (prop) {
    if (util.endsWith(prop, BOXED_INSIDE)) {
        return prop.substr(0, prop.length - BOXED_INSIDE.length) + this.boxedInSuffix;
    } else if (util.startsWith(prop, BOXED_OUTSIDE)) {
        return this.boxedOutPrefix + prop.substr(BOXED_OUTSIDE.length, prop.length - BOXED_OUTSIDE.length);
    }
    return prop;
};

BoxContext.prototype.boxedContext = function (options) {
    return !hasOwnProperties(options) ? this : new BoxContext(options, this);
};

BoxContext.prototype.copyUnreservedKeys = function (arg, forTarget) {
    if (!isObject(arg)) {
        return isFunction(forTarget) ? ['length'] : [];
    }

    let keys = Object.keys(arg);
    if (keys.length > 0) {
        let reservedPropsList = this.reservedPropsList;
        let i = reservedPropsList.length;
        while (i--) {
            const key = reservedPropsList[i];
            if (arg.hasOwnProperty(key)) {
                keys.splice(keys.indexOf(key), 1);
            }
        }
    }

    if (keys.indexOf('length') === -1) {
        keys.push('length');
    }
    return keys;
};

function boxedContext(options) {
    if (util.isObject(options) && options.constructor === BoxContext) return options;
    return new BoxContext(options);
}

module.exports.boxedContext = boxedContext;

function setBoxedOutProxy(box) {
    if (isObject(box.withBoxedOut)) {
        box.withBoxedOut[BOXED_GET_THIS] = box;
        box.boxedOutProxy = new Proxy(box.withBoxedOut, BoxedHandler);
    } else {
        box.withBoxedOut = UNDEFINED;
    }
}

/**
 * Wrap withBoxedIn of instance in proxy so it can be used to access boxed properties.
 * @param box
 * @returns {Object}
 */
function boxedProxy(box) {
    box.withBoxedIn = box.withBoxedIn.bind(box);
    // box.withBoxedOut = box.withBoxedOut.bind(box);
    // boxed.boxedOutValue = boxed.boxedOutValue.bind(boxed);
    // boxed.detachFromParent = boxed.detachFromParent.bind(boxed);
    // boxed.detachProp = boxed.detachProp.bind(boxed);
    // boxed.detachAllProps = boxed.detachAllProps.bind(boxed);
    // boxed.has = boxed.has.bind(boxed);
    // boxed.ownKeys = boxed.ownKeys.bind(boxed);
    // boxed.getOwnPropertyDescriptor = boxed.getOwnPropertyDescriptor.bind(boxed);
    // boxed.getBoxedProp = boxed.getBoxedProp.bind(boxed);
    // boxed.get = boxed.get.bind(boxed);
    // boxed.copyOfValue = boxed.copyOfValue.bind(boxed);
    // boxed.set = boxed.set.bind(boxed);
    // boxed.delete = boxed.delete.bind(boxed);
    // boxed.valueOf = boxed.valueOf.bind(boxed);
    // boxed.setValueOf = boxed.setValueOf.bind(boxed);
    // boxed.deleteValueOf = boxed.deleteValueOf.bind(boxed);
    // boxed.isModified = boxed.isModified.bind(boxed);
    // boxed.valueOfModified = boxed.valueOfModified.bind(boxed);
    // boxed.setValueOfModified = boxed.setValueOfModified.bind(boxed);
    // boxed.deleteValueOfModified = boxed.deleteValueOfModified.bind(boxed);
    // boxed.setValueOfDefault = boxed.setValueOfDefault.bind(boxed);
    box.setValueOfBoxedInDefault = box.setValueOfBoxedInDefault.bind(box);
    box.setValueOfBoxedOutDefault = box.setValueOfBoxedOutDefault.bind(box);
    // boxed.setValueOfDefaultMagic = boxed.setValueOfDefaultMagic.bind(boxed);
    // boxed.valueOfBoolean = boxed.valueOfBoolean.bind(boxed);
    // boxed.setValueOfBoolean = boxed.setValueOfBoolean.bind(boxed);
    // boxed.unboxedDelta = boxed.unboxedDelta.bind(boxed);
    // boxed.setUnboxedDelta = boxed.setUnboxedDelta.bind(boxed);
    // boxed.deleteUnboxedDelta = boxed.deleteUnboxedDelta.bind(boxed);
    // boxed.unboxedDeepDelta = boxed.unboxedDeepDelta.bind(boxed);
    // boxed.setUnboxedDeepDelta = boxed.setUnboxedDeepDelta.bind(boxed);
    // boxed.deleteUnboxedDeepDelta = boxed.deleteUnboxedDeepDelta.bind(boxed);
    box.forEachKey = box.forEachKey.bind(box);
    box.forEachKeyBoxed = box.forEachKeyBoxed.bind(box);
    box.ifValueBoxedOut = box.ifValueBoxedOut.bind(box);
    box.ifValueBoxedIn = box.ifValueBoxedIn.bind(box);
    box.ifValueDefinedBoxedOut = box.ifValueDefinedBoxedOut.bind(box);
    box.ifValueDefinedBoxedIn = box.ifValueDefinedBoxedIn.bind(box);
    box.ifValueValidBoxedOut = box.ifValueValidBoxedOut.bind(box);
    box.ifValueValidBoxedIn = box.ifValueValidBoxedIn.bind(box);
    box.ifValueArrayBoxedOut = box.ifValueArrayBoxedOut.bind(box);
    box.ifValueArrayBoxedIn = box.ifValueArrayBoxedIn.bind(box);
    box.ifValueObjectBoxedOut = box.ifValueObjectBoxedOut.bind(box);
    box.ifValueObjectBoxedIn = box.ifValueObjectBoxedIn.bind(box);
    box.getValueProp = box.getValueProp.bind(box);
    box.setValueProp = box.setValueProp.bind(box);
    box.boxedInOfPath = box.boxedInOfPath.bind(box);
    box.valueOfPath = box.valueOfPath.bind(box);

    box.withBoxedIn[BOXED_GET_THIS] = box;

    // need this to have the proxy stop yapping about it, the target is trying to be an object or array
    Object.defineProperty(box.withBoxedIn, "length", { value: 0, writable: true, configurable: false, enumerable: false });

    box.boxedInProxy = new Proxy(box.withBoxedIn, BoxedHandler);

    setBoxedOutProxy(box);
}

function getWithBoxedOutType(value) {
    let arr;
    return isObject(value) && (value.constructor === Object || (arr = value.constructor === Array)) ? arr ? Array : Object : UNDEFINED;  // pure objects for proxy use
}

function getWithBoxedOut(value) {
    let type = getWithBoxedOutType(value);
    return type ? new type : UNDEFINED;  // pure objects for proxy use
}

/**
 * create a new Boxed property or object
 * @param value  (*) - value to box
 * @param parent     - parent of this property
 * @param prop       - property name
 * @param options    - options or context for this boxed instance
 * @param boxOptions - box only options
 */
function Box(value, parent, prop, options, boxOptions) {
    // add context
    this.context = (parent ? parent.context.boxedContext(options) : boxedContext(options));

    // boxed properties
    this.value = value; // current value, modified or unmodified
    this.parent = parent;
    this.prop = prop;
    this.boxedProps = {}; // boxed property values
    this.modifiedProps = {}; // all modified properties are held here as keys
    this.reservedProps = this.context.reservedProps;
    this.globalBox = this.context.globalBox;
    this.setTransforms = boxOptions && boxOptions.setTransforms;
    this.getTransforms = boxOptions && boxOptions.getTransforms;
    this.boxedArrayEnd = this.context.boxedArrayEnd;

    // these will be set by proxy wrapped versions, we don't need access to them
    this.boxedInProxy = UNDEFINED;  // pure objects for proxy use
    this.boxedOutProxy = UNDEFINED;  // pure objects for proxy use

    // really need to have this be set to the same type of object as the value, if the value does not exist
    // then can be anything, but as soon as value is changed this should also change to reflect a new type
    // so that type comparison for object or array will at least match.
    this.withBoxedOut = getWithBoxedOut(this.value);

    // only root level box applies the get transform and only on freshly loaded value, transforms it
    // and pretends it is not modified.
    if (isObject(this.getTransforms)) {
        this.value = applyTransforms(value, this.getTransforms, this.boxedArrayEnd, true, true, (prop) => {
            this.modifiedProps[prop] = true;
        });
    }

    this.isCopy = this.value !== value; // is a copy if modified by transforms, full copy
    this.isFullCopy = false; // set if copy was a fresh array or object
}

module.exports.Box = Box;

// util.inherits(Boxed, InheritedClass);

// use .call(this)
function updateWithBoxedOut() {
    if (getWithBoxedOutType(this.value) !== getWithBoxedOutType(this.withBoxedOut)) {
        // need a new type
        if (this.withBoxedOut) {
            // detach it
            this.withBoxedOut[BOXED_GET_THIS] = false;
        }

        this.withBoxedOut = getWithBoxedOut(this.value);
        setBoxedOutProxy(this)
    }
}

/**
 * Implements the ._$() or the function call on any boxed value
 *
 * @param arg {*}
 *                  undefined - return unboxed value
 *                  function - callback for taking proxy as argument for ._$(_$ => {}), return value returned by the callback function
 *                  anything else - set the value and return boxed proxy for chaining
 *
 * @returns {*}    return depends on arguments
 */
function withBoxedIn(arg) {
    // const callBack = argumentList[0];
    if (arg !== UNDEFINED) {
        if (isFunction(arg)) {
            let proxy = this.boxedInProxy;
            return arg(proxy);
        } else {
            this.setValueOf(arg);
            return this.boxedInProxy;
        }
    }
    return this.value;
}

Box.prototype.withBoxedIn = withBoxedIn;

// TODO: can handle special properties when boxing out undefined value
// handle special properties so they don't throw if undefined
// .length is 0 if not array or object
const SPECIAL_BOXED_OUT = {
    // length : 0,
};

function getBoxedOutValue() {
    const result = this.boxedOutProxy || this.value;

    if (result === UNDEFINED && SPECIAL_BOXED_OUT.hasOwnProperty(this.prop)) {
        return SPECIAL_BOXED_OUT[prop];
    }
    return result;
}

Box.prototype.getBoxedOutValue = getBoxedOutValue;

// /**
//  * Implements the .$_() or the function call on any boxed out value
//  *
//  * @param callBack {function}
//  * @returns {*}    returns the results of the callback or undefined
//  */
// function withBoxedOut(callBack) {
//     // const callBack = argumentList[0];
//     if (isFunction(callBack)) {
//         let proxy = this.boxedOutProxy;
//         return callBack(proxy);
//     }
//     return undefined;
// }
//
// Box.prototype.withBoxedOut = withBoxedOut;

// function boxedOutValue() {
//     // for object values, boxedOutProxy
//     // for others the value itself
//     if (isObject(this.value)) {
//         return this.boxedOutProxy;
//     }
//     return this.value;
// }
//
// Boxed.prototype.boxedOutValue = boxedOutValue;
//
Box.prototype.detachFromParent = function () {
    // detach from parent, keep property, can be used to create single element update
    this.parent = UNDEFINED;
};

Box.prototype.detachProp = function (prop) {
    let boxedProps = this.boxedProps;
    if (boxedProps.hasOwnProperty(prop)) {
        // remove it
        let boxedChild = boxedProps[prop];
        if (boxedChild) {
            boxedChild.detachFromParent();
            delete boxedProps[prop];
        }
    }
};

Box.prototype.detachAllProps = function () {
    let boxedProps = Object.keys(this.boxedProps);
    let i = boxedProps.length;
    while (i--) {
        let prop = boxedProps[i];
        if (boxedProps.hasOwnProperty(prop)) {
            this.detachProp(prop);
        }
    }
};

Box.prototype.has = function (target, prop) {
    if (prop === this.globalBox) prop = this.boxedArrayEnd;
    if (this.reservedProps.hasOwnProperty(prop)) {
        return false;
    }
    return isObject(this.value) ? this.value.hasOwnProperty(prop) : false;
};

Box.prototype.ownKeys = function (target) {
    return this.context.copyUnreservedKeys(this.value, target);
};

Box.prototype.getOwnPropertyDescriptor = function (target, prop) {
    let result;

    if (prop === this.globalBox) prop = this.boxedArrayEnd;
    if (this.reservedProps.hasOwnProperty(prop)) {
        return this.reservedProps[prop].get.call(this);
    }

    if (isObject(this.value) || isFunction(this.value)) {
        result = Object.getOwnPropertyDescriptor(this.value, prop);
    }

    return result ? result : prop === 'length' ? Object.getOwnPropertyDescriptor(target, prop) : undefined;// { value: 0, writable: true, enumerable:false, configurable: false, } : undefined;
};

function createPropTransformList() {
    const iMax = arguments.length;
    let transforms;

    function copyTransforms(transform) {
        transform.forEach(item => {
            if (isObject(item)) {
                forEachKey(item, (key, value) => {
                    if (!transforms) transforms = {};
                    let transformList = transforms[key];
                    if (!transformList) {
                        transforms[key] = value;
                    } else {
                        if (!isArray(transformList)) {
                            transformList = [transformList];
                        }
                        transformList.push(value);
                    }
                });
            }
        });
    }

    for (let i = 0; i < iMax; i++) {
        const transform = arguments[i];

        if (isObject(transform)) {
            if (isArray(transform)) {
                copyTransforms(transform);
            } else {
                copyTransforms([transform]);
            }
        }
    }
    return transforms;
}

// always boxed in property is returned, no magic
Box.prototype.getBoxedProp = function (prop) {
    if (prop in this.boxedProps) {
        return this.boxedProps[prop];
    }

    let value = isObject(this.value) ? this.value[prop] : UNDEFINED;

    // pass transforms to child if our transforms for the property are an object with matching property name
    let setTransforms;
    // let getTransforms;
    let transforms;
    if (this.setTransforms) {
        const transform = this.setTransforms[prop];
        const defaultTransform = this.setTransforms[this.boxedArrayEnd];

        setTransforms = this.setTransforms && createPropTransformList(transform, defaultTransform);
        if (setTransforms) {
            transforms = { setTransforms: setTransforms };
        }
    }

    // if (this.getTransforms) {
    //     const transform = this.getTransforms[prop];
    //     const defaultTransform = this.getTransforms[this.boxedArrayEnd];
    //
    //     getTransforms = this.getTransforms && createPropTransformList(transform, defaultTransform);
    //     if (getTransforms) {
    //         if (!transforms) {
    //             transforms = { setTransforms: setTransforms };
    //         } else {
    //             transforms.getTransforms = getTransforms;
    //         }
    //     }
    // }

    let boxed = new Box(value, this, prop, undefined, transforms), BoxedHandler;
    if (this.modifiedProps.hasOwnProperty(prop)) {
        boxed.isCopy = true;
        boxed.isFullCopy = this.modifiedProps[prop];
    }
    this.boxedProps[prop] = boxed;
    boxedProxy(boxed);
    return boxed;
};

// magic works,
// all properties return boxed in proxy
Box.prototype.getBoxedIn = function (prop) {
    if (prop === this.globalBox) prop = this.boxedArrayEnd;
    if (this.reservedProps.hasOwnProperty(prop)) {
        return this.reservedProps[prop].getBoxedIn.call(this);
    }

    if (isObject(this.value)) {
        const element = this.value[prop];
        if (isFunction(element)) {
            return element;
        }
    }
    let boxed = this.getBoxedProp(prop);
    return boxed.boxedInProxy;
};

// magic works,
// pure Object and Array property values return boxed out objects
// the rest return the value of the property
Box.prototype.getBoxedOut = function (prop) {
    if (prop === this.globalBox) prop = this.boxedArrayEnd;
    if (this.reservedProps.hasOwnProperty(prop)) {
        return this.reservedProps[prop].getBoxedOut.call(this);
    }

    if (this.withBoxedOut) {
        const element = this.value[prop];
        if (getWithBoxedOutType(element)) {
            // pass through all non-pure Objects so that anything can be stored in the property and accessed via boxedOut
            let boxed = this.getBoxedProp(prop);
            return boxed.boxedOutProxy;
        }
        return element;
    }
    // should not happen unless the boxedOut proxy was held on to after value was changed
    return UNDEFINED;
};

Box.prototype.copyOfValue = function copyOfValue() {
    return util.copyArrayObject(this.value);
};

Box.prototype.boxedOfPath = function boxedOfPath(isBoxed, path) {
    if (isString(path)) {
        if (path) {
            let parts = path.split('.');
            let iMax = parts.length;
            let boxed = this;
            for (let i = 0; i < iMax; i++) {
                let part = parts[i];
                if (part !== this.boxedArrayEnd) {
                    if (this.reservedProps.hasOwnProperty(part)) {
                        throw "InvalidArgument, path parts cannot be reserved property names (other than " + this.boxedArrayEnd + "), got " + part + " in " + path;
                    }
                    boxed = boxed.getBoxedProp(part);
                }
            }

            let args = arguments.length;
            if (args > 2) { 
                // have value to set
                let value = arguments[2];
                if (isFunction(value)) {
                    let func = value;
                    if (args > 3) { 
                        // invoke with value as this and pass rest of argument
                        let argList = Array.prototype.slice.call(arguments, 3);
                        value = func.apply(isBoxed ? boxed.getBoxedOutValue() : boxed.value, argList);
                    } else {
                        // just pass it as arg and set to its return
                        value = func(isBoxed ? boxed.boxedInProxy: boxed.value);
                    }
                }
                
                boxed.setValueOf(value);
            }
            return boxed;
        }
        return this;
    } else {
        throw "InvalidArgument, only string path allowed, got " + path;
    }
};

Box.prototype.boxedInOfPath = function boxedInOfPath(path) {
    return this.boxedOfPath(true, ...arguments).boxedInProxy;
};

Box.prototype.valueOfPath = function valueOfPath(path) {
    return this.boxedOfPath(false, ...arguments).value;
};

function applyTransform(transforms, defaultTransforms, boxedArrayEnd, key, value, oldValue, getValue, setValue, applyFunctions, applyObjects) {
    if (transforms || defaultTransforms) {
        let allTransforms = [].concat(transforms, defaultTransforms);
        let jMax = allTransforms.length;
        for (let j = 0; j < jMax; j++) {
            let transform = allTransforms[j];
            if (transform) {
                if (applyObjects && isObject(transform)) {// recurse
                    value = applyTransforms(value, transform, boxedArrayEnd, applyFunctions, applyObjects);
                } else if (applyFunctions && isFunction(transform)) {
                    value = transform(value, key, oldValue, getValue, setValue);
                }
            }
        }
    }
    return value;
}

function applyTransforms(value, transforms, boxedArrayEnd, applyFunctions, applyObjects, markModified) {
    let isCopy;

    function setValue(prop, propValue) {
        if (value[prop] !== propValue) {
            if (!isCopy) {
                value = util.copyArrayObject(value);
                isCopy = true;
            }
            value[prop] = propValue;
            if (markModified) {
                markModified(prop);
            }
        }
    }

    function getValue(prop) {
        return value[prop];
    }

    const oldValues = Object.assign({}, value);
    let propValue;

    const defaultTransform = transforms[boxedArrayEnd];
    const keys = Object.keys(transforms);
    let i = keys.length;
    if (!defaultTransform || i > 1) {
        while (i--) {
            const key = keys[i];
            if (value.hasOwnProperty(key)) {
                let transformList = transforms[key];

                if (transformList) {
                    const oldValue = oldValues[key];
                    propValue = value[key];
                    propValue = applyTransform(transformList, defaultTransform, boxedArrayEnd, key, propValue, oldValue, getValue, setValue, applyFunctions, applyObjects);
                    setValue(key, propValue);
                }
            }
        }
    }
    if (defaultTransform) {
        // may have keys there were not processed above because they only have default transforms
        const keys = Object.keys(value);
        let i = keys.length;
        while (i--) {
            const key = keys[i];
            if (!transforms.hasOwnProperty(key)) {
                // was not done above
                const oldValue = oldValues[key];
                propValue = value[key];
                propValue = applyTransform(defaultTransform, undefined, boxedArrayEnd, key, propValue, oldValue, getValue, setValue, applyFunctions, applyObjects);
                setValue(key, propValue);
            }
        }
    }
    return value;
}

// used by transform callback
Box.prototype.getValueProp = function getValueProp(prop) {
    if (prop === this.toTransformKey) {
        return this.toTransformValue;
    }
    return isObject(this.value) && this.value.hasOwnProperty(prop) ? this.value[prop] : undefined;
};

// used by transform callback
Box.prototype.setValueProp = function setValueProp(prop, value) {
    if (prop === this.toTransformKey) {
        this.toTransformValue = value;
    } else if (!isObject(this.value) || this.value[prop] !== value) {
        if (!this.extraValues) this.extraValues = {};
        this.extraValues[prop] = value;
    }
};

// always works the same, boxed in or boxed out
// functions untouched and always refer to original object properties
Box.prototype.set = function (prop, value, boxed) {
    if (prop === this.globalBox) prop = this.boxedArrayEnd;
    const isArrayEnd = prop === this.boxedArrayEnd;

    if (!isArrayEnd) {
        if (this.reservedProps.hasOwnProperty(prop)) {
            return this.reservedProps[prop].set.call(this, value);
        }
    } else {
        prop = this.boxedArrayEnd;
    }

    // can't have boxed values here                  
    const boxedValue = value && value[BOXED_GET_THIS];
    if (boxedValue) {
        value = boxedValue.value;
    }

    let n = toArrayIndex(prop);
    const isNumeric = n !== UNDEFINED || isArrayEnd;
    prop = n || prop;

    if (boxed) {
        if (boxed !== this.boxedProps[prop]) {
            console.error("boxed child mismatch", boxed, this.boxedProps[prop]);
            throw "Boxed property mismatch";
        }
    }

    let canOptimizeSameValue = !isArrayEnd;
    // apply transform for this property before doing anything else with it
    const oldValue = isObject(this.value) ? this.value[prop] : undefined;
    if (this.setTransforms) {
        const transform = this.setTransforms[prop];
        const defaultTransform = this.setTransforms[this.boxedArrayEnd];
        if (transform || defaultTransform) {
            if (isArrayEnd) {
                prop = util.arrayEndIndex(this.value);
            }
            this.extraValues = undefined;
            this.toTransformValue = value;
            this.toTransformKey = prop;

            const untransformedValue = value;

            value = applyTransform(transform, defaultTransform, this.boxedArrayEnd, prop, value, oldValue, this.getValueProp, this.setValueProp, true, !boxed);

            if (this.extraValues) canOptimizeSameValue = false;
            // get the potentially transformed value, if it is changed then it boxed prop is invalid
            if (this.toTransformValue !== untransformedValue) {
                if (prop !== this.boxedArrayEnd) {
                    boxed = undefined;
                }
                value = this.toTransformValue;
            }
            this.toTransformValue = undefined;
            this.toTransformKey = undefined;
        }
    }

    let updateParent = !this.isCopy;
    if (!this.isCopy || !isObject(this.value)) {
        if (canOptimizeSameValue && isObject(this.value) && oldValue === value) return true;

        // value being modified, have to make a copy or create a new value since this one will have properties
        if (isNullOrUndefined(this.value) || !isObject(this.value)) {
            // create a new value which can hold properties
            this.value = isNumeric ? [] : {};

            // update our withBoxedOut and boxedOutProxy
            updateWithBoxedOut.call(this);

            this.isFullCopy = true; // all modifications will be reflected in the value, no need to track mods
        } else {
            this.value = this.copyOfValue();
        }

        updateParent = true;
        this.isCopy = true;
    } else {
        if (canOptimizeSameValue && oldValue === value) {
            // no change
            return true;
        }
    }

    if (isArrayEnd) {
        if (prop === this.boxedArrayEnd) prop = util.arrayEndIndex(this.value);
        this.value[prop] = value;
    } else {
        this.value[prop] = value;
        if (!boxed) {
            this.detachProp(prop);
        }
    }

    if (this.extraValues) {
        // copy out these to value
        util.forEachKey(this.extraValues, (key, value) => {
            this.value[key] = value;

            // extra overwrote boxed, invalidate it
            if (!boxed || boxed.prop !== key) {
                this.detachProp(key);
            }

            if (!this.isFullCopy) {
                // keeping track of modified properties that are unboxed
                this.modifiedProps[key] = true;
            }
        });
        this.extraValues = undefined;
    }

    if (updateParent && this.parent && this.prop) {
        // update self value in parent, without invalidating this boxed version
        this.parent.set(this.prop, this.value, this);
    }

    if (!this.isFullCopy) {
        // keeping track of modified properties that are unboxed
        this.modifiedProps[prop] = true;
    }

    return true;
};

Box.prototype.delete = function (prop) {
    if (prop === this.globalBox) prop = this.boxedArrayEnd;
    if (this.reservedProps.hasOwnProperty(prop)) {
        return this.reservedProps[prop].delete.call(this, true);
    }

    if (isObject(this.value) && this.value.hasOwnProperty(prop)) {
        // need to apply transforms
        const transform = prop !== this.boxedArrayEnd && this.setTransforms[prop];
        const defaultTransform = this.setTransforms[this.boxedArrayEnd];

        const oldValue = this.value[prop];

        if (transform || defaultTransform) {
            this.extraValues = undefined;
            this.toTransformValue = oldValue;
            this.toTransformKey = prop;

            let value = applyTransform(transform, defaultTransform, this.boxedArrayEnd, prop, undefined, oldValue, this.getValueProp, this.setValueProp, true, true);

            this.toTransformValue = undefined;
            this.toTransformKey = undefined;

            if (value !== undefined) {
                // delete cancelled
                this.extraValues = undefined;

                if (value !== oldValue) {
                    // we will use set to set it properly
                    this.set(prop, value)
                }
                return true;
            } else {
                if (this.extraValues) {
                    // copy out these to value
                    util.forEachKey(this.extraValues, (key, value) => {
                        this.value[key] = value;
                        this.detachProp(key);

                        if (!this.isFullCopy) {
                            // keeping track of modified properties that are unboxed
                            this.modifiedProps[key] = true;
                        }
                    });
                    this.extraValues = undefined;
                }
            }
        }

        this.detachProp(prop);

        // need to make a copy?
        let newValue = this.isCopy ? this.value : this.copyOfValue();

        if (delete newValue[prop]) {
            delete this.modifiedProps[prop];
            this.value = newValue;

            if (this.deleteEmptyCollections && !hasOwnProperties(this.value)) {
                // no props left then ask parent to delete our property
                if (this.prop && this.parent) {
                    // update self value in parent, without invalidating this boxed version
                    if (!this.parent.delete(this.prop)) {
                        // can't delete, update self value in parent, without invalidating this boxed version
                        this.parent.set(this.prop, this.value, this);
                    }
                }
            } else {
                if (!this.isCopy && this.prop && this.parent) {
                    // update self value in parent, without invalidating this boxed version
                    this.parent.set(this.prop, this.value, this);
                }
            }

            this.isCopy = true;
        }
    }

    return true;
};

Box.prototype.valueOf = function () {
    // if ours is a copy then give a copy of it back so we don't need to make copy on every mod
    return this.value;
};

Box.prototype.setValueOf = function (value) {
    // set value to new value as if it was unmodified, detach all boxed props, clear isCopy if value not already equal
    if (isObject(this.setTransforms)) {
        value = applyTransforms(value, this.setTransforms, this.boxedArrayEnd, true, true);
    }

    if (this.value !== value) {
        if (value === UNDEFINED && this.context.ignoreUndefinedProperties) {
            if (this.deleteValueOf()) return true;
        }

        this.value = value;
        this.isCopy = true;
        this.isFullCopy = true;

        // update our withBoxedOut and boxedOutProxy
        updateWithBoxedOut.call(this);

        // detach all boxed props and clear modified props, we don't need them.
        this.detachAllProps();
        this.modifiedProps = {};

        if (this.parent && this.prop) {
            // set in parent so we are invalidated
            this.parent.set(this.prop, value, this);
        }
    }
    return true;
};

Box.prototype.deleteValueOf = function () {
    if (this.parent && this.prop && this.context.ignoreUndefinedProperties) {
        if (this.parent.delete(this.prop)) return true;
    }
    return this.setValueOf(UNDEFINED);
};

Box.prototype.isModified = function () {
    return this.isCopy;
};

Box.prototype.valueOfModified = function () {
    return this.isCopy ? this.valueOf() : UNDEFINED;
};

// synonym for setValueOf()
Box.prototype.setValueOfModified = function (value) {
    return this.setValueOf(value);
};

Box.prototype.deleteValueOfModified = function () {
    return this.deleteValueOf();
};

// only set this.value is undefined and value is not undefined 
Box.prototype.setValueOfDefaultMagic = function (value) {
    return this.value !== UNDEFINED || value === UNDEFINED || this.setValueOf(value);
};

function defaultOptions(options) {
    return options === 'shallow' && 1 || (options === 'deep' || options === 'merge') && Number.MAX_SAFE_INTEGER || toNumericInteger(options);
}

// only set value if undefined  this is for .$_default()
Box.prototype.setValueOfDefaultImpl = function (boxedIn, options, value) {
    if (value === UNDEFINED) value = options;
    if (value !== UNDEFINED) {
        if (this.value === UNDEFINED) this.setValueOf(value);
        else if (isObject(this.value) && typeof this.value === typeof value && options) {
            let levels = defaultOptions(options);
            if (levels === UNDEFINED && isObject(options)) levels = defaultOptions(options['levels']);
            if (levels > 0) {
                if (isArray(value)) {
                    // TODO: implement arrays
                    // throw "Merging of array values is not implemented";
                } else {
                    // each property which is an object is passed to its boxed counterpart
                    forEachKey(value, (key, keyValue) => {
                        const valueProp = this.value[key];
                        if (valueProp === UNDEFINED) {
                            // just set it
                            this.set(key, keyValue);
                        } else if (levels > 1) {
                            if (isObject(valueProp) && typeof keyValue === typeof valueProp) {
                                // pass it to boxed
                                this.getBoxedProp(key).setValueOfDefaultImpl(true, levels - 1, keyValue);
                            }
                        }
                    });
                }
            }
        }
    }
    return boxedIn ? this.boxedInProxy : this.getBoxedOutValue();
};

Box.prototype.setValueOfBoxedOutDefault = function (options, value) {
    return this.setValueOfDefaultImpl(false, options, value);
};

// only set value if undefined this is for .default_$()
Box.prototype.setValueOfBoxedInDefault = function (options, value) {
    return this.setValueOfDefaultImpl(true, options, value);
};

// Box.prototype.valueOfBoolean = function () {
//     return !!this.value;
// };
//
// // convert to boolean before setting
// Box.prototype.setValueOfBoolean = function (value) {
//     return this.setValueOf(!!value);
// };

// if value is object or array: return only first level children that were modified or UNDEFINED if no mods
// if otherwise same as valueOfModified return value if modified or UNDEFINED if not modified
// here we do not copy
Box.prototype.unboxedDelta = function () {
    if (!this.isCopy || this.isFullCopy || !isObject(this.value)) {
        return this.valueOfModified();
    }

    // we will copy out only modified values
    // arrayDeltaObjects: when true array deltas will be copied as objects so no erroneous undefs
    // arrayDeltaPartials: when true array deltas will contain undefined for all unmodified fields or deleted fields
    let isArrayDelta = !this.context.arrayDeltaObjects && !this.context.arrayDeltaPartials && isArray(this.value);
    let delta = !isArrayDelta ? {} : this.value.constructor(); // always something or we would not be here

    let keys = Object.keys(this.modifiedProps);
    let i = keys.length;

    if (isArrayDelta) {
        let maxIndex = UNDEFINED;
        while (i--) {
            let prop = keys[i];
            // these are modified, we get our prop value for them
            let n = toArrayIndex(prop);
            if (n !== UNDEFINED && maxIndex === UNDEFINED || n > maxIndex) {
                maxIndex = n;
            } else {
                let value = this.value[prop];
                // TEST: that undefined values are not added to delta && deepDelta unless this.ignoreUndefinedProperties is false
                if (value !== UNDEFINED || !this.ignoreUndefinedProperties) delta[prop] = value;
            }
        }

        if (maxIndex !== UNDEFINED) {
            // copy from 0 to maxIndex
            i = maxIndex + 1;
            while (i--) {
                delta[i] = this.value[i];
            }
        }
    } else {
        while (i--) {
            let prop = keys[i];
            // these are modified, we get our prop value for them
            let value = this.value[prop];
            // TEST: that undefined values are not added to delta && deepDelta unless this.ignoreUndefinedProperties is false
            if (value !== UNDEFINED || !this.ignoreUndefinedProperties) delta[prop] = value;
        }
        if (isArray(this.value) && this.context.arrayDeltaObjectMarker !== UNDEFINED) {
            delta[this.context.arrayDeltaObjectMarker] = this.context.arrayDeltaObjectMarkerValue;
        }
    }

    return delta;
};

Box.prototype.setUnboxedDelta = function (value) {
    if (!isObject(this.value) || !isObject(value)) {
        return this.setValueOf(value);
    }

    // do shallow update with contents of value
    let keys = Object.keys(value);
    let i = keys.length;
    while (i--) {
        let prop = keys[i];
        // these are modified, we get our prop value for them
        this.set(prop, value[prop]);
    }
    return true;
};

Box.prototype.deleteUnboxedDelta = function () {
    return false;
};

// if value is object or array: return only modified properties (deep down)
// if otherwise same as valueOfModified return value if modified or UNDEFINED if not modified
// here we do not copy
Box.prototype.unboxedDeepDelta = function () {
    if (!this.isCopy || this.isFullCopy || !isObject(this.value)) {
        return this.valueOfModified();
    }

    // we will copy out only modified values
    // arrayDeltaObjects: when true array deltas will be copied as objects so no erroneous undefs
    // arrayDeltaPartials: when true array deltas will contain undefined for all unmodified fields or deleted fields
    let isArrayDelta = !this.context.arrayDeepDeltaObjects && isArray(this.value);
    let isPureArrayDelta = isArrayDelta && !this.context.arrayDeepDeltaPartials;
    let delta = !isArrayDelta ? {} : this.value.constructor();

    let keys = Object.keys(this.modifiedProps);
    let i = keys.length;

    if (isPureArrayDelta) {
        let maxIndex = UNDEFINED;
        while (i--) {
            let prop = keys[i];
            // these are modified, we get our prop value for them
            let n = toArrayIndex(prop);
            if (n !== UNDEFINED && maxIndex === UNDEFINED || n > maxIndex) {
                maxIndex = n;
            } else {
                let value = this.value[prop];
                // TEST: undefined values are not added to delta && deepDelta unless this.ignoreUndefinedProperties is false
                if (value !== UNDEFINED || !this.ignoreUndefinedProperties) delta[prop] = value;
            }
        }

        if (maxIndex !== UNDEFINED) {
            // copy from 0 to maxIndex
            i = maxIndex + 1;
            while (i--) {
                delta[i] = this.value[i];
            }
        }
    } else {
        // we will copy out only modified values
        while (i--) {
            let prop = keys[i];
            // these are modified, we get our prop value for them
            if (this.boxedProps.hasOwnProperty(prop)) {
                // can get deep delta
                let value = this.boxedProps[prop].unboxedDeepDelta();
                // TEST: that undefined values are not added to delta && deepDelta unless this.ignoreUndefinedProperties is false
                if (value !== UNDEFINED || !this.ignoreUndefinedProperties) delta[prop] = value;
            } else {
                // all of it is considered modified
                let value = this.value[prop];
                // TEST: that undefined values are not added to delta && deepDelta unless this.ignoreUndefinedProperties is false
                if (value !== UNDEFINED || !this.ignoreUndefinedProperties) delta[prop] = value;
            }
        }
        if (isArray(this.value) && this.context.arrayDeepDeltaObjectMarker !== UNDEFINED) {
            delta[this.context.arrayDeepDeltaObjectMarker] = this.context.arrayDeepDeltaObjectMarkerValue;
        }
    }
    return delta;
};

Box.prototype.setUnboxedDeepDelta = function (value) {
    if (!isObject(this.value)) {
        return this.setValueOf(value);
    }

    // do deep update with contents of value
    let keys = Object.keys(value);
    let i = keys.length;
    const context = this.context;
    while (i--) {
        let prop = keys[i];
        const propValue = value[prop];
        if (!isObject(propValue)) {
            // just set it
            this.set(prop, propValue);
        } else {
            // let the boxed prop do a deep delta on its value
            this.getBoxedProp(prop).setUnboxedDeepDelta(propValue);
        }
    }
    return true;
};

Box.prototype.deleteUnboxedDeepDelta = function () {
    return false;
};

/**
 * For all real values of unboxed item. Makes it easier to loop over all real values.
 *
 * For arrays will only include numeric keys (ie. indices)
 *
 * @param boxedIn true if boxedIn version of each key function
 * @param args {Array}  arguments, last one is the callback function
 *
 *              arg: strings & numbers are keys of interest, will be pre-filtered, saves on creating a proxy for undesired properties
 *              arg: object, then assumed to hold options:
 *                  props: default false, true to have arrays include non-numeric keys
 *                  undefs: default false, true to have keys and array indices with undefined values included
 *
 *              NOT IMPLEMENTED:
 *              arg: array, contains args other than callback
 *
 * @returns {Proxy}  of self for chaining
 *
 * TODO: refactor and add options for: exclude: keys, so that both would filter keys
 *
 */
function forEachKeyImpl(boxedIn, args) {
    let value = this.value;

    function doCallBack(prop, options, callBack) {
        let item = value[prop];
        if (item !== UNDEFINED || options.undefs) {
            if (boxedIn) {
                callBack(prop, this.getBoxedIn(prop), item);
            } else {
                const boxedOutProp = this.getBoxedOut(prop);
                callBack(prop, boxedOutProp !== UNDEFINED ? boxedOutProp : item, item);
            }
        }
    }

    if ((isArray(args) || typeof args === typeof arguments) && isObject(value)) {
        let argCount = args.length - 1;
        const callBack = args[argCount];

        if (isFunction(callBack)) {
            // can work with it
            let i;
            let filteredKeys;
            let options = {};
            const isArrayValue = isArray(value);
            let wantIntegers = isArrayValue && !options.props;
            let n;

            if (argCount) {
                i = argCount;
                filteredKeys = [];
                while (i--) {
                    let arg = args[i];
                    if (isObject(arg)) {
                        options.props = arg.props;
                        options.undefs = arg.undefs;
                    } else if (wantIntegers && (n = toArrayIndex(arg))) {
                        filteredKeys.push(n);
                    } else {
                        filteredKeys.push(arg);
                    }
                }
            }

            if (filteredKeys) {
                // both arrays and objects, filtered keys has only integers if so requested
                let keys = filteredKeys;
                let i = keys.length;
                while (i--) {
                    let prop = keys[i];
                    if (value.hasOwnProperty(prop)) {
                        if (isArrayValue) prop = toNumberIfArrayIndex(prop);
                        doCallBack.call(this, prop, options, callBack);
                    }
                }
            } else {
                if (isArrayValue && !options.props) {
                    let i = value.length;
                    while (i--) {
                        doCallBack.call(this, i, options, callBack);
                    }
                } else {
                    let keys = Object.keys(value);
                    let i = keys.length;
                    while (i--) {
                        let prop = keys[i];
                        if (isArrayValue) prop = toNumberIfArrayIndex(prop);
                        doCallBack.call(this, prop, options, callBack);
                    }
                }
            }
        }
    }
    return boxedIn ? this.boxedInProxy : this.boxedOutProxy;
}

Box.prototype.forEachKey = function () {
    forEachKeyImpl.call(this, false, arguments);
};

Box.prototype.ifImpl = function (boxedIn, preCondition, args) {
    if (preCondition) {
        const callback = args[0];
        const type = typeof args;
        if (isFunction(callback)) {
            const value = boxedIn ? this.boxedInProxy : this.getBoxedOutValue();
            // const callArgs = Array.prototype.slice(args, 1);
            // const callArgs = Object.assign([], args);
            if (args.length > 1) {
                // must not want value, passing a function, set this to value
                const callArgs = Array.prototype.slice.call(args, 1);
                return callback.apply(value, callArgs);
            } else {
                args[0] = value;
                return callback.apply(value, args);
            }
        }
    }
};

Box.prototype.ifValueBoxedOut = function () {
    return this.ifImpl(false, this.value, arguments);
};

Box.prototype.ifValueBoxedIn = function (callback) {
    return this.ifImpl(true, this.value, arguments);
};

Box.prototype.ifValueDefinedBoxedOut = function (callback) {
    return this.ifImpl(false, this.value !== UNDEFINED, arguments);
};

Box.prototype.ifValueDefinedBoxedIn = function (callback) {
    return this.ifImpl(true, this.value !== UNDEFINED, arguments);
};

Box.prototype.ifValueValidBoxedOut = function (callback) {
    return this.ifImpl(false, util.isValid(this.value), arguments);
};

Box.prototype.ifValueValidBoxedIn = function (callback) {
    return this.ifImpl(true, util.isValid(this.value), arguments);
};

Box.prototype.ifValueArrayBoxedOut = function (callback) {
    return this.ifImpl(false, util.isArray(this.value), arguments);
};

Box.prototype.ifValueArrayBoxedIn = function (callback) {
    return this.ifImpl(true, util.isArray(this.value), arguments);
};

Box.prototype.ifValueObjectBoxedOut = function (callback) {
    return this.ifImpl(false, util.isObject(this.value), arguments);
};

Box.prototype.ifValueObjectBoxedIn = function (callback) {
    return this.ifImpl(true, util.isObject(this.value), arguments);
};

/**
 * For all real values of unboxed item. Makes it easier
 * to loop over all real values.
 *
 * @param arguments  see forEachKeyImpl
 *
 * @returns {Box}
 */
Box.prototype.forEachKeyBoxed = function () {
    forEachKeyImpl.call(this, true, arguments);
};

function isBox(target) {
    return isObject(target) && target.constructor === Box;
}

module.exports.isBox = isBox;

function thisBox(target) {
    return isBoxedProxy(target) || null;
}

module.exports.thisBox = thisBox;

function isBoxedProxy(target) {
    let box;
    return target && (box = target[BOXED_GET_THIS]) && isBox(box) ? box : null;
}

module.exports.isBoxedProxy = isBoxedProxy;

function isBoxedOutProxy(target) {
    let box;
    return target && (box = target[BOXED_GET_THIS]) && isBox(box) && target === box.boxedOutProxy ? box : null;
}

module.exports.isBoxedOutProxy = isBoxedOutProxy;

function isBoxedInProxy(target) {
    let box;
    return target && (box = target[BOXED_GET_THIS]) && isBox(box) && target === box.boxedInProxy ? box : null;
}

module.exports.isBoxedInProxy = isBoxedInProxy;

function throwError(box) {
    if (box === UNDEFINED) {
        throw "BoxedHandler: IllegalArgument expected box function target";
    } else {
        throw "BoxedHandler: IllegalState boxedOut proxy is already detached, probably held on to a boxedIn proxy after the type of the property value was changed";
    }
}

const BoxedHandler = {
    // target is the box function with
    get: function (target, prop, receiver) {
        const box = target[BOXED_GET_THIS];
        if (box) {
            if (prop === BOXED_GET_THIS) {
                return box;
            } else if (prop === box.context.boxedInSuffix) {
                return box.boxedInProxy;
            }
            return box.withBoxedIn === target ? box.getBoxedIn(prop) : box.getBoxedOut(prop);
        }
        throwError(box);
    },

    set: function (target, prop, value, receiver) {
        const box = target[BOXED_GET_THIS];
        if (box) {
            if (prop === BOXED_GET_THIS) {
                return false;
            }
            return box.set(prop, value);
        }
        throwError(box);
    },

    has: function (target, prop) {
        const box = target[BOXED_GET_THIS];
        if (box) {
            if (prop === BOXED_GET_THIS) {
                return true;
            }
            return box.has(target, prop);
        }
        throwError(box);
    },

    ownKeys: function (target) {
        const box = target[BOXED_GET_THIS];
        if (box) {
            return box.ownKeys(target);
        }
        throwError(box);
    },

    deleteProperty: function (target, prop) {
        const box = target[BOXED_GET_THIS];
        if (box) {
            if (prop === BOXED_GET_THIS) {
                return false;
            }
            return box.delete(prop);
        }
        throwError(box);
    },

    getOwnPropertyDescriptor: function (target, prop) {
        const box = target[BOXED_GET_THIS];
        if (box) {
            if (prop === BOXED_GET_THIS) {
                return { value: box, writable: false, enumerable: false, configurable: false, get: UNDEFINED, set: UNDEFINED, };
            }
            return box.getOwnPropertyDescriptor(target, prop);
        }
        throwError(box);
    },

    // Not needed.
    // apply: function (target, thisArg, argumentsList) {
    //     return target.apply(thisArg, argumentsList);
    // },
};

let globalBoxKey; // set on first use

function toBoolean(arg) {
    return !!arg;
}

function toBooleanDefaultTrue(arg) {
    return arg === UNDEFINED ? true : !!arg;
}

function toBooleanNot(arg) {
    return !arg;
}

function isPrefixedToBoolean(arg, prop) {
    return util.startsWith(prop, 'is') ? !!arg : arg;
}

function regexMatchProp(regex, filter) {
    return function () {
        const prop = arguments[1];
        if (prop.match(regex)) {
            return filter.apply(this, arguments);
        }
        return arguments[0];
    }
}

function toDefault(defaultValue) {
    return function toDefault(value) {
        return value === UNDEFINED ? defaultValue : value;
    }
}

function f() {

}

function toAlwaysTrue() {
    return true;
}

function toAlwaysFalse() {
    return false;
}

const TRANSFORMS = {
    toBoolean: toBoolean,
    toBooleanDefaultTrue: toBooleanDefaultTrue,
    toAlwaysTrue: toAlwaysTrue,
    toAlwaysFalse: toAlwaysFalse,
    isPrefixedToBoolean: isPrefixedToBoolean,
    regexMatchProp: regexMatchProp,
    toDefault: toDefault,
    toBooleanNot: toBooleanNot,
};

function createBox(options) {
    let context = new BoxContext(options);
    let boxOnlyOptions = util.copyProperties(options, BOX_ONLY_PROPERTIES);
    let boxOptionOverride = undefined;

    let boxedIn = function boxedIn() {
        // global _$
        // if last arg: function => withBoxedIn(_$ => { _$ }) on boxed of previous params
        // single arg: return boxed
        // multiple args: return boxed array of args
        let args = arguments.length;
        let callBack;
        if (args && isFunction(arguments[args - 1])) {
            args--;
            callBack = arguments[args];
        }

        let value;
        if (args) {
            if (args > 1) {
                value = [...arguments].splice(args, 1);
            } else {
                value = arguments[0];
            }
        }

        let box;
        if (isObject(boxOptionOverride)) {
            box = new Box(value, UNDEFINED, UNDEFINED, context, Object.assign({}, boxOnlyOptions, boxOptionOverride));
        } else {
            box = new Box(value, UNDEFINED, UNDEFINED, context, boxOnlyOptions);
        }

        boxOptionOverride = undefined;

        boxedProxy(box);

        if (callBack) {
            box.withBoxedIn(callBack);
        }
        return box.boxedInProxy;
    };

    function withBoxOptions(options) {
        boxOptionOverride = options;
        return boxedIn.apply(boxedIn, Array.prototype.slice.call(arguments, 1));
    }

    // change to string so that global _$ will be recognized as array end property
    boxedIn.withBoxOptions = withBoxOptions.bind(boxedIn);
    boxedIn.transform = TRANSFORMS;

    if (!globalBoxKey) {
        let obj = {};
        obj[boxedIn] = 0;
        globalBoxKey = Object.keys(obj)[0];
    }

    context.globalBox = globalBoxKey;
    boxedIn.boxedContext = context;
    return boxedIn;
}

// create customized context
module.exports.createBox = createBox;

module.exports.box = createBox();

