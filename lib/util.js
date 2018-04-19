"use strict";

const isFunction = require('lodash.isfunction');
const isString = require('lodash.isstring');

const UNDEFINED = void 0;

module.exports.UNDEFINED = UNDEFINED;
module.exports.isString = isString;
module.exports.isFunction = isFunction;

module.exports.isValid = isValid;

function isValid(arg) {
    return arg || arg !== UNDEFINED && arg !== null && !Number.isNaN(arg);
}

module.exports.isNumber = isNumber;

function isNumber(arg) {
    return typeof arg === 'number';
}

module.exports.extend = extend;

function extend(other, add) {
    if (!add || !isObject(add)) return other;

    let keys = Object.keys(add);
    let i = keys.length;
    while (i--) {
        const key = keys[i];
        other[key] = add[key];
    }
    return other;
}

module.exports.hasOwnProperty = hasOwnProperty;

function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports.isObject = isObject;

function isObject(param) {
    return !!param && typeof param === "object";
}

module.exports.isArray = isArray;

function isArray(param) {
    return isObject(param) && param.constructor === Array;
}

module.exports.isNumeric = isNumeric;

function isNumeric(arg) {
    const n = !isObject(arg) && Number.parseFloat(arg);
    return Number.isFinite(n) && +n === n;
}

module.exports.isNumericInteger = isNumericInteger;

function isNumericInteger(arg) {
    const n = !isObject(arg) && Number.parseFloat(arg);
    return Number.isInteger(n) && +n === n;
}

module.exports.toNumberOrDefault = toNumberOrDefault;

function toNumberOrDefault(arg, defaultVal) {
    const n = !isObject(arg) && Number.parseFloat(arg);
    return Number.isFinite(n) && +n === n ? n : defaultVal;
}

/**
 * Return arg or its numeric value if it is numeric
 * @param arg
 * @return {*|number}
 */
module.exports.toNumber = toNumber;

function toNumber(arg) {
    return toNumberOrDefault(arg, arg);
}

module.exports.toIntegerOrDefault = toIntegerOrDefault;

function toIntegerOrDefault(arg, defaultVal) {
    const n = !isObject(arg) && Number.parseFloat(arg);
    return Number.isInteger(n) && +n === n ? n : defaultVal;
}

module.exports.toInteger = toInteger;

function toInteger(arg) {
    return toIntegerOrDefault(arg, arg);
}

module.exports.toArrayIndexOrDefault = toArrayIndexOrDefault;

function toArrayIndexOrDefault(arg, defaultVal) {
    const n = !isObject(arg) && Number.parseFloat(arg);
    return Number.isInteger(n) && +n === n && n >= 0 ? n : defaultVal;
}

module.exports.isArrayIndex = isArrayIndex;

function isArrayIndex(arg) {
    return toArrayIndexOrDefault(arg) !== UNDEFINED;
}

module.exports.toArrayIndex = toArrayIndex;

function toArrayIndex(arg) {
    return toArrayIndexOrDefault(arg, arg);
}

module.exports.returnsAlwaysFalse = returnsAlwaysFalse;

function returnsAlwaysFalse() {
    return false;
}

module.exports.returnsAlwaysTrue = returnsAlwaysTrue;

function returnsAlwaysTrue() {
    return true;
}

module.exports.isUndefined = isUndefined;

function isUndefined(arg) {
    return arg === void 0;
}

module.exports.isNull = isNull;

function isNull(arg) {
    return arg === null;
}

module.exports.isNullOrUndefined = isNullOrUndefined;

function isNullOrUndefined(arg) {
    return arg === null || arg === void 0;
}

module.exports.resolveArg = resolveArg;

function resolveArg(arg) {
    return isFunction(arg) ? arg.apply(undefined, Array.prototype.slice.call(arguments, 1)) : arg;
}

module.exports.ifStartsWith = ifStartsWith;

function ifStartsWith(arg, prefix, onTrue, onFalse) {
    return (prefix.length && arg.length >= prefix.length && arg.substr(0, prefix.length) === prefix)
        ? resolveArg(onTrue, arg, prefix)
        : resolveArg(onFalse, arg, prefix);
}

