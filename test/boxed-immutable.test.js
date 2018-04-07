"use strict";
const each = require('jest-each');
const boxedImmutable = require("boxed-immutable");
const testUtil = require('./testUtil');
const util = boxedImmutable.util;
const _$ = boxedImmutable._$;

const isObject = util.isObject;
const isBoxedProxy = boxedImmutable.boxed.isBoxedProxy;
const isBoxedInProxy = boxedImmutable.boxed.isBoxedInProxy;
const isBoxedOutProxy = boxedImmutable.boxed.isBoxedOutProxy;
const generateTestParams = testUtil.generateTestParams;
const paramStringException = testUtil.paramStringException;
const createBoxed = testUtil.createBoxed;
const createOnDemandBoxed = testUtil.createOnDemandBoxed;
const toTypeString = testUtil.toTypeString;

each([
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
            const boxedOut$_ = boxedProxy.$_;
            expect(boxedOut$_).toBe(isObject(boxedVal.value) ? boxedVal.boxedOutProxy : boxedVal.value);
        });

        test('value$_ === value', () => {
            expect(boxedProxy.value$_).toBe(boxedVal.value);
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

        test('modified$_ is undefined', () => {
            expect(boxedProxy.modified$_).toBe(undefined);
        });

        test('delta$_ is undefined', () => {
            expect(boxedProxy.delta$_).toBe(undefined);
        });

        test('deepDelta$_ is undefined', () => {
            expect(boxedProxy.deepDelta$_).toBe(undefined);
        });
    });

