"use strict";

const boxedImmutable = require("boxed-immutable");
const _$ = boxedImmutable._$;
const createBox = boxedImmutable.createBox;
const BOXED_GET_THIS = boxedImmutable.boxed.BOXED_GET_THIS;
const boxOnDemand = boxedImmutable.boxOnDemand;
const BoxedOnDemand = boxedImmutable.boxed.BoxedOnDemand;
const Boxed = boxedImmutable.boxed.Boxed;

function createBoxed(get, set) {
    const boxedProxy = boxOnDemand(get, set);
    return {
        boxedProxy: boxedProxy,
    };
}

describe('boxed on demand empty no changes', () => {
    let onDemand;
    let origVal;
    let boxedProxy;
    let saveCalled;
    let getCalled;

    beforeAll(() => {
        origVal = undefined;
        saveCalled = 0;
        getCalled = 0;

        let vals = createBoxed(()=>{
            getCalled++;
           return onDemand || origVal;
        }, (modified, boxed)=>{
            saveCalled++;
            onDemand = {
                state: modified,
                delta: boxed.delta$_$,
                deepDelta: boxed.delta$_$,
            }
        });

        boxedProxy = vals.boxedProxy;
    });

    test('Boxed does not change', () => {
        let boxed = boxedProxy._$;
        let tmp;
        expect([getCalled, saveCalled]).toEqual([1,0]);

        tmp = boxedProxy.value;
        expect([getCalled, saveCalled]).toEqual([1,0]);
        expect(boxedProxy._$).toBe(boxed);

        expect([getCalled, saveCalled]).toEqual([1,0]);
        expect(boxedProxy._$).toBe(boxed);
        expect([getCalled, saveCalled]).toEqual([1,0]);
        expect(onDemand).toEqual(undefined);
        expect(origVal).toEqual(undefined);

        boxedProxy.save();
        expect([getCalled, saveCalled]).toEqual([1,0]);

        let boxed2 = boxedProxy._$;
        expect([getCalled, saveCalled]).toEqual([1,0]);
        expect(boxed2).toBe(boxed);
        expect(boxedProxy._$).toBe(boxed2);
        expect([getCalled, saveCalled]).toEqual([1,0]);
        expect(boxedProxy._$).toBe(boxed2);
        expect([getCalled, saveCalled]).toEqual([1,0]);
        boxedProxy.save();
        expect([getCalled, saveCalled]).toEqual([1,0]);
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

        let vals = createBoxed(()=>{
            getCalled++;
           return onDemand || origVal;
        }, (modified, boxed)=>{
            saveCalled++;
            onDemand = {
                state: modified,
                delta: boxed.delta$_$,
                deepDelta: boxed.delta$_$,
            }
        });

        boxedProxy = vals.boxedProxy;
    });

    test('Boxed saves', () => {
        let boxed = boxedProxy._$;
        expect([getCalled, saveCalled]).toEqual([1,0]);
        expect(boxedProxy._$).toBe(boxed);
        expect([getCalled, saveCalled]).toEqual([1,0]);
        expect(boxedProxy._$).toBe(boxed);
        expect([getCalled, saveCalled]).toEqual([1,0]);
        expect(onDemand).toEqual(undefined);
        expect(origVal).toEqual(undefined);

        boxedProxy.simple = 0;
        expect(onDemand).toEqual(undefined);
        expect(origVal).toEqual(undefined);
        expect([getCalled, saveCalled]).toEqual([1,0]);
        boxedProxy.save();
        expect([getCalled, saveCalled]).toEqual([1,1]);
        expect(onDemand).toEqual({state: {simple: 0}, delta: {simple: 0}, deepDelta: {simple: 0}, });
        expect(origVal).toEqual(undefined);

        let boxed2 = boxedProxy._$;
        expect([getCalled, saveCalled]).toEqual([2,1]);
        expect(boxed2).not.toBe(boxed);
        expect(boxedProxy._$).toBe(boxed2);
        expect([getCalled, saveCalled]).toEqual([2,1]);
        expect(boxedProxy._$).toBe(boxed2);
        expect([getCalled, saveCalled]).toEqual([2,1]);
        boxedProxy.save();
        expect([getCalled, saveCalled]).toEqual([2,1]);
        expect(onDemand).toEqual({state: {simple: 0}, delta: {simple: 0}, deepDelta: {simple: 0}, });
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

        let vals = createBoxed(()=>{
            getCalled++;
           return onDemand || origVal;
        }, (modified, boxed)=>{
            saveCalled++;
            onDemand = {
                state: modified,
                delta: boxed.delta$_$,
                deepDelta: boxed.delta$_$,
            }
        });

        boxedProxy = vals.boxedProxy;
    });

    test('Boxed gets new state saves', () => {
        expect(boxedProxy.unboxed$_$).toBe(undefined);
        expect([getCalled, saveCalled]).toEqual([1,0]);
        expect(boxedProxy.field).toEqual(undefined);
        expect([getCalled, saveCalled]).toEqual([1,0]);

        onDemand = { field: 0 };
        expect(boxedProxy.unboxed$_$).toBe(undefined);
        expect(boxedProxy.unboxed$_$).toBe(undefined);
        boxedProxy.cancel();

        expect(boxedProxy.unboxed$_$).toEqual({ field: 0 });
        expect([getCalled, saveCalled]).toEqual([2,0]);
        expect(boxedProxy.field).toEqual(0);
        expect(boxedProxy.unboxed$_$).toEqual({ field: 0 });
        expect([getCalled, saveCalled]).toEqual([2,0]);
    });
});

