'use strict';

const boxed = require('./lib/boxed-immutable');
const boxedState = require('./lib/boxed-state');
const util = require('./lib/util');

boxed.BoxedState = boxedState.BoxedState;
boxed.boxState = boxedState.boxState;
boxed.boxOut = util.boxOut;

module.exports = {
    default: boxed.box,
    "_$": boxed.box,
    "$_": boxed.boxOut,
    box: boxed.box,
    createBox: boxed.createBox,
    boxState: boxed.boxState,
    boxOut: boxed.boxOut,

    // mostly for testing
    util: util,
    boxed: boxed,
};
