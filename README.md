# boxed-immutable

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

:warning: Version 0.5.0 has renamed functions in the `util` internal library in the process of
reducing conflict and to make them more consistent with their actual function. The API is
evolving and will still change as its idiosyncrasies and limitations are discovered in use. The
**boxed-in** proxy is fairly stable but may add new magic properties and eventually retire
unused or little use properties. **boxed-out** proxy gained iteration helpers to mimic ones
available for arrays.

Immutable proxy wrapper with auto-vivification of intermediate objects/arrays with syntactic
sugar to keep access/modification to deeply nested properties looking almost the same as plain
object property access. Flexible data transforms to massage or validate the data on boxed state
creation or on property changes: [Transforms](../../wiki/Transforms)

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

Any value can be boxed, traversed several levels deep into its property tree and at any point
take that property value out of the box. All access from this point on to the property and its
nested properties is on regular JavaScript object properties. If any intermediate property
access was invalid, the value of the unboxed property will be `undefined`.

Some code to show how it all comes together. Each example will be a continuation of the code in
the previous example, unless it starts with the `require('boxed-immutable')`

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

showDashboard = state_$.appSettings.dashboards[dashboardName].showDashboard(); // result is undefined
title = state_$.appSettings.title(); // result is "The Title"
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

The rest of this file was moved to the wiki for greater leg room, [boxed-immutable wiki](../../wiki)

## License

MIT, see [LICENSE.md](http://github.com/vsch/boxed-immutable/blob/master/LICENSE.md) for
details.

[React]: https://reactjs.org
[Redux]: https://redux.js.org

