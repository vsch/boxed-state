"use strict";

const jestEach = require('jest-each');
const boxedImmutable = require("boxed-immutable");
const utilTypeFuncs = require('util-type-funcs');
const objEachBreak = require('obj-each-break');
const testUtil = require('./testUtil');
const boxOut = require('boxed-out');
const boxState = require('../index');

const box = boxedImmutable.box;
const _$ = box;
const $_ = boxOut;

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

const isBoxedProxy = boxedImmutable.isBoxedProxy;
const isBoxedInProxy = boxedImmutable.isBoxedInProxy;
const isBoxedOutProxy = boxedImmutable.isBoxedOutProxy;
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
    [undefined, 'undefined'],
    [null, 'null'],
    [NaN, 'NaN'],
    ["test", '"test"'],
    [true, 'true'],
    [false, 'false'],
    [0, '0'],
    [5, '5'],
])
    .describe('util.toTypeString', (value, valueText) => {
        test(`toTypeString(${valueText}) === ${valueText}`, () => {
            expect(toTypeString(value)).toBe(valueText);
        });

        test('isBoxedProxy(null) === false', () => {
            expect(!!isBoxedProxy(null)).toBe(false);
        });
    });

jestEach([
    [undefined, false],
    [null, false],
    [NaN, false],
    ["test", false],
    [true, false],
    [false, false],
    [0, false],
    [5, false],
    [[], false],
    [{}, false],
])
    .describe('isBoxedProxy', (value, expected) => {
        test(`isProxy(${toTypeString(value)}) === ${toTypeString(expected)}`, () => {
            expect(!!isBoxedProxy(value) || false).toBe(expected);
        });

        test(`isBoxedProxy(${'_$('}${toTypeString(value)})) === ${toTypeString(true)}`, () => {
            const target = _$(value);
            const box = isBoxedProxy(target);
            expect(!!box).toBe(true);
        });

        test(`isBoxedInProxy(${'_$('}${toTypeString(value)})) === ${toTypeString(true)}`, () => {
            const target = _$(value);
            const box = isBoxedInProxy(target);
            expect(!!box).toBe(true);
        });

        test(`isBoxedOutProxy(${'_$('}${toTypeString(value)})) === ${toTypeString(false)}`, () => {
            const target = _$(value);
            const box = isBoxedOutProxy(target);
            expect(!!box).toBe(false);
        });

        test(`isBoxedOutProxy(${'_$('}${toTypeString(value)}).$_) === ${toTypeString(isObjectLike(value))}`, () => {
            const target = _$(value);
            const proxy = target.$_;
            const box = isBoxedOutProxy(proxy);
            expect(!!box).toBe(!!isObjectLike(value));
        });
    });

test(`keys .$_`, () => {
    const target = _$({});
    const boxedIn = target.$_;
    const keys = Object.keys(boxedIn);
    expect(keys).toEqual([]);
});