module.exports.ifEndsWith = ifEndsWith;

function ifEndsWith(arg, suffix, onTrue, onFalse) {
    return (suffix.length && arg.length >= suffix.length && arg.substr(arg.length - suffix.length) === suffix)
        ? resolveArg(onTrue, arg, suffix)
        : resolveArg(onFalse, arg, suffix);
}

module.exports.ifWrappedWith = ifWrappedWith;

function ifWrappedWith(arg, prefix, suffix, onTrue, onFalse) {
    return (arg.length >= prefix.length + suffix.length && startsWith(prop, prefix) && endsWith(prop, suffix))
        ? resolveArg(onTrue, arg, prefix, suffix)
        : resolveArg(onFalse, arg, prefix, suffix);
}

module.exports.startsWith = startsWith;

function startsWith(arg, prefix) {
    return ifStartsWith(arg, prefix, true, false);
}

module.exports.endsWith = endsWith;

function endsWith(arg, suffix) {
    return ifEndsWith(arg, suffix, true, false);
}

module.exports.wrappedWith = wrappedWith;

function wrappedWith(arg, prefix, suffix) {
    return ifWrappedWith(arg, prefix, suffix, true, false);
}

function removePrefixFunc(arg, prefix) {
    return arg.substring(prefix.length, arg.length);
}

function removeSuffixFunc(arg, suffix) {
    return arg.substring(0, arg.length - suffix.length);
}

function unwrapFunc(arg, prefix, suffix) {
    return arg.substring(prefix.length, arg.length - suffix.length);
}

module.exports.removePrefix = removePrefix;

function removePrefix(arg, prefix) {
    return ifStartsWith(arg, prefix, removePrefixFunc, arg);
}

module.exports.removeSuffix = removeSuffix;

function removeSuffix(arg, suffix) {
    return ifEndsWith(arg, suffix, removeSuffixFunc, arg);
}

module.exports.unwrap = unwrap;

function unwrap(arg, prefix, suffix) {
    return ifWrappedWith(arg, prefix, suffix, unwrapFunc, arg);
}

module.exports.prefixWith = prefixWith;

function prefixWith(arg, prefix) {
    return prefix + arg;
}

module.exports.suffixWith = suffixWith;

function suffixWith(arg, suffix) {
    return arg + suffix;
}

module.exports.wrapWith = wrapWith;

function wrapWith(arg, prefix, suffix) {
    return prefix + arg + suffix;
}

module.exports.prefixOnce = prefixOnce;

function prefixOnce(arg, prefix) {
    return ifStartsWith(arg, prefix, arg, prefixWith);
}

module.exports.suffixOnce = suffixOnce;

function suffixOnce(prop, suffix) {
    return ifEndsWith(arg, suffix, arg, prefixWith);
}

module.exports.wrapOnce = wrapOnce;

function wrapOnce(arg, prefix, suffix) {
    return ifWrappedWith(arg, prefix, suffix, arg, wrappedWith);
}

module.exports.firstDefined = firstDefined;

function firstDefined() {
    for (let i = 0; i < arguments.length; i++) {
        if (arguments[i] !== void 0) {
            return arguments[i];
        }
    }
}

module.exports.firstValid = firstValid;

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

const BREAK = function (arg = UNDEFINED) {
    BREAK.returned = arg;
    return BREAK;
};
module.exports.BREAK = BREAK;

module.exports.eachKey = eachKey;

/**
 * invoke callback for each own property of arg (object/array)
 * order of keys used for callback invocation is not specified
 *
 * @this       {*}
 * @param callback {function}  function(value, key, arg), key is number if arrayIndex, else
 *     string callback can return BREAK to break out of loop and have undefined returned, or
 *     return BREAK(arg) to break out of loop and have forEachKey return arg as result
 * @param thisArg  what to use as this for the function call, or undefined
 * @return {*}
 */
