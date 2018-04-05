"use strict";
const each = require('jest-each');
const boxedImmutable = require("boxed-immutable");
const testUtil = require('./testUtil');

const _$ = boxedImmutable._$;
const isProxy = boxedImmutable.boxed.isBoxedProxy;
const generateTestParams = testUtil.generateTestParams;
const paramStringException = testUtil.paramStringException;
const createBoxed = testUtil.createBoxed;
const createOnDemandBoxed = testUtil.createOnDemandBoxed;

describe('.boolean$(value)', () => {
    const template = {
        invalid: [undefined, null, NaN,],
        falsy: [false, 0, '',],
        number: [-3, -2, -1, 1, 2, 3, 1.5, -1.5],
        string: [' ', 'test', '_$'],
    };

    const params = generateTestParams(template, (t) => `${t.valueText}`);

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

            test(`_$(${thisTest.valueText}).boolean$ === ${!!thisTest.value}`, () => {
                expect(boxedProxy.boolean$).toBe(!!thisTest.value);
            });
            test(`_$(${thisTest.valueText}).boolean$_$ === ${!!thisTest.value}`, () => {
                expect(boxedProxy.boolean$_$).toBe(!!thisTest.value);
            });
            test(`_$().boolean$ = ${thisTest.valueText} === ${!!thisTest.value}`, () => {
                boxedProxy.boolean$ = thisTest.value;
                expect(boxedProxy.unboxed$).toBe(!!thisTest.value);
            });
            test(`_$().boolean$_$ = ${thisTest.valueText} === ${!!thisTest.value}`, () => {
                boxedProxy.boolean$_$ = thisTest.value;
                expect(boxedVal.value).toBe(!!thisTest.value);
            });
        });

});