describe('boxed on demand no changes', () => {
    let onDemand;
    let origVal;
    let boxedProxy;
    let saveCalled;
    let getCalled;

    beforeAll(() => {
        origVal = { state: { } };
        onDemand = { };
        saveCalled = 0;
        getCalled = 0;

        let vals = createBoxed(()=>{
            getCalled++;
           return onDemand.state;
        }, (modified, boxed)=>{
            saveCalled++;
            origVal.state = modified;
            origVal.delta = boxed.delta$_$;
            origVal.deepDelta = boxed.delta$_$;
        });

        boxedProxy = vals.boxedProxy;
    });

    test('Boxed does not change', () => {
        let boxed = boxedProxy._$;
        expect([getCalled, saveCalled]).toEqual([1,0]);
        expect(boxedProxy._$).toBe(boxed);
        expect([getCalled, saveCalled]).toEqual([1,0]);
        expect(boxedProxy._$).toBe(boxed);
        expect([getCalled, saveCalled]).toEqual([1,0]);
        expect(origVal).toEqual({state: {}, });

        boxedProxy.save();
        expect([getCalled, saveCalled]).toEqual([1,0]);

        let boxed2 = boxedProxy._$;
        expect([getCalled, saveCalled]).toEqual([1,0]);
        expect(boxed2).toBe(boxed);
        expect(boxedProxy._$).toBe(boxed2);
        expect([getCalled, saveCalled]).toEqual([1,0]);
        expect(boxedProxy._$).toBe(boxed2);
        expect([getCalled, saveCalled]).toEqual([1,0]);
        boxedProxy.save();
        expect([getCalled, saveCalled]).toEqual([1,0]);
    });
});

describe('boxed on demand changes', () => {
    let onDemand;
    let origVal;
    let boxedProxy;
    let saveCalled;
    let getCalled;

    beforeAll(() => {
        origVal = { state: { } };
        onDemand = { };
        saveCalled = 0;
        getCalled = 0;

        let vals = createBoxed(()=>{
            getCalled++;
           return onDemand.state;
        }, (modified, boxed)=>{
            saveCalled++;
            origVal.state = modified;
            origVal.delta = boxed.delta$_$;
            origVal.deepDelta = boxed.delta$_$;
        });

        boxedProxy = vals.boxedProxy;
    });

    test('Boxed saves', () => {
        let boxed = boxedProxy._$;
        expect([getCalled, saveCalled]).toEqual([1,0]);
        expect(boxedProxy._$).toBe(boxed);
        expect([getCalled, saveCalled]).toEqual([1,0]);
        expect(boxedProxy._$).toBe(boxed);
        expect([getCalled, saveCalled]).toEqual([1,0]);
        expect(origVal).toEqual({state: {}, });

        boxedProxy._$.simple = 0;
        expect(origVal).toEqual({state: {}, });
        expect([getCalled, saveCalled]).toEqual([1,0]);
        boxedProxy.save();
        expect([getCalled, saveCalled]).toEqual([1,1]);
        expect(origVal).toEqual({state: {simple: 0}, delta: {simple: 0}, deepDelta: {simple: 0}, });

        let boxed2 = boxedProxy._$;
        expect([getCalled, saveCalled]).toEqual([2,1]);
        expect(boxed2).not.toBe(boxed);
        expect(boxedProxy._$).toBe(boxed2);
        expect([getCalled, saveCalled]).toEqual([2,1]);
        expect(boxedProxy._$).toBe(boxed2);
        expect([getCalled, saveCalled]).toEqual([2,1]);
        boxedProxy.save();
        expect([getCalled, saveCalled]).toEqual([2,1]);
    });
});