function eachKey(callback, thisArg = UNDEFINED) {
    const arg = this;
    let result = UNDEFINED;

    if (isObject(arg) && (arg.constructor === Object || arg.constructor === Array)) {
        const keys = Object.keys(arg);
        let i = keys.length;
        BREAK.returned = UNDEFINED;
        while (i--) {
            const key = keys[i];
            if (callback.call(thisArg, arg[key], toArrayIndex(key), arg) === BREAK) {
                result = BREAK.returned;
                BREAK.returned = UNDEFINED; // reset BREAK for nested calls
                break;
            }
        }
    }
    return result;
}

module.exports.hasOwnProperties = hasOwnProperties;

function alwaysTrue(value, key) {
    return true;
}

function alwaysFalse(value, key) {
    return false;
}

function isEqualTo(value, key) {
    // noinspection EqualityComparisonWithCoercionJS
    return this == value;
}

function isNotEqualTo(value, key) {
    // noinspection EqualityComparisonWithCoercionJS
    return this != value;
}

function arrayContainsKey(value, key) {
    if (this.indexOf(key) !== -1) return true;
    return typeof key === "number" && key >= 0 && Number.isInteger(key) && this.indexOf(Number.prototype.toString.call(key)) !== -1;
}

function arrayContainsNotKey(value, key) {
    return !arrayContainsKey.call(this, value, key);
}

function objectHasOwnPropertyKey(value, key) {
    return this.hasOwnProperty(key);
}

function objectHasNotOwnPropertyKey(value, key) {
    return !this.hasOwnProperty(key);
}

function arrayContainsNotKeyBreakTrue(value, key) {
    if (!arrayContainsKey.call(this, value, key)) return BREAK(true);
}

function objectHasNotOwnPropertyBreakTrue(value, key, excluded) {
    if (!this.hasOwnProperty(key)) return BREAK(true);
}

function testFuncBreakTrue(testFunc) {
    return function (value, key, src) {
        if (testFunc.call(this, value, key, src)) {
            BREAK(true);
        }
    };
}

function testFuncNotBreakTrue(value, key, src) {
    if (this.call(this, value, key, src)) BREAK(true);
}

function alwaysBreakTrue(value, key, excluded) {
    return BREAK(true);
}

function keyEqualsBreakTrue(value, key, excluded) {
    // noinspection EqualityComparisonWithCoercionJS
    if (key == this) BREAK(true);
}

function keyNotEqualsBreakTrue(value, key, excluded) {
    // noinspection EqualityComparisonWithCoercionJS
    if (key != this) BREAK(true);
}

function resolveTestFunc(arg, isObjectTest, isArrayTest, functionWrapper, isUndefinedTest, isOtherTest) {
    return isFunction(arg) ? arg :
        isArray(arg) ? isArrayTest :
            isObject(arg) ? isObjectTest :
                isUndefined(arg) ? isUndefinedTest :
                    isOtherTest;
}

function resolveThisArg(arg, thisArg) {
    return isFunction(arg) ? thisArg : arg;
}

/**
 * test if this has own properties ie. not empty object, optionally apply exclusion filter to
 * ignore some properties
 * @this {*}            value to test
 * @param exclude {*}   function, array, object or value containing keys to be excluded
 * @return {boolean}
 */
function hasOwnProperties(exclude) {
    const arg = this;
    return !!eachKey.call(arg, resolveTestFunc(exclude, objectHasNotOwnPropertyBreakTrue, arrayContainsNotKeyBreakTrue, testFuncNotBreakTrue, alwaysFalse, keyNotEqualsBreakTrue), exclude);
}

function collectArrayObjectKeys(value, key) {
    if (isArrayIndex(key)) {
        this.arrayValues[key] = value;
    } else {
        this.objectKeys.push(key);
    }
}

function collectObjectKeys(value, key) {
    if (!isArrayIndex(key)) {
        this.objectKeys.push(key);
    }
}

module.exports.arrayObjectKeys = arrayObjectKeys;

function arrayObjectKeys(arg) {
    const notArrayArg = !isArray(arg);
    const result = {
        arrayValues: notArrayArg ? [] : arg,
        objectKeys: [],
    };

    eachKey.call(arg, notArrayArg ? collectArrayObjectKeys : collectObjectKeys, result);
    return result;
}

module.exports.eachDir = eachDir;

