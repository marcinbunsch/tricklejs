"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDoneMessage = exports.createErrorMessage = exports.createDataMessage = exports.nextTick = exports.cancelAndFulfill = void 0;
const types_1 = require("./types");
/** @ignore utility for handling promises: cancels subscription and (resolve | rejects) the value */
const cancelAndFulfill = function (v, sub, fulfill) {
    sub.cancel();
    fulfill(v);
};
exports.cancelAndFulfill = cancelAndFulfill;
/** @ignore utility for running a function on the next tick **/
/* istanbul ignore next*/
const nextTick = function (fn) {
    Promise.resolve().then(fn);
};
exports.nextTick = nextTick;
/** @ignore utility for creating a *data* StreamMessage **/
const createDataMessage = function (data) {
    return { type: types_1.StreamMessageType.Data, data };
};
exports.createDataMessage = createDataMessage;
/** @ignore utility for creating an *error* StreamMessage **/
const createErrorMessage = function (m) {
    let err;
    if (typeof m === "string") {
        err = new Error(m);
    }
    else {
        err = m;
    }
    return { type: types_1.StreamMessageType.Error, data: err };
};
exports.createErrorMessage = createErrorMessage;
/** @ignore utility for creating a *done* StreamMessage **/
const createDoneMessage = function () {
    return { type: types_1.StreamMessageType.Done };
};
exports.createDoneMessage = createDoneMessage;
