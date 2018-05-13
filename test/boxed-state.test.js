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

describe('boxed on demand internal ops', () => {
    let onDemand;
    let origVal;
    let boxedProxy;
    let boxedVal;
    let saveCalled;
    let getCalled;

    beforeAll(() => {
        origVal = undefined;
        saveCalled = 0;
        getCalled = 0;

        let vals = createBoxedState(() => {
            getCalled++;
            return onDemand || origVal;
        }, (modified, boxed) => {
            saveCalled++;
            onDemand = {
                state: modified,
                delta: boxed.$_delta,
                deepDelta: boxed.$_delta,
            }
        });

        boxedProxy = vals.boxedProxy;
        boxedVal = vals.boxedVal;
    });

    test('Boxed does not change', () => {
        expect(boxedVal.boxed).toBe(undefined);
        expect([getCalled, saveCalled]).toEqual([0, 0]);

        let boxed = boxedProxy._$;
        expect(boxedVal.boxed).not.toBe(undefined);
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        boxedProxy.cancel();
        expect(boxedVal.boxed).toBe(undefined);
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        let tmp = boxedProxy.value;
        expect(boxedVal.boxed).not.toBe(undefined);
    });
});

describe('boxed on demand empty no changes', () => {
    let onDemand;
    let origVal;
    let boxedProxy;
    let boxedVal;
    let saveCalled;
    let getCalled;

    beforeAll(() => {
        origVal = undefined;
        saveCalled = 0;
        getCalled = 0;

        let vals = createBoxedState(() => {
            getCalled++;
            return onDemand || origVal;
        }, (modified, boxed) => {
            saveCalled++;
            onDemand = {
                state: modified,
                delta: boxed.$_delta,
                deepDelta: boxed.$_delta,
            }
        });

        boxedProxy = vals.boxedProxy;
        boxedVal = vals.boxedVal;
    });

    test('Boxed does not change', () => {
        let boxed = boxedProxy._$;
        let tmp;
        expect([getCalled, saveCalled]).toEqual([1, 0]);

        tmp = boxedProxy.value;
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        expect(boxedProxy._$).toBe(boxed);

        expect([getCalled, saveCalled]).toEqual([1, 0]);
        expect(boxedProxy._$).toBe(boxed);
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        expect(onDemand).toEqual(undefined);
        expect(origVal).toEqual(undefined);

        boxedProxy.save();
        expect([getCalled, saveCalled]).toEqual([1, 0]);

        let boxed2 = boxedProxy._$;
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        expect(boxed2).toBe(boxed);
        expect(boxedProxy._$).toBe(boxed2);
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        expect(boxedProxy._$).toBe(boxed2);
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        boxedProxy.save();
        expect([getCalled, saveCalled]).toEqual([1, 0]);
    });
});

describe('boxed on demand changes', () => {
    let onDemand;
    let origVal;
    let boxedProxy;
    let saveCalled;
    let getCalled;

    beforeAll(() => {
        onDemand = origVal = undefined;
        saveCalled = 0;
        getCalled = 0;

        let vals = createBoxedState(() => {
            getCalled++;
            return onDemand || origVal;
        }, (modified, boxed) => {
            saveCalled++;
            onDemand = {
                state: modified,
                delta: boxed.$_delta,
                deepDelta: boxed.$_delta,
            }
        });

        boxedProxy = vals.boxedProxy;
    });

    test('Boxed saves', () => {
        let boxed = boxedProxy._$;
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        expect(boxedProxy._$).toBe(boxed);
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        expect(boxedProxy._$).toBe(boxed);
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        expect(onDemand).toEqual(undefined);
        expect(origVal).toEqual(undefined);

        boxedProxy.simple = 0;
        expect(onDemand).toEqual(undefined);
        expect(origVal).toEqual(undefined);
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        boxedProxy.save();
        expect([getCalled, saveCalled]).toEqual([1, 1]);
        expect(onDemand).toEqual({ state: { simple: 0 }, delta: { simple: 0 }, deepDelta: { simple: 0 }, });
        expect(origVal).toEqual(undefined);

        let boxed2 = boxedProxy._$;
        expect([getCalled, saveCalled]).toEqual([2, 1]);
        expect(boxed2).not.toBe(boxed);
        expect(boxedProxy._$).toBe(boxed2);
        expect([getCalled, saveCalled]).toEqual([2, 1]);
        expect(boxedProxy._$).toBe(boxed2);
        expect([getCalled, saveCalled]).toEqual([2, 1]);
        boxedProxy.save();
        expect([getCalled, saveCalled]).toEqual([2, 1]);
        expect(onDemand).toEqual({ state: { simple: 0 }, delta: { simple: 0 }, deepDelta: { simple: 0 }, });
        expect(origVal).toEqual(undefined);
    });
});

