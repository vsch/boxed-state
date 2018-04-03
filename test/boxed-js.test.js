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

describe('Boxed undefined Unmodified', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;

    beforeAll(() => {
        let vals = createBoxed(undefined);
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
    });

    test('is proxied', () => {
        expect(boxedProxy).not.toBe(undefined);
    });

    test('._$ proxy is proxy', () => {
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

    test('non-nested properties undefined', () => {
        expect(boxedProxy.nonexistent).toBe(undefined);
    });

    test('non-nested properties undefined', () => {
        expect(boxedProxy["nonexistent"]).toBe(undefined);
    });

    test('non-nested properties undefined', () => {
        expect(boxedProxy[5]).toBe(undefined);
    });

    test('nested properties throw', () => {
        expect(() => boxedProxy.nonexistent.property).toThrow(TypeError);
    });

    test('nested properties throw', () => {
        expect(() => boxedProxy.nonexistent.property.value).toThrow(TypeError);
    });

    test('non-nested wrapped property is proxied', () => {
        const nonexistent$ = boxedProxy.nonexistent_$;
        expect(nonexistent$._$).toBe(nonexistent$);
    });

    test('non-nested wrapped properties undefined', () => {
        expect(boxedProxy.nonexistent_$.property).toBe(undefined);
    });

    test('non-nested wrapped properties undefined', () => {
        expect(boxedProxy.nonexistent_$["property"]).toBe(undefined);
    });

    test('non-nested wrapped properties undefined', () => {
        expect(boxedProxy.nonexistent_$.property_$.value).toBe(undefined);
    });

    test('modified$_$ is undefined', () => {
        expect(boxedProxy.modified$_$).toBe(undefined);
    });

    test('delta$_$ is undefined', () => {
        expect(boxedProxy.delta$_$).toBe(undefined);
    });

    test('deepDelta$_$ is undefined', () => {
        expect(boxedProxy.deepDelta$_$).toBe(undefined);
    });
});

describe('Boxed Empty Unmodified', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;

    beforeAll(() => {
        let vals = createBoxed({});
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
    });

    test('is proxied', () => {
        expect(boxedProxy).not.toBe(undefined);
    });

    test('._$ proxy is proxy', () => {
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

    test('non-nested properties undefined', () => {
        expect(boxedProxy.nonexistent).toBe(undefined);
    });

    test('nested properties throw', () => {
        expect(() => boxedProxy.nonexistent.property).toThrow(TypeError);
    });

    test('nested properties undefined', () => {
        expect(() => boxedProxy.nonexistent.property.value).toThrow(TypeError);
    });

    test('non-nested wrapped properties undefined', () => {
        expect(boxedProxy.nonexistent_$.property).toBe(undefined);
    });

    test('non-nested wrapped properties undefined', () => {
        expect(boxedProxy.nonexistent_$.property_$.value).toBe(undefined);
    });

    test('modified$_$ is undefined', () => {
        expect(boxedProxy.modified$_$).toBe(undefined);
    });

    test('delta$_$ is undefined', () => {
        expect(boxedProxy.delta$_$).toBe(undefined);
    });

    test('deepDelta$_$ is undefined', () => {
        expect(boxedProxy.deepDelta$_$).toBe(undefined);
    });
});

describe('Boxed Empty Array Unmodified', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;

    beforeAll(() => {
        let vals = createBoxed([]);
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
    });

    test('is proxied', () => {
        expect(boxedProxy).not.toBe(undefined);
    });

    test('._$ proxy is proxy', () => {
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

    test('non-nested properties undefined', () => {
        expect(boxedProxy.nonexistent).toBe(undefined);
    });

    test('nested properties throw', () => {
        expect(() => boxedProxy.nonexistent.property).toThrow(TypeError);
    });

    test('nested properties undefined', () => {
        expect(() => boxedProxy.nonexistent.property.value).toThrow(TypeError);
    });

    test('non-nested wrapped properties undefined', () => {
        expect(boxedProxy.nonexistent_$.property).toBe(undefined);
    });

    test('non-nested wrapped properties undefined', () => {
        expect(boxedProxy.nonexistent_$.property_$.value).toBe(undefined);
    });

});

describe('Boxed undefined Modified', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;

    beforeAll(() => {
        let vals = createBoxed({});
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        boxedProxy.newProp = 5;
    });

    test('is proxied', () => {
        expect(boxedProxy).not.toBe(undefined);
    });

    test('._$ proxy is proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value !== original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value === modified', () => {
        expect(boxedVal.value).toEqual({ newProp: 5 });
    });

    test('modified$_$ === value', () => {
        expect(boxedProxy.modified$_$).toBe(boxedVal.value);
    });

    test('delta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('delta$_$ == value', () => {
        expect(boxedProxy.delta$_$).toEqual(boxedVal.value);
    });

    test('deepDelta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('deepDelta$_$ == value', () => {
        expect(boxedProxy.deepDelta$_$).toEqual(boxedVal.value);
    });
});