describe('Boxed On Demand Updates', () => {
    let onDemand;
    let origVal;
    let boxedProxy;

    beforeEach(() => {
        origVal = { state: { } };
        onDemand = { };

        let vals = createBoxed(()=>{
           return onDemand.state;
        }, (modified, boxed)=>{
            origVal.state = modified;
            origVal.delta = boxed.delta$_$;
            origVal.deepDelta = boxed.delta$_$;
        });

        boxedProxy = vals.boxedProxy;
    });

    test('set commit', () => {
        boxedProxy._$.simple = 0;
        expect(origVal).toEqual({state: {}});
        boxedProxy.save();

        expect(origVal).toEqual({state: {simple: 0}, delta: {simple: 0}, deepDelta: {simple: 0}, });
    });

    test('multi set, single commit', () => {
        let boxed = boxedProxy._$;

        boxedProxy._$.simple = 2;
        expect(origVal).toEqual({state: {}});
        expect(boxedProxy._$).toBe(boxed);
        boxedProxy._$.simple = 1;
        expect(origVal).toEqual({state: {}});
        expect(boxedProxy._$).toBe(boxed);
        boxedProxy._$.simple = 0;
        boxedProxy.save();
        expect(boxedProxy._$).not.toBe(boxed);
        boxedProxy.cancel();

        expect(origVal).toEqual({state: {simple: 0}, delta: {simple: 0}, deepDelta: {simple: 0}, });
    });

    test('multi set/commit', () => {
        boxedProxy._$.simple = 2;
        boxedProxy.save();
        expect(origVal).toEqual({state: {simple: 2}, delta: {simple: 2}, deepDelta: {simple: 2}, });
        boxedProxy._$.simple = 1;
        boxedProxy.save();
        expect(origVal).toEqual({state: {simple: 1}, delta: {simple: 1}, deepDelta: {simple: 1}, });
        boxedProxy._$.simple = 0;
        boxedProxy.save();
        expect(origVal).toEqual({state: {simple: 0}, delta: {simple: 0}, deepDelta: {simple: 0}, });
    });

    test('multi set/cancel, single commit', () => {
        boxedProxy._$.simple = 2;
        expect(origVal).toEqual({state: {}});
        boxedProxy.cancel();
        expect(origVal).toEqual({state: {}});
        boxedProxy._$.simple = 1;
        expect(origVal).toEqual({state: {}});
        boxedProxy.cancel();
        expect(origVal).toEqual({state: {}});
        boxedProxy._$.simple = 0;
        expect(origVal).toEqual({state: {}});
        boxedProxy.save();

        expect(origVal).toEqual({state: {simple: 0}, delta: {simple: 0}, deepDelta: {simple: 0}, });
    });

    test('set cancel', () => {
        boxedProxy._$.simple = 0;
        boxedProxy.cancel();
        expect(origVal).toEqual({ state: {} });
    });

    test('chain cancel', () => {
        boxedProxy._$.simple = 0;
        let retVal = boxedProxy.cancel();
        retVal._$.simple = 0;
        retVal.save();
        expect(origVal).toEqual({"deepDelta": {"simple": 0}, "delta": {"simple": 0}, "state": {"simple": 0}});
    });
});

