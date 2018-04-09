'use strict';

const boxed = require('./lib/boxed-immutable');
const boxedState = require('./lib/boxed-state');
const util = require('./lib/util');

boxed.BoxedState = boxedState.BoxedState;
boxed.boxState = boxedState.boxState;

module.exports = {
    default: boxed.box,
    "_$": boxed.box,
    box: boxed.box,
    createBox: boxed.createBox,
    boxState: boxed.boxState,

    // mostly for testing
    util: util,
    boxed: boxed,
};