describe('Boxed Empty Modified', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;

    beforeAll(() => {
        let vals = createBoxed({});
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        boxedProxy.newProp = 5;
    });

    test('is proxied', () => {
        expect(boxedProxy).not.toBe(undefined);
    });

    test('._$ proxy is proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value === original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value === modified', () => {
        expect(boxedVal.value).toEqual({ newProp: 5 });
    });

    test('modified$_$ is value', () => {
        expect(boxedProxy.modified$_$).toBe(boxedVal.value);
    });

    test('delta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('delta$_$ == value', () => {
        expect(boxedProxy.delta$_$).toEqual(boxedVal.value);
    });

    test('deepDelta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('deepDelta$_$ == value', () => {
        expect(boxedProxy.deepDelta$_$).toEqual(boxedVal.value);
    });
});

describe('Boxed Object param', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;

    beforeAll(() => {
        let vals = createBoxed({});
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        boxedProxy[{ abc: "abc" }] = 5;
    });

    test('is proxied', () => {
        expect(boxedProxy).not.toBe(undefined);
    });

    test('._$ proxy is proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value === original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value !== modified', () => {
        let value = {};
        value[{ abc: "abc" }] = 5;
        expect(boxedVal.value).toEqual(value);
    });

    test('modified$_$ is value', () => {
        expect(boxedProxy.modified$_$).toBe(boxedVal.value);
    });

    test('delta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('delta$_$ == value', () => {
        expect(boxedProxy.delta$_$).toEqual(boxedVal.value);
    });

    test('deepDelta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('deepDelta$_$ == value', () => {
        expect(boxedProxy.deepDelta$_$).toEqual(boxedVal.value);
    });
});

describe('Boxed Non-Empty Modified', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;

    beforeAll(() => {
        let vals = createBoxed({ oldValue: "old" });
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        boxedProxy.newProp = 5;
    });

    test('is proxied', () => {
        expect(boxedProxy).not.toBe(undefined);
    });

    test('._$ proxy is proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value === original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value === modified', () => {
        expect(boxedVal.value).toEqual({ oldValue: "old", newProp: 5 });
    });

    test('modified$_$ is value', () => {
        expect(boxedProxy.modified$_$).toBe(boxedVal.value);
    });

    test('delta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('delta$_$ != value', () => {
        expect(boxedProxy.delta$_$).not.toEqual(boxedVal.value);
    });

    test('delta$_$ == delta of mods', () => {
        expect(boxedProxy.delta$_$).toEqual({ newProp: 5 });
    });

    test('deepDelta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('deepDelta$_$ != value', () => {
        expect(boxedProxy.deepDelta$_$).not.toEqual(boxedVal.value);
    });

    test('deepDelta$_$ == delta of mods', () => {
        expect(boxedProxy.deepDelta$_$).toEqual({ newProp: 5 });
    });
});

describe('Boxed Non-Empty Overwrite', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;

    beforeAll(() => {
        let vals = createBoxed({ oldValue: "old" });
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        boxedProxy.oldValue = 5;
    });

    test('is proxied', () => {
        expect(boxedProxy).not.toBe(undefined);
    });

    test('._$ proxy is proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value === original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value === modified', () => {
        expect(boxedVal.value).toEqual({ oldValue: 5 });
    });

    test('modified$_$ is value', () => {
        expect(boxedProxy.modified$_$).toBe(boxedVal.value);
    });

    test('delta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('delta$_$ == value', () => {
        expect(boxedProxy.delta$_$).toEqual(boxedVal.value);
    });

    test('deepDelta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('deepDelta$_$ == value', () => {
        expect(boxedProxy.deepDelta$_$).toEqual(boxedVal.value);
    });
});

