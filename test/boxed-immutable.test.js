"use strict";

const jestEach = require('jest-each');
const boxedImmutable = require("boxed-immutable");
const utilTypeFuncs = require('util-type-funcs');
const objEachBreak = require('obj-each-break');
const testUtil = require('./testUtil');
const _$ = boxedImmutable._$;
const boxOut = boxedImmutable.boxOut;
const $_ = boxedImmutable.boxOut;
const boxState = boxedImmutable.boxState;

const isObjectLike = utilTypeFuncs.isObjectLike;
const isNullOrUndefined = utilTypeFuncs.isNullOrUndefined;
const isArray = utilTypeFuncs.isArray;
const toArrayIndex = utilTypeFuncs.toArrayIndex;
const isArrayIndex = utilTypeFuncs.isArrayIndex;
const isValid = utilTypeFuncs.isValid;
const isFunction = utilTypeFuncs.isFunction;
const isString = utilTypeFuncs.isString;
const isNumeric = utilTypeFuncs.isNumeric;
const toNumber = utilTypeFuncs.toNumber;

const BREAK = objEachBreak.BREAK;
const cloneArrayObject = objEachBreak.cloneArrayObject;
const hasOwnProperties = objEachBreak.hasOwnProperties;

const isBoxedProxy = boxedImmutable.boxed.isBoxedProxy;
const isBoxedInProxy = boxedImmutable.boxed.isBoxedInProxy;
const isBoxedOutProxy = boxedImmutable.boxed.isBoxedOutProxy;
const createTransformedBoxed = testUtil.createTransformedBoxed;
const generateTestParams = testUtil.generateTestParams;
const paramStringException = testUtil.paramStringException;
const createBoxed = testUtil.createBoxed;
const createOnDemandBoxed = testUtil.createBoxedState;
const toTypeString = testUtil.toTypeString;
const stringify = testUtil.stringify;
const createBoxedState = testUtil.createBoxedState;
const array = testUtil.array;
const object = testUtil.object;

jestEach([
    ['undefined', undefined],
    ['{}', {}],
    ['[]', []],
])
    .describe('Boxed %s unmodified', (typeDescription, type) => {
        let origVal;
        let boxedVal;
        let boxedProxy;
        let boxedInProxy;
        let boxedOutProxy;

        beforeAll(() => {
            let vals = createBoxed(type);
            origVal = vals.origVal;
            boxedVal = vals.boxedVal;
            boxedProxy = vals.boxedProxy;
        });

        test('isBoxedProxy() === boxedProxy', () => {
            expect(isBoxedProxy(boxedProxy)).toBe(boxedVal);
        });

        test('_$ === proxy', () => {
            expect(boxedProxy._$).toBe(boxedProxy);
        });

        test('_$ === boxedInProxy', () => {
            expect(boxedProxy._$).toBe(boxedVal.boxedInProxy);
        });

        test('$_ === boxedOutProxy or value', () => {
            const $_boxedOut = boxedProxy.$_;
            expect($_boxedOut).toBe(isObjectLike(boxedVal.value) ? boxedVal.boxedOutProxy : boxedVal.value);
        });

        test('$_value === value', () => {
            expect(boxedProxy.$_value).toBe(boxedVal.value);
        });

        test('valueOf() === value', () => {
            expect(boxedVal.valueOf()).toBe(boxedVal.value);
        });

        test('value === original', () => {
            expect(boxedVal.value).toBe(origVal);
        });

        test('valueOf() === original', () => {
            expect(boxedVal.valueOf()).toBe(origVal);
        });

        test('nested property is proxied', () => {
            const nonexistent = boxedProxy.nonexistent;
            expect(nonexistent._$).toBe(nonexistent);
        });

        test('nested property values undefined', () => {
            expect(boxedProxy.nonexistent.property.$_).toBe(undefined);
        });

        test('$_modified is undefined', () => {
            expect(boxedProxy.$_modified).toBe(undefined);
        });

        test('$_delta is undefined', () => {
            expect(boxedProxy.$_delta).toBe(undefined);
        });

        test('$_deepDelta is undefined', () => {
            expect(boxedProxy.$_deepDelta).toBe(undefined);
        });
    });

