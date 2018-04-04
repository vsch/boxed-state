'use strict';

const boxed = require('./lib/boxed-immutable');
const onDemand = require('./lib/boxed-on-demand');
const util = require('./lib/util');

boxed.BoxedOnDemand = onDemand.BoxedOnDemand;
boxed.boxOnDemand = onDemand.boxOnDemand;

module.exports = {
    default: boxed.box,
    _$: boxed.box,
    box: boxed.box,
    createBox: boxed.createBox,
    boxOnDemand: boxed.boxOnDemand,

    // mostly for testing
    util: util,
    boxed: boxed,
};