function eachDir(reverse, callback, thisArg = undefined) {
    const arg = this;

    const { arrayValues, objectKeys } = arrayObjectKeys(arg);

    let result = UNDEFINED;
    let doMore = true;

    function forwardProc(array, isArrayIndex) {
        const iMax = array.length;
        BREAK.returned = UNDEFINED; // reset BREAK for nested calls
        for (let i = 0; i < iMax; i++) {
            const key = isArrayIndex ? i : array[i];
            const value = isArrayIndex ? array[i] : arg[key];
            if (callback.call(thisArg, value, key, arg) === BREAK) {
                result = BREAK.returned;
                BREAK.returned = UNDEFINED; // reset BREAK for nested calls
                doMore = false;
                break;
            }
        }
    }

    function reverseProc(array, isArrayIndex) {
        const iMax = array.length;
        BREAK.returned = UNDEFINED; // reset BREAK for nested calls
        for (let i = iMax; i--;) {
            const key = isArrayIndex ? i : array[i];
            const value = isArrayIndex ? array[i] : arg[key];
            if (callback.call(thisArg, value, key, arg) === BREAK) {
                result = BREAK.returned;
                BREAK.returned = UNDEFINED; // reset BREAK for nested calls
                doMore = false;
                break;
            }
        }
    }

    if (reverse) {
        objectKeys.sort();
        reverseProc(objectKeys, false);
        if (doMore) reverseProc(arrayValues, true);
    } else {
        forwardProc(arrayValues, true);
        if (doMore) {
            objectKeys.sort();
            forwardProc(objectKeys, false);
        }
    }
    return result;
}

module.exports.each = each;

/**
 * invoke callback for each own property of arg (object/array)
 * order of keys used for callback invocation:
 *     - all defined array index values,
 *     - all non-array index values sorted by sort()
 *
 * @this  {*}
 * @param callback {function}  function(value, key, arg), key an arrayIndex then a number, else
 *     is a string callback can return BREAK to break out of loop and have undefined returned,
 *     or return BREAK(arg) to break out of loop and have forEachKey return arg as result
 * @param thisArg  what to use as this for the function call, or undefined
 */
function each(callback, thisArg = undefined) {
    return eachDir.call(this, false, callback, thisArg);
}

module.exports.eachRev = eachRev;

/**
 * invoke callback for each own property of arg (object/array)
 * order of keys used for callback invocation:
 *     - all non-array index values sorted by sort() in reverse order
 *     - all defined array index values in reverse order,
 *
 * @this  {*}
 * @param callback {function}  function(value, key, arg), if key is always a string
 *                             callback can return BREAK to break out of loop and have
 *     undefined returned, or return BREAK(arg) to break out of loop and have forEachKey return
 *     arg as result
 * @param thisArg  what to use as this for the function call, or undefined
 */
function eachRev(callback, thisArg = undefined) {
    return eachDir.call(this, true, callback, thisArg);
}

module.exports.cloneArrayObject = cloneArrayObject;

function cloneArrayObject() {
    const src = this;
    if (isObject(src)) {
        let newValue = Object.assign(src.constructor(), src);
        if (isArray(src)) {
            // need to copy the non numeric fields, object assign does not copy them
            eachKey.call(src, (value, key) => {
                if (!isArrayIndex(key)) {
                    newValue[key] = value;
                }
            });
        }
        return newValue;
    } else {
        throw "Invalid this for cloneArrayObject, got " + JSON.stringify(src);
    }
}

module.exports.deleteItems = deleteItems;

/**
 * @this            array
 * @arguments       values to delete, each value can be:
 *                  - array process it as arguments
 *                  - object process its keys as arguments
 *                  - else remove it from the array by splicing
 * @return {*}
 */
function deleteItems() {
    const arr = this;

    if (arguments.length > 0 && isArray(arr)) {
        let i = arguments.length;
        while (i--) {
            const arg = arguments[i];
            if (isArray(arg)) {
                deleteItems.apply(arr, arg);
            } else if (isObject(arg)) {
                deleteItems.apply(arr, Object.keys(arg));
            } else {
                let index = arr.indexOf(arg);
                if (index >= 0) arr.splice(index, 1);
            }
        }
    }

    return arr;
}