jestEach([
    // ['1. undefined', undefined, { newProp: 5 }],
    // ['2. null', null, { newProp: 5 }],
    // ['3. {}', {}, { newProp: 5 }],
    // ['4. []', [], { newProp: 5 }],
    // ['5. { oldValue: "old" }', { oldValue: "old" }, { newProp: 5 }],
    // ['6. []', [], { "": [5] }],
    ['7. []', [], { "_$": [5] }],
    // ['8. []', [], { "._$": [5] }],
    // ['9. []', [], { _$: [5] }],
    // ['10. [5]', [], { "": [5] }],
    // ['11. [5]', [], { "_$": [5] }],
    // ['12. [5]', [], { "._$": [5] }],
    // ['13. [5]', [], { _$: [5] }],
    // ['14. [5]', [], { 0: 5 }],
    // ['15. [10]', [], { 0: 5 }],
    // ['16. [10]', [], { 0: 5, _$: [20], }],
])
    .describe('Boxed %s modified', (typeDescription, type, params) => {
        let origVal;
        let boxedVal;
        let boxedProxy;
        let expected;
        let delta;

        beforeAll(() => {
            let vals = createBoxed(type);
            origVal = vals.origVal;
            boxedVal = vals.boxedVal;
            boxedProxy = vals.boxedProxy;
            expected = isObjectLike(origVal) && isArray(origVal) ? cloneArrayObject.call(origVal) : Object.assign({}, origVal);
            delta = isObjectLike(origVal) && isArray(origVal) ? [] : {};

            for (let param in params) {
                if (params.hasOwnProperty(param)) {
                    if (param === "" || param === "_$" || param === "._$" || param === boxedVal.context.globalBox) {
                        let values = params[param];
                        let iMax = values.length;
                        for (let i = 0; i < iMax; i++) {
                            if (param === '._$') {
                                boxedProxy._$ = values[i];
                            } else {
                                boxedProxy[param] = values[i];
                            }

                            if (isArray(expected)) {
                                delta[expected.length] = values[i];
                                expected.push(values[i]);
                            } else {
                                delta[i] = values[i];
                                expected[i] = values[i];
                            }
                        }
                    } else {
                        boxedProxy[param] = params[param];
                        expected[param] = params[param];
                        delta[param] = params[param];
                    }
                }
            }
        });

        test('isBoxedProxy() === boxedProxy', () => {
            expect(isBoxedProxy(boxedProxy)).toBe(boxedVal);
        });

        test('_$ === proxy', () => {
            expect(boxedProxy._$).toBe(boxedProxy);
        });

        test('_$ === boxedInProxy', () => {
            expect(boxedProxy._$).toBe(boxedVal.boxedInProxy);
        });

        test('$_ === boxedOutProxy or value', () => {
            const $_boxedOut = boxedProxy.$_;
            expect($_boxedOut).toBe(isObjectLike(boxedVal.value) ? boxedVal.boxedOutProxy : boxedVal.value);
        });

        test('$_value === value', () => {
            expect(boxedProxy.$_value).toBe(boxedVal.value);
        });

        test('valueOf() === value', () => {
            expect(boxedVal.valueOf()).toBe(boxedVal.value);
        });

        test('value !== original', () => {
            expect(boxedVal.value).not.toBe(origVal);
        });

        test('value === expected', () => {
            expect(boxedVal.value).toEqual(expected);
        });

        test('$_modified === value', () => {
            expect(boxedProxy.$_modified).toBe(boxedVal.value);
        });

        test('$_delta == delta', () => {
            expect(boxedProxy.$_delta).toEqual(delta);
        });

        test('$_deepDelta == delta', () => {
            expect(boxedProxy.$_deepDelta).toEqual(delta);
        });
    });

