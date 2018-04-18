"use strict";

const isFunction = require('lodash.isfunction');
const isString = require('lodash.isstring');

const UNDEFINED = void 0;

module.exports.UNDEFINED = UNDEFINED;
module.exports.isString = isString;
module.exports.isFunction = isFunction;

function isValid(arg) {
    return arg || arg !== UNDEFINED && arg !== null && !Number.isNaN(arg);
}

function isNumber(arg) {
    return typeof arg === 'number';
}

function extend(other, add) {
    // Don't do anything if add isn't an object
    if (!add || !isObject(add)) return other;

    let keys = Object.keys(add);
    let i = keys.length;
    while (i--) {
        other[keys[i]] = add[keys[i]];
    }
    return other;
}

function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

function hasOwnProperties(arg, exclude) {
    if (isObject(arg) && (arg.constructor === Object || arg.constructor === Array)) {
        const keys = Object.keys(arg);
        let i = keys.length;
        while (i--) {
            const key = keys[i];
            if (arg[key] !== UNDEFINED && (!exclude || !exclude.hasOwnProperty(key))) {
                return true;
            }
        }
    }
    return UNDEFINED;
}

/**
 * copy properties from source, optionally filter
 * @param arg       source
 * @param include   object with properties to be copied or falsy to copy all
 */
function copyProperties(arg, include) {
    let props = {};

    if (isObject(arg) && (arg.constructor === Object || arg.constructor === Array)) {
        const keys = Object.keys(arg);
        let i = keys.length;
        while (i--) {
            const key = keys[i];
            const argValue = arg[key];
            if (argValue !== UNDEFINED && (!include || include.hasOwnProperty(key))) {
                props[key] = argValue;
            }
        }
    }
    return props;
}

function mapProperties(arg, actionMap) {
    const props = {};
    let result = null;

    if (isObject(arg) && (arg.constructor === Object || arg.constructor === Array)) {
        const keys = Object.keys(arg);
        let i = keys.length;
        while (i--) {
            const key = keys[i];
            const argValue = arg[key];
            if (argValue !== UNDEFINED) {
                if (actionMap.hasOwnProperty(key)) {
                    const action = actionMap[key];
                    const value = isFunction(action) ? action(argValue, key) : argValue;
                    if (value !== UNDEFINED) {
                        props[key] = value;
                        result = props;
                    }
                }
            }
        }
    }
    return result;
}

function isObject(param) {
    return !!param && typeof param === "object";
}

function isArray(param) {
    return isObject(param) && param.constructor === Array;
}

function isStringOrNumber(arg) {
    return isString(arg) || typeof arg === "number";
}

function isNumeric(arg) {
    const n = isStringOrNumber(arg) && Number.parseFloat(arg);
    return Number.isFinite(n) && +n === n;
}

function isNumericInteger(arg) {
    const n = isStringOrNumber(arg) && Number.parseFloat(arg);
    return Number.isInteger(n) && +n === n;
}

function toNumber(arg) {
    const n = isStringOrNumber(arg) && Number.parseFloat(arg);
    // noinspection EqualityComparisonWithCoercionJS
    return n == arg ? n : arg;
}

function toNumberOrUndefined(arg) {
    const n = isStringOrNumber(arg) && Number.parseFloat(arg);
    // noinspection EqualityComparisonWithCoercionJS
    return n == arg ? n : UNDEFINED;
}

function toNumericInteger(arg) {
    const n = isStringOrNumber(arg) && Number.parseFloat(arg);
    return Number.isInteger(n) && +n === n ? n : UNDEFINED;
}

function toArrayIndex(arg) {
    const n = isStringOrNumber(arg) && Number.parseFloat(arg);
    return Number.isInteger(n) && +n === n && n >= 0 ? n : UNDEFINED;
}

function isArrayIndex(arg) {
    return toArrayIndex !== UNDEFINED;
}

function toNumberIfArrayIndex(arg) {
    const n = isStringOrNumber(arg) && Number.parseFloat(arg);
    return Number.isInteger(n) && +n === n && n >= 0 ? n : arg;
}

function returnsAlwaysFalse() {
    return false;
}

function returnsAlwaysTrue() {
    return true;
}

function isUndefined(arg) {
    return arg === void 0;
}

function isNull(arg) {
    return arg === null;
}

function isNullOrUndefined(arg) {
    return arg === null || arg === void 0;
}

function endsWith(value, suffix) {
    return (value.length >= suffix.length && value.substr(value.length - suffix.length) === suffix);
}

function startsWith(value, prefix) {
    return (value.length >= prefix.length && value.substr(0, prefix.length) === prefix);
}

function wrappedWith(value, prefix, suffix) {
    return (value.length >= prefix.length + suffix.length && startsWith(prop, prefix) && endsWith(prop, suffix));
}