describe('boxed on demand external changes', () => {
    let onDemand;
    let origVal;
    let boxedProxy;
    let saveCalled;
    let getCalled;

    beforeAll(() => {
        onDemand = origVal = undefined;
        saveCalled = 0;
        getCalled = 0;

        let vals = createBoxedState(() => {
            getCalled++;
            return onDemand || origVal;
        }, (modified, boxed) => {
            saveCalled++;
            onDemand = {
                state: modified,
                delta: boxed.$_delta,
                deepDelta: boxed.$_delta,
            }
        });

        boxedProxy = vals.boxedProxy;
    });

    test('Boxed gets new state saves', () => {
        expect(boxedProxy.$_).toBe(undefined);
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        expect(boxedProxy.field.$_).toEqual(undefined);
        expect([getCalled, saveCalled]).toEqual([1, 0]);

        onDemand = { field: 0 };
        expect(boxedProxy.$_).toBe(undefined);
        expect(boxedProxy.$_).toBe(undefined);
        boxedProxy.cancel();

        expect(boxedProxy.$_).toEqual({ field: 0 });
        expect([getCalled, saveCalled]).toEqual([2, 0]);
        expect(boxedProxy.field.$_).toEqual(0);
        expect(boxedProxy.$_).toEqual({ field: 0 });
        expect([getCalled, saveCalled]).toEqual([2, 0]);
    });
});

describe('boxed on demand no changes', () => {
    let onDemand;
    let origVal;
    let boxedProxy;
    let saveCalled;
    let getCalled;

    beforeAll(() => {
        origVal = { state: {} };
        onDemand = {};
        saveCalled = 0;
        getCalled = 0;

        let vals = createBoxedState(() => {
            getCalled++;
            return onDemand.state;
        }, (modified, boxed) => {
            saveCalled++;
            origVal.state = modified;
            origVal.delta = boxed.$_delta;
            origVal.deepDelta = boxed.$_delta;
        });

        boxedProxy = vals.boxedProxy;
    });

    test('Boxed does not change', () => {
        let boxed = boxedProxy._$;
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        expect(boxedProxy._$).toBe(boxed);
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        expect(boxedProxy._$).toBe(boxed);
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        expect(origVal).toEqual({ state: {}, });

        boxedProxy.save();
        expect([getCalled, saveCalled]).toEqual([1, 0]);

        let boxed2 = boxedProxy._$;
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        expect(boxed2).toBe(boxed);
        expect(boxedProxy._$).toBe(boxed2);
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        expect(boxedProxy._$).toBe(boxed2);
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        boxedProxy.save();
        expect([getCalled, saveCalled]).toEqual([1, 0]);
    });
});

describe('boxed on demand changes', () => {
    let onDemand;
    let origVal;
    let boxedProxy;
    let saveCalled;
    let getCalled;

    beforeAll(() => {
        origVal = { state: {} };
        onDemand = {};
        saveCalled = 0;
        getCalled = 0;

        let vals = createBoxedState(() => {
            getCalled++;
            return onDemand.state;
        }, (modified, boxed) => {
            saveCalled++;
            origVal.state = modified;
            origVal.delta = boxed.$_delta;
            origVal.deepDelta = boxed.$_delta;
        });

        boxedProxy = vals.boxedProxy;
    });

    test('Boxed saves', () => {
        let boxed = boxedProxy._$;
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        expect(boxedProxy._$).toBe(boxed);
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        expect(boxedProxy._$).toBe(boxed);
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        expect(origVal).toEqual({ state: {}, });

        boxedProxy._$.simple = 0;
        expect(origVal).toEqual({ state: {}, });
        expect([getCalled, saveCalled]).toEqual([1, 0]);
        boxedProxy.save();
        expect([getCalled, saveCalled]).toEqual([1, 1]);
        expect(origVal).toEqual({ state: { simple: 0 }, delta: { simple: 0 }, deepDelta: { simple: 0 }, });

        let boxed2 = boxedProxy._$;
        expect([getCalled, saveCalled]).toEqual([2, 1]);
        expect(boxed2).not.toBe(boxed);
        expect(boxedProxy._$).toBe(boxed2);
        expect([getCalled, saveCalled]).toEqual([2, 1]);
        expect(boxedProxy._$).toBe(boxed2);
        expect([getCalled, saveCalled]).toEqual([2, 1]);
        boxedProxy.save();
        expect([getCalled, saveCalled]).toEqual([2, 1]);
    });
});