describe('Boxed Empty Array Modified', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;

    beforeAll(() => {
        let vals = createBoxed([]);
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        boxedProxy.newProp = 5;
    });

    test('is proxied', () => {
        expect(boxedProxy).not.toBe(undefined);
    });

    test('._$ proxy is proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value === original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value === modified', () => {
        let value = [];
        value["newProp"] = 5;
        expect(boxedVal.value).toEqual(value);
    });

    test('modified$_$ is value', () => {
        expect(boxedProxy.modified$_$).toBe(boxedVal.value);
    });

    test('delta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('delta$_$ == value', () => {
        expect(boxedProxy.delta$_$).toEqual(boxedVal.value);
    });

    test('deepDelta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('deepDelta$_$ == value', () => {
        expect(boxedProxy.deepDelta$_$).toEqual(boxedVal.value);
    });
});

describe('Boxed Empty Array Append to End with ["_$"]', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;

    beforeAll(() => {
        let vals = createBoxed([]);
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        boxedProxy["_$"] = 5;
    });

    test('is proxied', () => {
        expect(boxedProxy).not.toBe(undefined);
    });

    test('._$ proxy is proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value === original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value === modified', () => {
        expect(boxedVal.value).toEqual([5]);
    });

    test('modified$_$ is value', () => {
        expect(boxedProxy.modified$_$).toBe(boxedVal.value);
    });

    test('delta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('delta$_$ == value', () => {
        expect(boxedProxy.delta$_$).toEqual(boxedVal.value);
    });

    test('deepDelta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('deepDelta$_$ == value', () => {
        expect(boxedProxy.deepDelta$_$).toEqual(boxedVal.value);
    });
});

describe('Boxed Empty Array Append to End with [_$]', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;

    beforeAll(() => {
        let vals = createBoxed([]);
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        boxedProxy[_$] = 5;
    });

    test('is proxied', () => {
        expect(boxedProxy).not.toBe(undefined);
    });

    test('._$ proxy is proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value === original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value === modified', () => {
        expect(boxedVal.value).toEqual([5]);
    });

    test('modified$_$ is value', () => {
        expect(boxedProxy.modified$_$).toBe(boxedVal.value);
    });

    test('delta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('delta$_$ == value', () => {
        expect(boxedProxy.delta$_$).toEqual(boxedVal.value);
    });

    test('deepDelta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('deepDelta$_$ == value', () => {
        expect(boxedProxy.deepDelta$_$).toEqual(boxedVal.value);
    });
});

describe('Boxed Empty Array Append to With ._$ = ...', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;

    beforeAll(() => {
        let vals = createBoxed([]);
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        boxedProxy._$ = 5;
    });

    test('is proxied', () => {
        expect(boxedProxy).not.toBe(undefined);
    });

    test('._$ proxy is proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value === original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value === modified', () => {
        expect(boxedVal.value).toEqual([5]);
    });

    test('modified$_$ is value', () => {
        expect(boxedProxy.modified$_$).toBe(boxedVal.value);
    });

    test('delta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('delta$_$ == value', () => {
        expect(boxedProxy.delta$_$).toEqual(boxedVal.value);
    });

    test('deepDelta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('deepDelta$_$ == value', () => {
        expect(boxedProxy.deepDelta$_$).toEqual(boxedVal.value);
    });
});

describe('Boxed Non-Empty Array Append to End', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;

    beforeAll(() => {
        let vals = createBoxed([10]);
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        boxedProxy[_$] = 5;
    });

    test('is proxied', () => {
        expect(boxedProxy).not.toBe(undefined);
    });

    test('._$ proxy is proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value === original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value === modified', () => {
        expect(boxedVal.value).toEqual([10, 5]);
    });

    test('modified$_$ === value', () => {
        expect(boxedProxy.modified$_$).toBe(boxedVal.value);
    });

    test('delta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('delta$_$ == value', () => {
        expect(boxedProxy.delta$_$).toEqual([10, 5]);
    });

    test('deepDelta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('deepDelta$_$ == value', () => {
        expect(boxedProxy.deepDelta$_$).toEqual([10, 5]);
    });
});