each([
    ['1. undefined', undefined, { newProp: 5 }],
    ['2. null', null, { newProp: 5 }],
    ['3. {}', {}, { newProp: 5 }],
    ['4. []', [], { newProp: 5 }],
    ['5. { oldValue: "old" }', { oldValue: "old" }, { newProp: 5 }],
    ['6. []', [], { "": [5] }],
    ['7. []', [], { "_$": [5] }],
    ['8. []', [], { "._$": [5] }],
    ['9. []', [], { _$: [5] }],
    ['10. [5]', [], { "": [5] }],
    ['11. [5]', [], { "_$": [5] }],
    ['12. [5]', [], { "._$": [5] }],
    ['13. [5]', [], { _$: [5] }],
    ['14. [5]', [], { 0: 5 }],
    ['15. [10]', [], { 0: 5 }],
    ['16. [10]', [], { 0: 5, _$: [20], }],
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
            expected = util.isObject(origVal) && util.isArray(origVal) ? util.copyArrayObject(origVal) : Object.assign({}, origVal);
            delta = util.isObject(origVal) && util.isArray(origVal) ? [] : {};

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

                            if (util.isArray(expected)) {
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
            const boxedOut$_ = boxedProxy.$_;
            expect(boxedOut$_).toBe(isObject(boxedVal.value) ? boxedVal.boxedOutProxy : boxedVal.value);
        });

        test('value$_ === value', () => {
            expect(boxedProxy.value$_).toBe(boxedVal.value);
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

        test('modified$_ === value', () => {
            expect(boxedProxy.modified$_).toBe(boxedVal.value);
        });

        test('delta$_ == delta', () => {
            expect(boxedProxy.delta$_).toEqual(delta);
        });

        test('deepDelta$_ == delta', () => {
            expect(boxedProxy.deepDelta$_).toEqual(delta);
        });
    });

// these assign via .$_
each([
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
            expected = util.isObject(origVal) && util.isArray(origVal) ? util.copyArrayObject(origVal) : Object.assign({}, origVal);
            delta = util.isObject(origVal) && util.isArray(origVal) ? [] : {};

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
            expect(boxedProxy.$_).toBe(isObject(boxedVal.value) ? boxedVal.boxedOutProxy : boxedVal.value);
        });

        test('value$_ === value', () => {
            expect(boxedProxy.value$_).toBe(boxedVal.value);
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

        test('modified$_ === value', () => {
            expect(boxedProxy.modified$_).toBe(boxedVal.value);
        });

        test('delta$_ == delta', () => {
            expect(boxedProxy.delta$_).toEqual(delta);
        });

        test('deepDelta$_ == delta', () => {
            expect(boxedProxy.deepDelta$_).toEqual(delta);
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
        expect(boxedProxy.$_).toBe(isObject(boxedVal.value) ? boxedVal.boxedOutProxy : boxedVal.value);
    });

    test('value$_ === value', () => {
        expect(boxedProxy.value$_).toBe(boxedVal.value);
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

    test('modified$_ === value', () => {
        expect(boxedProxy.modified$_).toBe(boxedVal.value);
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
        expect(boxedProxy.$_).toBe(isObject(boxedVal.value) ? boxedVal.boxedOutProxy : boxedVal.value);
    });

    test('value$_ === value', () => {
        expect(boxedProxy.value$_).toBe(boxedVal.value);
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

    test('modified$_ is value', () => {
        expect(boxedProxy.modified$_).toBe(boxedVal.value);
    });

    test('delta$_ !== value', () => {
        expect(boxedProxy.delta$_).not.toBe(boxedVal.value);
    });

    test('delta$_ != value', () => {
        expect(boxedProxy.delta$_).not.toEqual(boxedVal.value);
    });

    test('delta$_ == delta of mods', () => {
        let value = [];
        value["newProp"] = 5;
        expect(boxedProxy.delta$_).toEqual(value);
    });

    test('deepDelta$_ !== value', () => {
        expect(boxedProxy.delta$_).not.toBe(boxedVal.value);
    });

    test('deepDelta$_ != value', () => {
        expect(boxedProxy.deepDelta$_).not.toEqual(boxedVal.value);
    });

    test('deepDelta$_ == delta of mods', () => {
        let value = [];
        value["newProp"] = 5;
        expect(boxedProxy.deepDelta$_).toEqual(value);
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
        expect(boxedProxy.$_).toBe(isObject(boxedVal.value) ? boxedVal.boxedOutProxy : boxedVal.value);
    });

    test('value$_ === value', () => {
        expect(boxedProxy.value$_).toBe(boxedVal.value);
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

    test('modified$_ is value', () => {
        expect(boxedProxy.modified$_).toBe(boxedVal.value);
    });

    test('delta$_ !== value', () => {
        expect(boxedProxy.delta$_).not.toBe(boxedVal.value);
    });

    test('delta$_ == delta', () => {
        expect(boxedProxy.delta$_).toEqual(deltaValue);
    });

    test('deepDelta$_ !== delta', () => {
        expect(boxedProxy.deepDelta$_).not.toEqual(boxedProxy.delta$_);
    });

    test('deepDelta$_ == deepDelta', () => {
        expect(boxedProxy.deepDelta$_).toEqual(deepDeltaValue);
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
        boxedProxy.delta$_ = deltaValue;

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
        expect(boxedProxy.$_).toBe(isObject(boxedVal.value) ? boxedVal.boxedOutProxy : boxedVal.value);
    });

    test('value$_ === value', () => {
        expect(boxedProxy.value$_).toBe(boxedVal.value);
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

    test('modified$_ is value', () => {
        expect(boxedProxy.modified$_).toBe(boxedVal.value);
    });

    test('delta$_ !== value', () => {
        expect(boxedProxy.delta$_).not.toBe(boxedVal.value);
    });

    test('delta$_ == delta', () => {
        expect(boxedProxy.delta$_).toEqual(deltaValue);
    });

    test('delta param not modified', () => {
        expect(deltaValue).toEqual(origDeltaValue);
    });

    test('deepDelta$_ == delta', () => {
        expect(boxedProxy.deepDelta$_).toEqual(boxedProxy.delta$_);
    });

    test('deepDelta$_ == delta', () => {
        expect(boxedProxy.deepDelta$_).toEqual(deltaValue);
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
        boxedProxy.deepDelta$_ = deepDeltaValue;

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
        expect(boxedProxy.$_).toBe(isObject(boxedVal.value) ? boxedVal.boxedOutProxy : boxedVal.value);
    });

    test('value$_ === value', () => {
        expect(boxedProxy.value$_).toBe(boxedVal.value);
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

    test('modified$_ is value', () => {
        expect(boxedProxy.modified$_).toBe(boxedVal.value);
    });

    test('delta$_ !== value', () => {
        expect(boxedProxy.delta$_).not.toBe(boxedVal.value);
    });

    test('delta$_ == delta', () => {
        expect(boxedProxy.delta$_).toEqual(deltaValue);
    });

    test('deepDelta$_ !== delta', () => {
        expect(boxedProxy.deepDelta$_).not.toEqual(boxedProxy.delta$_);
    });

    test('deepDelta$_ == deepDelta', () => {
        expect(boxedProxy.deepDelta$_).toEqual(deepDeltaValue);
    });

    test('deepDelta param not modified', () => {
        expect(deepDeltaValue).toEqual(origDeepDeltaValue);
    });
});

