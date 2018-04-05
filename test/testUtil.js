const boxedImmutable = require("boxed-immutable");
const _$ = boxedImmutable._$;
const createBox = boxedImmutable.createBox;
const Boxed = boxedImmutable.boxed.Boxed;
const BOXED_GET_THIS = boxedImmutable.boxed.BOXED_GET_THIS;
const isProxy = boxedImmutable.boxed.isBoxedProxy;
const boxedThis = boxedImmutable.boxed.boxedThis;
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
                const valueText = value === undefined ? 'undefined' : Number.isNaN(value) ? 'NaN' : JSON.stringify(value);
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
    const valueIsString = util.isString(paramValue);
    const paramIsNumeric = util.isNumericInteger(boxedValue);
    return valueIsString && paramIsNumeric ? paramValue[boxedValue] : undefined;
}

function createBoxed(val) {
    const boxedProxy = _$(val);
    return {
        origVal: val,
        boxedProxy: boxedProxy,
        boxedVal: boxedProxy[BOXED_GET_THIS],
    };
}

function createOnDemandBoxed(get, set) {
    const boxedProxy = boxOnDemand(get, set);
    return {
        boxedProxy: boxedProxy,
    };
}

module.exports.generateTestParams = generateTestParams;
module.exports.paramStringException = paramStringException;
module.exports.createBoxed = createBoxed;
module.exports.createOnDemandBoxed = createOnDemandBoxed;
