"use strict";

const each = require('jest-each');
const boxedImmutable = require("boxed-immutable");
const util = boxedImmutable.util;
const testUtil = require('./testUtil');

const _$ = boxedImmutable._$;
const isProxy = boxedImmutable.boxed.isBoxedProxy;
const generateTestParams = testUtil.generateTestParams;
const paramStringException = testUtil.paramStringException;
const createBoxed = testUtil.createBoxed;
const createOnDemandBoxed = testUtil.createOnDemandBoxed;
const isNullOrUndefined = boxedImmutable.util.isNullOrUndefined;

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
                        test(`${nestedTest.genTitle(' is ' + (JSON.stringify(paramStringException(thisTest.value, nestedTest.value)) || 'undefined'))}`, () => {
                            let proxyElement = vals.boxedProxy[nestedTest.value];
                            const paramResult = paramStringException(thisTest.value, nestedTest.value);
                            expect(proxyElement.$_).toBe(paramResult);
                        });

                        test(`${nestedTest.genTitle(' isProxy', '"_$"')}`, () => {
                            let proxyElement = vals.boxedProxy[nestedTest.value];
                            expect(isProxy(proxyElement)).toBe(true);
                        });

                        test(`${nestedTest.genTitle(' is not parent', '"_$"')}`, () => {
                            let proxyElement = vals.boxedProxy[nestedTest.value + "_$"];
                            expect(proxyElement).not.toBe(boxedProxy);
                        });

                        test(`${nestedTest.genTitle('.$_ is undefined', '"_$"')}`, () => {
                            let proxyElement = vals.boxedProxy[nestedTest.value + "_$"];
                            expect(proxyElement.$_).toBe(undefined);
                        });
                    });
            });
        });

});

