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
const toTypeString = testUtil.toTypeString;
const boxOut = util.boxOut;
const BREAK = util.BREAK;

function array(arr, props) {
    if (props) {
        for (let key in props) {
            if (props.hasOwnProperty(key)) {
                arr[key] = props[key];
            }
        }
    }

    return [JSON.stringify(arr), arr];
}

function object(arr, props) {
    const obj = {};

    let iMax = arr.length;
    for (let i = 0; i < iMax; i++) {
        obj[i] = arr[i];
    }

    if (props) {
        for (let key in props) {
            if (props.hasOwnProperty(key)) {
                obj[key] = props[key];
            }
        }
    }

    return [JSON.stringify(obj), obj];
}

each([
    array([]),
    array([], { prop: 'field', "-1": -1 }),
    array([undefined]),
    array([undefined], { prop: 'field', "-1": -1 }),
    array([1]),
    array([1], { prop: 'field', "-1": -1 }),
    array([1, 2]),
    array([1, 2], { prop: 'field', "-1": -1 }),
    array([1, 2, undefined]),
    array([1, 2, undefined], { prop: 'field', "-1": -1 }),
    array([1, 2, undefined, 4]),
    array([1, 2, undefined, 4], { prop: 'field', "-1": -1 }),
])
    .describe('boxedOut(%s)', (valueText, value) => {
        test(`.eachKey(${valueText}) all key values called`, () => {
            const expected = {};

            for (let key in value) {
                if (value.hasOwnProperty(key)) {
                    expected[key] = {
                        value: value[key],
                        key: util.toArrayIndex(key),
                        collection: value,
                    };
                }
            }

            const accum = {};

            boxOut(value).eachKey((value, key, collection) => {
                accum[key] = { value: value, key: key, collection: collection };
            });

            expect(accum).toEqual(expected);
        });

        test(`.eachKey(${valueText}) break`, () => {
            const expected = [];

            const accum = [];

            const result = boxOut(value).eachKey((value, key, collection) => {
                accum.push({ value: value, key: key, collection: collection });
                return BREAK(key);
            });
            accum.push(result);

            expected.push(accum[0]);
            if (accum[0]) expected.push(accum[0].key);

            expect(accum).toEqual(expected);
        });

        test(`.each(${valueText}) called in order`, () => {
            const expected = [];

            const indexKeys = [];
            const objectKeys = [];
            for (let key in value) {
                if (value.hasOwnProperty(key)) {
                    if (util.isArrayIndex(key)) {
                        indexKeys.push(util.toNumber(key));
                    } else {
                        objectKeys.push(key);
                    }
                }
            }

            indexKeys.sort((a, b) => a - b);
            objectKeys.sort();

            let iMax = indexKeys.length;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: value[indexKeys[i]],
                    key: util.toArrayIndex(indexKeys[i]),
                    collection: value,
                });
            }

            iMax = objectKeys.length;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: value[objectKeys[i]],
                    key: util.toArrayIndex(objectKeys[i]),
                    collection: value,
                });
            }

            const accum = [];

            boxOut(value).each((value, key, collection) => {
                accum.push({ value: value, key: key, collection: collection });
            });

            expect(accum).toEqual(expected);
        });

        test(`.reduceLeft(${valueText}) called in order`, () => {
            const expected = [];

            const indexKeys = [];
            const objectKeys = [];
            for (let key in value) {
                if (value.hasOwnProperty(key)) {
                    if (util.isArrayIndex(key)) {
                        indexKeys.push(util.toNumber(key));
                    } else {
                        objectKeys.push(key);
                    }
                }
            }

            indexKeys.sort((a, b) => a - b);
            objectKeys.sort();

            let iMax = indexKeys.length;
            let reduced;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: value[indexKeys[i]],
                    key: util.toArrayIndex(indexKeys[i]),
                    collection: value,
                    reduced: reduced,
                });

                reduced = reduced !== undefined ? reduced + "," + value[indexKeys[i]] : value[indexKeys[i]];
            }

            iMax = objectKeys.length;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: value[objectKeys[i]],
                    key: util.toArrayIndex(objectKeys[i]),
                    collection: value,
                    reduced: reduced,
                });

                reduced = reduced !== undefined ? reduced + "," + value[objectKeys[i]] : value[objectKeys[i]];
            }

            const accum = [];

            boxOut(value).reduceLeft((reduced, value, key, collection) => {
                accum.push({
                    value: value,
                    key: key,
                    collection: collection,
                    reduced: reduced,
                });
                return reduced !== undefined ? reduced + "," + value : value;
            });

            expect(accum).toEqual(expected);
        });

        test(`.eachRev(${valueText}) called in order`, () => {
            const expected = [];

            const indexKeys = [];
            const objectKeys = [];
            for (let key in value) {
                if (value.hasOwnProperty(key)) {
                    if (util.isArrayIndex(key)) {
                        indexKeys.push(util.toNumber(key));
                    } else {
                        objectKeys.push(key);
                    }
                }
            }

            indexKeys.sort((a, b) => b - a);
            objectKeys.sort().reverse();
            let iMax;

            iMax = objectKeys.length;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: value[objectKeys[i]],
                    key: util.toArrayIndex(objectKeys[i]),
                    collection: value,
                });
            }

            iMax = indexKeys.length;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: value[indexKeys[i]],
                    key: util.toArrayIndex(indexKeys[i]),
                    collection: value,
                });
            }

            const accum = [];

            boxOut(value).eachRev((value, key, collection) => {
                accum.push({ value: value, key: key, collection: collection });
            });

            expect(accum).toEqual(expected);
        });

        test(`.reduceRight(${valueText}) called in order`, () => {
            const expected = [];

            const indexKeys = [];
            const objectKeys = [];
            for (let key in value) {
                if (value.hasOwnProperty(key)) {
                    if (util.isArrayIndex(key)) {
                        indexKeys.push(util.toNumber(key));
                    } else {
                        objectKeys.push(key);
                    }
                }
            }

            indexKeys.sort((a, b) => b - a);
            objectKeys.sort().reverse();
            let iMax;

            iMax = objectKeys.length;
            let reduced;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: value[objectKeys[i]],
                    key: util.toArrayIndex(objectKeys[i]),
                    collection: value,
                    reduced: reduced,
                });

                reduced = reduced !== undefined ? reduced + "," + value[objectKeys[i]] : value[objectKeys[i]];
            }

            iMax = indexKeys.length;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: value[indexKeys[i]],
                    key: util.toArrayIndex(indexKeys[i]),
                    collection: value,
                    reduced: reduced,
                });

                reduced = reduced !== undefined ? reduced + "," + value[indexKeys[i]] : value[indexKeys[i]];
            }

            const accum = [];

            boxOut(value).reduceRight((reduced, value, key, collection) => {
                accum.push({
                    value: value,
                    key: key,
                    collection: collection,
                    reduced: reduced,
                });
                return reduced !== undefined ? reduced + "," + value : value;
            });

            expect(accum).toEqual(expected);
        });
    });

