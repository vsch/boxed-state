"use strict";

const jestEach = require('jest-each');
const boxedImmutable = require("boxed-immutable");
const utilTypeFuncs = require('util-type-funcs');
const objEachBreak = require('obj-each-break');
const testUtil = require('./testUtil');
const _$ = boxedImmutable._$;
const boxOut = boxedImmutable.boxOut;
const $_ = boxedImmutable.boxOut;
const boxState = boxedImmutable.boxState;

const isObjectLike = utilTypeFuncs.isObjectLike;
const isNullOrUndefined = utilTypeFuncs.isNullOrUndefined;
const isArray = utilTypeFuncs.isArray;
const toArrayIndex = utilTypeFuncs.toArrayIndex;
const isArrayIndex = utilTypeFuncs.isArrayIndex;
const isValid = utilTypeFuncs.isValid;
const isFunction = utilTypeFuncs.isFunction;
const isString = utilTypeFuncs.isString;
const isNumeric = utilTypeFuncs.isNumeric;
const toNumber = utilTypeFuncs.toNumber;

const BREAK = objEachBreak.BREAK;
const cloneArrayObject = objEachBreak.cloneArrayObject;
const hasOwnProperties = objEachBreak.hasOwnProperties;

const isBoxedProxy = boxedImmutable.boxed.isBoxedProxy;
const isBoxedInProxy = boxedImmutable.boxed.isBoxedInProxy;
const isBoxedOutProxy = boxedImmutable.boxed.isBoxedOutProxy;
const createTransformedBoxed = testUtil.createTransformedBoxed;
const generateTestParams = testUtil.generateTestParams;
const paramStringException = testUtil.paramStringException;
const createBoxed = testUtil.createBoxed;
const createOnDemandBoxed = testUtil.createBoxedState;
const toTypeString = testUtil.toTypeString;
const stringify = testUtil.stringify;
const createBoxedState = testUtil.createBoxedState;
const array = testUtil.array;
const object = testUtil.object;

class UnBoxable {
    constructor(value) {
        this.value = value;
    }
}

// non-pure Array or Object are now not boxed by default
// const customBox = boxedImmutable.createBox({
//     canBox(value) {
//         return !(value instanceof UnBoxable);
//     }
// });
const customBox = boxedImmutable.box;

describe("unboxable", () => {
    let boxedValue_$;
    let unboxable1;
    let unboxable2;
    let unboxable3;
    let boxable1;

    beforeEach(()=>{
        unboxable1 = new UnBoxable({ name: "unboxable1", prop1: 1, prop2: "prop2", });
        unboxable2 = new UnBoxable({ name: "unboxable2", prop1: 10, prop2: "prop20", });
        unboxable3 = new UnBoxable({ name: "unboxable3", prop1: 100, prop2: "prop200", });
        boxable1 = { name: "boxable1", prop1: 11, prop2: "prop22", };
        boxedValue_$ = customBox({
            prop: "prop",
            values: [
                unboxable1, unboxable2, boxable1,
            ],
        });
    });

    test(`unboxable values built`, () => {
        expect(boxedValue_$.$_value).toEqual({"prop": "prop", "values": [{"value": {"name": "unboxable1", "prop1": 1, "prop2": "prop2"}}, {"value": {"name": "unboxable2", "prop1": 10, "prop2": "prop20"}}, {"name": "boxable1", "prop1": 11, "prop2": "prop22"}]});
    });

    test(`unboxable breaks propagation of modified`, () => {
        boxedValue_$.values[0].value.prop1 = 2;
        expect(boxedValue_$.$_value).toEqual({"prop": "prop", "values": [{"value": {"name": "unboxable1", "prop1": 2, "prop2": "prop2"}}, {"value": {"name": "unboxable2", "prop1": 10, "prop2": "prop20"}}, {"name": "boxable1", "prop1": 11, "prop2": "prop22"}]});

        expect(boxedValue_$.$_modified).toEqual(undefined);
    });

    test(`unboxable is a real reference not copy`, () => {
        boxedValue_$.values._$ = unboxable1;
        boxedValue_$.values[3].value.prop1 = 2;

        expect(boxedValue_$.$_value).toEqual({"prop": "prop", "values": [{"value": {"name": "unboxable1", "prop1": 2, "prop2": "prop2"}}, {"value": {"name": "unboxable2", "prop1": 10, "prop2": "prop20"}}, {"name": "boxable1", "prop1": 11, "prop2": "prop22"}, {"value": {"name": "unboxable1", "prop1": 2, "prop2": "prop2"}}]});

        expect(boxedValue_$.$_modified).toEqual({"prop": "prop", "values": [{"value": {"name": "unboxable1", "prop1": 2, "prop2": "prop2"}}, {"value": {"name": "unboxable2", "prop1": 10, "prop2": "prop20"}}, {"name": "boxable1", "prop1": 11, "prop2": "prop22"}, {"value": {"name": "unboxable1", "prop1": 2, "prop2": "prop2"}}]});
        expect(boxedValue_$.$_delta).toEqual({"values": [{"value": {"name": "unboxable1", "prop1": 2, "prop2": "prop2"}}, {"value": {"name": "unboxable2", "prop1": 10, "prop2": "prop20"}}, {"name": "boxable1", "prop1": 11, "prop2": "prop22"}, {"value": {"name": "unboxable1", "prop1": 2, "prop2": "prop2"}}]});
        expect(boxedValue_$.$_deepDelta).toEqual({"values": [undefined, undefined, undefined, {"value": {"name": "unboxable1", "prop1": 2, "prop2": "prop2"}}]});
    });

    test(`unboxable does not affect boxable propagation of modified`, () => {
        boxedValue_$.values[2].prop1 = 22;
        expect(boxedValue_$.$_value).toEqual({"prop": "prop", "values": [{"value": {"name": "unboxable1", "prop1": 1, "prop2": "prop2"}}, {"value": {"name": "unboxable2", "prop1": 10, "prop2": "prop20"}}, {"name": "boxable1", "prop1": 22, "prop2": "prop22"}]});

        expect(boxedValue_$.$_modified).toEqual({"prop": "prop", "values": [{"value": {"name": "unboxable1", "prop1": 1, "prop2": "prop2"}}, {"value": {"name": "unboxable2", "prop1": 10, "prop2": "prop20"}}, {"name": "boxable1", "prop1": 22, "prop2": "prop22"}]});
        expect(boxedValue_$.$_delta).toEqual({"values": [{"value": {"name": "unboxable1", "prop1": 1, "prop2": "prop2"}}, {"value": {"name": "unboxable2", "prop1": 10, "prop2": "prop20"}}, {"name": "boxable1", "prop1": 22, "prop2": "prop22"}]});
        expect(boxedValue_$.$_deepDelta).toEqual({"values": [undefined, undefined, {"prop1": 22}]});
    });
});
