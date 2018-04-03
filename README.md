# boxed-immutable

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Immutable proxy wrapper with auto-vivification of intermediate objects/arrays with syntactic
sugar to keep access/modification to deeply nested properties looking almost the same as plain
object property access.

## Install

Use [npm](https://npmjs.com/) to install.

```sh
npm install boxed-immutable --save
```

## Usage

[![NPM](https://nodei.co/npm/boxed-immutable.png)](https://www.npmjs.com/package/boxed-immutable)

Create a boxed-immutable object proxy then access and/or modify its nested properties, ignoring
whether intermediate values are objects/arrays or whether they exist.

Original object/array are shallow copied on first modification (all the way back to the root
collection), thereafter all mods are done on the copy. This occurs at every level so minimal
copying is done on all modifications and any unmodified values are re-used.

Subsequent modifications will be done on a copy. Once a copy is made it is re-used for the life
of the boxed object since it is detached from the original.

Access to object's original properties occurs in two ways:

1. Use original property name to get access to the raw underlying object's property value.
   Trying to access a field or array index when the property is not valid will throw
   `TypeError`.
2. Use original property name with `_$` appended to the end of it to get access to a proxy which
   will auto-vivify the property container when the first property is set.

Use option 1 to access leaf values in the object since JavaScript handles this nicely.

Use option 2 to access intermediate properties.

```javascript
const _$ = require('boxed-immutable')._$;

function updateState(confirmationName, confirmationValue) {
    let state = _$(this.getState());

    state.fieldStatus = 5; // direct access to first level field, state will be copied if field's value !== 5 
    
    // can hold intermediate values for easy access 
    const confirmationData = state.properties_$.confirmations_$[confirmationName + "_$"]; // add _$ to get boxed proxy
    confirmationData.count = 1 + (confirmationData.count || 0);
    confirmationData.value = confirmationValue;
    
    // get all the first level children to update state
    this.setState(state.delta$_$);
    
    // get only the changed leaf fields and their parents, minimal update image
    this.setState(state.deepDelta$_$);
}
```

Use it to safely access deeply nested values without throwing `TypeError`:

```javascript
let boxed = _$(someValue);

// anything accessed via proxied properties (ending in _$) could be undefined, null, or anything that would throw a TypeError, the result is undefined
let caption = boxed.appState_$.dashboard_$[dashboardName + "_$"].captionText || 'default caption';

// would work just as well
let boxed = _$(undefined);

// everything could be completely empty, the end result is undefined
let caption = boxed.appState_$.dashboard_$[dashboardName + "_$"].captionText || 'default caption';

```

### Auto-Vivication of intermediate properties

When setting properties on non-existent or non-array or object properties the proxy will
auto-create the array or object, ie. auto-vivify it.

Auto-vivication takes the property name into account: integers whether numbers or numbers in
strings will create an `Array`, everything else will create an `Object`.

You can use the special `end of array` value of `"_$"` or just the global box `_$` or `._$`
property on any boxed value when setting an array property to have the value added to the end of
the array. Effectively, `_$` is always equal to the length of the array.

```javascript
let empty = _$();

// all are equivalent
empty["_$"] = 5;
empty[_$] = 5;
empty._$ = 5;  // if you know its empty can also do empty[0] however if you are wrong then the latter will overwrite the value at 0
// result: [5]

empty._$ = 10;
// result: [5, 10]

empty._$ = 20;
let result = empty.unboxed$_$;
// result: [5, 10, 20]
```

The following will create an object:

```javascript
let empty = _$();

// all are equivalent
empty["field"] = 5;
empty.field = 5; 
// result: {field: 5}

empty._$ = 10;
// result: [5, 10]

empty._$ = 20;
let result = empty.unboxed$_$;
// result: [5, 10, 20]
```

For symmetry, you can also use `_$` on objects. In case of objects `_$` is equal to the greatest
integer key in the object or 0 if no integer keys. Here is why:

```javascript

let obj = {};

obj.prop = "a";
obj[0] = 5;
obj[1] = 15;
obj[2] = 25;
let result = obj.unboxed$_$;
// result: {0: 5, 1:15, 2:25, prop: "a"}

// the same can be achieved with
obj.prop = "a";
obj[_$] = 5;
obj[_$] = 15;
obj[_$] = 25;
```

### Options

You can change a couple of options on how the boxing handles properties whose value is
`undefined` and also modify the prefix/suffix used for accessing boxed properties:

Use the `createBox(options)` function from the module to create a boxing function with
non-default options:

```javascript
const createBox = require('boxed-immutable').createBox;
const $__$ = createBox({prefixChars: "$_", suffixChars:"_$"});

// Now all your properties are wrapped 
let obj = $__$();

obj.$_field_$.subField = 4;
obj.$_prop_$[$__$] = "a";
obj.$_prop_$[$__$] = "b";
obj.$_prop_$[$__$] = "c";

let result = obj.$_unboxed$_$;
// result: { field: { subField: 4 }, prop: [ "a", "b", "c"] };
```

| Option                             | Default     | Description                                                                              |
|:-----------------------------------|:------------|:-----------------------------------------------------------------------------------------|
| `deleteEmptyCollections:`          | `true`      | if deleting a property results in an empty collection, delete that too                   |
| `ignoreUndefinedProperties:`       | `true`      | when copying delta and deepDelta ignore properties with `undefined` value                |
| `arrayDeltaObjects:`               | `false`     | return array delta as objects with index as key                                          |
| `arrayDeltaObjectMarker:`          | `undefined` | field name to set when returning array delta as objects, `undefined` means don't set     |
| `arrayDeltaObjectMarkerValue:`     | `undefined` | value for above                                                                          |
| `arrayDeltaPartials:`              | `false`     | return array delta as partials, any unset indices will be `undefined`                    |
| `arrayDeepDeltaObjects:`           | `false`     | return array deepDelta as objects with index as key                                      |
| `arrayDeepDeltaObjectMarker:`      | `undefined` | field name to set when returning array deepDelta as objects, `undefined` means don't set |
| `arrayDeepDeltaObjectMarkerValue:` | `undefined` | value for above                                                                          |
| `arrayDeepDeltaPartials:`          | `false`     | return array deepDelta as partials, any unset indices will be `undefined`                |
| `prefixChars:`<sup>\[1]</sup>      | `""`        | prefix for boxed properties.                                                             |
| `suffixChars:`<sup>\[1]</sup>      | `"_$"`      | suffix for boxed properties.                                                             |
| `magicPrefixChars:`<sup>\[1]</sup> | `""`        | prefix for magic properties, applied after prefixChars                                   |
| `magicSuffixChars:`<sup>\[1]</sup> | `"$"`       | suffix for magic properties, applied before suffixChars                                  |

\* \[1]: Note use of `[_$]` is not affected by prefixes or suffixes since the function is passed
as property, use of `["_$"]` and `._$` has to have the prefix/suffix used in the options for the
box context

## API

Change `_$` to your combination of prefix/suffix if modifying defaults.

With default settings all magic properties except `_$` get an extra `$` added because of the
default `magicSuffixChars` being `"$"`

Magic Properties of boxed properties:

| Property       | Get                                                                                       | Set                                                                                     | Delete                    | Call                                                                                                            |
|:---------------|:------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------|:--------------------------|:----------------------------------------------------------------------------------------------------------------|
| `_$`           | proxy of the boxed object, ie.  boxed === boxed.\_$, so you can do boxed.\_$() or boxed() | append end of array                                                                     | error                     | does a call or first use as `boxed._$(_$ => { });` returns `boxed`                                              |
| `forEach$_$`   | function                                                                                  | error                                                                                   | error                     | functions executes callback for each own property, passes  `.forEach_$((boxedValue, prop, unboxedValue) =>{});` |
| `unboxed$_$`   | unboxed value                                                                             | set value of boxed property and mark as modified                                        | delete property in parent | error                                                                                                           |
| `modified$_$`  | value if modified else undefined                                                          | same as above                                                                           | same as above             | error                                                                                                           |
| `delta$_$`     | modified properties of first level, full props thereafter: shallow delta                  | do shallow delta update of properties, all properties after first level will be changed | error                     | error                                                                                                           |
| `deepDelta$_$` | modified properties only of all levels: deep delta                                        | do deep delta update with value, only modified properties of all levels are changed.    | error                     | error                                                                                                           |

Use of `._$()`, sometimes you need to modify deep properties based on programming logic. Instead
of creating an object then adding it to your modified state, you can use this option and benefit
from not worrying about immutability:

```javascript
let boxed = _$(someState);

boxed.appState_$.dashboards_$.userData_$(_$ => {
    // here _$ is boxed.dashboards_$.userData_$, get/set/call it or properties
    if (condition) {
        // fill
        _$.undoList_$.modified_$(_$ => {
            // here _$ is boxed.dashboards_$.userData_$.undoList_$.modified_$, get/set/call it or properties
        });
    }
});

```

:warning: When a property is set through the parent collection it orphans the boxed state for
all the properties of the parent for which you kept reference. These detached properties will
still work but only on their own copy of the data since they are now detached from the root.

For example this will happen when you do something like:

```
let boxed = _$();

let nested = boxed.level1_$.level2_$.level3_$;
nested[_$] = 0;
nested[_$] = 1;
nested[_$] = 2;
// boxed is now: { level1: { level2: { level3: [0,1,2]}}};

boxed.level1_$.level2_$.level3 = [0,1,2]; // this will detach all boxed properties from level3 and below, like nested  

nested[_$] = 3;
nested[_$] = 4;
nested[_$] = 5;
// nested is [0,1,2,3,4,5]
// boxed is still: { level1: { level2: { level3: [0,1,2]}}};
```

## License

MIT, see [LICENSE.md](http://github.com/vsch/boxed-immutable/blob/master/LICENSE.md) for
details.

