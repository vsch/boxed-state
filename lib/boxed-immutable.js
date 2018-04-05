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

const BOXED_ARRAY_END = "";

// reserved mappings, this is the Boxed instance for the call
// reserved props are not prefixed or suffixed
const RESERVED_PROPS = {
    forEachKey: {
        get: function (wrapped) {return wrapped ? this.forEachKey : this.forEachKeyBoxed;},
        set: function (value, wrapped) {return false;},
        delete: function (wrapped) {return false;},
        ownPropertyDescriptor: function () {return { value: this.value, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    unboxed: {
        get: function (wrapped) {return this.valueOf();},
        set: function (value, wrapped) {return this.setValueOf(value);},
        delete: function (wrapped) {return this.deleteValueOf();},
        ownPropertyDescriptor: function () {return { value: this.value, writable: true, /*enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    get: {
        get: function (wrapped) {return this.getProp;},
        set: function (value, wrapped) {return false;},
        delete: function (wrapped) {return false;},
        ownPropertyDescriptor: function () {return { value: this.getProp, /* writable: true, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    default: {
        get: function (wrapped) {return wrapped ? this.setValueOfDefaultBoxed : this.setValueOfDefault;},
        set: function (value, wrapped) {return this.setValueOfDefaultMagic(value);},
        delete: function (wrapped) {return false;},
        ownPropertyDescriptor: function () {return { value: this.value, writable: true, /*enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    boolean: {
        get: function (wrapped) {return this.valueOfBoolean();},
        set: function (value, wrapped) {return this.setValueOfBoolean(value);},
        delete: function (wrapped) {return false;},
        ownPropertyDescriptor: function () {return { value: this.valueOfBoolean(), writable: true, /*enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    "": {  // $boxed with after stripping off prefix/suffix _$
        get: function (wrapped) {return this.proxiedThis;},
        set: function (value, wrapped) {return false;}, // this does not get here, intercepted in set, it is boxedValue[$] = ..., or boxedValue.$ = ..., ie. we treat it as append to end of array!
        delete: function (wrapped) {return false;},    // this is delete boxedValue[$]; or delete boxedValue.$; in either case we don't have a meaning for this
        ownPropertyDescriptor: function () {return { value: this.proxiedThis, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    modified: {
        get: function (wrapped) {return this.valueOfModified();},
        set: function (value, wrapped) {return this.setValueOfModified(value);},
        delete: function (wrapped) {return this.deleteValueOfModified();},
        ownPropertyDescriptor: function () {return { value: this.value, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    delta: {
        get: function (wrapped) {return this.unboxedDelta();},
        set: function (value, wrapped) {return this.setUnboxedDelta(value);},
        delete: function (wrapped) {return this.deleteUnboxedDelta();},
        ownPropertyDescriptor: function () {return { value: this.value, /*writable: false, enumerable: false, configurable: false, get:UNDEFINED, set:UNDEFINED,*/ };},
    },
    deepDelta: {
        get: function (wrapped) {return this.unboxedDeepDelta();},
        set: function (value, wrapped) {return this.setUnboxedDeepDelta(value);},
        delete: function (wrapped) {return this.deleteUnboxedDeepDelta();},
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
    this.prefixChars = (options.prefixChars || BOXED_PREFIX);
    this.suffixChars = (options.suffixChars || BOXED_SUFFIX);
    this.magicPrefixChars = (options.magicPrefixChars || "");
    this.magicSuffixChars = (options.magicSuffixChars || "$");
    this.boxedArrayEnd = this.wrapProp(BOXED_ARRAY_END);
    this.magicParamsKey = this.wrapMagicProp("|");
    // this.boxedParamsKey = this.wrapProp("|" + this.magicParamsKey + "|");

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
    this.reservedPropsList = Object.keys(this.reservedProps);

    // if (!util.hasOwnProperty(wrappedPropsLists, this.boxedParamsKey)) {
    //     let i = RESERVED_PROPS_LIST.length;
    //     let reservedPropsList = [];
    //     while (i--) {
    //         reservedPropsList[i] = this.wrapProp(this.wrapMagicProp(RESERVED_PROPS_LIST[i]));
    //     }
    //     wrappedPropsLists[this.boxedParamsKey] = reservedPropsList;
    // }
    // this.reservedPropsList = wrappedPropsLists[this.boxedParamsKey];
}

module.exports.BoxedContext = BoxedContext;

// util.inherits(Boxed, InheritedClass);

BoxedContext.prototype.wrapProp = function (prop) {
    return wrap(prop, this.prefixChars, this.suffixChars);
};

BoxedContext.prototype.wrapMagicProp = function (prop) {
    return wrap(prop, this.magicPrefixChars, this.magicSuffixChars);
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
    if (!(isObject(arg) || isFunction(arg))) return [];
    // if (!arg) return [];

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

module.exports.boxedContext = boxedContext;

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

module.exports.Boxed = Boxed;

// util.inherits(Boxed, InheritedClass);

/**
 * Implements the ._$() or the function call on any boxed value
 *
 * @param wrapped   whether the return value should be boxed
 *
 * @param args {*}  arg type:
 *
 *                  function: calls it with proxy as argument for ._$(_$=>{}) implementation
 *
 *                  string: then will evaluate the string
 *
 *                           All access to properties withing expressions will be using the boxed
 *                           property. Final unboxing is done by the top level calling context which
 *                           assigns the result to a field of an object or returns the result to original
 *                           caller of boxedWith().
 *
 *                           if the string does not start with _$, will evaluate it on the proxy function using:
 *
 *                           eval("(function () { 
 *                               const _$ = this; 
 *                               return (expression);
 *                           }())");
 *
 *                           if starts with "_$." then the rest is assumed to be the path within this
 *                           boxed value, adding prefixes/suffixes to properties is optional since all
 *                           intermediate elements will always be boxed. The final element will be unboxed
 *                           if wrapped argument was true, unboxed otherwise.
 *
 *                           ie. "_$.field2.field" is the same as "_$.field2_$.field_$" and will be
 *                           interpreted as _$.field2_$.field if result is unboxed, or as _$.field2_$.field_$
 *                           if the result is boxed.
 *
 *                           [expression] for indexing using computed values. The text within is evaluated
 *                           by a recursive call with (boxed, expression), where boxed is true if the bracketed
 *                           expression does not end the string. Otherwise, boxed will equal the wrapped argument
 *                           passed to the function.
 *
 *                           Only magic properties which return values are recognized as such: .unboxed$, .modified$,
 *                           .delta$, .deepDelta$, .boolean$
 *
 *                  object will process it to create a new object with computed
 *                  contents so allow easy shape changes and transformations.
 *
 *                  { key: value, }
 *
 *                  each key in the object can have any value. if the value is undefined then the key will not be
 *                  included in the result object.
 *
 *                  object: recursively process it for values, _$ within nested objects does not change all paths must
 *                          start at the _$ object.
 *
 * @returns {*}    returns the results of the callback or undefined
 */
Boxed.prototype.boxedWithImpl = function (wrapped, args) {
    // const callBack = argumentList[0];
    let proxy = this.proxiedThis;
    let callBack = args;
    return callBack ? callBack(proxy) : UNDEFINED;
};

/**
 * Implements the ._$() or the function call on any boxed value
 *
 * @param args {*}  arg type:
 *
 *                  function: calls it with proxy as argument for ._$(_$=>{}) implementation
 *
 *                  string: then will evaluate the string as an expression by using:
 *
 *                  eval("(function () { 
 *                      const _$ = this; 
 *                      return (expression);
 *                  }");
 *
 *                  object will process it to create a new object with computed
 *                  contents so allow easy shape changes and transformations.
 *
 *                  { key: value, }
 *
 *                  each key in the object can have any value. if the value is undefined then the key will not be
 *                  included in the result object.
 *
 *                  string : if starts with "_$." then the rest is assumed to be the path within this
 *                           boxed value, adding prefixes/suffixes to properties is optional since all
 *                           intermediate elements will always be boxed. The final element will be unboxed. ie. "_$.field2.field" is the same
 *                           as "_$.field2_$.field_$" and will be interpreted as _$.field2_$.field.
 *
 *                           [expression] for indexing using computed values. The text within is evaluated
 *                           by a recursive call to boxedWith(expression)
 *
 *
 *                           Only magic properties which return values are recognized as such: .unboxed$, .modified$,
 *                           .delta$, .deepDelta$, .boolean$
 *
 *                  object: recursively process it for values, _$ within nested objects does not change all paths must
 *                          start at the _$ object.
 *
 * @returns {*}    returns the results of the callback or undefined
 */
Boxed.prototype.boxedWith = function boxed(args) {
    // const callBack = argumentList[0];
    let proxy = this.proxiedThis;
    let callBack = args;
    return callBack ? callBack(proxy) : UNDEFINED;
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

    if (isObject(this.value) || isFunction(this.value)) {
        return Object.getOwnPropertyDescriptor(this.value, prop);
    }
    return undefined;
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
    // accept both unwrapped magic props and wrapped ones
    if (this.reservedProps.hasOwnProperty(wrappedProp)) {
        return this.reservedProps[wrappedProp].get.call(this, false);
    }

    let prop = this.context.unwrappedProp(wrappedProp);
    if (prop !== wrappedProp) {
        if (this.reservedProps.hasOwnProperty(prop)) {
            return this.reservedProps[prop].get.call(this, true);
        }
        let boxed = this.getBoxedProp(prop);
        return boxed.proxiedThis;
    }

    // return unboxed value
    return isNullOrUndefined(this.value) ? UNDEFINED : this.value[prop];
};

Boxed.prototype.getProp = function (prop) {
    return this.get(this.context.wrapProp(prop));
};

Boxed.prototype.copyOfValue = function copyOfValue() {
    return util.copyArrayObject(this.value);
};

Boxed.prototype.set = function (wrappedProp, value, boxed) {
    if (wrappedProp !== BOXED_ARRAY_END && this.reservedProps.hasOwnProperty(wrappedProp)) {
        return this.reservedProps[wrappedProp].set.call(this, value, false);
    }

    let prop = this.context.unwrappedProp(wrappedProp);
    if (prop !== wrappedProp && prop !== BOXED_ARRAY_END) {
        if (this.reservedProps.hasOwnProperty(prop)) {
            return this.reservedProps[prop].set.call(this, value, true);
        }
    }

    const isArrayEnd = prop === BOXED_ARRAY_END;

    // can't have boxed values here
    const boxedValue = value && value[BOXED_GET_THIS];
    if (boxedValue) {
        value = boxedValue.valueOf();
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
                let key = toArrayIndex(keys[i]);
                if (key !== UNDEFINED) {
                    let index = key + 1;
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
    if (this.reservedProps.hasOwnProperty(wrappedProp)) {
        return this.reservedProps[wrappedProp].delete.call(this, false);
    }

    let prop = this.context.unwrappedProp(wrappedProp);
    if (prop !== wrappedProp) {
        if (this.reservedProps.hasOwnProperty(prop)) {
            return this.reservedProps[prop].delete.call(this, true);
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
Boxed.prototype.setValueOfDefaultMagic = function (value) {
    return this.value !== UNDEFINED || value === UNDEFINED || this.setValueOf(value);
};

// only set value if undefined
Boxed.prototype.setValueOfDefault = function (value) {
    if (this.value === UNDEFINED && value !== UNDEFINED) this.setValueOf(value);
    return this.value;
};

// only set value if undefined
Boxed.prototype.setValueOfDefaultBoxed = function (value) {
    if (this.value === UNDEFINED && value !== UNDEFINED) this.setValueOf(value);
    return this.proxiedThis;
};

Boxed.prototype.valueOfBoolean = function () {
    return !!this.value;
};

// convert to boolean before setting
Boxed.prototype.setValueOfBoolean = function (value) {
    return this.setValueOf(!!value);
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
 * For all real values of unboxed item. Makes it easier to loop over all real values.
 *
 * For arrays will only include numeric keys (ie. indices)
 *
 * @param wrapped true if wrapped version of each key function
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
function forEachKeyImpl(wrapped, args) {
    let value = this.value;
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
                        let item = value[prop];
                        if (item !== UNDEFINED || options.undefs) {
                            if (wrapped) {
                                callBack(prop, this.getProp(prop), item);
                            } else {
                                callBack(prop, item);
                            }
                        }
                    }
                }
            } else {
                if (isArrayValue && !options.props) {
                    let i = value.length;
                    while (i--) {
                        const item = value[i];
                        if (item !== UNDEFINED || options.undefs) {
                            if (wrapped) {
                                callBack(i, this.getProp(i), item);
                            } else {
                                callBack(i, item);
                            }
                        }
                    }
                } else {
                    let keys = Object.keys(value);
                    let i = keys.length;
                    while (i--) {
                        let prop = keys[i];
                        if (isArrayValue) prop = toNumberIfArrayIndex(prop);
                        const item = value[prop];
                        if (item !== UNDEFINED || options.undefs) {
                            if (wrapped) {
                                callBack(prop, this.getProp(prop), item);
                            } else {
                                callBack(prop, item);
                            }
                        }
                    }
                }

            }
        }
    }
    return this.proxiedThis;
}

/**
 * For all real values of unboxed item. Makes it easier
 * to loop over all real values.
 *
 * @param args  see forEachKeyImpl
 *
 * @returns {Boxed}
 */
Boxed.prototype.forEachKey = function () {
    forEachKeyImpl.call(this, false, arguments);
};

/**
 * For all real values of unboxed item. Makes it easier
 * to loop over all real values.
 *
 * @param args  see forEachKeyImpl
 *
 * @returns {Boxed}
 */
Boxed.prototype.forEachKeyBoxed = function () {
    forEachKeyImpl.call(this, true, arguments);
};

function isBoxed(target) {
    return isObject(target) && target.constructor === Boxed;
}

module.exports.isBoxed = isBoxed;

function boxedThis(target) {
    return isBoxedProxy(target) ? target[BOXED_GET_THIS] : UNDEFINED;
}

module.exports.boxedThis = boxedThis;

function isBoxedProxy(target) {
    return target && isBoxed(target[BOXED_GET_THIS]);
}

module.exports.isBoxedProxy = isBoxedProxy;

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
                return true;
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
    boxed.boxedWith = boxed.boxedWith.bind(boxed);
    // boxed.detachFromParent = boxed.detachFromParent.bind(boxed);
    // boxed.detachProp = boxed.detachProp.bind(boxed);
    // boxed.detachAllProps = boxed.detachAllProps.bind(boxed);
    // boxed.has = boxed.has.bind(boxed);
    // boxed.ownKeys = boxed.ownKeys.bind(boxed);
    // boxed.getOwnPropertyDescriptor = boxed.getOwnPropertyDescriptor.bind(boxed);
    // boxed.getBoxedProp = boxed.getBoxedProp.bind(boxed);
    // boxed.get = boxed.get.bind(boxed);
    boxed.getProp = boxed.getProp.bind(boxed);
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
    boxed.setValueOfDefault = boxed.setValueOfDefault.bind(boxed);
    boxed.setValueOfDefaultBoxed = boxed.setValueOfDefaultBoxed.bind(boxed);
    // boxed.setValueOfDefaultMagic = boxed.setValueOfDefaultMagic.bind(boxed);
    // boxed.valueOfBoolean = boxed.valueOfBoolean.bind(boxed);
    // boxed.setValueOfBoolean = boxed.setValueOfBoolean.bind(boxed);
    // boxed.unboxedDelta = boxed.unboxedDelta.bind(boxed);
    // boxed.setUnboxedDelta = boxed.setUnboxedDelta.bind(boxed);
    // boxed.deleteUnboxedDelta = boxed.deleteUnboxedDelta.bind(boxed);
    // boxed.unboxedDeepDelta = boxed.unboxedDeepDelta.bind(boxed);
    // boxed.setUnboxedDeepDelta = boxed.setUnboxedDeepDelta.bind(boxed);
    // boxed.deleteUnboxedDeepDelta = boxed.deleteUnboxedDeepDelta.bind(boxed);
    boxed.forEachKey = boxed.forEachKey.bind(boxed);
    boxed.forEachKeyBoxed = boxed.forEachKeyBoxed.bind(boxed);

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
        let obj = {};
        obj[box] = 0;
        globalBoxKey = Object.keys(obj)[0];
    }
    context.globalBox = globalBoxKey;
    box.boxedContext = context;
    return box;
}

// create customized context
module.exports.createBox = createBox;

module.exports.box = createBox();

