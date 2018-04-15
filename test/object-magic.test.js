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
        ['undefined',undefined,{}],
        ['null',null,{}],
        ['""',"",{}],
        ['0',0,{}],
        ['5',5,{}],
        ['[10,20,30]',[10,20,30],{0:10,1:20,2:30}],
        ['{0:10,1:20,2:30,arg:"abc"}',{0:10,1:20,2:30,arg:'abc'},{0:10,1:20,2:30,arg:'abc'}],
    ])
        .describe("_$(%s).$_object", (text,value,expected) => {

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

