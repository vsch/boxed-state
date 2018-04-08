"use strict";
const each = require('jest-each');
const boxedImmutable = require("boxed-immutable");
const testUtil = require('./testUtil');

const _$ = boxedImmutable._$;
const isProxy = boxedImmutable.boxed.isBoxedProxy;
const generateTestParams = testUtil.generateTestParams;
const paramStringException = testUtil.paramStringException;
const createBoxed = testUtil.createBoxed;
const createOnDemandBoxed = testUtil.createBoxedState;

// TEST: complete this test
// call: .$_default(value)
// call boxed: .$_default(value)
// set: .$_default = value
// set boxed: .$_default = value
describe.skip('.$_default = value', () => {
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
                    string: ['$', '$_', '$__', 'field', '_$field', '$_field', '$_field', '$_field1', '$_field_'],
                };

                let nestedParams = generateTestParams(template, (t) => {
                    t.genTitle = (suffix, valueSuffix) => `${thisTest.testDescription}[${t.valueText + (valueSuffix ? ' + ' + valueSuffix : '')}]${suffix || ''}`;
                    return `${t.valueText} param`;
                });

                each(nestedParams)
                    .describe(`%s`, (nestedDescription, nestedTest) => {
                        test(`${nestedTest.genTitle(' is ' + (JSON.stringify(paramStringException(thisTest.value, nestedTest.value)) || 'undefined'))}`, () => {
                            let proxyElement = vals.boxedProxy[nestedTest.value];
                            const paramResult = paramStringException(thisTest.value, nestedTest.value);
                            expect(proxyElement).toBe(paramResult);
                        });

                        test(`${nestedTest.genTitle(' isProxy', '"_$"')}`, () => {
                            let proxyElement = vals.boxedProxy[nestedTest.value + "_$"];
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

const state = {
    oldString: "oldString",
    oldNumber: 0,
    oldObj: {
        oldProp: "oldProp",
        nestedProp: {
            oldProp: "oldProp",
        },
    },
    oldArr: [1, 2],
};

const expectedShallow = {
    oldString: "oldString",
    oldNumber: 0,
    defString: "defString",
    defNum: -20,
    oldObj: {
        oldProp: "oldProp",
        nestedProp: {
            oldProp: "oldProp",
        },
    },
    oldArr: [1, 2],
};

const expectedLevels2 = {
    oldString: "oldString",
    oldNumber: 0,
    defString: "defString",
    defNum: -20,
    oldObj: {
        oldProp: "oldProp",
        defaultProp: "defaultProp",
        nestedProp: {
            oldProp: "oldProp",
        },
    },
    oldArr: [1, 2],
};

const expectedDeep = {
    oldString: "oldString",
    oldNumber: 0,
    defString: "defString",
    defNum: -20,
    oldObj: {
        oldProp: "oldProp",
        defaultProp: "defaultProp",
        nestedProp: {
            oldProp: "oldProp",
            defProp: "defProp",
        },
    },
    oldArr: [1, 2],
};

const defaults = {
    oldString: "defaultString",
    defString: "defString",
    oldNumber: 10,
    defNum: -20,
    oldObj: {
        oldProp: "defProp",
        defaultProp: "defaultProp",
        nestedProp: {
            oldProp: "defaultProp",
            defProp: "defProp",
        },
    },
    oldArr: [0, 10, 20],
};

each([
    ['deep', 'deep'],
    ['merge', 'merge'],
    ['1000', '1000'],
    ['{levels:"deep"}', { levels: "deep" }],
    ['{levels:"merge"}', { levels: "merge" }],
    ['{levels:"1000"}', { levels: "1000" }],
])
    .describe('Deep with: %s', (text, type) => {
        test(`default_$(${text})`, () => {
            const boxedProxy = _$(state);
            boxedProxy.default_$(type, defaults);
            const result = boxedProxy();
            expect(result).toEqual(expectedDeep);
        });
    });

each([
    ['shallow', 'shallow'],
    ['1', '1'],
    ['{levels:"shallow"}', { levels: "shallow" }],
    ['{levels:"1"}', { levels: "1" }],
])
    .describe('Shallow with: %s', (text, type) => {
        test(`default_$(${text})`, () => {
            const boxedProxy = _$(state);
            boxedProxy.default_$(type, defaults);
            const result = boxedProxy();
            expect(result).toEqual(expectedShallow);
        });
    });

each([
    ['2', '2'],
    ['{levels:"2"}', { levels: "2" }],
])
    .describe('Levels with: %s', (text, type) => {
        test(`default_$(${text})`, () => {
            const boxedProxy = _$(state);
            boxedProxy.default_$(type, defaults);
            const result = boxedProxy();
            expect(result).toEqual(expectedLevels2);
        });
    });

