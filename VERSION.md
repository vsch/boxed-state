# Version History

[TOC]: # " "

- [0.7.2](#072)
- [0.7.0](#070)
- [0.6.0](#060)
- [0.5.8](#058)
- [0.5.6](#056)
- [0.5.4](#054)
- [0.5.2](#052)
- [0.5.0](#050)
- [0.4.3](#043)
- [Next: 0.4.2](#next-042)
- [Next: 0.4.0](#next-040)
- [0.3.2](#032)
- [0.3.0](#030)
- [0.2.8](#028)
- [0.2.6](#026)
- [0.2.4](#024)
- [0.2.2](#022)
- [0.2.0](#020)
- [0.1.6](#016)
- [0.1.5](#015)
- [0.1.4](#014)
- [0.1.3](#013)
- [0.1.2](#012)
- [0.1.1](#011)
- [0.1.0](#010)


## 0.7.2

* Change: by default only box values which are either non-object like or are pure `Array` or
  `Object`. This will store all others by reference. If the properties of particular class are
  desired to be persisted then define a custom box with your `canBox` function to test which
  values should be boxed.

  ```javascript
      const boxedImmutable = require('boxed-immutable');
      const createBox = boxedImmutable.createBox;
      const defaultCanBox = boxedImmutable.defaultCanBox;
      
      const _$ = createBox({
        canBox(value, prop, collection) {
            return value instanceof YourType || defaultCanBox(value);
        }
    });
  ```

## 0.7.0

* Change: move `boxed-out` implementation to own module `boxed-out`.
* Add: `canBox` function(value) property to box context if return tests `true` then value will
  not be boxed and assumed to handle its own immutability and change tracking. This allows
  references whose properties are not copied.
* Remove: exports from dependent modules
* Rename: util to boxed-out and export a single function
* Change: tests to use dependent modules

## 0.6.0

* Change: factor out object each, filter, map, etc into own module: `obj-each-break`
* Change: `eachRev` to `eachRight` for orthogonality to forEach, map, filter from `for-each-break`

## 0.5.8

* Change: `for-each-break` dependency version

## 0.5.6

* Change: factor out more type related util functions to `util-type-funcs`

## 0.5.4

* Change: factor out type test and conversion related util functions to own module
  `util-type-funcs`, these are re-exported from util and marked deprecated for now.

## 0.5.2

* Change: factor out string wrap related util functions to own module `util-string-wrap`, these
  are re-exported from util and marked deprecated for now.

## 0.5.0

* Change: rename util functions

## 0.4.3

* Add: `util.firstValid(args)`

## Next: 0.4.2

* Add: `$_array` to always return a boxed-out proxy of an array value, non-array values
  (including objects) will be wrapped in an array, invalid values return `[]`.

* Add: `$_object` to always return a boxed-out proxy of an object value, if value is an array
  its own properties will be copied to the object, all others return `{}`.

## Next: 0.4.0

* Change: Remove "" as array end and match all transforms. Use only "_$" instead to prevent ""
  from not being usable as a general property.
* Fix: set prop did not unbox boxed values which were passed in.
* Add: `.$_path` and `.path_$` take string argument and interpret is as a nested property path,
  return final proxy or value.
* Add: second arg to path, uses it to set before returning. If val sets, if func sets it to
  returned value, if no extra args passes boxed-out or boxed-in proxy to func, if extra args,
  passes boxed-out proxy value for `.path_$` and value for `.$_path` as this, rest of args as args.
* [ ] ToDo: Document above change.

## 0.3.2

* Add: `.withBoxOptions(options)` function to box creation functions so that a transforms
  customized box can be created from a single box function without needing to create one for
  each type of transform.
* Add: box options to `boxState(getState, saveState, options)` so that it will create customized
  boxes if any box specific options are passed in options. Eliminates the need to have a custom
  created box to provide transforms.

## 0.3.0

* Change: completely reworked the concept and implementation to make it less error prone and
  work with IDE completions for properties. Adding a suffix to a property in previous
  implementation would break the IDE completions and was a pain to type in.
* Add: start a wiki for the project
* Change: Move most of the readme file to wiki
* Add: Transforms to transform the object state either on load state or on property
  modification. [Transforms](https://github.com/vsch/boxed-immutable/wiki/Transforms)

## 0.2.8

* Add: `boxedValue_$[""] = value;` as a synonym for `boxedValue_$[_$] = value;`

## 0.2.6

* Add: name to Boxed.boxedWith so ._$ function has a name

## 0.2.4

* Fix: result for non-object, or function for `getOwnPropertyDescriptor()`

## 0.2.2

* Fix: exception if `getOwnPropertyNames()` is called on boxed object with null or undefined
  value. Also, boxed properties of string value will not report char indices for own properties
  as is done by Object.keys for string argument.

## 0.2.0

* Fix: forEach$ did not box item passed to callback.
* Delete: `.forEach$` magic property. Was not debugged and not thought through. `.forEachKey$()`
  and `.forEachKey$_$()` instead.

* Change: magic wrapped properties can be accessed with or without the parameter prefix/suffix
  wrapper. Having both was not relevant since the magic property would hide its unwrapped
  counterpart and only made mode typing necessary.

  Now `_$().unboxed$` and `_$().unboxed$_$` are the same. However, some magic properties have
  meaning attached to a parameter wrapped version. For example: `var_$.forEachKey$` provides
  `(key, _$var[key]` to callback and `_$().forEachKey$_$()` provides `(key, _$var[key + "_$"])`,
  the latter being the boxed property. Which makes sense based on the `_$` suffix convention of
  this library.

  Another is `default$(val)` sets to `val` if was undefined, returns unboxed value.
  `default$_$(val)` sets to `val` if was undefined, returns boxed proxy for chaining. Quick way
  to set defaults then proceed to modify them.

* Add: `boolean$` magic, returns boolean of value, when you absolutely need a boolean and
  `undefined`, `null` and other stuff won't do. `_$().boolean$ = value` will convert `value` to
  boolean before setting. `boolean$` and `boolean$_$` are equivalent.

* Change: `arrayDeepDeltaPartials` default to `true`

## 0.1.6

* Fix: setting null values would cause NPE.
* Fix: unbound functions would sometimes fail

## 0.1.5

* Change: move function to util

## 0.1.4

* Fix: deep delta would not include properties for which proxy was created after the property
  was already modified in the parent.
* Add: `default$_$` magic property which only changes value if it is `undefined`, otherwise a
  noop. Use: `boxed.field_$.default$_$ = value;` or `boxed.field_$.default$_$(value)`
* Add: `boxState` proxy wrapper to allow creating a boxed state with `save()` and `cancel()`
  methods. It provides a new copy of the state if it has changed from last access.

## 0.1.3

* Fix: remove endsWith/startsWith on strings. Need to get babel and polyfill presets figured
  out. for now works in a react app.

## 0.1.2

* Fix: clean out node_modules to detect extraneous requires which are not used

## 0.1.1

* Fix: remove straggler export keyword

## 0.1.0

* First functional release. Needs more tests.