module.exports.arrayLength = arrayLength;

/**
 * @this  {*}       anything
 * @return {number} array length equivalent for object, length for array, 0 otherwise
 */
function arrayLength() {
    const arg = this;
    if (isObject(arg)) {
        if (!isArray(arg)) {
            // lets not bicker and look for last integer field in object
            let keys = Object.keys(arg);
            let propKey = 0;
            let i = keys.length;
            while (i--) {
                let key = toArrayIndexOrDefault(keys[i]);
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

module.exports.deepClone = deepClone;

function deepClone(src) {
    if (isObject(src)) {
        let result = isArray(src) ? [] : {};

        const keys = Object.keys(src);
        let i = keys.length;
        while (i--) {
            const key = keys[i];
            const value = src[key];
            result[key] = isObject(value) ? deepClone(value) : value;
        }
        return result;
    }
    return src;
}

module.exports.mergeDefaults = mergeDefaults;

/**
 * defaultMerge properties
 * @this                destination object to merge defaults into
 * @param src           source of defaults
 * @param levels        number of levels deep to merge defaults, all levels if not specified.
 * @param isImmutable   if true then make a copy if changing
 * @param deepCloneSrc  make a deep copy of src values if copying to dst
 * @return {*}          defaults merged (copy if not mutable or original if mutable)
 */
function mergeDefaults(src, levels = undefined, isImmutable = false, deepCloneSrc = false) {
    let dst = this;
    levels = levels || Number.MAX_SAFE_INTEGER;
    let isCopy = !isImmutable;
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
                    newValue = mergeDefaults.call(dstValue, value, levels - 1, isImmutable, deepCloneSrc);
                }

                if (newValue !== dstValue) {
                    if (!isCopy) {
                        dst = cloneArrayObject.call(dst);
                        isCopy = true;
                    }

                    if (deepCloneSrc && isObject(newValue)) {
                        newValue = deepClone(newValue);
                    }
                    dst[key] = newValue;
                }
            }
        }
    }
    return dst;
}

module.exports.copyFiltered = copyFiltered;

/**
 * copy properties from source, optionally filter
 * NOTE: properties whose value is undefined are never copied
 *
 * @this            destination object/array for copied properties, if tests false, then new
 *                  object will be used
 * @param src       source object/array whose properties to filter
 * @param includeFilter {*}
 *                  - function (value, key, src) returning testing true to include,
 *                  - object with properties to be copied
 *                  - array containing properties to copy,
 *                  - anything else will copy if value of property compares with == as true
 * @param thisArg   what to use as this for the function call, or undefined, ignored if
 *     includeFilter is not a function
 * @return {*}      null if no properties were copied, otherwise destination object (this or
 *     new if this was undefined)
 */
function copyFiltered(src, includeFilter, thisArg = undefined) {
    let result = null;

    if (includeFilter !== UNDEFINED && (isObject(src) && (src.constructor === Object || src.constructor === Array))) {
        const dst = this;
        const testFunc = resolveTestFunc(includeFilter, objectHasOwnPropertyKey, arrayContainsKey, null, alwaysTrue, isEqualTo);
        
        if (!isFunction(includeFilter)) thisArg = includeFilter;

        eachKey.call(src, (value, key, arg) => {
            if (value !== UNDEFINED) {
                const testResult = testFunc.call(thisArg, value, key, arg);
                if (testResult === BREAK) return BREAK;
                if (testResult) {
                    if (!result) result = dst || {};
                    result[key] = value;
                }
            }
        }, thisArg);
    }
    return result;
}

module.exports.copyFilteredNot = copyFilteredNot;

/**
 * copy properties from source, optionally filter by inverse condition
 * NOTE: properties whose value is undefined are never copied
 *
 * @this            destination object/array for copied properties, if tests false, then new
 *     object will be used
 * @param src       source object/array whose properties to filter
 * @param excludeFilter {*}
 *                  - function (value, key, src) returning testing true to not copy property,
 *                  - object with properties to be not copied
 *                  - array containing properties to not copy,
 *                  - anything else will copy if value of property compares with != as true
 * @param thisArg  what to use as this for the function call, or undefined, ignored if
 *     excludeFilter is not a function
 * @return {*}      null if no properties were copied, otherwise destination object (this or
 *     new if this was undefined)
 */
