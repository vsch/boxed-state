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

describe('$_object tests', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let vals;

    jestEach([
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

    const boxedOut = boxOut(origVal);
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

    const boxedOut = boxOut(origVal);
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

    const boxedOut = boxOut(origVal);
    const result = boxedOut.mappedProps((key, value) => isArrayIndex(key) && isNumeric(value) ? toNumber(value) + 2 : value);
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

    const boxedOut = boxOut(origVal);
    const result = boxedOut.map((key, value) => isArrayIndex(key) && isNumeric(value) ? toNumber(value) + 2 : key !== 'filteredOut' ? value : undefined);
    expect(result).toEqual(expectedVal);
});
