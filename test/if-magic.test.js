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


test(`_$(['a','b','c']).$_ifValid(value => value.join(', ')) returns "a, b, c"`, () => {
    let result = _$(['a','b','c']).$_ifValid(value => value.join(', '));
    expect(result).toEqual("a, b, c");
});


test(`_$(['a','b','c']).$_ifValid(Array.prototype.join(', ')) returns "a, b, c"`, () => {
    let result = _$(['a','b','c']).$_ifValid(Array.prototype.join, ', ');
    expect(result).toEqual("a, b, c");
});

test(`_$(['a','b','c']).$_ifValid(Array.prototype.join(', ')) returns "a, b, c"`, () => {
    let result = _$(['a','b','c']).$_ifValid(Array.prototype.join, undefined);
    expect(result).toEqual("a,b,c");
});

// TEST: complete this test
describe.skip('.$_forEachKey(value)', () => {
    test('',()=>{
        
    });
});

describe.skip('.forEachKey_$(value)', () => {
    test('',()=>{

    });
});