describe('Boxed Non-Empty Array Overwrite', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;

    beforeAll(() => {
        let vals = createBoxed([10]);
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        boxedProxy[0] = 5;
    });

    test('is proxied', () => {
        expect(boxedProxy).not.toBe(undefined);
    });

    test('._$ proxy is proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value === original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value == modified', () => {
        expect(boxedVal.value).toEqual([5]);
    });

    test('modified$_$ === value', () => {
        expect(boxedProxy.modified$_$).toBe(boxedVal.value);
    });

    test('delta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('delta$_$ == value', () => {
        expect(boxedProxy.delta$_$).toEqual(boxedVal.value);
    });

    test('deepDelta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('deepDelta$_$ == value', () => {
        expect(boxedProxy.deepDelta$_$).toEqual(boxedVal.value);
    });
});

describe('Boxed Non-Empty Array Overwrite/Append', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;

    beforeAll(() => {
        let vals = createBoxed([20, 10]);
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        boxedProxy[0] = 5;
        boxedProxy[_$] = 15;
    });

    test('is proxied', () => {
        expect(boxedProxy).not.toBe(undefined);
    });

    test('._$ proxy is proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value === original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value == modified', () => {
        expect(boxedVal.value).toEqual([5, 10, 15]);
    });

    test('modified$_$ === value', () => {
        expect(boxedProxy.modified$_$).toBe(boxedVal.value);
    });

    test('delta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('delta$_$ == mods', () => {
        expect(boxedProxy.delta$_$).toEqual([5, 10, 15]);
    });

    test('deepDelta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('deepDelta$_$ == delta$_$', () => {
        expect(boxedProxy.deepDelta$_$).toEqual(boxedVal.unboxedDelta());
    });
});

describe('Boxed Non-Empty Multi-Mods One Copy', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let boxedValue1;
    let boxedValue2;
    let boxedValue3;

    beforeEach(() => {
        let vals = createBoxed([10, 20, 30]);
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        boxedProxy[_$] = 45;
        boxedValue1 = boxedVal.value;
        boxedProxy[1] = 55;
        boxedValue2 = boxedVal.value;
        boxedProxy[_$] = 35;
        boxedValue3 = boxedVal.value;
    });

    test('is proxied', () => {
        expect(boxedProxy).not.toBe(undefined);
    });

    test('._$ proxy is proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value !== original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value == modified', () => {
        expect(boxedVal.value).toEqual([10, 55, 30, 45, 35]);
    });

    test('modified$_$ === value', () => {
        expect(boxedProxy.modified$_$).toBe(boxedVal.value);
    });

    test('first mod !== original', () => {
        expect(boxedValue1).not.toBe(origVal);
    });

    test('first mod === value', () => {
        expect(boxedValue1).toBe(boxedVal.value);
    });

    test('second mod === value', () => {
        expect(boxedValue2).toBe(boxedVal.value);
    });

    test('third mod === value', () => {
        expect(boxedValue3).toBe(boxedVal.value);
    });
});

describe('Boxed Non Empty Array Modified with property', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;

    beforeAll(() => {
        let vals = createBoxed([10]);
        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        boxedProxy.newProp = 5;
    });

    test('is proxied', () => {
        expect(boxedProxy).not.toBe(undefined);
    });

    test('._$ proxy is proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value === original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value === modified', () => {
        let value = [10];
        value["newProp"] = 5;
        expect(boxedVal.value).toEqual(value);
    });

    test('modified$_$ is value', () => {
        expect(boxedProxy.modified$_$).toBe(boxedVal.value);
    });

    test('delta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('delta$_$ != value', () => {
        expect(boxedProxy.delta$_$).not.toEqual(boxedVal.value);
    });

    test('delta$_$ == delta of mods', () => {
        let value = [];
        value["newProp"] = 5;
        expect(boxedProxy.delta$_$).toEqual(value);
    });

    test('deepDelta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('deepDelta$_$ != value', () => {
        expect(boxedProxy.deepDelta$_$).not.toEqual(boxedVal.value);
    });

    test('deepDelta$_$ == delta of mods', () => {
        let value = [];
        value["newProp"] = 5;
        expect(boxedProxy.deepDelta$_$).toEqual(value);
    });

});

