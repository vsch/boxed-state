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
const createOnDemandBoxed = testUtil.createBoxedState;
const toTypeString = testUtil.toTypeString;

each([
    [undefined, 'undefined'],
    [null, 'null'],
    [NaN, 'NaN'],
    ["test", '"test"'],
    [true, 'true'],
    [false, 'false'],
    [0, '0'],
    [5, '5'],
])
    .describe('testUtil.toTypeString', (value, valueText) => {
        test(`toTypeString(${valueText}) === ${valueText}`, () => {
            expect(toTypeString(value)).toBe(valueText);
        });

        test('isBoxedProxy(null) === false', () => {
            expect(!!isBoxedProxy(null)).toBe(false);
        });
    });

each([
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

        test(`isBoxedOutProxy(${'_$('}${toTypeString(value)}).$_) === ${toTypeString(isObject(value))}`, () => {
            const target = _$(value);
            const proxy = target.$_;
            const box = isBoxedOutProxy(proxy);
            expect(!!box).toBe(!!isObject(value));
        });
    });

test(`keys .$_`, () => {
    const target = _$({});
    const boxedIn = target.$_;
    const keys = Object.keys(boxedIn);
    expect(keys).toEqual([]);
});

