import { StreamSubscriptionActions } from "./stream_subscription";
import { StreamMessageError, StreamMessageData, StreamMessageDone } from "./types";
/** @ignore utility for handling promises: cancels subscription and (resolve | rejects) the value */
export declare const cancelAndFulfill: (v: any, sub: StreamSubscriptionActions, fulfill: (v: any) => void) => void;
/** @ignore utility for running a function on the next tick **/
export declare const nextTick: (fn: () => any) => void;
/** @ignore utility for creating a *data* StreamMessage **/
export declare const createDataMessage: <T>(data: T) => StreamMessageData<T>;
/** @ignore utility for creating an *error* StreamMessage **/
export declare const createErrorMessage: (m: string | Error) => StreamMessageError;
/** @ignore utility for creating a *done* StreamMessage **/
export declare const createDoneMessage: () => StreamMessageDone;
//# sourceMappingURL=stream_utils.d.ts.map