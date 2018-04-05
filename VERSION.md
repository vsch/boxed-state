# Version History


[TOC]: # " "

- [0.2.0](#020)
- [0.1.6](#016)
- [0.1.5](#015)
- [0.1.4](#014)
- [0.1.3](#013)
- [0.1.2](#012)
- [0.1.1](#011)
- [0.1.0](#010)


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
* Add: `boxOnDemand` proxy wrapper to allow creating a boxed state with `save()` and `cancel()`
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

