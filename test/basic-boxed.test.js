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

describe('Boxing of simple values', () => {
    const template = {
        // single: [[]],
        invalid: [undefined, null, NaN,],
        falsy: [false, 0, '',],
        number: [-3, -2, -1, 1, 2, 3, 1.5, -1.5],
        string: [' ', 'test', '_$'],
        array: [[], [1], [1, 2, 3]],
        object: [{}, { 1: '1', prop: 'prop' }, { null: null }, { NaN: NaN },],
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

            test(`.$_if called === ${!!thisTest.value}`, () => {
                let called = false;
                boxedProxy.$_if(value => called = true);
                expect(called).toBe(!!boxedVal.value);
            });

            test(`.$_if(value => {}) called with value == ${thisTest.value}`, () => {
                let calledValue;
                if (boxedVal.value) {
                    boxedProxy.$_if(value => calledValue = value);
                    expect(calledValue).toEqual(boxedVal.value);
                }
            });

            test(`.$_if(value => {}) returns result`, () => {
                const expected = false;
                let result = boxedProxy.$_if(value => expected);
                expect(result === undefined ? 'undefined' : result).toEqual(boxedVal.value ? expected : 'undefined');
            });

            test(`.$_ifDefined called === ${thisTest.value !== undefined}`, () => {
                let called = false;
                boxedProxy.$_ifDefined(value => called = true);
                expect(called).toBe(boxedVal.value !== undefined);
            });

            test(`.$_ifDefined(value => {}) called with value == ${thisTest.value}`, () => {
                let calledValue;
                if (boxedVal.value !== undefined) {
                    boxedProxy.$_ifDefined(value => calledValue = value);
                    expect(calledValue).toEqual(boxedVal.value);
                }
            });

            test(`.$_ifDefined(value => {}) returns result`, () => {
                const expected = false;
                let result = boxedProxy.$_ifDefined(value => expected);
                expect(result === undefined ? 'undefined' : result).toEqual(boxedVal.value !== undefined ? expected : 'undefined');
            });

            test(`.$_ifValid called === ${util.isValid(thisTest.value)}`, () => {
                let called = false;
                boxedProxy.$_ifValid(value => called = true);
                expect(called).toBe(!!util.isValid(boxedVal.value));
            });

            test(`.$_ifValid(value => {}) called with value == ${thisTest.value}`, () => {
                let calledValue;
                if (util.isValid(boxedVal.value)) {
                    boxedProxy.$_ifValid(value => calledValue = value);
                    expect(calledValue).toEqual(boxedVal.value);
                }
            });

            test(`.$_ifValid(value => {}) returns result`, () => {
                const expected = false;
                let result = boxedProxy.$_ifValid(value => expected);
                expect(result === undefined ? 'undefined' : result).toEqual(util.isValid(boxedVal.value) ? expected : 'undefined');
            });

            test(`.$_ifArray called === ${util.isArray(thisTest.value)}`, () => {
                let called = false;
                boxedProxy.$_ifArray(value => called = true);
                expect(called).toBe(!!util.isArray(boxedVal.value));
            });

            test(`.$_ifArray(value => {}) called with value == ${thisTest.value}`, () => {
                let calledValue;
                if (util.isArray(boxedVal.value)) {
                    boxedProxy.$_ifArray(value => calledValue = value);
                    expect(calledValue).toEqual(boxedVal.value);
                }
            });

            test(`.$_ifArray(value => {}) returns result`, () => {
                const expected = false;
                let result = boxedProxy.$_ifArray(value => expected);
                expect(result === undefined ? 'undefined' : result).toEqual(util.isArray(boxedVal.value) ? expected : 'undefined');
            });

            test(`.$_ifObject called === ${util.isObjectLike(thisTest.value)}`, () => {
                let called = false;
                boxedProxy.$_ifObject(value => called = true);
                expect(called).toBe(!!util.isObjectLike(boxedVal.value));
            });

            test(`.$_ifObject(value => {}) called with value == ${thisTest.value}`, () => {
                let calledValue;
                if (util.isObjectLike(boxedVal.value)) {
                    boxedProxy.$_ifObject(value => calledValue = value);
                    expect(calledValue).toEqual(boxedVal.value);
                }
            });

            test(`.$_ifObject(value => {}) returns result`, () => {
                const expected = false;
                let result = boxedProxy.$_ifObject(value => expected);
                expect(result === undefined ? 'undefined' : result).toEqual(util.isObjectLike(boxedVal.value) ? expected : 'undefined');
            });

            test(`.if_$ called === ${!!thisTest.value}`, () => {
                let called = false;
                boxedProxy.if_$(value => called = true);
                expect(called).toBe(!!boxedVal.value);
            });

            test(`.if_$(value => {}) called with boxed value == ${thisTest.value}`, () => {
                let calledValue;
                if (boxedVal.value) {
                    boxedProxy.if_$(value => calledValue = value);
                    expect(!!isBoxedInProxy(calledValue)).toEqual(true);
                    expect(calledValue()).toEqual(boxedVal.value);
                }
            });

            test(`.if_$(value => {}) returns result`, () => {
                const expected = false;
                let result = boxedProxy.if_$(value => expected);
                expect(result === undefined ? 'undefined' : result).toEqual(boxedVal.value ? expected : 'undefined');
            });

            test(`.ifDefined_$ called === ${thisTest.value !== undefined}`, () => {
                let called = false;
                boxedProxy.ifDefined_$(value => called = true);
                expect(called).toBe(boxedVal.value !== undefined);
            });

            test(`.ifDefined_$(value => {}) called with boxed value == ${thisTest.value}`, () => {
                let calledValue;
                if (boxedVal.value !== undefined) {
                    boxedProxy.ifDefined_$(value => calledValue = value);
                    expect(!!isBoxedInProxy(calledValue)).toEqual(true);
                    expect(calledValue()).toEqual(boxedVal.value);
                }
            });

            test(`.ifDefined_$(value => {}) returns result`, () => {
                const expected = false;
                let result = boxedProxy.ifDefined_$(value => expected);
                expect(result === undefined ? 'undefined' : result).toEqual(boxedVal.value !== undefined ? expected : 'undefined');
            });

            test(`.ifValid_$ called === ${util.isValid(thisTest.value)}`, () => {
                let called = false;
                boxedProxy.ifValid_$(value => called = true);
                expect(called).toBe(!!util.isValid(boxedVal.value));
            });

            test(`.ifValid_$(value => {}) called with boxed value == ${thisTest.value}`, () => {
                let calledValue;
                if (util.isValid(boxedVal.value)) {
                    boxedProxy.ifValid_$(value => calledValue = value);
                    expect(!!isBoxedInProxy(calledValue)).toEqual(true);
                    expect(calledValue()).toEqual(boxedVal.value);
                }
            });

            test(`.ifValid_$(value => {}) returns result`, () => {
                const expected = false;
                let result = boxedProxy.ifValid_$(value => expected);
                expect(result === undefined ? 'undefined' : result).toEqual(util.isValid(boxedVal.value) ? expected : 'undefined');
            });

            test(`.ifArray_$ called === ${util.isArray(thisTest.value)}`, () => {
                let called = false;
                boxedProxy.ifArray_$(value => called = true);
                expect(called).toBe(!!util.isArray(boxedVal.value));
            });

            test(`.ifArray_$(value => {}) called with boxed value == ${thisTest.value}`, () => {
                let calledValue;
                if (util.isArray(boxedVal.value)) {
                    boxedProxy.ifArray_$(value => calledValue = value);
                    expect(!!isBoxedInProxy(calledValue)).toEqual(true);
                    expect(calledValue()).toEqual(boxedVal.value);
                }
            });

            test(`.ifArray_$(value => {}) returns result`, () => {
                const expected = false;
                let result = boxedProxy.ifArray_$(value => expected);
                expect(result === undefined ? 'undefined' : result).toEqual(util.isArray(boxedVal.value) ? expected : 'undefined');
            });

            test(`.ifObject_$ called === ${util.isObjectLike(thisTest.value)}`, () => {
                let called = false;
                boxedProxy.ifObject_$(value => called = true);
                expect(called).toBe(!!util.isObjectLike(boxedVal.value));
            });

            test(`.ifObject_$(value => {}) called with boxed value == ${thisTest.value}`, () => {
                let calledValue;
                if (util.isObjectLike(boxedVal.value)) {
                    boxedProxy.ifObject_$(value => calledValue = value);
                    expect(!!isBoxedInProxy(calledValue)).toEqual(true);
                    expect(calledValue()).toEqual(boxedVal.value);
                }
            });

            test(`.ifObject_$(value => {}) returns result`, () => {
                const expected = false;
                let result = boxedProxy.ifObject_$(value => expected);
                expect(result === undefined ? 'undefined' : result).toEqual(util.isObjectLike(boxedVal.value) ? expected : 'undefined');
            });

            describe('Boxed proxy access', () => {
                const template = {
                    invalid: [undefined, null, NaN,],
                    falsy: [false, 0,],
                    number: [-3, -2, -1, 1, 2, 3, 1.5, -1.5],
                    string: ['$', '$__', 'field', '_$field', '$_field', '$_field', '$_field1', '$_field_'],
                };

                let nestedParams = generateTestParams(template, (t) => {
                    t.genTitle = (suffix, valueSuffix) => `${thisTest.testDescription}[${t.valueText + (valueSuffix ? ' + ' + valueSuffix : '')}]${suffix || ''}`;
                    return `${t.valueText} param`;
                });

                test('Object.keys(proxy) === Object.keys(original)', () => {
                    // if (isObjectLike(origVal)) {
                    //     let origKeys = Object.getOwnPropertyDescriptor(origVal,'length');
                    //     let proxyKeys = Object.getOwnPropertyDescriptor(boxedProxy,'length');
                    // }
                    expect(Object.keys(boxedProxy)).toEqual(util.isObjectLike(origVal) || util.isFunction(origVal) ? Object.keys(origVal) : []);
                });

                each(nestedParams)
                    .describe(`%s`, (nestedDescription, nestedTest) => {
                        test(`${nestedTest.genTitle('.$_ is ' + (JSON.stringify(paramStringException(thisTest.value, nestedTest.value)) || 'undefined'))}`, () => {
                            let proxyElement = vals.boxedProxy[nestedTest.value];
                            const paramResult = paramStringException(thisTest.value, nestedTest.value);
                            expect(proxyElement.$_).toEqual(isObjectLike(thisTest.value) ? paramResult : undefined);
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
                            const paramResult = paramStringException(vals.boxedVal.value, nestedTest.value);
                            expect(proxyElement.$_).toBe(paramResult);
                        });
                    });
            });
        });
});

