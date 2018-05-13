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


const utilStringWrap = require('util-string-wrap');
const endsWith = utilStringWrap.endsWith;

function booleanTransform(value) {
    return !!value;
}

function capitalize(value) {
    return isString(value) ? value.toUpperCase() : value;
}

function toArrayIndexOrDefault(arg) {
    const n = Number.parseFloat(arg);
    return Number.isInteger(n) && +n === n && n >= 0 ? n : undefined;
}

function toNumberOrUndefined(arg) {
    const n = Number.parseFloat(arg);
    // noinspection EqualityComparisonWithCoercionJS
    return n == arg ? n : undefined;
}

function totalTransform(value, prop, oldValue, getProp, setProp) {
    // total all the values
    prop = toArrayIndexOrDefault(prop);
    if (prop !== undefined) {
        const oldTotal = toNumberOrUndefined(getProp('total'));
        const oldIndices = getProp('totaled');
        const indices = oldIndices || [];

        let total = oldTotal || 0;

        let indexOf = -1;
        if (oldTotal !== undefined) {
            indexOf = indices.indexOf(prop);
            if (indexOf !== -1) {
                oldValue = toNumberOrUndefined(oldValue);
                if (oldValue !== undefined) {
                    total -= oldValue;
                }
            }
        }

        const newValue = toNumberOrUndefined(value);
        if (newValue !== undefined) {
            total += newValue;
            if (indexOf === -1) indices.push(prop);
        }

        if (oldTotal !== total) {
            setProp('total', total);
        }
        if (indices !== oldIndices) {
            setProp('totaled', indices);
        }
    }
    return value;
}

function roundTransform(value) {
    return Math.round(value);
}

const getTransforms = {
    capitalized: capitalize,
    boolean: booleanTransform,
    nested: {
        capitalized: capitalize,
        boolean: booleanTransform,
        nested: {
            capitalized: capitalize,
            boolean: booleanTransform,
        },
    },
    booleanArr: {
        '_$': booleanTransform,
    },
    withTotals: {
        '_$': totalTransform,
    },
    withRounded: {
        '_$': roundTransform,
    },
    withRoundedTotals: {
        '_$': [roundTransform, totalTransform],
    },
};

const original = {
    capitalized: 'lowercase',
    boolean: {},
    another: 'someValue',
    nested: {
        capitalized: 5,
        boolean: 0,
        another: 'someValue',
        nested: {
            capitalized: null,
            boolean: NaN,
            another: 'someValue',
        },
    },
    booleanArr: [undefined, null, NaN, 0, true, '0', 'abc', 'def', 10],
    anotherArr: [1, 2, 3, 4],
};

const originalCopy = {
    capitalized: 'lowercase',
    boolean: {},
    another: 'someValue',
    nested: {
        capitalized: 5,
        boolean: 0,
        another: 'someValue',
        nested: {
            capitalized: null,
            boolean: NaN,
            another: 'someValue',
        },
    },
    booleanArr: [undefined, null, NaN, 0, true, '0', 'abc', 'def', 10],
    anotherArr: [1, 2, 3, 4],
};

const applied = {
    capitalized: 'LOWERCASE',
    boolean: true,
    another: 'someValue',
    nested: {
        capitalized: 5,
        boolean: false,
        another: 'someValue',
        nested: {
            capitalized: null,
            boolean: false,
            another: 'someValue',
        },
    },
    booleanArr: [false, false, false, false, true, true, true, true, true],
    anotherArr: [1, 2, 3, 4],
};

function createTransformedBox() {
    return createTransformedBoxed({ getTransforms: getTransforms }, ...arguments);
}

