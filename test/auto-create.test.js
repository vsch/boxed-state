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

describe('Create Array first level', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let expectedValue;
    let deltaValue;
    let deepDeltaValue;

    beforeAll(() => {
        let vals = createBoxed(undefined);
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;

        boxedProxy[_$] = 5;
        boxedProxy[_$] = 15;
        boxedProxy[_$] = 25;

        deepDeltaValue = deltaValue = expectedValue = [5, 15, 25];
    });

    test('value == modified', () => {
        expect(boxedVal.value).toEqual(expectedValue);
    });

    test('$_modified is value', () => {
        expect(boxedProxy.$_modified).toBe(boxedVal.value);
    });

    test('$_delta == delta', () => {
        expect(boxedProxy.$_delta).toEqual(deltaValue);
    });

    test('$_deepDelta == deepDelta', () => {
        expect(boxedProxy.$_deepDelta).toEqual(boxedProxy.$_delta);
    });
});

describe('Create Array add props', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let expectedValue;
    let deltaValue;
    let deepDeltaValue;

    beforeAll(() => {
        let vals = createBoxed(undefined);
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;

        boxedProxy[_$] = 5;
        boxedProxy[_$] = 15;
        boxedProxy[_$] = 25;
        boxedProxy.prop = 35;

        expectedValue = [5, 15, 25];
        expectedValue.prop = 35;
        deepDeltaValue = deltaValue = expectedValue;
    });

    test('value == modified', () => {
        const value = boxedVal.value;
        expect(value).toEqual(expectedValue);
    });

    test('$_modified is value', () => {
        expect(boxedProxy.$_modified).toEqual(boxedVal.value);
    });

    test('$_delta == delta', () => {
        expect(boxedProxy.$_delta).toEqual(deltaValue);
    });

    test('$_deepDelta == deepDelta', () => {
        expect(boxedProxy.$_deepDelta).toEqual(deepDeltaValue);
    });
});

describe('Create Object add indices', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let expectedValue;
    let deltaValue;
    let deepDeltaValue;

    beforeAll(() => {
        let vals = createBoxed(undefined);
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;

        boxedProxy.prop = 35;
        boxedProxy[0] = 5;
        boxedProxy[1] = 15;
        boxedProxy[2] = 25;

        expectedValue = { prop: 35 };
        expectedValue[0] = 5;
        expectedValue[1] = 15;
        expectedValue[2] = 25;
        deepDeltaValue = deltaValue = expectedValue;
    });

    test('value == modified', () => {
        const value = boxedVal.value;
        expect(value).toEqual(expectedValue);
    });

    test('$_modified is value', () => {
        expect(boxedProxy.$_modified).toEqual(boxedVal.value);
    });

    test('$_delta == delta', () => {
        expect(boxedProxy.$_delta).toEqual(deltaValue);
    });

    test('$_deepDelta == deepDelta', () => {
        expect(boxedProxy.$_deepDelta).toEqual(deepDeltaValue);
    });
});

describe('Create Object add indices', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let expectedValue;
    let deltaValue;
    let deepDeltaValue;

    beforeAll(() => {
        let vals = createBoxed(undefined);
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;

        boxedProxy.prop = 35;
        boxedProxy[_$] = 5;
        boxedProxy[_$] = 15;
        boxedProxy[_$] = 25;

        expectedValue = { prop: 35 };
        expectedValue[0] = 5;
        expectedValue[1] = 15;
        expectedValue[2] = 25;
        deepDeltaValue = deltaValue = expectedValue;
    });

    test('value == modified', () => {
        const value = boxedVal.value;
        expect(value).toEqual(expectedValue);
    });

    test('$_modified is value', () => {
        expect(boxedProxy.$_modified).toEqual(boxedVal.value);
    });

    test('$_delta == delta', () => {
        expect(boxedProxy.$_delta).toEqual(deltaValue);
    });

    test('$_deepDelta == deepDelta', () => {
        expect(boxedProxy.$_deepDelta).toEqual(deepDeltaValue);
    });
});

describe('delta and deepDelta of Array should return 0..lastModified index, otherwise get erroneous undefined values', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let expectedValue;
    let deltaValue;
    let deepDeltaValue;

    beforeAll(() => {
        let vals = createBoxed([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;

        boxedProxy[7] = 17;
        boxedProxy[5] = 15;
        boxedProxy[2] = 12;

        expectedValue = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        expectedValue[7] = 17;
        expectedValue[5] = 15;
        expectedValue[2] = 12;
        deepDeltaValue = deltaValue = [0, 1, 12, 3, 4, 15, 6, 17];
        // deepDeltaValue = { 2: 12, 5: 15, 7: 17 };
    });

    test('value == modified', () => {
        const value = boxedVal.value;
        expect(value).toEqual(expectedValue);
    });

    test('$_modified is value', () => {
        expect(boxedProxy.$_modified).toEqual(boxedVal.value);
    });

    test('$_delta == delta', () => {
        expect(boxedProxy.$_delta).toEqual(deltaValue);
    });

    test('$_deepDelta == deepDelta', () => {
        expect(boxedProxy.$_deepDelta).toEqual([undefined, undefined, 12, undefined, undefined, 15, undefined, 17]);
    });
});

describe('Multiple modifications of same field', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let expectedValue;
    let deltaValue;
    let deepDeltaValue;

    beforeAll(() => {
        let vals = createBoxed({ field: "" });
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;

        boxedProxy.field = 1;
        boxedProxy.field = 2;
        boxedProxy.field = 3;

        expectedValue = { field: 3 };
        deepDeltaValue = deltaValue = expectedValue;
    });

    test('value == modified', () => {
        const value = boxedVal.value;
        expect(value).toEqual(expectedValue);
    });

    test('$_modified is value', () => {
        expect(boxedProxy.$_modified).toEqual(boxedVal.value);
    });

    test('$_delta == delta', () => {
        expect(boxedProxy.$_delta).toEqual(deltaValue);
    });

    test('$_deepDelta == deepDelta', () => {
        expect(boxedProxy.$_deepDelta).toEqual(deepDeltaValue);
    });
});

describe('Default Value setting', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let expectedValue;
    let deltaValue;
    let deepDeltaValue;

    beforeAll(() => {
        let vals = createBoxed({ field1: "" });
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;

        boxedProxy.field1.$_default = 1;
        boxedProxy.field2.$_default = 2;
        boxedProxy.field2.$_default = 3;
        boxedProxy.field3.$_default(1);
        boxedProxy.field3.$_default(2);
        boxedProxy.field3.$_default(3);

        expectedValue = { field1: "", field2: 2, field3: 1, };
        deepDeltaValue = deltaValue = { field2: 2, field3: 1, };
    });

    test('value == modified', () => {
        const value = boxedVal.value;
        expect(value).toEqual(expectedValue);
    });

    test('$_modified is value', () => {
        expect(boxedProxy.$_modified).toEqual(boxedVal.value);
    });

    test('$_delta == delta', () => {
        expect(boxedProxy.$_delta).toEqual(deltaValue);
    });

    test('$_deepDelta == deepDelta', () => {
        expect(boxedProxy.$_deepDelta).toEqual(deepDeltaValue);
    });
});

