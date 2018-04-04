# Version History


[TOC]: # " "

- [0.1.4](#014)
- [0.1.3](#013)
- [0.1.2](#012)
- [0.1.1](#011)
- [0.1.0](#010)


## 0.1.4

* Fix: deep delta would not include properties for which proxy was created after the property
  was already modified in the parent.
* Add: `default$_$` magic property which only changes value if it is `undefined`, otherwise a
  noop. Use: `boxed.field_$.default$_$ = value;` or `boxed.field_$.default$_$(value)`
* Add: `boxOnDemand` proxy wrapper to allow creating a boxed state with `save()` and
  `cancel()` methods. It provides a new copy of the state if it has changed from last access.

## 0.1.3

* Fix: remove endsWith/startsWith on strings. Need to get babel and polyfill presets figured
  out. for now works in a react app.

## 0.1.2

* Fix: clean out node_modules to detect extraneous requires which are not used

## 0.1.1

* Fix: remove straggler export keyword

## 0.1.0

* First functional release. Needs more tests.

