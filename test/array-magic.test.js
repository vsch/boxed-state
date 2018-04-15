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

describe('$_array tests', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let vals;

    each([
        ['undefined',undefined,[]],
        ['null',null,[]],
        ['""',"",[""]],
        ['0',0,[0]],
        ['5',5,[5]],
        ['[1,2,3]',[1,2,3],[1,2,3]],
    ])
        .describe("_$(%s).$_array", (text,value,expected) => {

            beforeEach(() => {
                vals = createBoxed(value);
                origVal = vals.origVal;
                boxedVal = vals.boxedVal;
                boxedProxy = vals.boxedProxy;
            });

            test(`_$(${text}).$_array isBoxedInProxy`, () => {
                let pathVal = boxedProxy.$_array;
                expect(!!isBoxedOutProxy(pathVal)).toBe(true);
            });

            test(`_$(${text}).$_array === ${JSON.stringify(value)}`, () => {
                let pathVal = boxedProxy.$_array;
                expect(pathVal).toEqual(expected);
            });

            test(`_$(${text}).$_array.join(',') === ${expected.join(',')}`, () => {
                let pathVal = boxedProxy.$_array;
                expect(pathVal.join(',')).toEqual(expected.join(','));
            });
        });
});