function copyFilteredNot(src, excludeFilter, thisArg = undefined) {
    let result = null;

    if (isObject(src) && (src.constructor === Object || src.constructor === Array)) {
        const dst = this;
        const testFunc = resolveTestFunc(excludeFilter, objectHasOwnPropertyKey, arrayContainsKey, null, alwaysTrue, isEqualTo);
        if (!isFunction(excludeFilter)) thisArg = excludeFilter;

        eachKey.call(src, (value, key, arg) => {
            if (value !== UNDEFINED) {
                const testResult = testFunc.call(thisArg, value, key, arg);
                if (testResult === BREAK) return BREAK;
                if (!testResult) {
                    if (!result) result = dst || {};
                    result[key] = value;
                }
            }
        }, thisArg);
    }
    return result;
}

module.exports.objFiltered = objFiltered;

/**
 * filter function applied to objects and array's own properties not just indexed contents
 * results in object or array
 *
 * @this        array or object
 * @param filter  see copyFiltered
 * @param thisArg if filter is function then what to use for this
 * @return {object|array} depending on this passed on call
 */
function objFiltered(filter, thisArg) {
    const dst = isArray(this) ? [] : {};
    copyFiltered.call(dst, this, filter, thisArg);
    return dst;
}

module.exports.objFilter = objFilter;

/**
 * filter function applied to objects and array's own properties not just indexed contents
 * results in array of property values for which function returned true
 * property order: index properties first, non-indexed properties in ascii sorted order
 *
 * @this        array or object
 * @param callback  function(value,key,collection) returning value testing true to accumulate
 *     value in result if BREAK returned then breaks out of loop
 * @param thisArg if filter is function then what to use for this
 * @return {array} of values for which callback returned true
 */
function objFilter(callback, thisArg) {
    const dst = [];
    each.call(this, (value, key, src) => {
        const result = callback.call(thisArg, value, key, src);
        if (result === BREAK) return BREAK;
        if (result) {
            dst.push(value);
        }
    });
    return dst;
}

module.exports.objMapped = objMapped;

/**
 * map function applied to objects and array's own properties not just indexed contents
 * results in object or array
 *
 * @this        array or object
 * @param callback  function(value,key,collection)
 *                  if BREAK returned then breaks out of loop
 * @param thisArg what to use for this for callback
 * @return {object|array} depending on this passed on call
 */
function objMapped(callback, thisArg = UNDEFINED) {
    const dst = isArray(this) ? [] : {};
    eachKey.call(this, (value, key, src) => {
        const result = callback.call(thisArg, value, key, src);
        if (result === BREAK) return BREAK;
        if (result !== UNDEFINED) {
            dst[key] = result;
        }
    });
    return dst;
}

module.exports.objMap = objMap;

/**
 * map function applied to objects and array's own properties not just indexed contents
 * results accumulated in an array
 *
 * @this        array or object
 * @param callback function taking (value, key, collection) and returning value to accumulate,
 *     undefined is skipped, BREAK will break out of loop
 * @param thisArg what to use for this for callback
 * @return {array} depending on this passed on call
 *
 */
function objMap(callback, thisArg = UNDEFINED) {
    const dst = [];
    each.call(this, (value, key, src) => {
        const result = callback.call(thisArg, value, key, src);
        if (result === BREAK) return BREAK;
        if (result !== UNDEFINED) {
            dst.push(result);
        }
    });
    return dst;
}

module.exports.objSome = objSome;

/**
 * some function applied to objects and array's own properties not just indexed contents
 * results accumulated in an array
 *
 * @this        array or object
 * @param callback function taking (value, key, collection) and returning value to test for
 *     truth if BREAK returned then result of function will be true, if BREAK(arg) then result
 *     is !!arg
 * @param thisArg what to use for this for callback
 * @return {boolean} whether callback returned true for some values
 *
 */
