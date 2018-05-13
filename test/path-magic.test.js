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

describe('Path tests', () => {
    let origVal;
    let boxedVal;
    let boxedProxy;
    let vals;

    const original = {
        path1: "path1",
        path2: { path1: "path2.path1" },
        path3: { path2: { path1: "path3.path2.path1" } },
    };

    jestEach([
        ['path1'],
        ['path2.path1'],
        ['path3.path2.path1'],
    ])
        .describe("%s", (path) => {

            beforeEach(() => {
                vals = createBoxed(original);
                origVal = vals.origVal;
                boxedVal = vals.boxedVal;
                boxedProxy = vals.boxedProxy;
            });

            test(`path_$(${path}) isBoxedInProxy`, () => {
                let pathVal = boxedProxy.path_$(path);
                expect(!!isBoxedInProxy(pathVal)).toBe(true);
            });

            test(`path_$(${path}) === ${path}`, () => {
                let pathVal = boxedProxy.path_$(path);
                expect(pathVal.$_value).toBe(path);
            });

            test(`path_$(${path}, (val)=>'prefix.' + val) === prefix.${path}`, () => {
                let pathVal = boxedProxy.path_$(path, (val) => 'prefix.' + val());
                expect(pathVal.$_value).toBe('prefix.' + path);
            });

            test(`path_$(${path})._$ = 'prefix.'+ ${path} === prefix.${path}`, () => {
                let pathVal = boxedProxy.path_$(path)('prefix.' + path);
                // let pathVal = boxedProxy.path_$(path);
                expect(pathVal.$_value).toBe('prefix.' + path);
            });

            test(`path_$(${path}).$_value = 'prefix.'+ ${path} === prefix.${path}`, () => {
                boxedProxy.path_$(path).$_value = 'prefix.' + path;
                let pathVal = boxedProxy.path_$(path);
                expect(pathVal.$_value).toBe('prefix.' + path);
            });

            test(`path_$(${path}, String.prototype.toUpperCase, undefined) === prefix.${path}`, () => {
                let pathVal = boxedProxy.path_$(path, String.prototype.toUpperCase, undefined);
                expect(pathVal()).toBe(path.toUpperCase());
            });

            test(`$_path(${path}) === ${path}`, () => {
                let pathVal = boxedProxy.$_path(path);
                expect(pathVal).toBe(path);
            });

            test(`$_path(${path}, (val)=>'prefix.' + val) === prefix.${path}`, () => {
                let pathVal = boxedProxy.$_path(path, (val) => 'prefix.' + val);
                expect(pathVal).toBe('prefix.' + path);
            });

            test(`$_path(${path}, String.prototype.toUpperCase, undefined) === prefix.${path}`, () => {
                let pathVal = boxedProxy.$_path(path, String.prototype.toUpperCase, undefined);
                expect(pathVal).toBe(path.toUpperCase());
            });
        });
});

test(`$_path(), returning function is not a proxy`, () => {
    let vals = createBoxed({ func: () => {} });
    let origVal = vals.origVal;
    let boxedVal = vals.boxedVal;
    let boxedProxy = vals.boxedProxy;

    let pathVal = boxedProxy.$_path('func');
    expect(!!isBoxedProxy(pathVal)).toBe(false);
});