describe('Boxed On Demand Updates', () => {
    let onDemand;
    let origVal;
    let boxedProxy;

    beforeEach(() => {
        origVal = { state: {} };
        onDemand = {};

        let vals = createBoxedState(() => {
            return onDemand.state;
        }, (modified, boxed) => {
            origVal.state = modified;
            origVal.delta = boxed.$_delta;
            origVal.deepDelta = boxed.$_delta;
        });

        boxedProxy = vals.boxedProxy;
    });

    test('set commit', () => {
        boxedProxy._$.simple = 0;
        expect(origVal).toEqual({ state: {} });
        boxedProxy.save();

        expect(origVal).toEqual({ state: { simple: 0 }, delta: { simple: 0 }, deepDelta: { simple: 0 }, });
    });

    test('multi set, single commit', () => {
        let boxed = boxedProxy._$;

        boxedProxy._$.simple = 2;
        expect(origVal).toEqual({ state: {} });
        expect(boxedProxy._$).toBe(boxed);
        boxedProxy._$.simple = 1;
        expect(origVal).toEqual({ state: {} });
        expect(boxedProxy._$).toBe(boxed);
        boxedProxy._$.simple = 0;
        boxedProxy.save();
        expect(boxedProxy._$).not.toBe(boxed);
        boxedProxy.cancel();

        expect(origVal).toEqual({ state: { simple: 0 }, delta: { simple: 0 }, deepDelta: { simple: 0 }, });
    });

    test('multi set/commit', () => {
        boxedProxy._$.simple = 2;
        boxedProxy.save();
        expect(origVal).toEqual({ state: { simple: 2 }, delta: { simple: 2 }, deepDelta: { simple: 2 }, });
        boxedProxy._$.simple = 1;
        boxedProxy.save();
        expect(origVal).toEqual({ state: { simple: 1 }, delta: { simple: 1 }, deepDelta: { simple: 1 }, });
        boxedProxy._$.simple = 0;
        boxedProxy.save();
        expect(origVal).toEqual({ state: { simple: 0 }, delta: { simple: 0 }, deepDelta: { simple: 0 }, });
    });

    test('multi set/cancel, single commit', () => {
        boxedProxy._$.simple = 2;
        expect(origVal).toEqual({ state: {} });
        boxedProxy.cancel();
        expect(origVal).toEqual({ state: {} });
        boxedProxy._$.simple = 1;
        expect(origVal).toEqual({ state: {} });
        boxedProxy.cancel();
        expect(origVal).toEqual({ state: {} });
        boxedProxy._$.simple = 0;
        expect(origVal).toEqual({ state: {} });
        boxedProxy.save();

        expect(origVal).toEqual({ state: { simple: 0 }, delta: { simple: 0 }, deepDelta: { simple: 0 }, });
    });

    test('set cancel', () => {
        boxedProxy.simple = 0;
        boxedProxy.cancel();
        expect(origVal).toEqual({ state: {} });
    });

    test('set value to null', () => {
        boxedProxy.simple = null;
        boxedProxy.save();
        expect(origVal).toEqual({ "deepDelta": { "simple": null }, "delta": { "simple": null }, "state": { "simple": null } });
    });
});

test('Boxed cancel of unmodified returns UNDEFINED', () => {
    const origValue = { oldValue: 'oldValue' };
    let boxedProxy = boxState(() => origValue);
    let retVal = boxedProxy.cancel();
    expect(retVal).toEqual(undefined);
});

test('Boxed cancel returns delta', () => {
    const origValue = { oldValue: 'oldValue' };
    let boxedProxy = boxState(() => origValue);
    boxedProxy.simple = 0;
    let retVal = boxedProxy.cancel();
    expect(retVal).toEqual({ simple: 0 });
});