describe('Boxed Deep Nested New Mods', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let expectedValue;
    let deltaValue;
    let deepDeltaValue;

    beforeAll(() => {
        let vals = createBoxed({
            oldValue: "old",
            oldValue1: {
                fieldParam: 5,
            },
            oldValue2: "aValue",
            oldValue3: {
                fieldParam: 10,
                fieldParam2: "10",
                newValue2: { oldField: "25", },
            },
        });
        const arr = [];
        arr[5] = 15;

        expectedValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
            },
            oldValue2: "aValue",
            oldValue3: {
                fieldParam: 10,
                fieldParam2: 10,
                newValue2: { oldField: "25", field: 25, },
            },
        };
        deltaValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
            },
            // oldValue2: "aValue",
            oldValue3: {
                fieldParam: 10,
                fieldParam2: 10,
                newValue2: { oldField: "25", field: 25, },
            },
        };
        deepDeltaValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                // fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
                },
            // oldValue2: "aValue",
            oldValue3: {
                // fieldParam: 10,
                fieldParam2: 10,
                newValue2: {
                    // oldField: 25,
                    field: 25,
                },
            },
        };

        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        if (boxedProxy._$ !== boxedProxy) {
            const tmp = 0;
        }
        boxedProxy.oldValue_$.newValue1_$[_$] = 5;
        if (boxedProxy._$ !== boxedProxy) {
            const tmp = 0;
        }
        boxedProxy.oldValue1_$.newValue1_$[5] = 15;
        if (boxedProxy._$ !== boxedProxy) {
            const tmp = 0;
        }
        boxedProxy.oldValue1_$.newValue2_$.field = 25;
        if (boxedProxy._$ !== boxedProxy) {
            const tmp = 0;
        }
        boxedProxy.oldValue3_$.fieldParam_$ = 10;
        boxedProxy.oldValue3_$.fieldParam2_$ = 10;
        boxedProxy.oldValue3_$.newValue2_$["field"] = 25;
        if (boxedProxy._$ !== boxedProxy) {
            const tmp = 0;
        }
    });

    test('is proxied', () => {
        expect(boxedProxy).not.toBe(undefined);
    });

    test('._$ proxy === proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value !== original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value == modified', () => {
        expect(boxedVal.value).toEqual(expectedValue);
    });

    test('modified$_$ is value', () => {
        expect(boxedProxy.modified$_$).toBe(boxedVal.value);
    });

    test('delta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('delta$_$ == delta', () => {
        expect(boxedProxy.delta$_$).toEqual(deltaValue);
    });

    test('deepDelta$_$ !== delta', () => {
        expect(boxedProxy.deepDelta$_$).not.toEqual(boxedProxy.delta$_$);
    });

    test('deepDelta$_$ == deepDelta', () => {
        expect(boxedProxy.deepDelta$_$).toEqual(deepDeltaValue);
    });
});

describe('Boxed Deep Nested delta Mods', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let expectedValue;
    let deltaValue;
    let origDeltaValue;
    let deepDeltaValue;
    let origDeepDeltaValue;

    beforeAll(() => {
        let vals = createBoxed({
            oldValue: "old",
            oldValue1: {
                fieldParam: 5,
            },
            oldValue2: "aValue",
            oldValue3: {
                fieldParam: 10,
                fieldParam2: "10",
                newValue2: { oldField: "25", },
            },
        });

        const arr = [];
        arr[5] = 15;

        expectedValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
            },
            oldValue2: "aValue",
            oldValue3: {
                fieldParam: 10,
                fieldParam2: 10,
                newValue2: { oldField: "25", field: 25, },
            },
        };

        deltaValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
            },
            // oldValue2: "aValue",
            oldValue3: {
                fieldParam: 10,
                fieldParam2: 10,
                newValue2: { oldField: "25", field: 25, },
            },
        };

        origDeltaValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
            },
            // oldValue2: "aValue",
            oldValue3: {
                fieldParam: 10,
                fieldParam2: 10,
                newValue2: { oldField: "25", field: 25, },
            },
        };

        deepDeltaValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                // fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
                },
            // oldValue2: "aValue",
            oldValue3: {
                // fieldParam: 10,
                fieldParam2: 10,
                newValue2: {
                    // oldField: 25,
                    field: 25,
                },
            },
        };


        origDeepDeltaValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                // fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
                },
            // oldValue2: "aValue",
            oldValue3: {
                // fieldParam: 10,
                fieldParam2: 10,
                newValue2: {
                    // oldField: 25,
                    field: 25,
                },
            },
        };


        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        boxedProxy.delta$_$ = deltaValue;

        if (boxedProxy._$ !== boxedProxy) {
            const tmp = 0;
        }
    });

    test('is proxied', () => {
        expect(boxedProxy).not.toBe(undefined);
    });

    test('._$ proxy === proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value !== original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value == modified', () => {
        expect(boxedVal.value).toEqual(expectedValue);
    });

    test('modified$_$ is value', () => {
        expect(boxedProxy.modified$_$).toBe(boxedVal.value);
    });

    test('delta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('delta$_$ == delta', () => {
        expect(boxedProxy.delta$_$).toEqual(deltaValue);
    });

    test('delta param not modified', () => {
        expect(deltaValue).toEqual(origDeltaValue);
    });

    test('deepDelta$_$ == delta', () => {
        expect(boxedProxy.deepDelta$_$).toEqual(boxedProxy.delta$_$);
    });

    test('deepDelta$_$ == delta', () => {
        expect(boxedProxy.deepDelta$_$).toEqual(deltaValue);
    });

    test('deepDelta param not modified', () => {
        expect(deepDeltaValue).toEqual(origDeepDeltaValue);
    });
});

