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
const isNullOrUndefined = boxedImmutable.util.isNullOrUndefined;
const toTypeString = testUtil.toTypeString;

describe('Boxed in Proxy as function: .$_()', () => {
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

            test(`() === ${thisTest.value}`, () => {
                expect(vals.boxedProxy()).toBe(boxedVal.value);
            });

            test(`._$() === ${thisTest.value}`, () => {
                expect(vals.boxedProxy._$()).toBe(boxedVal.value);
            });

            test('._$(_$ => { _$ === proxy; }', () => {
                let innerProxy;
                boxedProxy._$(_$ => innerProxy = _$);
                expect(innerProxy).toBe(boxedProxy);
            });

            describe('set value', () => {
                const template = {
                    invalid: [null, NaN,],
                    falsy: [false, 0,],
                    number: [-3, -2, -1, 1, 2, 3, 1.5, -1.5],
                    string: ['$', '$__', 'field', '_$field', '$_field', '$_field', '$_field1', '$_field_'],
                    array: [[], [1, 2, 3]],
                    object: [{}, { a: "a", b: "b", }],
                };

                let nestedParams = generateTestParams(template, (t) => {
                    t.genTitle = (suffix, valueSuffix) => `${thisTest.testDescription}[${t.valueText + (valueSuffix ? ' + ' + valueSuffix : '')}]${suffix || ''}`;
                    return `${t.valueText} param`;
                });

                each(nestedParams)
                    .describe(`%s`, (nestedDescription, nestedTest) => {
                        test(`_$(${thisTest.valueText})._$(${nestedTest.valueText})() === ${nestedTest.valueText}`, () => {
                            expect(boxedProxy._$(nestedTest.value)()).toBe(nestedTest.value);
                        });
                        test(`_$(${thisTest.valueText})._$(_$ => ${nestedTest.valueText}) === ${nestedTest.valueText}`, () => {
                            let retVal = boxedProxy._$(_$ => nestedTest.value);
                            expect(retVal).toBe(nestedTest.value);
                        });
                    });
            });
        });
});

