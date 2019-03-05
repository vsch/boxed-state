# boxed-state

[![experimental](https://badges.github.io/stability-badges/dist/experimental.svg)](https://github.com/badges/stability-badges)

Implements a wrapper for immutable state with encapsulation of `save()` and `cancel()`
implementations allowing making implementation independent use of transactional changes to the
encapsulated state.

Immutability is provided by the [`boxed-immutable` module](https://github.com/vsch/boxed-immutable/blob/master/README.md)

## Install

Use [npm](https://npmjs.com/) to install.

```sh
npm install boxed-state --save
```

## Usage

[![NPM](https://nodei.co/npm/boxed-state.png)](https://www.npmjs.com/package/boxed-state)

### `require('boxed-state')` function

Provides a boxed proxy to immutable state, with `.save()` and `.cancel()` methods for saving or
canceling state changes. With minimal code this allows transparent access to current state
without the callers worrying about stale data or how to apply the changes back to the state
holder.

Applying partial changes to component's state is as easy as setting a value in a `boxState`
instance and invoking `.save()`

```javascript
const boxState = require('boxed-state');

// your function for returning the current immutable state object
function getSimpleState() {
}

let state_$;

// your current function for setting a new state
function saveState(newState) {
    // 1. update state
    // 2. regardless of how this function is called, cancel
    //    the cached boxed state, then next access will be forced to
    //    get a fresh state
    state_$.cancel();
}

// wrap in proxy so boxed state can be provided automatically
// use in new getState to get boxed state using default createBox options
state_$ = boxState(() => {
    return getSimpleState();
}, (modified, boxed) => {
    // call the save state function to apply changes in full
    saveState(modified);

    // or if your saveState can handle delta
    //saveState(boxed.$_delta$);
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

    // NOTE: properties returned by state_$ are mutable, make a copy of state_$.$_value
    // or use the old getSimpleState() function if you need an immutable copy between state change

    // make changes to state_$ properties

    // saving is handled by the provider instead of having the caller know how to update state
    state_$.save(); // save changes
    // state_$.cancel(); // or to discard changes
    // next access to any property of the boxed state will get a fresh copy of the state
}
```

| Property | Get      | Set   | Delete | Call                                                                                                                                |
|:---------|:---------|:------|:-------|:------------------------------------------------------------------------------------------------------------------------------------|
| `save`   | function | error | error  | calls the saveState callback passed to `boxState` function, callback only called if there were changes made to boxed object         |
| `cancel` | function | error | error  | cancels any changes, next access will get new current state, returns `undefined` or delta which can be used to re-apply the changes |

#### boxState(getState, saveState, options)

```javascript
const boxState = require('boxed-state').boxState;
const boxedState = boxState();
```

Used to construct a new boxed state proxy.

| argument    | default | Description                                                                                                                              |
|:------------|:--------|:-----------------------------------------------------------------------------------------------------------------------------------------|
| `getState`  | none    | callback to obtain the current state                                                                                                     |
| `saveState` | none    | callback to save modified, arguments: (newState, boxedState), return value passed back to caller of `save()`.                            |
| `options`   | box     | options to use. Can be a box as provided by boxedImmutable.box or boxedImmutable.createBox(), then all other options are set to defaults |

`options`:

| Option             | Default      | Description                                                                                                                                      |
|:-------------------|:-------------|:-------------------------------------------------------------------------------------------------------------------------------------------------|
| `box`:             | global `box` | Which box creation to use for each new boxed state object                                                                                        |
| `saveBoxedProp`:   | `'save'`     | name of the `save` property to use, allows changing of the function to 'commit' or something that will not conflict with your state's properties |
| `cancelBoxedProp`: | `'cancel'`   | name of the `cancel` property to use, allows changing of the function to something that will not conflict with your state's properties           |
| `getTransforms`    | `undefined`  | get-transforms to use when creating a boxed state                                                                                                |
| `setTransforms`    | `undefined`  | set-transforms to use when creating a boxed state                                                                                                |

[React]: https://reactjs.org
[Redux]: https://redux.js.org