describe('Boxed Deep Nested deepDelta Mods', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let expectedValue;
    let deltaValue;
    let deepDeltaValue;
    let origDeepDeltaValue;

    beforeAll(() => {
        let vals = createBoxed({
            oldValue: "old",
            oldValue1: {
                fieldParam: 5,
            },
            oldValue2: "aValue",
            oldValue3: {
                fieldParam: 10,
                fieldParam2: "10",
                newValue2: { oldField: "25", },
            },
        });

        const arr = [];
        arr[5] = 15;

        expectedValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
            },
            oldValue2: "aValue",
            oldValue3: {
                fieldParam: 10,
                fieldParam2: 10,
                newValue2: { oldField: "25", field: 25, },
            },
        };

        deltaValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
            },
            // oldValue2: "aValue",
            oldValue3: {
                fieldParam: 10,
                fieldParam2: 10,
                newValue2: { oldField: "25", field: 25, },
            },
        };

        deepDeltaValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                // fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
                },
            // oldValue2: "aValue",
            oldValue3: {
                // fieldParam: 10,
                fieldParam2: 10,
                newValue2: {
                    // oldField: 25,
                    field: 25,
                },
            },
        };


        origDeepDeltaValue = {
            oldValue: { newValue1: [5] },
            oldValue1: {
                // fieldParam: 5,
                newValue1: arr,
                newValue2: { field: 25, },
                },
            // oldValue2: "aValue",
            oldValue3: {
                // fieldParam: 10,
                fieldParam2: 10,
                newValue2: {
                    // oldField: 25,
                    field: 25,
                },
            },
        };


        origVal = vals.origVal;
        boxedVal = vals.boxedVal;
        boxedProxy = vals.boxedProxy;
        boxedProxy.deepDelta$_$ = deepDeltaValue;

        if (boxedProxy._$ !== boxedProxy) {
            const tmp = 0;
        }
    });

    test('is proxied', () => {
        expect(boxedProxy).not.toBe(undefined);
    });

    test('._$ proxy === proxy', () => {
        expect(boxedProxy._$).toBe(boxedProxy);
    });

    test('valueOf() === value', () => {
        expect(boxedVal.valueOf()).toBe(boxedVal.value);
    });

    test('value !== original', () => {
        expect(boxedVal.value).not.toBe(origVal);
    });

    test('value == modified', () => {
        expect(boxedVal.value).toEqual(expectedValue);
    });

    test('modified$_$ is value', () => {
        expect(boxedProxy.modified$_$).toBe(boxedVal.value);
    });

    test('delta$_$ !== value', () => {
        expect(boxedProxy.delta$_$).not.toBe(boxedVal.value);
    });

    test('delta$_$ == delta', () => {
        expect(boxedProxy.delta$_$).toEqual(deltaValue);
    });

    test('deepDelta$_$ !== delta', () => {
        expect(boxedProxy.deepDelta$_$).not.toEqual(boxedProxy.delta$_$);
    });

    test('deepDelta$_$ == deepDelta', () => {
        expect(boxedProxy.deepDelta$_$).toEqual(deepDeltaValue);
    });

    test('deepDelta param not modified', () => {
        expect(deepDeltaValue).toEqual(origDeepDeltaValue);
    });
});