// these assign via .$_
jestEach([
    ['1. undefined', undefined, { newProp: 5 }],
    ['2. null', null, { newProp: 5 }],
    ['3. {}', {}, { newProp: 5 }],
    ['4. []', [], { newProp: 5 }],
    ['5. { oldValue: "old" }', { oldValue: "old" }, { newProp: 5 }],
    ['6. [5]', [], { 0: 5 }],
    ['7. [10]', [], { 0: 5 }],
])
    .describe('Boxed %s modified via .$_', (typeDescription, type, params) => {
        let origVal;
        let boxedVal;
        let boxedProxy;
        let expected;
        let delta;

        beforeAll(() => {
            let vals = createBoxed(type);
            origVal = vals.origVal;
            boxedVal = vals.boxedVal;
            boxedProxy = vals.boxedProxy;
            expected = isObjectLike(origVal) && isArray(origVal) ? cloneArrayObject.call(origVal) : Object.assign({}, origVal);
            delta = isObjectLike(origVal) && isArray(origVal) ? [] : {};

            for (let param in params) {
                if (params.hasOwnProperty(param)) {
                    boxedProxy[param].$_ = params[param];
                    expected[param] = params[param];
                    delta[param] = params[param];
                }
            }
        });

        test('isBoxedProxy() === boxedProxy', () => {
            expect(isBoxedProxy(boxedProxy)).toBe(boxedVal);
        });

        test('_$ === proxy', () => {
            expect(boxedProxy._$).toBe(boxedProxy);
        });

        test('_$ === boxedInProxy', () => {
            expect(boxedProxy._$).toBe(boxedVal.boxedInProxy);
        });

        test('$_ === boxedOutProxy or value', () => {
            expect(boxedProxy.$_).toBe(isObjectLike(boxedVal.value) ? boxedVal.boxedOutProxy : boxedVal.value);
        });

        test('$_value === value', () => {
            expect(boxedProxy.$_value).toBe(boxedVal.value);
        });

        test('valueOf() === value', () => {
            expect(boxedVal.valueOf()).toBe(boxedVal.value);
        });

        test('value !== original', () => {
            expect(boxedVal.value).not.toBe(origVal);
        });

        test('value === expected', () => {
            expect(boxedVal.value).toEqual(expected);
        });

        test('$_modified === value', () => {
            expect(boxedProxy.$_modified).toBe(boxedVal.value);
        });

        test('$_delta == delta', () => {
            expect(boxedProxy.$_delta).toEqual(delta);
        });

        test('$_deepDelta == delta', () => {
            expect(boxedProxy.$_deepDelta).toEqual(delta);
        });
    });

describe('Boxed Non-Empty Multi-Mods One Copy', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let boxedValue1;
    let boxedValue2;
    let boxedValue3;

    beforeEach(() => {
        let vals = createBoxed([10, 20, 30]);
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        boxedProxy[_$] = 45;
        boxedValue1 = boxedVal.value;
        boxedProxy[1] = 55;
        boxedValue2 = boxedVal.value;
        boxedProxy[_$] = 35;
        boxedValue3 = boxedVal.value;
    });

    test('isBoxedProxy() === boxedProxy', () => {
        expect(isBoxedProxy(boxedProxy)).toBe(boxedVal);
    });

    test('_$ === proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('_$ === boxedInProxy', () => {
        expect(boxedProxy._$).toBe(boxedVal.boxedInProxy);
    });

    test('$_ === boxedOutProxy or value', () => {
        expect(boxedProxy.$_).toBe(isObjectLike(boxedVal.value) ? boxedVal.boxedOutProxy : boxedVal.value);
    });

    test('$_value === value', () => {
        expect(boxedProxy.$_value).toBe(boxedVal.value);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value !== original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value == modified', () => {
        expect(boxedVal.value).toEqual([10, 55, 30, 45, 35]);
    });

    test('$_modified === value', () => {
        expect(boxedProxy.$_modified).toBe(boxedVal.value);
    });

    test('first mod !== original', () => {
        expect(boxedValue1).not.toBe(origVal);
    });

    test('first mod === value', () => {
        expect(boxedValue1).toBe(boxedVal.value);
    });

    test('second mod === value', () => {
        expect(boxedValue2).toBe(boxedVal.value);
    });

    test('third mod === value', () => {
        expect(boxedValue3).toBe(boxedVal.value);
    });
});

