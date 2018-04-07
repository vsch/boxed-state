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
const isNullOrUndefined = boxedImmutable.util.isNullOrUndefined;
const toTypeString = testUtil.toTypeString;

describe('Boxing of simple values', () => {
    const template = {
        invalid: [undefined, null, NaN,],
        falsy: [false, 0, '',],
        number: [-3, -2, -1, 1, 2, 3, 1.5, -1.5],
        string: [' ', 'test', '_$'],
    };

    const params = generateTestParams(template, (t) => `_$(${t.valueText})`);

    each(params)
        .describe('%s', (testDescription, thisTest) => {
            let origVal;
            let boxedVal;
            let boxedProxy;
            let vals;

            beforeEach(() => {
                vals = createBoxed(thisTest.value);
                origVal = vals.origVal;
                boxedVal = vals.boxedVal;
                boxedProxy = vals.boxedProxy;
            });

            test('isProxy()', () => {
                expect(vals.boxedProxy).not.toBe(undefined);
            });

            test('._$ === parent', () => {
                expect(boxedProxy._$).toBe(boxedProxy);
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

            describe('Boxed proxy access', () => {
                const template = {
                    invalid: [undefined, null, NaN,],
                    falsy: [false, 0,],
                    number: [-3, -2, -1, 1, 2, 3, 1.5, -1.5],
                    string: ['$', '_$_', 'field', '_$field', 'field$_', '$_field', 'field$_1', 'field_$_'],
                };

                let nestedParams = generateTestParams(template, (t) => {
                    t.genTitle = (suffix, valueSuffix) => `${thisTest.testDescription}[${t.valueText + (valueSuffix ? ' + ' + valueSuffix : '')}]${suffix || ''}`;
                    return `${t.valueText} param`;
                });

                test('Object.keys(proxy) === Object.keys(original)', () => {
                    expect(Object.keys(boxedProxy)).toEqual(util.isObject(origVal) || util.isFunction(origVal) ? Object.keys(origVal) : []);
                });

                each(nestedParams)
                    .describe(`%s`, (nestedDescription, nestedTest) => {
                        test(`${nestedTest.genTitle('.$_ is ' + (JSON.stringify(paramStringException(thisTest.value, nestedTest.value)) || 'undefined'))}`, () => {
                            let proxyElement = vals.boxedProxy[nestedTest.value];
                            const paramResult = paramStringException(thisTest.value, nestedTest.value);
                            expect(proxyElement.$_).toEqual(isObject(thisTest.value) ? paramResult : undefined);
                        });

                        test(`${nestedTest.genTitle(' isProxy', '')}`, () => {
                            let proxyElement = vals.boxedProxy[nestedTest.value];
                            expect(!!isBoxedProxy(proxyElement)).toBe(true);
                        });

                        test(`${nestedTest.genTitle(' is not parent', '')}`, () => {
                            let proxyElement = vals.boxedProxy[nestedTest.value];
                            expect(proxyElement).not.toBe(boxedProxy);
                        });

                        test(`${nestedTest.genTitle('.$_ is undefined', '')}`, () => {
                            let proxyElement = vals.boxedProxy[nestedTest.value];
                            expect(proxyElement.$_).toBe(undefined);
                        });
                    });
            });
        });
});

