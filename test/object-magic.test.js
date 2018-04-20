"use strict";

const each = require('jest-each');
const boxedImmutable = require("boxed-immutable");
const testUtil = require('./testUtil');
const util = boxedImmutable.util;
const _$ = boxedImmutable._$;

const isObjectLike = util.isObjectLike;
const isBoxedProxy = boxedImmutable.boxed.isBoxedProxy;
const isBoxedInProxy = boxedImmutable.boxed.isBoxedInProxy;
const isBoxedOutProxy = boxedImmutable.boxed.isBoxedOutProxy;
const generateTestParams = testUtil.generateTestParams;
const paramStringException = testUtil.paramStringException;
const createBoxed = testUtil.createBoxed;
const createOnDemandBoxed = testUtil.createBoxedState;
const isNullOrUndefined = boxedImmutable.util.isNullOrUndefined;
const toTypeString = testUtil.toTypeString;

describe('$_object tests', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let vals;

    each([
        // ['undefined', undefined, {}],
        // ['null', null, {}],
        // ['""', "", {}],
        // ['0', 0, {}],
        // ['5', 5, {}],
        ['[10,20,30]', [10, 20, 30], { 0: 10, 1: 20, 2: 30 }],
        // ['{0:10,1:20,2:30,arg:"abc"}', { 0: 10, 1: 20, 2: 30, arg: 'abc' }, { 0: 10, 1: 20, 2: 30, arg: 'abc' }],
    ])
        .describe("_$(%s).$_object", (text, value, expected) => {

            beforeEach(() => {
                vals = createBoxed(value);
                origVal = vals.origVal;
                boxedVal = vals.boxedVal;
                boxedProxy = vals.boxedProxy;
            });

            test(`_$(${text}).$_object isBoxedInProxy`, () => {
                let pathVal = boxedProxy.$_object;
                expect(!!isBoxedOutProxy(pathVal)).toBe(true);
            });

            test(`_$(${text}).$_object === ${JSON.stringify(expected)}`, () => {
                let pathVal = boxedProxy.$_object;
                expect(pathVal).toEqual(expected);
            });
        });
});

test('boxOut().filteredProps() returns object with filtered properties', () => {
    const origVal = {
        0: '0',
        1: '1',
        normal: "normal",
        filteredOut: "filteredOut",
    };

    const expectedVal = {
        0: '0',
        normal: "normal",
    };

    const boxedOut = util.boxOut(origVal);
    const result = boxedOut.filteredProps((key, value) => key !== 'filteredOut' && key !== '1');
    expect(result).toEqual(expectedVal);

});

test('boxOut().filter() returns object with filtered properties', () => {
    const origVal = {
        0: '0',
        1: '1',
        normal: "normal",
        filteredOut: "filteredOut",
    };

    const expectedVal = [
        '0',
        "normal",
    ];

    const boxedOut = util.boxOut(origVal);
    const result = boxedOut.filter((key, value) => key !== 'filteredOut' && key !== '1');
    expect(result).toEqual(expectedVal);

});

test('boxOut().mappedProps() returns object with mapped properties', () => {
    const origVal = {
        0: '0',
        1: '1',
        normal: "normal",
        filteredOut: "filteredOut",
    };

    const expectedVal = {
        0: 2,
        1: 3,
        normal: "normal",
        filteredOut: "filteredOut",
    };

    const boxedOut = util.boxOut(origVal);
    const result = boxedOut.mappedProps((key, value) => util.isArrayIndex(key) && util.isNumeric(value) ? util.toNumber(value) + 2 : value);
    expect(result).toEqual(expectedVal);
});

test('boxOut().map() returns array with mapped property values', () => {
    const origVal = {
        0: '0',
        1: '1',
        zzlast: "zzlast",
        normal: "normal",
        filteredOut: "filteredOut",
        first: "first",
    };

    const expectedVal = [
        2,
        3,
        "first",
        "normal",
        "zzlast",
    ];

    const boxedOut = util.boxOut(origVal);
    const result = boxedOut.map((key, value) => util.isArrayIndex(key) && util.isNumeric(value) ? util.toNumber(value) + 2 : key !== 'filteredOut' ? value : undefined);
    expect(result).toEqual(expectedVal);
});
