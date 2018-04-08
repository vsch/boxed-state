const boxedImmutable = require("boxed-immutable");
const _$ = boxedImmutable._$;
const createBox = boxedImmutable.createBox;
const Boxed = boxedImmutable.boxed.Box;
const BOXED_GET_THIS = boxedImmutable.boxed.BOXED_GET_THIS;
const isProxy = boxedImmutable.boxed.isBoxedProxy;
const boxedThis = boxedImmutable.boxed.thisBox;
const boxState = boxedImmutable.boxed.boxState;
const util = boxedImmutable.util;

function generateTestParams(template, customize) {
    const innerParams = [];
    for (let type in template) {
        if (template.hasOwnProperty(type)) {
            const values = template[type];
            let iMax = values.length;
            for (let i = 0; i < iMax; i++) {
                let value = values[i];
                let ofTotal = values.length;
                const valueText = toTypeString(value);
                const testThis = {
                    type: type,
                    value: value,
                    valueText: valueText,
                    valueIndex: i,
                    ofTotal: ofTotal,
                };

                let testDescription;
                if (customize) testDescription = customize(testThis);

                if (!(testThis.hasOwnProperty('testDescription') && testThis.testDescription)) {
                    // returned description
                    testThis.testDescription = testDescription ? testDescription : type + ': [' + valueText + ']';
                }
                innerParams.push([testDescription, testThis]);
            }
        }
    }
    return innerParams;
}

function paramStringException(arg, param) {
    // const valueIsString = util.isString(arg);
    // const paramIsNumeric = util.isNumericInteger(param);
    // return valueIsString && paramIsNumeric ? arg[param] : undefined;
    // if (valueIsString) undefined;
    return util.isObject(arg) ? arg[param] : undefined;
}

function createBoxed(val, box) {
    box = box || _$;
    const boxedProxy = box(val);
    const boxVal = boxedProxy[BOXED_GET_THIS];
    return {
        origVal: val,
        boxedProxy: boxedProxy,
        boxedVal: boxVal,
    };
}

function createBoxedState(get, set) {
    const boxedProxy = boxState(get, set);
    return {
        boxedProxy: boxedProxy,
    };
}

function toTypeString(value) {
    return value === undefined ? 'undefined' : Number.isNaN(value) ? 'NaN' : JSON.stringify(value);
}

function arrayToObject(arr, except) {
    let dst = {};
    let keys = Object.keys(arr);
    let i = keys.length;
    while (i--) {
        const key = keys[i];
        if (!except || except.indexOf(key) === -1) { 
            dst[key] = arr[key];
        }
    }
    return dst;
}

module.exports.toTypeString = toTypeString;
module.exports.generateTestParams = generateTestParams;
module.exports.paramStringException = paramStringException;
module.exports.createBoxed = createBoxed;
module.exports.createBoxedState = createBoxedState;
module.exports.arrayToObject = arrayToObject;