test('Unboxes boxed values on assignment', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let vals;

    vals = createBoxed({ oldProp: 'abc' });
    origVal = vals.origVal;
    boxedVal = vals.boxedVal;
    boxedProxy = vals.boxedProxy;
    boxedProxy.newProp = boxedProxy.oldProp;
    const t = boxedProxy.$_value;
    expect(t).toEqual({ oldProp: 'abc', newProp: 'abc' });
});

test('Assigns string values as strings', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let vals;

    vals = createBoxed({ oldProp: 'abc', newProp: { "en": 'en', ru: 'ru', fr: 'fr', } });
    origVal = vals.origVal;
    boxedVal = vals.boxedVal;
    boxedProxy = vals.boxedProxy;
    boxedProxy.newProp['a'] = 'string';
    const t = boxedProxy.newProp.$_value;
    expect(t).toEqual({ "en": 'en', ru: 'ru', fr: 'fr', a: 'string' });
});

test('Assigns new array to old string value', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let vals;

    vals = createBoxed({ oldProp: 'abc' });
    origVal = vals.origVal;
    boxedVal = vals.boxedVal;
    boxedProxy = vals.boxedProxy;
    boxedProxy.oldProp['a'] = 'string';
    const t = boxedProxy.oldProp.$_value;
    expect(t).toEqual({ a: 'string' });
});

