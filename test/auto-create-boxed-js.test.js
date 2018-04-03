"use strict";

let boxed = require("boxed-js");
let _$ = boxed._$;
let createBox = boxed.createBox;
let Boxed = boxed.Boxed;
let BOXED_GET_THIS = boxed.BOXED_GET_THIS;

function createBoxed(val) {
    const boxedProxy = _$(val);
    return {
        origVal: val,
        boxedProxy: boxedProxy,
        boxedVal: boxedProxy[BOXED_GET_THIS],
    };
}

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

    test('modified$_$ is value', () => {
        expect(boxedProxy.modified$_$).toBe(boxedVal.value);
    });

    test('delta$_$ == delta', () => {
        expect(boxedProxy.delta$_$).toEqual(deltaValue);
    });

    test('deepDelta$_$ == deepDelta', () => {
        expect(boxedProxy.deepDelta$_$).toEqual(boxedProxy.delta$_$);
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

    test('modified$_$ is value', () => {
        expect(boxedProxy.modified$_$).toEqual(boxedVal.value);
    });

    test('delta$_$ == delta', () => {
        expect(boxedProxy.delta$_$).toEqual(deltaValue);
    });

    test('deepDelta$_$ == deepDelta', () => {
        expect(boxedProxy.deepDelta$_$).toEqual(deepDeltaValue);
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

    test('modified$_$ is value', () => {
        expect(boxedProxy.modified$_$).toEqual(boxedVal.value);
    });

    test('delta$_$ == delta', () => {
        expect(boxedProxy.delta$_$).toEqual(deltaValue);
    });

    test('deepDelta$_$ == deepDelta', () => {
        expect(boxedProxy.deepDelta$_$).toEqual(deepDeltaValue);
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

    test('modified$_$ is value', () => {
        expect(boxedProxy.modified$_$).toEqual(boxedVal.value);
    });

    test('delta$_$ == delta', () => {
        expect(boxedProxy.delta$_$).toEqual(deltaValue);
    });

    test('deepDelta$_$ == deepDelta', () => {
        expect(boxedProxy.deepDelta$_$).toEqual(deepDeltaValue);
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

    test('modified$_$ is value', () => {
        expect(boxedProxy.modified$_$).toEqual(boxedVal.value);
    });

    test('delta$_$ == delta', () => {
        expect(boxedProxy.delta$_$).toEqual(deltaValue);
    });

    test('deepDelta$_$ == deepDelta', () => {
        expect(boxedProxy.deepDelta$_$).toEqual(deepDeltaValue);
    });
});