each([
    object([]),
    object([], { prop: 'field', "-1": -1 }),
    object([undefined]),
    object([undefined], { prop: 'field', "-1": -1 }),
    object([1]),
    object([1], { prop: 'field', "-1": -1 }),
    object([1, 2]),
    object([1, 2], { prop: 'field', "-1": -1 }),
    object([1, 2, undefined]),
    object([1, 2, undefined], { prop: 'field', "-1": -1 }),
    object([1, 2, undefined, 4]),
    object([1, 2, undefined, 4], { prop: 'field', "-1": -1 }),
])
    .describe('boxedOut(%s)', (valueText, value) => {
        test(`.eachKey(${valueText}) all key values called`, () => {
            const expected = {};

            for (let key in value) {
                if (value.hasOwnProperty(key)) {
                    expected[key] = {
                        value: value[key],
                        key: util.toArrayIndex(key),
                        collection: value,
                    };
                }
            }

            const accum = {};

            boxOut(value).eachKey((value, key, collection) => {
                accum[key] = { value: value, key: key, collection: collection };
            });

            expect(accum).toEqual(expected);
        });

        test(`.eachKey(${valueText}) break`, () => {
            const expected = [];

            const accum = [];

            const result = boxOut(value).eachKey((value, key, collection) => {
                accum.push({ value: value, key: key, collection: collection });
                return BREAK(key);
            });
            accum.push(result);

            expected.push(accum[0]);
            if (accum[0]) expected.push(accum[0].key);

            expect(accum).toEqual(expected);
        });

        test(`.each(${valueText}) called in order`, () => {
            const expected = [];

            const indexKeys = [];
            const objectKeys = [];
            for (let key in value) {
                if (value.hasOwnProperty(key)) {
                    if (util.isArrayIndex(key)) {
                        indexKeys.push(util.toNumber(key));
                    } else {
                        objectKeys.push(key);
                    }
                }
            }

            indexKeys.sort((a, b) => a - b);
            objectKeys.sort();

            let iMax = indexKeys.length;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: value[indexKeys[i]],
                    key: util.toArrayIndex(indexKeys[i]),
                    collection: value,
                });
            }

            iMax = objectKeys.length;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: value[objectKeys[i]],
                    key: util.toArrayIndex(objectKeys[i]),
                    collection: value,
                });
            }

            const accum = [];

            boxOut(value).each((value, key, collection) => {
                accum.push({ value: value, key: key, collection: collection });
            });

            expect(accum).toEqual(expected);
        });

        test(`.reduceLeft(${valueText}) called in order`, () => {
            const expected = [];

            const indexKeys = [];
            const objectKeys = [];
            for (let key in value) {
                if (value.hasOwnProperty(key)) {
                    if (util.isArrayIndex(key)) {
                        indexKeys.push(util.toNumber(key));
                    } else {
                        objectKeys.push(key);
                    }
                }
            }

            indexKeys.sort((a, b) => a - b);
            objectKeys.sort();

            let iMax = indexKeys.length;
            let reduced;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: value[indexKeys[i]],
                    key: util.toArrayIndex(indexKeys[i]),
                    collection: value,
                    reduced: reduced,
                });

                reduced = reduced !== undefined ? reduced + "," + value[indexKeys[i]] : value[indexKeys[i]];
            }

            iMax = objectKeys.length;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: value[objectKeys[i]],
                    key: util.toArrayIndex(objectKeys[i]),
                    collection: value,
                    reduced: reduced,
                });

                reduced = reduced !== undefined ? reduced + "," + value[objectKeys[i]] : value[objectKeys[i]];
            }

            const accum = [];

            boxOut(value).reduceLeft((reduced, value, key, collection) => {
                accum.push({
                    value: value,
                    key: key,
                    collection: collection,
                    reduced: reduced,
                });
                return reduced !== undefined ? reduced + "," + value : value;
            });

            expect(accum).toEqual(expected);
        });

        test(`.eachRev(${valueText}) called in order`, () => {
            const expected = [];

            const indexKeys = [];
            const objectKeys = [];
            for (let key in value) {
                if (value.hasOwnProperty(key)) {
                    if (util.isArrayIndex(key)) {
                        indexKeys.push(util.toNumber(key));
                    } else {
                        objectKeys.push(key);
                    }
                }
            }

            indexKeys.sort((a, b) => b - a);
            objectKeys.sort().reverse();
            let iMax;

            iMax = objectKeys.length;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: value[objectKeys[i]],
                    key: util.toArrayIndex(objectKeys[i]),
                    collection: value,
                });
            }

            iMax = indexKeys.length;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: value[indexKeys[i]],
                    key: util.toArrayIndex(indexKeys[i]),
                    collection: value,
                });
            }

            const accum = [];

            boxOut(value).eachRev((value, key, collection) => {
                accum.push({ value: value, key: key, collection: collection });
            });

            expect(accum).toEqual(expected);
        });

        test(`.reduceRight(${valueText}) called in order`, () => {
            const expected = [];

            const indexKeys = [];
            const objectKeys = [];
            for (let key in value) {
                if (value.hasOwnProperty(key)) {
                    if (util.isArrayIndex(key)) {
                        indexKeys.push(util.toNumber(key));
                    } else {
                        objectKeys.push(key);
                    }
                }
            }

            indexKeys.sort((a, b) => b - a);
            objectKeys.sort().reverse();
            let iMax;

            iMax = objectKeys.length;
            let reduced;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: value[objectKeys[i]],
                    key: util.toArrayIndex(objectKeys[i]),
                    collection: value,
                    reduced: reduced,
                });

                reduced = reduced !== undefined ? reduced + "," + value[objectKeys[i]] : value[objectKeys[i]];
            }

            iMax = indexKeys.length;
            for (let i = 0; i < iMax; i++) {
                expected.push({
                    value: value[indexKeys[i]],
                    key: util.toArrayIndex(indexKeys[i]),
                    collection: value,
                    reduced: reduced,
                });

                reduced = reduced !== undefined ? reduced + "," + value[indexKeys[i]] : value[indexKeys[i]];
            }

            const accum = [];

            boxOut(value).reduceRight((reduced, value, key, collection) => {
                accum.push({
                    value: value,
                    key: key,
                    collection: collection,
                    reduced: reduced,
                });
                return reduced !== undefined ? reduced + "," + value : value;
            });

        });
    });