function objSome(callback, thisArg = UNDEFINED) {
    return !!each.call(this, (value, key, src) => {
        BREAK.returned = true;
        const result = callback.call(thisArg, value, key, src);
        if (result === BREAK) return BREAK;
        if (result) return BREAK(true);
    });
}

module.exports.objEvery = objEvery;

/**
 * every function applied to object's and array's own properties not just indexed contents
 *
 * @this        array or object
 * @param callback function taking (value, key, collection) and returning value to test for
 *     truth if BREAK returned then result of function will be true, if BREAK(arg) then result
 *     is !arg
 * @param thisArg what to use for this for callback
 * @return {boolean} whether callback returned true for all keys/values
 *
 */
function objEvery(callback, thisArg = UNDEFINED) {
    return !each.call(this, (value, key, src) => {
        BREAK.returned = false;
        const result = callback.call(thisArg, value, key, src);
        if (result === BREAK) return BREAK;
        if (!result) return BREAK(true);
    });
}

module.exports.objReduce = objReduce;

/**
 * reduce function applied to object's and array's own properties not just indexed contents
 * where order of reduction is not important
 *
 * @this        array or object
 * @param callback function taking (prevValue, value, key, collection) and returning reduced
 *     value if BREAK returned then the result will be the accumulated value up to this point,
 *     or if BREAK(arg) is returned then the result will be arg
 * @param thisArg what to use for this for callback
 * @return {boolean} whether callback returned true for all keys/values
 *
 */
function objReduce(callback, thisArg = UNDEFINED) {
    let reduced;
    eachKey.call(this, (value, key, src) => {
        BREAK.returned = reduced;
        const result = callback.call(thisArg, reduced, value, key, src);
        if (result === BREAK) return BREAK;
        reduced = result;
    });
}

module.exports.objReduceLeft = objReduceLeft;

/**
 * reduce function applied to object's and array's own properties not just indexed contents
 * where order of reduction is left to right, first indexed properties, then ascii sorted
 * non-indexed properties
 *
 * @this        array or object
 * @param callback function taking (prevValue, value, key, collection) and returning reduced
 *     value if BREAK returned then the result will be the accumulated value up to this point,
 *     or if BREAK(arg) is returned then the result will be arg
 * @param thisArg what to use for this for callback
 * @return {boolean} whether callback returned true for all keys/values
 *
 */
function objReduceLeft(callback, thisArg = UNDEFINED) {
    let reduced;
    each.call(this, (value, key, src) => {
        BREAK.returned = reduced;
        const result = callback.call(thisArg, reduced, value, key, src);
        if (result === BREAK) return BREAK;
        reduced = result;
    });
}

module.exports.objReduceRight = objReduceRight;

/**
 * reduceRight function applied to object's and array's own properties not just indexed
 * contents
 * where order of reduction is right to left, ascii sorted non-indexed properties in reverse
 * order, then indexed properties in reverse order
 *
 * @this        array or object
 * @param callback function taking (prevValue, value, key, collection) and returning reduced
 *     value if BREAK returned then the result will be the accumulated value up to this point,
 *     or if BREAK(arg) is returned then the result will be arg
 * @param thisArg what to use for this for callback
 * @return {boolean} whether callback returned true for all keys/values
 *
 */
function objReduceRight(callback, thisArg = UNDEFINED) {
    let reduced;
    eachRev.call(this, (value, key, src) => {
        BREAK.returned = reduced;
        const result = callback.call(thisArg, reduced, value, key, src);
        if (result === BREAK) return BREAK;
        reduced = result;
    });
}