test('Splice boxed-out array', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let vals;

    vals = createBoxed([1, 2, 3, 4, 5, 6]);
    origVal = vals.origVal;
    boxedVal = vals.boxedVal;
    boxedProxy = vals.boxedProxy;

    boxedProxy.$_.splice(2, 2);
    const t = boxedProxy.$_modified;
    expect(t).toEqual([1, 2, 5, 6]);
});

describe('Append to end of non-object creates array', () => {
    each([
        ['undefined', undefined],
        ['null', null],
        ['false', false],
        ['true', true],
        ['5', 5],
        ['"5"', "5"],
        ['[]', []],
    ])
        .describe('%s', (text, value) => {
            test(`_$(${text})._$ = 5 === [5]`, () => {
                let origVal;
                let boxedVal;
                let boxedProxy;
                let vals;

                vals = createBoxed(value);
                origVal = vals.origVal;
                boxedVal = vals.boxedVal;
                boxedProxy = vals.boxedProxy;

                boxedProxy._$ = 5;
                const t = boxedProxy.$_modified;
                expect(t).toEqual([5]);
            });
        });
});

describe('Append to end of object keeps object', () => {
    test(`_$({})._$ = 5 === {0:5}`, () => {
        let origVal;
        let boxedVal;
        let boxedProxy;
        let vals;

        vals = createBoxed({});
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;

        boxedProxy._$ = 5;
        const t = boxedProxy.$_modified;
        expect(t).toEqual({0:5});
    });
});

