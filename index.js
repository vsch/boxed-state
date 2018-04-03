'use strict';

const boxed = require('./lib/boxed-immutable');
const boxedOnDemand = require('./lib/boxed-on-demand');

exports._$ = boxed.box;
exports.createBox = boxed.createBox;
exports.boxedOnDemand = boxedOnDemand.boxedOnDemand;

// mostly for testing
exports.Boxed = boxed.Boxed;
exports.BoxedOnDemand = boxedOnDemand.BoxedOnDemand;
exports.BOXED_GET_THIS = boxed.BOXED_GET_THIS;