const BoxedOutObject = {};
BoxedOutObject.prototype = Object.create(Object.prototype);
BoxedOutObject.prototype.filtered = objFiltered;
BoxedOutObject.prototype.filter = objFilter;
BoxedOutObject.prototype.mapped = objMapped;
BoxedOutObject.prototype.map = objMap;
BoxedOutObject.prototype.copyFiltered = copyFiltered;
BoxedOutObject.prototype.copyFilteredNot = copyFilteredNot;
BoxedOutObject.prototype.each = each;
BoxedOutObject.prototype.eachRev = eachRev;
BoxedOutObject.prototype.eachKey = eachKey;
BoxedOutObject.prototype.cloneArrayObject = cloneArrayObject;
BoxedOutObject.prototype.deleteItems = deleteItems;
BoxedOutObject.prototype.arrayLength = arrayLength;
BoxedOutObject.prototype.deepClone = deepClone;
BoxedOutObject.prototype.mergeDefaults = mergeDefaults;
BoxedOutObject.prototype.some = objSome;
BoxedOutObject.prototype.every = objEvery;
BoxedOutObject.prototype.reduce = objReduce;
BoxedOutObject.prototype.reduceLeft = objReduceLeft;
BoxedOutObject.prototype.reduceRight = objReduceRight;

const BoxedMaxOutArray = [];
BoxedMaxOutArray.prototype = Object.create(Array.prototype);
BoxedMaxOutArray.prototype.filtered = objFiltered;
BoxedMaxOutArray.prototype.filter = objFilter;
BoxedMaxOutArray.prototype.mapped = objMapped;
BoxedMaxOutArray.prototype.map = objMap;
BoxedMaxOutArray.prototype.copyFiltered = copyFiltered;
BoxedMaxOutArray.prototype.copyFilteredNot = copyFilteredNot;
BoxedMaxOutArray.prototype.each = each;
BoxedMaxOutArray.prototype.eachRev = eachRev;
BoxedMaxOutArray.prototype.eachKey = eachKey;
BoxedMaxOutArray.prototype.cloneArrayObject = cloneArrayObject;
BoxedMaxOutArray.prototype.deleteItems = deleteItems;
BoxedMaxOutArray.prototype.arrayLength = arrayLength;
BoxedMaxOutArray.prototype.deepClone = deepClone;
BoxedMaxOutArray.prototype.mergeDefaults = mergeDefaults;
BoxedMaxOutArray.prototype.some = objSome;
BoxedMaxOutArray.prototype.every = objEvery;
BoxedMaxOutArray.prototype.reduce = objReduce;
BoxedMaxOutArray.prototype.reduceLeft = objReduceLeft;
BoxedMaxOutArray.prototype.reduceRight = objReduceRight;

const BoxedOutArray = [];
BoxedOutArray.prototype = Object.create(Array.prototype);
BoxedOutArray.prototype.filtered = objFiltered;
// BoxedOutArray.prototype.filter = objFilter;
BoxedOutArray.prototype.mapped = objMapped;
// BoxedOutArray.prototype.map = objMap;
BoxedOutArray.prototype.copyFiltered = copyFiltered;
BoxedOutArray.prototype.copyFilteredNot = copyFilteredNot;
BoxedOutArray.prototype.each = each;
BoxedOutArray.prototype.eachRev = eachRev;
BoxedOutArray.prototype.eachKey = eachKey;
BoxedOutArray.prototype.cloneArrayObject = cloneArrayObject;
BoxedOutArray.prototype.deleteItems = deleteItems;
BoxedOutArray.prototype.arrayLength = arrayLength;
BoxedOutArray.prototype.deepClone = deepClone;
BoxedOutArray.prototype.mergeDefaults = mergeDefaults;
// BoxedOutArray.prototype.some = objSome;
// BoxedOutArray.prototype.every = objEvery;
// BoxedOutArray.prototype.reduce = objReduce;
BoxedOutArray.prototype.reduceLeft = objReduceLeft;
BoxedOutArray.prototype.reduceRight = objReduceRight;

module.exports.boxOut = boxOut;
module.exports.$_ = boxOut;

function boxOut(obj) {
    if (isObject(obj) && (obj.constructor === Object || obj.constructor === Array)) {
        Object.setPrototypeOf(obj, obj.constructor === Array ? BoxedOutArray.prototype : BoxedOutObject.prototype);
    }
    return obj;
}

module.exports.boxMaxOut = boxMaxOut;

function boxMaxOut(obj) {
    if (isObject(obj) && (obj.constructor === Object || obj.constructor === Array)) {
        Object.setPrototypeOf(obj, obj.constructor === Array ? BoxedMaxOutArray.prototype : BoxedOutObject.prototype);
    }
    return obj;
}

