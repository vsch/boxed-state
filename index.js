'use strict';

const boxed = require('./lib/boxed-js');

exports._$ = boxed.box;
exports.createBox = boxed.createBox;

// mostly for texting
exports.Boxed = boxed.Boxed;
exports.BOXED_GET_THIS = boxed.BOXED_GET_THIS;
