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

    each([
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