function isWrapped(prop, prefixChars, suffixChars) {
    if (prefixChars && suffixChars) {
        return (wrappedWith(prop, prefixChars, suffixChars));
    } else if (prefixChars) {
        return (startsWith(prop, prefixChars));
    } else if (suffixChars) {
        return (endsWith(prop, suffixChars));
    }
    return false;
}

function unwrap(prop, prefixChars, suffixChars) {
    if (prefixChars && suffixChars) {
        if (wrappedWith(prop, prefixChars, suffixChars)) {
            return prop.substring(prefixChars.length, prop.length - suffixChars.length);
        }
    } else if (prefixChars) {
        if (startsWith(prop, prefixChars)) {
            return prop.substring(prefixChars.length);
        }
    } else if (suffixChars) {
        if (endsWith(prop, suffixChars)) {
            return prop.substring(0, prop.length - suffixChars.length);
        }
    }
    return prop;
}

function wrap(prop, prefixChars, suffixChars) {
    return prefixChars + prop + suffixChars;
}

function copyFilteredProperties(dst, src, callBack) {
    let keys = Object.keys(src);
    let i = keys.length;
    while (i--) {
        const key = keys[i];
        const value = src[key];
        if (callBack(key, value)) {
            dst[key] = src[key];
        }
    }

    return keys;
}

function copyMappedProperties(dst, src, callBack) {
    let keys = Object.keys(src);
    let i = keys.length;
    while (i--) {
        const key = keys[i];
        const value = src[key];
        const result = callBack(key, value);
        if (result !== UNDEFINED) {
            dst[key] = result;
        }
    }
    return keys;
}

function pushMappedProperties(dst, src, callBack) {
    if (!isArray(dst)) throw "IllegalArgument for collectMappedProperties, dst must be an array, given " + dst; 
    let keys = Object.keys(src);
    let i = keys.length;
    while (i--) {
        const key = keys[i];
        const value = src[key];
        const result = callBack(key, value);
        if (result !== UNDEFINED) {
            dst.push(result);
        }
    }

    return keys;
}

function copyArrayObject(src) {
    if (isObject(src)) {
        let newValue = Object.assign(src.constructor(), src);
        if (isArray(src)) {
            // need to copy the non numeric fields, object assign does not copy them
            copyFilteredProperties(newValue, src, key => !isNumericInteger(key) || key < 0);
        }
        return newValue;
    } else {
        throw "Invalid argument to copyArrayObject, got " + JSON.stringify(src);
    }
}

function firstDefined() {
    for (let i = 0; i < arguments.length; i++) {
        if (arguments[i] !== void 0) {
            return arguments[i];
        }
    }
}

function firstValid() {
    let lastDefined;
    for (let i = 0; i < arguments.length; i++) {
        let arg = arguments[i];
        if (isValid(arg)) {
            return arg;
        } else if (arg !== UNDEFINED) {
            lastDefined = arg;
        }
    }
    return lastDefined;
}

function deleteItems(arr) {
    if (arguments.length > 1 && isArray(arr)) {
        let i = arguments.length;
        while (--i) {
            const arg = arguments[i];
            if (isArray(arg)) {
                deleteItems(arr, ...arg);
            } else if (isObject(arg)) {
                deleteItems(arr, ...Object.keys(arg));
            } else {
                let index = arr.indexOf(arg);
                if (index >= 0) arr.splice(index, 1);
            }
        }
    }

    return arr;
}

function deleteProperties(arg, props) {
    let i = props.length;
    while (i--) {
        const key = props[i];
        delete arg[key];
    }
}

function forEachKey(arg, callBack) {
    const keys = Object.keys(arg);
    let i = keys.length;
    while (i--) {
        const key = keys[i];
        if (callBack(key, arg[key], keys.length - i) === null) {
            break;
        }
    }
}

function mapEachKey(arg, callBack) {
    const result = [];
    const keys = Object.keys(arg);
    let i = keys.length;
    while (i--) {
        const key = keys[i];
        const val = callBack(key, arg[key], keys.length - i);
        if (isValid(val)) {
            result.push(val);
        }
    }
    return result;
}

function arrayEndIndex(arg) {
    if (isObject(arg)) {
        if (!isArray(arg)) {
            // lets not bicker and look for last integer field in object
            let keys = Object.keys(arg);
            let propKey = 0;
            let i = keys.length;
            while (i--) {
                let key = toArrayIndex(keys[i]);
                if (key !== UNDEFINED) {
                    let index = key + 1;
                    if (propKey < index) propKey = index;
                }
            }
            return propKey;
        } else {
            return arg.length;
        }
    } else {
        return 0;
    }
}

