import { StreamMessageType, } from "./types.js";
/** @ignore utility for handling promises: cancels subscription and (resolve | rejects) the value */
export const cancelAndFulfill = function (v, sub, fulfill) {
    sub.cancel();
    fulfill(v);
};
/** @ignore utility for running a function on the next tick **/
/* istanbul ignore next*/
export const nextTick = function (fn) {
    Promise.resolve().then(fn || (() => { }));
};
/** @ignore utility for creating a *data* StreamMessage **/
export const createDataMessage = function (data) {
    return { type: StreamMessageType.Data, data };
};
/** @ignore utility for creating an *error* StreamMessage **/
export const createErrorMessage = function (m) {
    let err;
    if (typeof m === "string") {
        err = new Error(m);
    }
    else {
        err = m;
    }
    return { type: StreamMessageType.Error, data: err };
};
/** @ignore utility for creating a *done* StreamMessage **/
export const createDoneMessage = function () {
    return { type: StreamMessageType.Done };
};