describe('getTransforms applied to props', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let vals;

    let box;

    // beforeAll(() => {
    //     box = boxedImmutable.createBox({ getTransforms: getTransforms });
    // });

    test(`getTransforms applied to value`, () => {
        const vals = createTransformedBox(original);
        const { origVal, boxedVal, boxedProxy } = vals;

        expect(boxedVal.value).toEqual(applied);
    });

    test(`getTransforms original unmodified`, () => {
        const vals = createTransformedBox(original);
        const { origVal, boxedVal, boxedProxy } = vals;
        expect(original).toEqual(originalCopy);
    });

    test(`getTransforms get modified`, () => {
        const vals = createTransformedBox(original);
        const { origVal, boxedVal, boxedProxy } = vals;
        expect(boxedVal.valueOfModified()).toEqual(boxedVal.value);
    });

    test(`getTransforms get delta`, () => {
        const vals = createTransformedBox(original);
        const { origVal, boxedVal, boxedProxy } = vals;
        expect(boxedVal.unboxedDelta()).toEqual({
            "boolean": true,
            "booleanArr": [false, false, false, false, true, true, true, true, true],
            "capitalized": "LOWERCASE",
            "nested": {
                "another": "someValue",
                "boolean": false,
                "capitalized": 5,
                "nested": { "another": "someValue", "boolean": false, "capitalized": null },
            }
        });
    });

    test(`getTransforms get deep delta`, () => {
        const vals = createTransformedBox(original);
        const { origVal, boxedVal, boxedProxy } = vals;
        expect(boxedVal.unboxedDeepDelta()).toEqual({
            "boolean": true,
            "booleanArr": [false, false, false, false, true, true, true, true, true],
            "capitalized": "LOWERCASE",
            "nested": {
                "another": "someValue", "boolean": false, "capitalized": 5,
                "nested": { "another": "someValue", "boolean": false, "capitalized": null }
            },
        });
    });

    test(`with totals`, () => {
        const withTotals = [1, 2, 3, 4];
        const vals = createTransformedBox({ withTotals: withTotals });
        const { origVal, boxedVal, boxedProxy } = vals;

        withTotals.total = withTotals.reduce((prev, value) => (prev || 0) + value);

        // expect(boxedVal.value.withTotals.total).toEqual(withTotals.total);
        expect(testUtil.arrayToObject(boxedVal.valueOf().withTotals, ['totaled'])).toEqual(testUtil.arrayToObject(withTotals));
    });

    test(`with root custom`, () => {
        const withTotals = { showFlag: null, collapseFlag: 0, untouched: '', isLoadingFlag: 1, };
        const expected = { showFlag: false, collapseFlag: false, untouched: '', isLoadingFlag: true, };
        const vals = createTransformedBoxed({
            getTransforms: {
                '_$': function (value, prop, oldValue, getProp, setProp) {
                    if (endsWith(prop, 'Flag')) {
                        return !!value;
                    }
                    return value;
                }
            }
        }, withTotals);
        const { origVal, boxedVal, boxedProxy } = vals;

        // expect(boxedVal.value.withTotals.total).toEqual(withTotals.total);
        expect(boxedVal.valueOf()).toEqual(expected);
    });

    test(`with rounded mods`, () => {
        let withTotals = [1.5, 2.5, 3.5, 4.5];
        const vals = createTransformedBox({ withRounded: withTotals });
        const { origVal, boxedVal, boxedProxy } = vals;

        withTotals = withTotals.map(roundTransform);
        // withTotals.total = withTotals.reduce((prev, value, index) => (prev || 0) + value);

        // expect(boxedVal.value.withTotals.total).toEqual(withTotals.total);
        expect(testUtil.arrayToObject(boxedVal.valueOf().withRounded, ['totaled'])).toEqual(testUtil.arrayToObject(withTotals));
    });

    test(`with object totals`, () => {
        const withTotals = [1, 2, 3, 4];
        const vals = createTransformedBox({ withTotals: withTotals });
        const { origVal, boxedVal, boxedProxy } = vals;

        withTotals.total = withTotals.reduce((prev, value) => (prev || 0) + value);

        // expect(boxedVal.value.withTotals.total).toEqual(withTotals.total);
        expect(testUtil.arrayToObject(boxedVal.valueOf().withTotals, ['totaled'])).toEqual(testUtil.arrayToObject(withTotals));
    });

    test(`with object rounded mods`, () => {
        let withTotals = [1.5, 2.5, 3.5, 4.5];
        const vals = createTransformedBox({ withRounded: withTotals });
        const { origVal, boxedVal, boxedProxy } = vals;
        withTotals = withTotals.map(roundTransform);

        // withTotals.total = withTotals.reduce((prev, value, index) => (prev || 0) + value);

        // expect(boxedVal.value.withTotals.total).toEqual(withTotals.total);
        expect(testUtil.arrayToObject(boxedVal.valueOf().withRounded, ['totaled'])).toEqual(testUtil.arrayToObject(withTotals));
    });

    test(`with object rounded totals mods`, () => {
        let withTotals = [1.5, 2.5, 3.5, 4.5];
        const vals = createTransformedBox({ withRoundedTotals: withTotals });
        const { origVal, boxedVal, boxedProxy } = vals;

        withTotals = withTotals.map(roundTransform);
        withTotals.total = withTotals.reduce((prev, value, index) => (prev || 0) + value);

        // expect(boxedVal.value.withTotals.total).toEqual(withTotals.total);
        expect(testUtil.arrayToObject(boxedVal.valueOf().withRoundedTotals, ['totaled'])).toEqual(testUtil.arrayToObject(withTotals));
    });
});

