/** internal
 * class Boxed
 *
 * Implements boxed property functionality
 *
 **/

'use strict';

const util = require('./util');
const isNumericInteger = util.isNumericInteger;
const isArrayIndex = util.isArrayIndex;
const toArrayIndex = util.toArrayIndex;
const toNumberIfArrayIndex = util.toNumberIfArrayIndex;
const unwrap = util.unwrap;
const wrap = util.wrap;
const isWrapped = util.isWrapped;
const isFunction = util.isFunction;
const isObject = util.isObject;
const isArray = util.isArray;
const isNullOrUndefined = util.isNullOrUndefined;
const hasOwnProperties = util.hasOwnProperties;
const UNDEFINED = util.UNDEFINED;
const firstDefined = util.firstDefined;

const BOXED_GET_THIS = "@@BOXED_THIS";
module.exports.BOXED_GET_THIS = BOXED_GET_THIS;

// default inside and outside markers
const BOXED_INSIDE = "_$"; // also works as array end
const BOXED_OUTSIDE = "$_";
const BOXED_ARRAY_END = "";

// reserved mappings, this is the Boxed instance for the call
// reserved props are not prefixed or suffixed

// Here this is the BoxedIn or the BoxedOut instance which are pure objects since they don't need inheritance
const RESERVED_PROPS = {
    _$: {  // BOXED_INSIDE, request boxedIn from parent
        getBoxedIn: function () {return this.boxedInProxy;},
        getBoxedOut: function () {return this.boxedInProxy;},
        set: function (value) {return this.setValueOf(value);},
        delete: function () {return this.deleteValueOf();},
        ownPropertyDescriptor: function () {return { value: this.value, writable: true, /*enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    $_: { // BOXED_OUTSIDE: request boxedOut from parent
        getBoxedIn: function () {return this.getBoxedOutValue();},
        getBoxedOut: function () {return this.getBoxedOutValue();}, // withBoxedOut is an object, cannot return ref to self, otherwise infinite loop is created when full depth is traversed.
        set: function (value) {return this.setValueOf(value);},
        delete: function () {return this.deleteValueOf();},
        ownPropertyDescriptor: function () {return { value: this.getBoxedOutValue(), writable: !!this.boxedOutProxy, /*enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    forEachKey$_: {
        getBoxedIn: function () {return this.forEachKey;},
        getBoxedOut: function () {return this.forEachKey;},
        set: function (value) {return false;},
        delete: function () {return false;},
        ownPropertyDescriptor: function () {return { value: this.forEachKey, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
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
    default$_: {
        getBoxedIn: function () {return this.setValueOfBoxedOutDefault;},
        getBoxedOut: function () {return this.setValueOfBoxedOutDefault;},
        set: function (value) {return this.setValueOfDefaultMagic(value);},
        delete: function () {return false;},
        ownPropertyDescriptor: function () {return { value: this.setValueOfBoxedOutDefault, writable: true, /*enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    value$_: {
        getBoxedIn: function () {return this.valueOf();},
        getBoxedOut: function () {return this.valueOf();},
        set: function (value) {return this.setValueOf(value);},
        delete: function () {return this.deleteValueOf();},
        ownPropertyDescriptor: function () {return { value: this.value, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    modified$_: {
        getBoxedIn: function () {return this.valueOfModified();},
        getBoxedOut: function () {return this.valueOfModified();},
        set: function (value) {return this.setValueOfModified(value);},
        delete: function () {return this.deleteValueOfModified();},
        ownPropertyDescriptor: function () {return { value: this.isCopy ? this.value : UNDEFINED, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    delta$_: {
        getBoxedIn: function () {return this.unboxedDelta();},
        getBoxedOut: function () {return this.unboxedDelta();},
        set: function (value) {return this.setUnboxedDelta(value);},
        delete: function () {return this.deleteUnboxedDelta();},
        ownPropertyDescriptor: function () {return { value: this.isCopy ? this.unboxedDelta() : UNDEFINED, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    deepDelta$_: {
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

// boxed options context
function BoxContext(options, parent) {
    options = Object.assign({}, options || {});

    // don't allow suffix/prefix overrides if have parent, otherwise we cannot communicate
    if (parent) {
        options.insideBox = parent.insideBox;
        options.outsideBox = parent.outsideBox;
        this.globalBox = parent.context.globalBox; // will be set by box
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
    this.insideBox = (options.insideBox || BOXED_INSIDE);
    this.outsideBox = (options.outsideBox || BOXED_OUTSIDE);
    this.boxedArrayEnd = this.insideBox;

    const magicParamsKey = this.insideBox + "|" + this.outsideBox;  // _$|$_

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
        return prop.substr(0, prop.length - BOXED_INSIDE.length) + this.insideBox;
    } else if (util.endsWith(prop, BOXED_OUTSIDE)) {
        return prop.substr(0, prop.length - BOXED_OUTSIDE.length) + this.outsideBox;
    }
    return prop;
};

BoxContext.prototype.boxedContext = function (options) {
    return !hasOwnProperties(options) ? this : new BoxContext(options, this);
};

BoxContext.prototype.copyUnreservedKeys = function (arg) {
    if (!(isObject(arg) || isFunction(arg))) return [];
    // if (!arg) return [];

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
    if (isArray(arg) && keys.indexOf('length') === -1) { 
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
    // box.setValueOfBoxedInDefault = box.setValueOfBoxedInDefault.bind(box);
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

    box.withBoxedIn[BOXED_GET_THIS] = box;
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
 */
function Box(value, parent, prop, options) {
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

    // these will be set by proxy wrapped versions, we don't need access to them
    this.boxedInProxy = UNDEFINED;  // pure objects for proxy use
    this.boxedOutProxy = UNDEFINED;  // pure objects for proxy use

    // really need to have this be set to the same type of object as the value, if the value does not exist
    // then can be anything, but as soon as value is changed this should also change to reflect a new type
    // so that type comparison for object or array will at least match.
    this.withBoxedOut = getWithBoxedOut(this.value);

    this.isCopy = false; // set on first modification
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
 * @param callBack {function}  callback for taking proxy as argument for ._$(_$ => {})
 * @returns {*}    returns the results of the callback or undefined
 */
function withBoxedIn(callBack) {
    // const callBack = argumentList[0];
    if (isFunction(callBack)) {
        let proxy = this.boxedInProxy;
        return callBack(proxy);
    }
    return undefined;
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

Box.prototype.has = function (prop) {
    if (prop === this.globalBox) prop = BOXED_ARRAY_END;
    if (this.reservedProps.hasOwnProperty(prop)) {
        return false;
    }
    return isObject(this.value) ? this.value.hasOwnProperty(prop) : false;
};

Box.prototype.ownKeys = function () {
    return this.context.copyUnreservedKeys(this.value);
};

Box.prototype.getOwnPropertyDescriptor = function (prop) {
    if (prop === this.globalBox) prop = BOXED_ARRAY_END;
    if (this.reservedProps.hasOwnProperty(prop)) {
        return this.reservedProps[prop].get.call(this);
    }

    if (isObject(this.value) || isFunction(this.value)) {
        return Object.getOwnPropertyDescriptor(this.value, prop);
    }
    return undefined;
};

// always boxed in property is returned, no magic
Box.prototype.getBoxedProp = function (prop) {
    if (prop in this.boxedProps) {
        return this.boxedProps[prop];
    }

    let value = isObject(this.value) ? this.value[prop] : UNDEFINED;
    let boxed = new Box(value, this, prop), BoxedHandler;
    if (this.modifiedProps.hasOwnProperty(prop)) {
        boxed.isCopy = true;
    }
    this.boxedProps[prop] = boxed;
    boxedProxy(boxed);
    return boxed;
};

// magic works,
// all properties return boxed in proxy
Box.prototype.getBoxedIn = function (prop) {
    if (prop === this.globalBox) prop = BOXED_ARRAY_END;
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
    if (prop === this.globalBox) prop = BOXED_ARRAY_END;
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

// always works the same, boxed in or boxed out
// functions untouched and always refer to original object properties
Box.prototype.set = function (prop, value, boxed) {
    if (prop === this.globalBox) prop = BOXED_ARRAY_END;
    const isArrayEnd = prop === BOXED_ARRAY_END || prop === this.context.boxedArrayEnd;

    if (!isArrayEnd) {
        if (this.reservedProps.hasOwnProperty(prop)) {
            return this.reservedProps[prop].set.call(this, value);
        }
    }

    // can't have boxed values here                  
    const boxedValue = value && value[BOXED_GET_THIS];
    if (boxedValue && boxedValue.thisBox) {
        value = boxedValue.thisBox.value;
    }

    let n = toArrayIndex(prop);
    const isNumeric = n !== UNDEFINED;
    prop = n || prop;
    let updateParent = !this.isCopy;

    if (!this.isCopy || !isObject(this.value)) {
        if (!isArrayEnd && isObject(this.value) && this.value[prop] === value) return true;

        // value being modified, have to make a copy or create a new value since this one will have properties
        if (isNullOrUndefined(this.value) || !isObject(this.value)) {
            // create a new value which can hold properties
            this.value = isNumeric || isArrayEnd ? [] : {};

            // update our withBoxedOut and boxedOutProxy
            updateWithBoxedOut.call(this);

            this.isFullCopy = true; // all modifications will be reflected in the value, no need to track mods
        } else {
            this.value = this.copyOfValue();
        }

        updateParent = true;
        this.isCopy = true;
    } else {
        if (!isArrayEnd && this.value[prop] === value) {
            // no change
            return true;
        }
    }

    if (isArrayEnd) {
        if (!isArray(this.value)) {
            // lets not bicker and look for last integer field in object
            let keys = Object.keys(this.value);
            let propKey = 0;
            let i = keys.length;
            while (i--) {
                let key = toArrayIndex(keys[i]);
                if (key !== UNDEFINED) {
                    let index = key + 1;
                    if (propKey < index) propKey = index;
                }
            }
            prop = propKey;
            this.value[prop] = value;
        } else {
            prop = this.value.length;
            this.value[prop] = value;
        }
    } else {
        this.value[prop] = value;
        if (boxed) {
            if (boxed !== this.boxedProps[prop]) {
                console.error("boxed child mismatch", boxed, this.boxedProps[prop]);
            }
        } else {
            this.detachProp(prop);
        }
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
    if (prop === this.globalBox) prop = BOXED_ARRAY_END;
    if (this.reservedProps.hasOwnProperty(prop)) {
        return this.reservedProps[prop].delete.call(this, true);
    }

    this.detachProp(prop);

    if (this.value.hasOwnProperty(prop)) {
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

// only set value if undefined  this is for .default$_()
Box.prototype.setValueOfBoxedOutDefault = function (value) {
    if (this.value === UNDEFINED && value !== UNDEFINED) this.setValueOf(value);
    return this.boxedOutProxy || this.value;
};

// only set value if undefined this is for .default_$()
Box.prototype.setValueOfBoxedInDefault = function (value) {
    if (this.value === UNDEFINED && value !== UNDEFINED) this.setValueOf(value);
    return this.boxedInProxy;
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

/**
 * For all real values of unboxed item. Makes it easier
 * to loop over all real values.
 *
 * @param arguments  see forEachKeyImpl
 *
 * @returns {Box}
 */
Box.prototype.forEachKey = function () {
    forEachKeyImpl.call(this, false, arguments);
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
            return box.has(prop);
        }
        throwError(box);
    },

    ownKeys: function (target) {
        const box = target[BOXED_GET_THIS];
        if (box) {
            return box.ownKeys();
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
                return { value: box, };
            }
            return box.getOwnPropertyDescriptor(prop);
        }
        throwError(box);
    },

    // Not needed.
    // apply: function (target, thisArg, argumentsList) {
    //     return target.apply(thisArg, argumentsList);
    // },
};

let globalBoxKey; // set on first use

function createBox(options) {
    let context = new BoxContext(options);

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

        let box = new Box(value, UNDEFINED, UNDEFINED, context);
        boxedProxy(box);

        if (callBack) {
            box.withBoxedIn(callBack);
        }
        return box.boxedInProxy;
    };

    // change to string so that global _$ will be recognized as array end property
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