describe('Boxed Non Empty Array Modified with property', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;

    beforeAll(() => {
        let vals = createBoxed([10]);
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        boxedProxy.newProp = 5;
    });

    test('isBoxedProxy() === boxedProxy', () => {
        expect(isBoxedProxy(boxedProxy)).toBe(boxedVal);
    });

    test('_$ === proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('_$ === boxedInProxy', () => {
        expect(boxedProxy._$).toBe(boxedVal.boxedInProxy);
    });

    test('$_ === boxedOutProxy or value', () => {
        expect(boxedProxy.$_).toBe(isObjectLike(boxedVal.value) ? boxedVal.boxedOutProxy : boxedVal.value);
    });

    test('$_value === value', () => {
        expect(boxedProxy.$_value).toBe(boxedVal.value);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value === original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value === modified', () => {
        let value = [10];
        value["newProp"] = 5;
        expect(boxedVal.value).toEqual(value);
    });

    test('$_modified is value', () => {
        expect(boxedProxy.$_modified).toBe(boxedVal.value);
    });

    test('$_delta !== value', () => {
        expect(boxedProxy.$_delta).not.toBe(boxedVal.value);
    });

    test('$_delta != value', () => {
        expect(boxedProxy.$_delta).not.toEqual(boxedVal.value);
    });

    test('$_delta == delta of mods', () => {
        let value = [];
        value["newProp"] = 5;
        expect(boxedProxy.$_delta).toEqual(value);
    });

    test('$_deepDelta !== value', () => {
        expect(boxedProxy.$_delta).not.toBe(boxedVal.value);
    });

    test('$_deepDelta != value', () => {
        expect(boxedProxy.$_deepDelta).not.toEqual(boxedVal.value);
    });

    test('$_deepDelta == delta of mods', () => {
        let value = [];
        value["newProp"] = 5;
        expect(boxedProxy.$_deepDelta).toEqual(value);
    });

});

describe('Boxed Deep Nested New Mods', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let expectedValue;
    let deltaValue;
    let deepDeltaValue;

    beforeAll(() => {
        let vals = createBoxed({
            oldValue: "old",
            oldValue1: {
                fieldParam: 5,
            },
            oldValue2: "aValue",
            oldValue3: {
                fieldParam: 10,
                fieldParam2: "10",
                newValue2: { oldField: "25", },
            },
        });
        const arr = [];
        arr[5] = 15;

        expectedValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
            },
            oldValue2: "aValue",
            oldValue3: {
                fieldParam: 10,
                fieldParam2: 10,
                newValue2: { oldField: "25", field: 25, },
            },
        };
        deltaValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
            },
            // oldValue2: "aValue",
            oldValue3: {
                fieldParam: 10,
                fieldParam2: 10,
                newValue2: { oldField: "25", field: 25, },
            },
        };
        deepDeltaValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                // fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
            },
            // oldValue2: "aValue",
            oldValue3: {
                // fieldParam: 10,
                fieldParam2: 10,
                newValue2: {
                    // oldField: 25,
                    field: 25,
                },
            },
        };

        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        if (boxedProxy._$ !== boxedProxy) {
            const tmp = 0;
        }
        boxedProxy.oldValue.newValue1[_$] = 5;
        if (boxedProxy._$ !== boxedProxy) {
            const tmp = 0;
        }
        boxedProxy.oldValue1.newValue1[5] = 15;
        if (boxedProxy._$ !== boxedProxy) {
            const tmp = 0;
        }
        boxedProxy.oldValue1.newValue2.field = 25;
        if (boxedProxy._$ !== boxedProxy) {
            const tmp = 0;
        }
        boxedProxy.oldValue3.fieldParam = 10;
        boxedProxy.oldValue3.fieldParam2 = 10;
        boxedProxy.oldValue3.newValue2["field"] = 25;
        if (boxedProxy._$ !== boxedProxy) {
            const tmp = 0;
        }
    });

    test('isBoxedProxy() === boxedProxy', () => {
        expect(isBoxedProxy(boxedProxy)).toBe(boxedVal);
    });

    test('_$ === proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('_$ === boxedInProxy', () => {
        expect(boxedProxy._$).toBe(boxedVal.boxedInProxy);
    });

    test('$_ === boxedOutProxy or value', () => {
        expect(boxedProxy.$_).toBe(isObjectLike(boxedVal.value) ? boxedVal.boxedOutProxy : boxedVal.value);
    });

    test('$_value === value', () => {
        expect(boxedProxy.$_value).toBe(boxedVal.value);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value !== original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value == modified', () => {
        expect(boxedVal.value).toEqual(expectedValue);
    });

    test('$_modified is value', () => {
        expect(boxedProxy.$_modified).toBe(boxedVal.value);
    });

    test('$_delta !== value', () => {
        expect(boxedProxy.$_delta).not.toBe(boxedVal.value);
    });

    test('$_delta == delta', () => {
        expect(boxedProxy.$_delta).toEqual(deltaValue);
    });

    test('$_deepDelta !== delta', () => {
        expect(boxedProxy.$_deepDelta).not.toEqual(boxedProxy.$_delta);
    });

    test('$_deepDelta == deepDelta', () => {
        expect(boxedProxy.$_deepDelta).toEqual(deepDeltaValue);
    });
});