function deepCloneProperties(src) {
    if (isObject(src)) {
        let result = isArray(src) ? [] : {};

        const keys = Object.keys(src);
        let i = keys.length;
        while (i--) {
            const key = keys[i];
            const value = src[key];
            result[key] = isObject(value) ? deepCloneProperties(value) : value;
        }
        return result;
    }
    return src;
}

/**
 * defaultMerge properties
 * @param dst
 * @param src
 * @param levels  default one level.
 * @param isMutable  - dst is mutable, else make a copy if changing
 * @param deepCloneSrc   - make a deep copy of src values if copying to dst
 * @return {*}
 */
function mergeDefaultProperties(dst, src, levels = 1, isMutable = false, deepCloneSrc = false) {
    levels = levels || 1;
    let isCopy = isMutable;
    let dstValue;
    let newValue;

    if (isObject(dst) && isObject(src)) {
        const keys = Object.keys(src);
        let i = keys.length;
        while (i--) {
            const key = keys[i];
            const value = src[key];

            if (isValid(value)) {
                newValue = dstValue = isObject(dst) && dst.hasOwnProperty(key) ? dst[key] : UNDEFINED;

                if (!isValid(dstValue)) {
                    newValue = value;
                } else if (levels > 1 && isObject(dstValue) && !isArray(dstValue)) {
                    // cannot deep merge arrays, would just mess up the values 
                    newValue = mergeDefaultProperties(dstValue, value, levels - 1, isMutable);
                }

                if (newValue !== dstValue) {
                    if (!isCopy) {
                        dst = copyArrayObject(dst);
                        isCopy = true;
                    }

                    if (deepCloneSrc && isObject(newValue)) {
                        newValue = deepCloneProperties(newValue);
                    }
                    dst[key] = newValue;
                }
            }
        }
    }
    return dst;
}

/**
 * Copy properties from a list of properties, return null if none copied
 *
 * @param arg       {object}
 * @param include    {array}
 * @param dst       {object|undefined} or undefined to create a new object
 * @return {object|null} if none added then null, otherwise result
 */
function extractProperties(arg, include, dst = undefined) {
    let i = include.length;
    let result = null;
    dst = dst || {};
    while (i--) {
        const key = include[i];
        if (arg.hasOwnProperty(key)) {
            const value = arg[key];
            if (value !== UNDEFINED) {
                dst[key] = arg[key];
                result = dst;
            }
        }
    }
    return result;
}

function objFilter(arg, callback) {
    const dst = {};
    copyFilteredProperties(dst, arg, callback);
    return dst; 
}

function objMap(arg, callback) {
    const dst = {};
    copyMappedProperties(dst, arg, callback);
    return dst;
}

function objCollect(arg, callback) {
    const dst = [];
    pushMappedProperties(dst, arg, callback);
    return dst;
}

module.exports.objFilter = objFilter;
module.exports.objMap = objMap;
module.exports.objCollect = objCollect;
module.exports.mergeDefaultProperties = mergeDefaultProperties;
module.exports.deleteProperties = deleteProperties;
module.exports.extractProperties = extractProperties;
module.exports.deepCloneProperties = deepCloneProperties;
module.exports.arrayEndIndex = arrayEndIndex;
module.exports.isValid = isValid;
module.exports.isNumber = isNumber;
module.exports.extend = extend;
module.exports.hasOwnProperty = hasOwnProperty;
module.exports.hasOwnProperties = hasOwnProperties;
module.exports.copyProperties = copyProperties;
module.exports.isObject = isObject;
module.exports.isArray = isArray;
module.exports.isNumeric = isNumeric;
module.exports.isNumericInteger = isNumericInteger;
module.exports.toNumericInteger = toNumericInteger;
module.exports.toArrayIndex = toArrayIndex;
module.exports.isArrayIndex = isArrayIndex;
module.exports.toNumber = toNumber;
module.exports.toNumberOrUndefined = toNumberOrUndefined;
module.exports.toNumberIfArrayIndex = toNumberIfArrayIndex;
module.exports.returnsAlwaysFalse = returnsAlwaysFalse;
module.exports.returnsAlwaysTrue = returnsAlwaysTrue;
module.exports.isUndefined = isUndefined;
module.exports.isNull = isNull;
module.exports.isNullOrUndefined = isNullOrUndefined;
module.exports.endsWith = endsWith;
module.exports.startsWith = startsWith;
module.exports.wrappedWith = wrappedWith;
module.exports.isWrapped = isWrapped;
module.exports.unwrap = unwrap;
module.exports.wrap = wrap;
module.exports.copyFilteredProperties = copyFilteredProperties;
module.exports.copyArrayObject = copyArrayObject;
module.exports.firstDefined = firstDefined;
module.exports.firstValid = firstValid;
module.exports.deleteItems = deleteItems;
module.exports.forEachKey = forEachKey;
module.exports.mapProperties = mapProperties;
module.exports.mapEachKey = mapEachKey;
