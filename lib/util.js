"use strict";

const _ = require('lodash');

exports.extend = function (other, add) {
    // Don't do anything if add isn't an object
    if (!add || !isObject(add)) return other;

    let keys = Object.keys(add);
    let i = keys.length;
    while (i--) {
        other[keys[i]] = add[keys[i]];
    }
    return other;
};

function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

exports.hasOwnProperty = hasOwnProperty;

function hasOwnProperties(arg) {
    if (isObject(arg) && (arg.constructor === Object || arg.constructor === Array)) {
        for (let key in arg) {
            // noinspection JSUnfilteredForInLoop
            if (hasOwnProperty(arg, key) && arg[key] !== undefined) {
                return true;
            }
        }
    }
    return false;
}

exports.hasOwnProperties = hasOwnProperties;

function isObject(param) {
    return param && typeof param === "object";
}

function isArray(param) {
    return isObject(param) && param.constructor === Array;
}

exports.isString = _.isString;
exports.isArray = isArray;
exports.isObject = isObject;
exports.isFunction = _.isFunction;

function isNumeric(arg) {
    const n = Number.parseFloat(arg);
    return Number.isFinite(n) && +n === n;
}

exports.isNumeric = isNumeric;

function isNumericInteger(arg) {
    const n = Number.parseFloat(arg);
    return Number.isInteger(n) && +n === n;
}

exports.isNumericInteger = isNumericInteger;

function returnsAlwaysFalse() {
    return false;
}

exports.returnsAlwaysFalse = returnsAlwaysFalse;

function returnsAlwaysTrue() {
    return true;
}

exports.returnsAlwaysTrue = returnsAlwaysTrue;

exports.UNDEFINED = void 0;

function isUndefined(arg) {
    return arg === void 0;
}

exports.isUndefined = isUndefined;

function isNull(arg) {
    return arg === null;
}

exports.isNull = isNull;

function isNullOrUndefined(arg) {
    return arg === null || arg === void 0;
}

exports.isNullOrUndefined = isNullOrUndefined;

function endsWith(value, suffix) {
    return (value.length >= suffix.length && value.substr(value.length - suffix.length) === suffix);
}

exports.endsWith = endsWith;

function startsWith(value, prefix) {
    return (value.length >= prefix.length && value.substr(0, prefix.length) === prefix);
}

exports.startsWith = startsWith;

function wrappedWith(value, prefix, suffix) {
    return (value.length >= prefix.length + suffix.length && startsWith(prop, prefix) && endsWith(prop, suffix));
}

exports.wrappedWith = wrappedWith;

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

exports.isWrapped = isWrapped;

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

exports.unwrap = unwrap;

function wrap(prop, prefixChars, suffixChars) {
    return prefixChars + prop + suffixChars;
}

exports.wrap = wrap;

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

exports.copyFilteredProperties = copyFilteredProperties;

function copyArrayObject(src) {
    let newValue = Object.assign(src.constructor(), src);
    if (isArray(src)) {
        // need to copy the non numeric fields, object assign does not copy them
        copyFilteredProperties(newValue, src, key => !isNumericInteger(key));
    }
    return newValue;
}

exports.copyArrayObject = copyArrayObject;

function firstDefined() {
    for (let i = 0; i < arguments.length; i++) {
        if (arguments[i] !== void 0) {
            return arguments[i];
        }
    }
}

exports.firstDefined = firstDefined;

function deleteItems(arr) {
    if (arguments.length > 1) {
        let i = arguments.length;
        while (--i) {
            let index = arr.indexOf(arguments[i]);
            if (index >= 0) {
                arr.splice(index, 1);
            }
        }
    }

    return arr;
}

exports.deleteItems = deleteItems;