describe('Boxed Deep Nested delta Mods', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let expectedValue;
    let deltaValue;
    let origDeltaValue;
    let deepDeltaValue;
    let origDeepDeltaValue;

    beforeAll(() => {
        let vals = createBoxed({
            oldValue: "old",
            oldValue1: {
                fieldParam: 5,
            },
            oldValue2: "aValue",
            oldValue3: {
                fieldParam: 10,
                fieldParam2: "10",
                newValue2: { oldField: "25", },
            },
        });

        const arr = [];
        arr[5] = 15;

        expectedValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
            },
            oldValue2: "aValue",
            oldValue3: {
                fieldParam: 10,
                fieldParam2: 10,
                newValue2: { oldField: "25", field: 25, },
            },
        };

        deltaValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
            },
            // oldValue2: "aValue",
            oldValue3: {
                fieldParam: 10,
                fieldParam2: 10,
                newValue2: { oldField: "25", field: 25, },
            },
        };

        origDeltaValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
            },
            // oldValue2: "aValue",
            oldValue3: {
                fieldParam: 10,
                fieldParam2: 10,
                newValue2: { oldField: "25", field: 25, },
            },
        };

        deepDeltaValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                // fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
            },
            // oldValue2: "aValue",
            oldValue3: {
                // fieldParam: 10,
                fieldParam2: 10,
                newValue2: {
                    // oldField: 25,
                    field: 25,
                },
            },
        };

        origDeepDeltaValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                // fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
            },
            // oldValue2: "aValue",
            oldValue3: {
                // fieldParam: 10,
                fieldParam2: 10,
                newValue2: {
                    // oldField: 25,
                    field: 25,
                },
            },
        };

        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        boxedProxy.$_delta = deltaValue;

        if (boxedProxy._$ !== boxedProxy) {
            const tmp = 0;
        }
    });

    test('isBoxedProxy() === boxedProxy', () => {
        expect(isBoxedProxy(boxedProxy)).toBe(boxedVal);
    });

    test('_$ === proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('_$ === boxedInProxy', () => {
        expect(boxedProxy._$).toBe(boxedVal.boxedInProxy);
    });

    test('$_ === boxedOutProxy or value', () => {
        expect(boxedProxy.$_).toBe(isObjectLike(boxedVal.value) ? boxedVal.boxedOutProxy : boxedVal.value);
    });

    test('$_value === value', () => {
        expect(boxedProxy.$_value).toBe(boxedVal.value);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value !== original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value == modified', () => {
        expect(boxedVal.value).toEqual(expectedValue);
    });

    test('$_modified is value', () => {
        expect(boxedProxy.$_modified).toBe(boxedVal.value);
    });

    test('$_delta !== value', () => {
        expect(boxedProxy.$_delta).not.toBe(boxedVal.value);
    });

    test('$_delta == delta', () => {
        expect(boxedProxy.$_delta).toEqual(deltaValue);
    });

    test('delta param not modified', () => {
        expect(deltaValue).toEqual(origDeltaValue);
    });

    test('$_deepDelta == delta', () => {
        expect(boxedProxy.$_deepDelta).toEqual(boxedProxy.$_delta);
    });

    test('$_deepDelta == delta', () => {
        expect(boxedProxy.$_deepDelta).toEqual(deltaValue);
    });

    test('deepDelta param not modified', () => {
        expect(deepDeltaValue).toEqual(origDeepDeltaValue);
    });
});

