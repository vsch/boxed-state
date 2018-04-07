const boxedImmutable = require("boxed-immutable");
const _$ = boxedImmutable._$;
const createBox = boxedImmutable.createBox;
const Boxed = boxedImmutable.boxed.Box;
const BOXED_GET_THIS = boxedImmutable.boxed.BOXED_GET_THIS;
const isProxy = boxedImmutable.boxed.isBoxedProxy;
const boxedThis = boxedImmutable.boxed.thisBox;
const boxOnDemand = boxedImmutable.boxed.boxOnDemand;
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

function paramStringException(paramValue, boxedValue) {
    // const valueIsString = util.isString(paramValue);
    // const paramIsNumeric = util.isNumericInteger(boxedValue);
    // return valueIsString && paramIsNumeric ? paramValue[boxedValue] : undefined;
    // if (valueIsString) undefined;
    return paramValue;
}

function createBoxed(val) {
    const boxedProxy = _$(val);
    const boxVal = boxedProxy[BOXED_GET_THIS];
    return {
        origVal: val,
        boxedProxy: boxedProxy,
        boxedVal: boxVal,
    };
}

function createOnDemandBoxed(get, set) {
    const boxedProxy = boxOnDemand(get, set);
    return {
        boxedProxy: boxedProxy,
    };
}

function toTypeString(value) {
    return value === undefined ? 'undefined' : Number.isNaN(value) ? 'NaN' : JSON.stringify(value);
}

module.exports.toTypeString = toTypeString;
module.exports.generateTestParams = generateTestParams;
module.exports.paramStringException = paramStringException;
module.exports.createBoxed = createBoxed;
module.exports.createOnDemandBoxed = createOnDemandBoxed;
