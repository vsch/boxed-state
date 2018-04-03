/** internal
 * class Boxed
 *
 * Implements boxed property functionality
 *
 **/

'use strict';

const util = require('./util');
const isNumericInteger = util.isNumericInteger;
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
exports.BOXED_GET_THIS = BOXED_GET_THIS;

const BOXED_ARRAY_END = "";

// reserved mappings, this is the Boxed instance for the call
// reserved props are not prefixed or suffixed
const RESERVED_PROPS = {
    // "@@BOXED_THIS": {
    //     get: function () {return this;},
    //     set: function (value) {return false;},
    //     delete: function () {return false;},
    //     ownPropertyDescriptor: function () {return { value: this, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    // },
    forEach: {
        get: function () {return this.boxedForEach;},
        set: function (value) {return false;},
        delete: function () {return false;},
        ownPropertyDescriptor: function () {return { value: this.boxedForEach, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    unboxed: {
        get: function () {return this.valueOf();},
        set: function (value) {return this.setValueOf(value);},
        delete: function () {return this.deleteValueOf();},
        ownPropertyDescriptor: function () {return { value: this.value, writable: true, /*enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    default: {
        get: function () {return this.setDefaultValue;},
        set: function (value) {return this.setDefaultValue(value);},
        delete: function () {return false;},
        ownPropertyDescriptor: function () {return { value: this.value, writable: true, /*enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    "": {  // $boxed with after stripping off prefix/suffix _$
        get: function () {return this.proxiedThis;},
        set: function (value) {return false;}, // this does not get here, intercepted in set, it is boxedValue[$] = ..., or boxedValue.$ = ..., ie. we treat it as append to end of array!
        delete: function () {return false;},    // this is delete boxedValue[$]; or delete boxedValue.$; in either case we don't have a meaning for this
        ownPropertyDescriptor: function () {return { value: this.boxedWith, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    modified: {
        get: function () {return this.valueOfModified();},
        set: function (value) {return this.setValueOfModified(value);},
        delete: function () {return this.deleteValueOfModified();},
        ownPropertyDescriptor: function () {return { value: this.value, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    delta: {
        get: function () {return this.unboxedDelta();},
        set: function (value) {return this.setUnboxedDelta(value);},
        delete: function () {return this.deleteUnboxedDelta();},
        ownPropertyDescriptor: function () {return { value: this.value, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    deepDelta: {
        get: function () {return this.unboxedDeepDelta();},
        set: function (value) {return this.setUnboxedDeepDelta(value);},
        delete: function () {return this.deleteUnboxedDeepDelta();},
        ownPropertyDescriptor: function () {return { value: this.value, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
};

const RESERVED_PROPS_LIST = Object.keys(RESERVED_PROPS);

// default suffix on boxed properties and functions
const BOXED_SUFFIX = "_$";
const BOXED_PREFIX = "";

let wrappedProps = {};
let wrappedPropsLists = {};

// boxed options context
function BoxedContext(options, parent) {
    options = Object.assign({}, options || {});

    // don't allow suffix/prefix overrides if have parent, otherwise we cannot communicate
    if (parent) {
        options.prefixChars = parent.prefixChars;
        options.suffixChars = parent.suffixChars;
        this.globalBox = parent.context.globalBox; // will be set by box
    } else {
        this.globalBox = undefined; // will be set by box
    }

    // add options
    this.deleteEmptyCollections = firstDefined(options.deleteEmptyCollections, true);
    this.ignoreUndefinedProperties = firstDefined(options.ignoreUndefinedProperties, true);
    this.arrayDeltaObjects = firstDefined(options.arrayDeltaObjects, false);
    this.arrayDeltaPartials = firstDefined(options.arrayDeltaPartials, false);
    this.arrayDeltaObjectMarker = firstDefined(options.arrayDeltaObjectMarker, undefined);
    this.arrayDeltaObjectMarkerValue = firstDefined(options.arrayDeltaObjectMarkerValue, undefined);
    this.arrayDeepDeltaObjects = firstDefined(options.arrayDeepDeltaObjects, false);
    this.arrayDeepDeltaObjectMarker = firstDefined(options.arrayDeepDeltaObjectMarker, undefined);
    this.arrayDeepDeltaObjectMarkerValue = firstDefined(options.arrayDeepDeltaObjectMarkerValue, undefined);
    this.arrayDeepDeltaPartials = firstDefined(options.arrayDeepDeltaPartials, false);
    this.prefixChars = (options.prefixChars || BOXED_PREFIX);
    this.suffixChars = (options.suffixChars || BOXED_SUFFIX);
    this.extraPrefixChars = (options.extraPrefixChars || "");
    this.extraSuffixChars = (options.extraSuffixChars || "$");
    this.boxedArrayEnd = this.wrapProp(BOXED_ARRAY_END);
    this.magicParamsKey = this.wrapMagicProp("|");
    this.boxedParamsKey = this.wrapProp("|" + this.magicParamsKey + "|");

    if (!util.hasOwnProperty(wrappedProps, this.magicParamsKey)) {
        let keys = Object.keys(RESERVED_PROPS);
        let i = keys.length;
        let reservedProps = {};
        while (i--) {
            let key = keys[i];
            // keep "" => "" it is the array end and only wrapped in boxed prefix/suffix
            reservedProps[key ? this.wrapMagicProp(key) : key] = RESERVED_PROPS[key];
        }
        wrappedProps[this.magicParamsKey] = reservedProps;
    }
    this.reservedProps = wrappedProps[this.magicParamsKey];

    if (!util.hasOwnProperty(wrappedPropsLists, this.boxedParamsKey)) {
        let i = RESERVED_PROPS_LIST.length;
        let reservedPropsList = [];
        while (i--) {
            reservedPropsList[i] = this.wrapProp(this.wrapMagicProp(RESERVED_PROPS_LIST[i]));
        }
        wrappedPropsLists[this.boxedParamsKey] = reservedPropsList;
    }
    this.reservedPropsList = wrappedPropsLists[this.boxedParamsKey];
}

exports.BoxedContext = BoxedContext;

// util.inherits(Boxed, InheritedClass);

BoxedContext.prototype.wrapProp = function (prop) {
    return wrap(prop, this.prefixChars, this.suffixChars);
};

BoxedContext.prototype.wrapMagicProp = function (prop) {
    return wrap(prop, this.extraPrefixChars, this.extraSuffixChars);
};

/**
 * Remove boxing prefixes
 * @param prop  - possibly wrapped in prefix/suffix chars
 * @returns {string} - unwrapped or same if was not wrapped
 */
BoxedContext.prototype.unwrappedProp = function (prop) {
    if (prop === this.globalBox) {
        // using _$ as ["_$"]
        return BOXED_ARRAY_END;
    }
    return unwrap(prop, this.prefixChars, this.suffixChars);
};

BoxedContext.prototype.isWrappedProp = function (prop) {
    if (prop === this.globalBox) {
        // using _$ as ["_$"]
        return true;
    }
    return isWrapped(prop, this.prefixChars, this.suffixChars);
};

BoxedContext.prototype.boxedContext = function (options) {
    return !hasOwnProperties(options) ? this : new BoxedContext(options, this);
};

BoxedContext.prototype.copyUnreservedKeys = function (arg) {
    let keys = Object.keys(arg);
    let reservedPropsList = this.reservedPropsList;
    let i = reservedPropsList.length;
    while (i--) {
        const key = reservedPropsList[i];
        if (arg.hasOwnProperty(key)) {
            keys.splice(keys.indexOf(key), 1);
        }
    }
    return keys;
};

function boxedContext(options) {
    if (util.isObject(options) && options.constructor === BoxedContext) return options;
    return new BoxedContext(options);
}

exports.boxedContext = boxedContext;

/**
 * create a new Boxed property or object
 * @param value  (*) - value to box
 * @param parent     - parent of this property
 * @param unwrappedProp       - property name
 * @param options    - options or context for this boxed instance
 */
function Boxed(value, parent, unwrappedProp, options) {
    // add context
    this.context = (parent ? parent.context.boxedContext(options) : boxedContext(options));
    this.proxiedThis = UNDEFINED; // this will be this wrapped in proxy boxed handler

    // super call
    // InheritedClass.call(this, context);

    // boxed properties
    this.value = value;   // current value, modified or unmodified
    this.parent = parent;
    this.prop = unwrappedProp;
    this.boxedProps = {}; // boxed property values
    this.modifiedProps = {}; // all modified properties are held here as keys
    this.reservedProps = this.context.reservedProps;

    this.isCopy = false;     // set on first modification
    this.isFullCopy = false; // set if copy was a fresh array or object
}

exports.Boxed = Boxed;

// util.inherits(Boxed, InheritedClass);

Boxed.prototype.boxedWith = function (callBack) {
    // const callBack = argumentList[0];
    let proxy = this.proxiedThis;
    callBack && callBack(proxy);
    return proxy;
};

Boxed.prototype.detachFromParent = function () {
    // detach from parent, keep property, can be used to create single element update
    this.parent = UNDEFINED;
};

Boxed.prototype.detachProp = function (unwrappedProp) {
    let boxedProps = this.boxedProps;
    if (boxedProps.hasOwnProperty(unwrappedProp)) {
        // remove it
        let boxedChild = boxedProps[unwrappedProp];
        if (boxedChild) {
            boxedChild.detachFromParent();
            delete boxedProps[unwrappedProp];
        }
    }
};

Boxed.prototype.detachAllProps = function () {
    let boxedProps = Object.keys(this.boxedProps);
    let i = boxedProps.length;
    while (i--) {
        let prop = boxedProps[i];
        if (boxedProps.hasOwnProperty(prop)) {
            this.detachProp(prop);
        }
    }
};

Boxed.prototype.has = function (wrappedProp) {
    let prop = this.context.unwrappedProp(wrappedProp);
    if (prop !== wrappedProp && this.reservedProps.hasOwnProperty(prop)) {
        return false;
    }

    return this.value.hasOwnProperty(prop);
};

Boxed.prototype.ownKeys = function () {
    return this.context.copyUnreservedKeys(this.value);
};

Boxed.prototype.getOwnPropertyDescriptor = function (wrappedProp) {
    let prop = this.context.unwrappedProp(wrappedProp);
    if (prop !== wrappedProp && this.reservedProps.hasOwnProperty(prop)) {
        return this.reservedProps[prop].get.call(this);
    }
    return Object.getOwnPropertyDescriptor(this.value, prop);
};

Boxed.prototype.getBoxedProp = function (prop) {
    if (prop in this.boxedProps) {
        return this.boxedProps[prop];
    }

    let value = isObject(this.value) ? this.value[prop] : UNDEFINED;
    let boxed = new Boxed(value, this, prop), BoxedHandler;
    if (this.modifiedProps.hasOwnProperty(prop)) {
        boxed.isCopy = true;
    }
    this.boxedProps[prop] = boxed;
    boxedProxy(boxed);
    return boxed;
};

Boxed.prototype.get = function (wrappedProp) {
    let prop = this.context.unwrappedProp(wrappedProp);
    if (prop !== wrappedProp) {
        if (this.reservedProps.hasOwnProperty(prop)) {
            return this.reservedProps[prop].get.call(this);
        }
        let boxed = this.getBoxedProp(prop);
        return boxed.proxiedThis;
    }

    // return unboxed value
    return isNullOrUndefined(this.value) ? UNDEFINED : this.value[prop];
};

Boxed.prototype.copyOfValue = function copyOfValue() {
    return util.copyArrayObject(this.value);
};

Boxed.prototype.set = function (wrappedProp, value, boxed) {
    let prop = this.context.unwrappedProp(wrappedProp);
    if (prop !== wrappedProp) {
        if (prop !== BOXED_ARRAY_END && this.reservedProps.hasOwnProperty(prop)) {
            return this.reservedProps[prop].set.call(this, value);
        }
    }

    const isArrayEnd = prop !== wrappedProp && prop === BOXED_ARRAY_END;

    // can't have boxed values here
    const boxedValue = value[BOXED_GET_THIS];
    if (boxedValue) {
        value = boxedValue.valueOf();
    }

    const isNumeric = isNumericInteger(prop);
    if (isNumeric) {
        prop = Number.parseInt(prop);
    }

    let updateParent = !this.isCopy;

    if (!this.isCopy || !isObject(this.value)) {
        if (!isArrayEnd && isObject(this.value) && this.value[prop] === value) return true;

        // value being modified, have to make a copy or create a new value since this one will have properties
        if (isNullOrUndefined(this.value) || !isObject(this.value)) {
            // create a new value which can hold properties
            this.value = isNumeric || isArrayEnd ? [] : {};
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
            let maxKey = 0;
            let i = keys.length;
            while (i--) {
                let key = keys[i];
                if (isNumericInteger(key)) {
                    let index = Number.parseInt(key) + 1;
                    if (maxKey < index) maxKey = index;
                }
            }
            prop = maxKey;
        } else {
            prop = this.value.length;
        }

        this.value[prop] = value;
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

Boxed.prototype.delete = function (wrappedProp) {
    let prop = this.context.unwrappedProp(wrappedProp);
    if (prop !== wrappedProp) {
        if (this.reservedProps.hasOwnProperty(prop)) {
            return this.reservedProps[prop].delete.call(this);
        }
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

Boxed.prototype.valueOf = function () {
    // if ours is a copy then give a copy of it back so we don't need to make copy on every mod
    return this.value;
};

Boxed.prototype.setValueOf = function (value) {
    // set value to new value as if it was unmodified, detach all boxed props, clear isCopy if value not already equal
    if (this.value !== value) {
        if (value === UNDEFINED && this.context.ignoreUndefinedProperties) {
            if (this.deleteValueOf()) return true;
        }

        this.value = value;
        this.isCopy = true;
        this.isFullCopy = true;

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

Boxed.prototype.deleteValueOf = function () {
    if (this.parent && this.prop && this.context.ignoreUndefinedProperties) {
        if (this.parent.delete(this.prop)) return true;
    }
    return this.setValueOf(UNDEFINED);
};

Boxed.prototype.isModified = function () {
    return this.isCopy;
};

Boxed.prototype.valueOfModified = function () {
    return this.isCopy ? this.valueOf() : UNDEFINED;
};

// synonym for setValueOf()
Boxed.prototype.setValueOfModified = function (value) {
    return this.setValueOf(value);
};

Boxed.prototype.deleteValueOfModified = function () {
    return this.deleteValueOf();
};

// only set value if undefined
Boxed.prototype.setDefaultValue = function (value) {
    return this.value !== UNDEFINED || value === UNDEFINED || this.setValueOf(value);
};

// if value is object or array: return only first level children that were modified or UNDEFINED if no mods
// if otherwise same as valueOfModified return value if modified or UNDEFINED if not modified
// here we do not copy
Boxed.prototype.unboxedDelta = function () {
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
        let maxIndex = undefined;
        while (i--) {
            let prop = keys[i];
            // these are modified, we get our prop value for them
            if (isNumericInteger(prop) && isNullOrUndefined(maxIndex) || prop > maxIndex) {
                maxIndex = Number.parseInt(prop);
            } else {
                let value = this.value[prop];
                // TEST: that undefined values are not added to delta && deepDelta unless this.ignoreUndefinedProperties is false
                if (value !== UNDEFINED || !this.ignoreUndefinedProperties) delta[prop] = value;
            }
        }

        if (maxIndex !== undefined) {
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

Boxed.prototype.setUnboxedDelta = function (value) {
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

Boxed.prototype.deleteUnboxedDelta = function () {
    return false;
};

// if value is object or array: return only modified properties (deep down)
// if otherwise same as valueOfModified return value if modified or UNDEFINED if not modified
// here we do not copy
Boxed.prototype.unboxedDeepDelta = function () {
    if (!this.isCopy || this.isFullCopy || !isObject(this.value)) {
        return this.valueOfModified();
    }

    // we will copy out only modified values
    // arrayDeltaObjects: when true array deltas will be copied as objects so no erroneous undefs
    // arrayDeltaPartials: when true array deltas will contain undefined for all unmodified fields or deleted fields
    let isArrayDelta = !this.context.arrayDeepDeltaObjects && !this.context.arrayDeepDeltaPartials && isArray(this.value);
    let delta = !isArrayDelta ? {} : this.value.constructor(); // always something or we would not be here

    let keys = Object.keys(this.modifiedProps);
    let i = keys.length;

    if (isArrayDelta) {
        let maxIndex = undefined;
        while (i--) {
            let prop = keys[i];
            // these are modified, we get our prop value for them
            if (isNumericInteger(prop) && isNullOrUndefined(maxIndex) || prop > maxIndex) {
                maxIndex = Number.parseInt(prop);
            } else {
                let value = this.value[prop];
                // TEST: that undefined values are not added to delta && deepDelta unless this.ignoreUndefinedProperties is false
                if (value !== UNDEFINED || !this.ignoreUndefinedProperties) delta[prop] = value;
            }
        }

        if (maxIndex !== undefined) {
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

Boxed.prototype.setUnboxedDeepDelta = function (value) {
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

Boxed.prototype.deleteUnboxedDeepDelta = function () {
    return false;
};

/**
 * For all real values of unboxed item. Makes it easier
 * to loop over all real values.
 *
 * @param param  if function then gets (boxedValue, prop, unboxedValue)
 *               if object or array then will crate a copy of these in a new boxed parent and
 *               return it as result.
 *
 * @returns {Boxed}
 */
Boxed.prototype.boxedForEach = function (param) {
    // TODO: generalize parameter processing. array or object, function, many individual strings or numbers
    // const callBack = argumentList[0];
    let value = this.value;

    if (isFunction(param)) {
        let keys = value;
        let i = keys.length;
        while (i--) {
            let prop = keys[i];
            const item = value[prop];
            if (item !== UNDEFINED) {
                const boxedItem = this.get(prop);
                param.call(UNDEFINED, boxedItem, prop, item);
            }
        }
    } else if (isObject(param)) {
        const result = {};

        let keys = Object.keys(param);
        let i = keys.length;
        while (i--) {
            let prop = keys[i];

            if (value.hasOwnProperty(param)) {
                const item = value[prop];
                if (item !== UNDEFINED) {
                    result[prop] = item;
                }
            }
        }
        let boxed = new Boxed(result, UNDEFINED, UNDEFINED, this.context);
        boxedProxy(boxed);
        return boxed.proxiedThis;
    } else if (!isNullOrUndefined(param)) {
        const result = {};
        if (this.value.hasOwnProperty(param)) {
            result[param] = this.value[param];
        }
        let boxed = new Boxed(result, UNDEFINED, UNDEFINED, this.context);
        boxedProxy(boxed);
        return boxed.proxiedThis;
    }
};

const BoxedHandler = {
    // target is the box function with
    get: function (target, prop, receiver) {
        if (target.hasOwnProperty(BOXED_GET_THIS)) {
            if (prop === BOXED_GET_THIS) {
                return target[BOXED_GET_THIS];
            }
            return target[BOXED_GET_THIS].get(prop);
        }
        throw "BoxedHandler: IllegalArgument expected box function target";
    },

    set: function (target, prop, value, receiver) {
        if (target.hasOwnProperty(BOXED_GET_THIS)) {
            if (prop === BOXED_GET_THIS) {
                return false;
            }
            return target[BOXED_GET_THIS].set(prop, value);
        }
        throw "BoxedHandler: IllegalArgument expected box function target";
    },

    has: function (target, prop) {
        if (target.hasOwnProperty(BOXED_GET_THIS)) {
            if (prop === BOXED_GET_THIS) {
                return false;
            }
            return target[BOXED_GET_THIS].has(prop, value);
        }
        throw "BoxedHandler: IllegalArgument expected box function target";
    },

    ownKeys: function (target) {
        if (target.hasOwnProperty(BOXED_GET_THIS)) {
            return target[BOXED_GET_THIS].ownKeys();
        }
        throw "BoxedHandler: IllegalArgument expected box function target";
    },

    deleteProperty: function (target, prop) {
        if (target.hasOwnProperty(BOXED_GET_THIS)) {
            if (prop === BOXED_GET_THIS) {
                return false;
            }
            return target[BOXED_GET_THIS].delete(prop);
        }
        throw "BoxedHandler: IllegalArgument expected box function target";
    },

    getOwnPropertyDescriptor: function (target, prop) {
        if (target.hasOwnProperty(BOXED_GET_THIS)) {
            if (prop === BOXED_GET_THIS) {
                return { value: target[BOXED_GET_THIS] };
            }
            return target[BOXED_GET_THIS].getOwnPropertyDescriptor(prop);
        }
        throw "BoxedHandler: IllegalArgument expected box function target";
    },

    // Not needed.
    // apply: function (target, thisArg, argumentsList) {
    //     return target.apply(thisArg, argumentsList);
    // },
};

/**
 * Wrap boxedWith of instance in proxy so it can be used to access boxed properties.
 * @param boxed
 * @returns {Object}
 */
function boxedProxy(boxed) {
    boxed.setDefaultValue = boxed.setDefaultValue.bind(boxed);
    boxed.boxedWith = boxed.boxedWith.bind(boxed);
    boxed.boxedWith[BOXED_GET_THIS] = boxed;
    boxed.proxiedThis = new Proxy(boxed.boxedWith, BoxedHandler);
}

let globalBoxKey; // set on first use

function createBox(options) {
    let context = new BoxedContext(options);

    let box = function box() {
        // global _$
        // if last arg: function => boxedWith(_$ => { _$ }) on boxed of previous params
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

        let boxed = new Boxed(value, UNDEFINED, UNDEFINED, context);
        boxedProxy(boxed);

        if (callBack) {
            boxed.boxedWith(callBack);
        }
        return boxed.proxiedThis;
    };

    // change to string so that global _$ will be recognized as array end property
    if (!globalBoxKey) {
        globalBoxKey = box + "";
    }
    context.globalBox = globalBoxKey;
    box.boxedContext = context;
    return box;
}

// create customized context
exports.createBox = createBox;

exports.box = createBox();

