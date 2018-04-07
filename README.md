# boxed-immutable

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

:warning: Version 1.0.0 Completely rethought the concept not compatible with previous uses

Immutable proxy wrapper with auto-vivification of intermediate objects/arrays with syntactic
sugar to keep access/modification to deeply nested properties looking almost the same as plain
object property access.

1. Create a boxed-immutable object proxy from any value, including `undefined` then access
   and/or modify its direct and nested properties, without concern to whether intermediate
   values are objects/arrays or whether they exist. The final result will either reflect the
   value of an actual property or be undefined if any intermediate properties were undefined or
   invalid.

2. Modify any direct or nested properties without affecting the original object/array. It will
   be shallow copied on first modification of any property. All further modifications will be
   done on the copy.

3. Get the full modified array/object or just the changed properties to pass to state updater
   such as [Redux] `dispatch()` or [React] component's `setState()`.

## Install

Use [npm](https://npmjs.com/) to install.

```sh
npm install boxed-immutable --save
```

## Usage

[![NPM](https://nodei.co/npm/boxed-immutable.png)](https://www.npmjs.com/package/boxed-immutable)

The concept behind this module is to create a protective box around a value: to box it.

For values inside the box, all properties return a proxy that does the job of keeping immutable
originals intact, track modified properties, auto-vivify containers when properties are set and
provide magic properties.

Outside the box is the standard JavaScript properties, the ones you need to evaluate
expressions, check values and pass them to code otherwise not aware of proxy wrapped properties.
They also tend to throw `TypeError` or `ReferenceError` when attempting to access null or
undefined values as objects.

Any value can be boxed, traversed several levels deep into its property tree and at any point
take that property value out of the box. All access from this point on to the property and its
nested properties is on regular JavaScript object properties. If any intermediate property
access was invalid, the value of the unboxed property will be `undefined`.

Use the `_$` function to box any value. The function returns a proxy for that value with
all the protection of never failing property access and never modifying the original value. 

Take a value out of the box by accessing the `.$_` magic property of the box proxy. 

The names used can be changed creating a box function with `createBox(options)` but the default
visually signals that properties between `_$` and `.$_` markers are boxed in, protected and not
the JavaScript values they hold.

It is advisable to adopt a naming convention to show that a variable holds a boxed value of
another variable. Name the boxed variable by appending a `_$` suffix to the name of the unboxed
value it holds. This convention conveys that the properties you access through the boxed
variable are themselves boxed.

Some code to show how it all comes together. Each example will be a continuation of the
code in the previous example, unless it starts with the `require('boxed-immutable')`

```javascript 
const _$ = require('boxed-immutable').box;

let state = {
    isLoaded: false,
    isLoading: false,
    appSettings: {
        title: "The Title",
    }
};

let state_$ = _$(state);
let dashboardName = "overview";
let showDashboard;
let title;

showDashboard = state_$.appSettings.dashboards[dashboardName].showDashboard.$_; // result is undefined
title = state_$.appSettings.title.$_; // result is "The Title"
```

Modifying properties is even easier because they can be set without unboxing. It might seem
easier just to bang away on the unboxed state object but then you will not get immutability
barrier, same value optimization, `TypeError` and `ReferenceError` protection and parent
container instantiation. The following is a no-op:

```javascript
state_$.isLoaded = false;
```

On the other hand the next line will cause the proxy to make a shallow copy of the boxed value
and then set its `isLoading` property to `true`.

```javascript
state_$.isLoading = true; // this will shallow copy the underlying object and set its property
```

Now for some fun examples that would not work with JavaScript objects:

```javascript
state_$.appSettings.dashboards[dashboardName].showDashboard = true;
state_$.appSettings.dashboards[dashboardName].dashboardTitle = "Overview";

let newState = state_$;
```

At this point `newState` will be the same as if you did:

```javascript
let newState = {
    isLoaded: false,
    isLoading: true,
    appSettings: {
        title: "The Title",
        dashboards: {
            overview: {
                showDashboard: true,
                dashboardTitle: "Overview",
            },
        },
    },
};
```

If you want to only set defaults without overwrite existing values then it is easiest to use the
`.default$_` magic property. It is an l-value for assignment and a function for r-value that you
can use to pass complex initialization shapes.

```javascript
state_$.appSettings.dashboards[dashboardName].showDashboard.default$_ = false;
state_$.appSettings.dashboards[dashboardName].dashboardTitle.default$_ = "Overview Dashboard";
state_$.appSettings.dashboards[dashboardName].isCollapsed.default$_ = false;

let initState = state_$;
```

Above lines only modified `state_$` by adding a single property to the `overview` dashboard,
because the others were already not `undefined`:

```javascript
let initState = {
    isLoaded: false,
    isLoading: true,
    appSettings: {
        title: "The Title",
        dashboards: {
            overview: {
                showDashboard: true,
                dashboardTitle: "Overview",
                isCollapsed: false,
            },
        },
    },
};
```

To save the new state in full use `state_$.$_` or `state_$.modified$_` which will return the
modified value or `undefined` if no actual changes were made to the underlying state object.

If your update can handle a shallow delta, merging first level changed properties, use
`state_$.delta$_`, which only returns full first level properties that were changed.

`state_$.deepDelta$_` will return only changed properties for all values regardless how deep.
Use this if merging changed values makes sense or if you need a minimal delta for other
purposes.

### Auto-Vivication of intermediate properties

When setting properties on non-existent or non-object properties the proxy will auto-create the
array or object, ie. auto-vivify it.

Auto-vivication takes the property name into account: integers >= 0, whether numbers or numbers
in strings will create an `Array`, everything else will create an `Object`.

You can use the special `end of array` value of `"_$"` or just the global box `_$` or `._$` of
any boxed property when setting an array property to have the value added to the end of the
array. Effectively, `_$` is always equal to the length of the array.

```javascript
let empty = _$();

// all are equivalent for arrays it is equivalent to push. 
empty[""] = 5;
empty["_$"] = 5;
empty[_$] = 5;
empty._$ = 5;  // simplest alternative
// result: [5]

empty._$ = 10;
// result: [5, 10]

empty._$ = 20;
let result = empty.$_;
// result: [5, 10, 20]
```

For symmetry, you can also use the end of array index (`_$` or `''`) on objects. In case of
objects `_$` is equal to the greatest integer key which is >= 0 in the object or 0 if no integer
keys exist. The goal is to make boxed values allow setting properties like their unboxed
JavaScript counterparts.

It is equivalent to copying object properties to an array, doing a push on that array and
copying the resulting properties back. This is not how it is implemented but conceptually it is
the same.

The following will create an object:

```javascript
let empty = _$();

empty.field = 5; // result: {field: 5}
empty._$ = 10; // result: {0: 10, field: 5}
empty._$ = 20; // result: {0: 10, 1: 20, field: 5}
empty._$ = 20; // result: {0: 10, 1: 20, field: 5}

let result = empty.$_; // result: {0: 10, 1: 20, field: 5}
```

```javascript

let obj = {};

obj.prop = "a";
obj[0] = 5;
obj[1] = 15;
obj[2] = 25;
// result: {0: 5, 1:15, 2:25, prop: "a"}

// the same can be achieved with, without having to increment the index
let obj = _$({});

obj.prop = "a";
obj._$ = 5;
obj._$ = 15;
obj._$ = 25;
let result = obj.$_;
// result: {0: 5, 1:15, 2:25, prop: "a"}
```

### Options

You can change a couple of options on how the boxing handles properties whose value is
`undefined` and modify the prefix/suffix used for accessing boxed properties or magic
properties:

Use the `createBox(options)` function from the module to create a boxing function with
non-default options:

```javascript
const createBox = require('boxed-immutable').createBox;
const __$ = createBox({outsideBox: "$__", insideBox:"__$", magicPrefixChars: "", magicSuffixChars: "$_"});

// Now all your properties are wrapped and magic properties end with two $ 
let obj = __$();

obj.field.subField = 4;
obj.prop.__$ = "a";
obj.prop.__$ = "b";
obj.prop.__$ = "c";

let result = obj.unboxed$_;
// result: { field: { subField: 4 }, prop: [ "a", "b", "c"] };
```

| Option                             | Default     | Description                                                                                                                                  |
|:-----------------------------------|:------------|:---------------------------------------------------------------------------------------------------------------------------------------------|
| `deleteEmptyCollections`:          | `true`      | if deleting a property results in an empty collection, delete that too                                                                       |
| `ignoreUndefinedProperties`:       | `true`      | when copying delta and deepDelta ignore properties with `undefined` value                                                                    |
| `arrayDeltaObjects`:               | `false`     | return array delta as objects with index as key                                                                                              |
| `arrayDeltaObjectMarker`:          | `undefined` | field name to set when returning array delta as objects, `undefined` means don't set                                                         |
| `arrayDeltaObjectMarkerValue`:     | `undefined` | value for above                                                                                                                              |
| `arrayDeltaPartials`:              | `false`     | return array delta as partials, any unset indices will be `undefined`                                                                        |
| `arrayDeepDeltaObjects`:           | `false`     | return array deepDelta as objects with index as key                                                                                          |
| `arrayDeepDeltaObjectMarker`:      | `undefined` | field name to set when returning array deepDelta as objects, `undefined` means don't set                                                     |
| `arrayDeepDeltaObjectMarkerValue`: | `undefined` | value for above                                                                                                                              |
| `arrayDeepDeltaPartials`:          | `true`      | return array deepDelta as partials, any unset indices will be `undefined`, false will return array delta from index 0 to last modified index |
| `outsideBox`:                      | `"$_"`      | take value outside the box                                                                                                                   |
| `insideBox`:                       | `"_$"`      | keep value inside the box                                                                                                                    |
| `magicPrefixChars`:                | `""`        | prefix for magic properties                                                                                                                  |
| `magicSuffixChars`:                | `"$"`       | suffix for magic properties                                                                                                                  |

## API

### boxed-immutable.box 

This is a function which will wrap the argument passed to it in a boxed proxy. `box._$` is a
synonym. The proxy makes wrapped and magic properties available on the boxed value. To customize
options use `createBox(options)` function to create your box function. Effectively, the default
box is created using `createBox(defaultOptions)`.

Magic properties except `_$` are wrapped in `magicPrefixChars` and `magicSuffixChars`, regular
properties and empty string `""` which represents array end (or the `_$` index) is wrapped using
`outsideBox` and `insideBox` values of the options.

Properties can potentially have separate `get`, `set`, `delete` and `call` behaviors as
exhibited by the `._$` property, `.default$_` and others.

| Property       | Get                                                                      | Set                                                                             | Delete                    | Call                                                                                                                                                              |
|:---------------|:-------------------------------------------------------------------------|:--------------------------------------------------------------------------------|:--------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `_$`           | proxy for the boxed object                                               | append end of array                                                             | error                     | does a call on first argument, use: `boxed._$(_$ => { });` returns `boxed`                                                                                        |
| `$_`           | unboxed value or object                                                  | set value of boxed property and mark as modified                                | delete property in parent | error                                                                                                                                                             |
| `forEachKey$_` | function                                                                 | error                                                                           | error                     | functions executes callback for each property key `.forEach$((prop, unboxedValue) =>{});` skips `undefined` values, for arrays prop is an integer >=0             |
| `forEachKey_$` | function                                                                 | error                                                                           | error                     | functions executes callback for each property key `.forEach$((prop, boxedValue, unboxedValue) =>{});` skips `undefined` values, for arrays prop is an integer >=0 |
| `modified$_`   | value if modified else undefined                                         | same as above                                                                   | same as above             | error                                                                                                                                                             |
| `default$_`    | function                                                                 | set value if it is undefined, otherwise do nothing                              | error                     | error                                                                                                                                                             |
| `boolean$_`    | unboxed value converted to true or false                                 | use `!!value` to set the contained value                                        | error                     | error                                                                                                                                                             |
| `delta$_`      | modified properties of first level, full props thereafter: shallow delta | shallow delta update of properties, set all properties to properties in value   | error                     | error                                                                                                                                                             |
| `deepDelta$_`  | modified properties from nesting all levels: deep delta                  | deep delta update, only properties provided in value of all levels are changed. | error                     | error                                                                                                                                                             |

Use of `._$()` function when you need to modify deep properties based on programming logic.
Instead of creating an object then adding it to your modified state, you can use this option and
benefit from not worrying about immutability or safe access:

```javascript
let state_$ = _$(state);

state_$.appState.dashboards.userData(_$ => {
    // _$ here is equivalent to state_$.dashboards.userData 
    if (condition) {
        // fill with values
        _$.undoList.items(_$ => {
            // here _$ is equivalent to state_$.dashboards.userData.undoList.items
        });
    }
});

```

:warning: When a value is set on the parent collection it orphans the boxed state for all the
properties of the parent for which you kept reference. These detached properties will still work
but only on their own copy of the data since they are now detached from the root.

It will happen when you do something like:

```javascript
let boxed_$ = _$();

let nested_$ = boxed_$.level1.level2.level3;
nested_$._$ = 0;
nested_$._$ = 1;
nested_$._$ = 2;
// boxed is now: { level1: { level2: { level3: [0,1,2]}}};

boxed_$.level1.level2.level3 = [0,1,2]; // this will detach all boxed properties from level3 and deeper, including the nested refernced  

nested_$._$ = 3;
nested_$._$ = 4;
nested_$._$ = 5;
// nested is [0,1,2,3,4,5]
// boxed_$ is still: { level1: { level2: { level3: [0,1,2]}}};
```

### boxed-immutable boxOnDemand

Provides a boxed proxy to immutable state, with `.save()` and `.cancel()` methods for saving or
canceling state changes. With minimal code this allows transparent access to current state
without the callers worrying about stale data or how to apply the changes back to the state
holder.

Applying partial changes to component's state is as easy as setting a value in boxedOnDemand
instance and invoking `.save()`

```javascript
const boxOnDemand = require('boxed-immutable').boxOnDemand;

// your function for returning the current immutable state object
function getSimpleState() {
}

let state_$;

// your current function for setting a new state 
function saveState(newState) {
    // 1. update state
    // 2. regardless of how this function is called, cancel the boxed on demand so next access will be forced to get a fresh state
    state_$.cancel();
}

// wrap in proxy so boxed state can be provided automatically
// use in new getState to get boxed on demand
state_$ = boxOnDemand(undefined, () => {
    return getSimpleState();
}, (modified, boxed) => {
    // call the save state function to apply changes in full
    saveState(modified);

    // or if your saveState can handle delta
    //saveState(boxed.delta$_$);
    // or anything else without having to change the users of your state API
});

// use new function to provide access to now boxed immutable state
function getState() {
    return state_$;
}

function handleEvent() {
    // somewhere in the code.
    let state_$ = getState();

    // can use state as before or as boxed state, except now there is no need to get a new state 
    // every time. The same state will reflect latest changes. Make a copy if you need immutable state

    // NOTE: now it is not immutable, make a copy of its .unboxed$_$ property if you need an immutable copy  

    // make changes
    // saving is handled by the provider instead of having the caller know how to update state
    state_$.save(); // save changes
    // state_$.cancel(); // or to discard changes
    // next access to any property of the boxed state will get a fresh copy before returning the property value
}

```

| Property | Get      | Set   | Delete | Call                                                                                                                           |
|:---------|:---------|:------|:-------|:-------------------------------------------------------------------------------------------------------------------------------|
| `save`   | function | error | error  | calls the saveState callback passed to `boxOnDemand` function, callback only called if there were changes made to boxed object |
| `cancel` | function | error | error  | cancels any changes and destroys the boxed object, next property access will fetch the current state                           |

#### boxOnDemand(getState, saveState, options)

```javascript
const boxOnDemand = require('boxed-immutable').boxOnDemand;
const onDemandState = boxOnDemand();
```

Used to construct a new boxed on demand proxy.

| argument    | default | Description                                                                                                                              |
|:------------|:--------|:-----------------------------------------------------------------------------------------------------------------------------------------|
| `getState`  | none    | callback to obtain the current state                                                                                                     |
| `saveState` | none    | callback to save modified, arguments: (newState, boxedState), return value passed back to caller of `save()`.                            |
| `options`   | box     | options to use. Can be a box as provided by boxedImmutable.box or boxedImmutable.createBox(), then all other options are set to defaults |

| Option             | Default      | Description                                                                                                                                      |
|:-------------------|:-------------|:-------------------------------------------------------------------------------------------------------------------------------------------------|
| `box`:             | global `box` | Which box creation to use for each new boxed state object                                                                                        |
| `saveBoxedProp`:   | 'save'       | name of the `save` property to use, allows changing of the function to 'commit' or something that will not conflict with your state's properties |
| `cancelBoxedProp`: | 'cancel'     | name of the `cancel` property to use, allows changing of the function to something that will not conflict with your state's properties           |
| `wrapProps`:       | false        | if true will wrap the saveBoxedProp and cancelBoxedProp the same as magical properties of the boxed object created from the box                  |

## License

MIT, see [LICENSE.md](http://github.com/vsch/boxed-immutable/blob/master/LICENSE.md) for
details.


[Redux]: https://redux.js.org
[React]: https://reactjs.org