describe('Boxed Deep Nested deepDelta Mods', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let expectedValue;
    let deltaValue;
    let deepDeltaValue;
    let origDeepDeltaValue;

    beforeAll(() => {
        let vals = createBoxed({
            oldValue: "old",
            oldValue1: {
                fieldParam: 5,
            },
            oldValue2: "aValue",
            oldValue3: {
                fieldParam: 10,
                fieldParam2: "10",
                newValue2: { oldField: "25", },
            },
        });

        const arr = [];
        arr[5] = 15;

        expectedValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
            },
            oldValue2: "aValue",
            oldValue3: {
                fieldParam: 10,
                fieldParam2: 10,
                newValue2: { oldField: "25", field: 25, },
            },
        };

        deltaValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
            },
            // oldValue2: "aValue",
            oldValue3: {
                fieldParam: 10,
                fieldParam2: 10,
                newValue2: { oldField: "25", field: 25, },
            },
        };

        deepDeltaValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                // fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
            },
            // oldValue2: "aValue",
            oldValue3: {
                // fieldParam: 10,
                fieldParam2: 10,
                newValue2: {
                    // oldField: 25,
                    field: 25,
                },
            },
        };

        origDeepDeltaValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                // fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
            },
            // oldValue2: "aValue",
            oldValue3: {
                // fieldParam: 10,
                fieldParam2: 10,
                newValue2: {
                    // oldField: 25,
                    field: 25,
                },
            },
        };

        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        boxedProxy.$_deepDelta = deepDeltaValue;

        if (boxedProxy._$ !== boxedProxy) {
            const tmp = 0;
        }
    });

    test('isBoxedProxy() === boxedProxy', () => {
        expect(isBoxedProxy(boxedProxy)).toBe(boxedVal);
    });

    test('_$ === proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('_$ === boxedInProxy', () => {
        expect(boxedProxy._$).toBe(boxedVal.boxedInProxy);
    });

    test('$_ === boxedOutProxy or value', () => {
        expect(boxedProxy.$_).toBe(isObjectLike(boxedVal.value) ? boxedVal.boxedOutProxy : boxedVal.value);
    });

    test('$_value === value', () => {
        expect(boxedProxy.$_value).toBe(boxedVal.value);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value !== original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value == modified', () => {
        expect(boxedVal.value).toEqual(expectedValue);
    });

    test('$_modified is value', () => {
        expect(boxedProxy.$_modified).toBe(boxedVal.value);
    });

    test('$_delta !== value', () => {
        expect(boxedProxy.$_delta).not.toBe(boxedVal.value);
    });

    test('$_delta == delta', () => {
        expect(boxedProxy.$_delta).toEqual(deltaValue);
    });

    test('$_deepDelta !== delta', () => {
        expect(boxedProxy.$_deepDelta).not.toEqual(boxedProxy.$_delta);
    });

    test('$_deepDelta == deepDelta', () => {
        expect(boxedProxy.$_deepDelta).toEqual(deepDeltaValue);
    });

    test('deepDelta param not modified', () => {
        expect(deepDeltaValue).toEqual(origDeepDeltaValue);
    });
});

