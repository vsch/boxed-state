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

function copyProperties(arg, include) {
    let props = include ? Object.assign({}, include) : {};

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
};

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
        if (callBack(key)) {
            dst[key] = src[key];
        }
    }

    return keys;
}

function copyArrayObject(src) {
    let newValue = Object.assign(src.constructor(), src);
    if (isArray(src)) {
        // need to copy the non numeric fields, object assign does not copy them
        copyFilteredProperties(newValue, src, key => !isNumericInteger(key) || key < 0);
    }
    return newValue;
}

function firstDefined() {
    for (let i = 0; i < arguments.length; i++) {
        if (arguments[i] !== void 0) {
            return arguments[i];
        }
    }
}

function deleteItems(arr) {
    if (arguments.length > 1 && isArray(arr)) {
        let i = arguments.length;
        while (--i) {
            const arg = arguments[i];
            if (isArray(arg)) {
                deleteItems(arr, ...arg)
            } else if (isObject(arg)) {
                deleteItems(arr, ...Object.keys(arg))
            } else {
                let index = arr.indexOf(arg);
                if (index >= 0) arr.splice(index, 1);
            }
        }
    }

    return arr;
}

function forEachKey(arg, callBack) {
    const keys = Object.keys(arg);
    let i = keys.length;
    while (i--) {
        const key = keys[i];
        if (callBack(key, arg[key]) === null) {
            break;
        }
    }
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

/**
 * defaultMerge properties
 * @param dst
 * @param src
 * @param levels
 * @param isImmutable {boolean} - true - make a copy if changing
 *                           false - in-place mods
 * @return {*}
 */
function defaultMergeProperties(dst, src, levels, isImmutable,) {
    levels = levels || 1;
    let isCopy = !isImmutable;
    let dstValue;
    let newValue;
    
    forEachKey(src, (key, value) => {
        if (isValid(value)) {
            newValue = dstValue = dst.hasOwnProperty(key) ? dst[key] : UNDEFINED;
            
            if (!isValid(dstValue)) {
                newValue = value;
            } else if (levels > 1) {
                if (isObject(dstValue)) {
                    newValue = defaultMergeProperties(dstValue, value, levels - 1, isImmutable);
                }
            }
            
            if (newValue !== dstValue) {
                if (!isCopy) {
                    dst = copyArrayObject(dst);
                    isCopy = true;
                }
                dst[key] = newValue;
            }
        }
    });

    return dst;
}

module.exports.defaultMergeProperties = defaultMergeProperties;
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
module.exports.deleteItems = deleteItems;
module.exports.forEachKey = forEachKey;
