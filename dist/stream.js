"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stream_subscription_1 = __importDefault(require("./stream_subscription"));
const stream_controller_1 = __importDefault(require("./stream_controller"));
const types_1 = require("./types");
const stream_utils_1 = require("./stream_utils");
/**
 * Error to be thrown when adding to a closed stream
 */
/** @ignore */
const ErrorForAdd = new Error("cannot add to closed stream");
/**
 * Error to be thrown when adding errors to a closed stream
 */
/** @ignore */
const ErrorForAddError = new Error("cannot add error to closed stream");
/**
 * Error to be thrown when there are multiple listeners to a non-broadcast stream
 */
/** @ignore */
const ErrorForListen = new Error("cannot have more than one listener on the stream");
/**
 * Stream
 * @template T - the type for the data in the stream
 */
class Stream {
    constructor() {
        this._subscription = null;
        /** The buffer containing the stream messages */
        this._buffer = [];
        /** internal flag representing the paused state of the stream */
        this._isPaused = false;
        /** internal flag representing the closed state of the stream */
        this._isClosed = false;
        this._eventCallbacks = {};
    }
    /**
     * Derive a stream from a promise.
     *
     * @param promise - The promise to convert to a stream
     * @returns Stream - The stream
     * @template T - the type of the data resolved by the promise
     */
    static fromPromise(promise) {
        const streamController = new stream_controller_1.default();
        promise
            .then((value) => {
            streamController.add(value);
            streamController.close();
        })
            .catch((e) => {
            streamController.addError(e);
            streamController.close();
        });
        return streamController.stream;
    }
    /**
     * Derives a stream from promises
     *
     * Resolved values are data on the stream. Rejected values are errors on the stream.
     * Stream is closed after all promises have been resolved.
     * @param promises
     * @template T the type of data resolved by the promises
     */
    static fromPromises(promises) {
        const streamController = new stream_controller_1.default();
        let count = 0;
        const onData = (data) => {
            if (!streamController.isClosed) {
                streamController.add(data);
                if (--count === 0)
                    streamController.close();
            }
        };
        const onError = (error) => {
            if (!streamController.isClosed) {
                streamController.addError(error);
                if (--count === 0)
                    streamController.close();
            }
        };
        for (let p of promises) {
            count++;
            p.then(onData, onError);
        }
        return streamController.stream;
    }
    /**
     * Derives a new stream from an existing stream.
     *
     * @param stream
     * @returns stream
     * @template T the type of the data in the stream
     */
    static fromStream(stream) {
        return new _filteringStream(stream);
    }
    /**
     * _emit - emit messages to listeners
     */
    /** @ignore */
    _emit() {
        if (this.isPaused || !this._subscription)
            return;
        (0, stream_utils_1.nextTick)(() => {
            this._buffer.forEach((message) => {
                if (this._subscription) {
                    this._subscription.messageHandler(message);
                }
            });
            this._buffer = [];
            if (this._isClosed && this._subscription) {
                this.cancel(this._subscription);
            }
        });
    }
    /**
     * Fire callbacks for event listeners
     *
     * @param name - the event name
     */
    _callEventListeners(name) {
        (0, stream_utils_1.nextTick)(() => {
            if (this._eventCallbacks[name] && this._eventCallbacks[name].length) {
                this._eventCallbacks[name].forEach((c) => c());
            }
        });
    }
    /**
     * Cancel a StreamSubscription
     *
     * This is called when StreamSubscription.cancel() is called.
     */
    cancel(_) {
        this._subscription = null;
        this._callEventListeners("onCancel");
    }
    /**
     * Subscribes a listener and callbacks to the stream.
     *
     * Override to alter the behavior on how listeners are managed.
     * @param onData - the listener
     * @param callbacks - the optional error and ondone callbacks
     */
    listen(onData, callbacks = {}) {
        if (this._subscription) {
            throw ErrorForListen;
        }
        this._subscription = new stream_subscription_1.default(this, onData, callbacks);
        this._callEventListeners("onListen");
        this._emit();
        return this._subscription;
    }
    /**
     * Add messages to the stream.
     *
     * Override to alter how data is processed
     * @param data - the data to add
     */
    add(data) {
        if (this.isClosed)
            throw ErrorForAdd;
        this._buffer.push((0, stream_utils_1.createDataMessage)(data));
        this._emit();
    }
    /**
     * Add errors to the stream.
     *
     * Override to alter how errors are processed
     * @param message - the error or error message
     */
    addError(message) {
        if (this.isClosed)
            throw ErrorForAddError;
        this._buffer.push((0, stream_utils_1.createErrorMessage)(message));
        this._emit();
    }
    /**
     * Pause the stream.
     *
     * When a stream is paused, listeners are no longer notified for incoming messages.
     * Unless the stream is a broadcast stream, messages are buffered until the stream is resumed.
     */
    pause() {
        if (!this._isPaused) {
            this._isPaused = true;
            this._callEventListeners("onPause");
        }
    }
    /**
     * Resume the stream.
     *
     * Unless the stream is a broadcast stream, buffered messages will be
     * dispatched to listeners when the stream resumes.
     */
    resume() {
        if (this._isPaused) {
            this._isPaused = false;
            this._callEventListeners("onResume");
            this._emit();
        }
    }
    /**
     * Close the stream.
     *
     * When a stream is closed, add messages/errors to the stream are then prohibbited.
     */
    close() {
        this._isClosed = true;
        this._buffer.push((0, stream_utils_1.createDoneMessage)());
        this._emit();
    }
    /**
     * Add an event listener to the stream.
     *
     * This is used to be notified for events such as:
     * onListen, onPause, onResume, onCancel.
     *
     * @param name - the name of the event
     * @param callback
     */
    addEventListener(name, callback) {
        if (!this._eventCallbacks[name]) {
            this._eventCallbacks[name] = [];
        }
        this._eventCallbacks[name].push(callback);
    }
    /**
     * Remove an event listener from the stream.
     *
     * @param name - the name of the event
     * @param callback
     */
    removeEventListener(name, callback) {
        if (!this._eventCallbacks[name])
            return;
        this._eventCallbacks[name] = this._eventCallbacks[name].filter((c) => c !== callback);
    }
    /**
     * Whether the stream is a broadcast stream
     */
    get isBroadcast() {
        return false;
    }
    /**
     * The **closed** state of the stream.
     *
     * @return boolean
     */
    get isClosed() {
        return this._isClosed;
    }
    /**
     * The **paused** state of the stream.
     *
     * @returns boolean
     */
    get isPaused() {
        return this._isPaused;
    }
    /**
     * asBroadcastStream
     *
     * Creates a multilistener enabled stream that receives messages from the current stream.
     * The broadcast stream subscribes to the current stream when it receives its first listener.
     */
    asBroadcastStream() {
        return new _broadcastStream(this);
    }
    /**
     * Derives new stream that emits mapped values.
     *
     * @param transform - the function that maps data of type T => type U
     * @template T original data type
     * @template U new data type
     */
    map(transform) {
        return new _mapStream(this, transform);
    }
    /**
     * Derives new stream that emits mapped values, accepting promises.
     *
     * When the transform function returns a promise, the stream will pause until the promise resolves.
     *
     * @param transform - the function that maps data of type T => Promise<U> | U
     * @template T original data type
     * @template U new data type
     */
    asyncMap(transform) {
        const streamController = new stream_controller_1.default();
        streamController.onListen = () => {
            const subscription = this.listen((data) => __awaiter(this, void 0, void 0, function* () {
                let newValue;
                try {
                    newValue = transform(data);
                }
                catch (e) {
                    streamController.addError(e);
                    return;
                }
                if (newValue instanceof Promise) {
                    subscription.pause();
                    try {
                        const value = yield newValue;
                        streamController.add(value);
                    }
                    catch (e) {
                        streamController.addError(e);
                    }
                    subscription.resume();
                }
                else {
                    streamController.add(newValue);
                }
            }));
            streamController.onCancel = () => subscription.cancel();
            streamController.onPause = () => subscription.pause();
            streamController.onResume = () => subscription.resume();
        };
        return streamController.stream;
    }
    // Stream<E> asyncMap<E>(FutureOr<E> convert(T event)) {
    //   _StreamControllerBase<E> controller;
    //   if (isBroadcast) {
    //     controller = _SyncBroadcastStreamController<E>(null, null);
    //   } else {
    //     controller = _SyncStreamController<E>(null, null, null, null);
    //   }
    //   controller.onListen = () {
    //     StreamSubscription<T> subscription = this.listen(null,
    //         onError: controller._addError, // Avoid Zone error replacement.
    //         onDone: controller.close);
    //     FutureOr<Null> add(E value) {
    //       controller.add(value);
    //     }
    //     final addError = controller._addError;
    //     final resume = subscription.resume;
    //     subscription.onData((T event) {
    //       FutureOr<E> newValue;
    //       try {
    //         newValue = convert(event);
    //       } catch (e, s) {
    //         controller.addError(e, s);
    //         return;
    //       }
    //       if (newValue is Future<E>) {
    //         subscription.pause();
    //         newValue.then(add, onError: addError).whenComplete(resume);
    //       } else {
    //         controller.add(newValue);
    //       }
    //     });
    //     controller.onCancel = subscription.cancel;
    //     if (!isBroadcast) {
    //       controller
    //         ..onPause = subscription.pause
    //         ..onResume = resume;
    //     }
    //   };
    //   return controller.stream;
    // }
    /**
     * Derives new stream that consumes only the first *n* messages of the current stream.
     *
     * @param n - the number of messages to consume
     */
    take(n) {
        return new _takeStream(this, n);
    }
    /**
     * Dervices a new stream that continues to receive messages from the current stream
     * as long as the `condition` function returns true.
     *
     * @param condition - function that returns true to continue taking
     */
    takeWhile(condition) {
        return new _takeWhileStream(this, condition);
    }
    /**
     * Derives new stream that skips the first *n* messages of the current stream.
     *
     * @param n - the number of messages to skip
     */
    skip(n) {
        return new _skipStream(this, n);
    }
    /**
     * Derives new stream that continues to skip elements in the parent stream
     * until the `condition` function returns false.
     *
     * @param condition
     */
    skipWhile(condition) {
        return new _skipWhileStream(this, condition);
    }
    /**
     * Derives new stream that only receives messages from the parent stream if
     * the message matches the condition.
     *
     * @param condition
     */
    where(condition) {
        return new _whereStream(this, condition);
    }
    /**
     * Derives new stream that only passes data from the parent stream if the data does not equal
     * the previously passed data.
     *
     * @param equals - function that checks if two values are the same
     */
    distinct(equals) {
        if (!equals) {
            equals = (oldVal, newVal) => oldVal === newVal;
        }
        return new _distinctStream(this, equals);
    }
    /**
     * Checks if every message in the stream satisfies a certain condition
     *
     * @param condition
     * @returns Promise - Resolved if every message satifies the condtion, Rejects otherwise
     */
    every(condition) {
        return new Promise((resolve, reject) => {
            const sub = this.listen((data) => {
                try {
                    if (condition(data))
                        return;
                }
                catch (_) { }
                (0, stream_utils_1.cancelAndFulfill)(false, sub, reject);
            }, {
                onError: (e) => (0, stream_utils_1.cancelAndFulfill)(e, sub, reject),
                onDone: () => resolve(true),
            });
        });
    }
    /**
     * first - gets the first element in the stream
     *
     * Resolves the first element on the stream.
     * Rejects if there is an error before the first element is found.
     * Rejects if the stream is empty.
     *
     * @returns Promise
     */
    first() {
        return new Promise((resolve, reject) => {
            const sub = this.listen((data) => {
                (0, stream_utils_1.cancelAndFulfill)(data, sub, resolve);
            }, {
                onError: (e) => (0, stream_utils_1.cancelAndFulfill)(e, sub, reject),
                onDone: () => reject(new Error()),
            });
        });
    }
    /**
     * firstWhere - gets the first element on the stream that matches a condition
     *
     * Resolves the first element that meets the condition.
     * Rejects if there is an error before the first element is found.
     * Rejects if the stream is empty.
     *
     * @param condition
     */
    firstWhere(condition) {
        return new Promise((resolve, reject) => {
            const sub = this.listen((data) => {
                try {
                    if (condition(data))
                        return (0, stream_utils_1.cancelAndFulfill)(data, sub, resolve);
                }
                catch (e) {
                    (0, stream_utils_1.cancelAndFulfill)(e, sub, reject);
                }
            }, {
                onError: (e) => (0, stream_utils_1.cancelAndFulfill)(e, sub, reject),
                onDone: () => (0, stream_utils_1.cancelAndFulfill)(null, sub, reject),
            });
        });
    }
    /**
     * forEach - calls the callback for each element in the stream
     *
     * @param listener
     * @returns Promise - Resolved when the stream has ended, Rejected on error.
     */
    forEach(listener) {
        return new Promise((resolve, reject) => {
            const sub = this.listen((data) => {
                try {
                    listener(data);
                }
                catch (e) {
                    (0, stream_utils_1.cancelAndFulfill)(e, sub, reject);
                }
            }, {
                onDone: resolve,
                onError: (e) => (0, stream_utils_1.cancelAndFulfill)(e, sub, reject),
            });
        });
    }
    /**
     * Calls a reducer function and returns value from the final call.
     *
     * @param reducer - fn that returns the new value by taking previous and current messages
     * @param initialValue - the initial value
     */
    reduce(reducer, initialValue) {
        let seenFirst = false;
        if (initialValue !== undefined) {
            seenFirst = true;
        }
        return new Promise((resolve, reject) => {
            const sub = this.listen((item) => {
                if (!seenFirst) {
                    initialValue = item;
                    seenFirst = true;
                    return;
                }
                try {
                    initialValue = reducer(initialValue, item);
                }
                catch (e) {
                    (0, stream_utils_1.cancelAndFulfill)(e, sub, reject);
                }
            }, {
                onDone: () => resolve(initialValue),
                onError: (e) => (0, stream_utils_1.cancelAndFulfill)(e, sub, reject),
            });
        });
    }
    /**
     * Takes the elements of a stream and outputs it into an Array.
     *
     * Note: if the stream outputs an error, the promise rejects with the error
     * from the stream.
     *
     * @returns Promise
     */
    toArray() {
        return new Promise((resolve, reject) => {
            const result = [];
            const sub = this.listen((data) => {
                result.push(data);
            }, {
                onError: (e) => (0, stream_utils_1.cancelAndFulfill)(e, sub, reject),
                onDone: () => resolve(result),
            });
        });
    }
    /**
     * Takes the elements of a stream and outputs it into a Set.
     *
     * Note: if the stream outputs an error, the partial result will be
     * provided in the reject of the promise.
     * @returns Set
     */
    toSet() {
        return new Promise((resolve, reject) => {
            const result = new Set();
            const sub = this.listen((data) => {
                result.add(data);
            }, {
                onError: (e) => (0, stream_utils_1.cancelAndFulfill)(e, sub, reject),
                onDone: () => resolve(result),
            });
        });
    }
}
exports.default = Stream;
/** @ignore */
class _broadcastStream extends Stream {
    constructor(parent) {
        super();
        this.parent = parent;
        this._parentSubscription = null;
        this._subscribers = new Set();
    }
    add(data) {
        if (this.isClosed)
            throw ErrorForAdd;
        const message = (0, stream_utils_1.createDataMessage)(data);
        (0, stream_utils_1.nextTick)(() => {
            this._subscribers.forEach((s) => s.messageHandler(message));
        });
    }
    addError(e) {
        if (this.isClosed)
            throw ErrorForAddError;
        const error = (0, stream_utils_1.createErrorMessage)(e);
        (0, stream_utils_1.nextTick)(() => {
            this._subscribers.forEach((s) => s.messageHandler(error));
        });
    }
    cancel(subscription) {
        this._subscribers.delete(subscription);
        this._callEventListeners("onCancel");
    }
    pause() { }
    resume() { }
    close() {
        var _a;
        this._isClosed = true;
        (_a = this._parentSubscription) === null || _a === void 0 ? void 0 : _a.cancel();
        this._parentSubscription = null;
        (0, stream_utils_1.nextTick)(() => {
            this._subscribers.forEach((s) => {
                s.messageHandler({ type: types_1.StreamMessageType.Done });
            });
        });
    }
    listen(onData, callbacks = {}) {
        if (!this._parentSubscription) {
            this._parentSubscription = this.parent.listen(this.add.bind(this), {
                onError: this.addError.bind(this),
                onDone: this.close.bind(this),
            });
        }
        const sub = new stream_subscription_1.default(this, onData, callbacks);
        this._subscribers.add(sub);
        this._callEventListeners("onListen");
        if (this.isClosed)
            this.close();
        return sub;
    }
    get isBroadcast() {
        return true;
    }
}
/** @ignore */
class _filteringStream extends Stream {
    constructor(parent) {
        super();
        this.parent = parent;
        this._sub = null;
    }
    // Forward cancel to parent - it might need to know nothing is listening
    cancel(sub) {
        super.cancel(sub);
        this.parent.cancel(sub);
    }
    close() {
        var _a;
        (_a = this._sub) === null || _a === void 0 ? void 0 : _a.cancel();
        this._sub = null;
        super.close();
    }
    listen(onData, callbacks = {}) {
        if (!this._sub) {
            this._sub = this.parent.listen(this.add.bind(this), {
                onError: this.addError.bind(this),
                onDone: this.close.bind(this),
            });
        }
        return super.listen(onData, callbacks);
    }
}
/** @ignore */
class _mapStream extends _filteringStream {
    constructor(parent, transform) {
        super(parent);
        this.transform = transform;
    }
    add(data) {
        const newData = this.transform(data);
        super.add(newData);
    }
}
/** @ignore */
class _takeStream extends _filteringStream {
    constructor(parent, takeAmount) {
        super(parent);
        this.takeAmount = takeAmount;
        this._taken = 0;
    }
    add(data) {
        if (this._taken < this.takeAmount) {
            super.add(data);
            this._taken++;
        }
        if (this._taken >= this.takeAmount) {
            this.close();
        }
    }
}
/** @ignore */
class _takeWhileStream extends _filteringStream {
    constructor(s, condition) {
        super(s);
        this.condition = condition;
    }
    add(data) {
        try {
            if (this.condition(data)) {
                super.add(data);
                return;
            }
        }
        catch (e) {
            super.addError(e);
        }
        this.close();
    }
}
/** @ignore */
class _skipStream extends _filteringStream {
    constructor(parent, skipAmount) {
        super(parent);
        this.skipAmount = skipAmount;
        this._skipped = 0;
    }
    add(data) {
        if (this._skipped < this.skipAmount) {
            return this._skipped++;
        }
        super.add(data);
    }
}
/** @ignore */
class _skipWhileStream extends _filteringStream {
    constructor(parent, condition) {
        super(parent);
        this.condition = condition;
        this._isSkipping = true;
    }
    add(data) {
        try {
            if (this._isSkipping && this.condition(data))
                return;
        }
        catch (e) {
            this._isSkipping = false;
            return super.addError(e);
        }
        this._isSkipping = false;
        super.add(data);
    }
}
/** @ignore */
class _whereStream extends _filteringStream {
    /**
     * whereStream constructor
     * @param parent - the parent stream
     * @param condition - the function that returns true for messages to keep
     */
    constructor(parent, condition) {
        super(parent);
        this.condition = condition;
    }
    add(data) {
        try {
            if (this.condition(data)) {
                super.add(data);
            }
        }
        catch (e) {
            super.addError(e);
        }
    }
}
/** @ignore **/
class _distinctStream extends _filteringStream {
    /**
     * distinctStream constructor
     * @param parent - the parent stream
     * @param equals - the function that tests if two values are equal
     */
    constructor(parent, equals) {
        super(parent);
        this.equals = equals;
        this._oldVal = null;
    }
    add(data) {
        try {
            if (!this.equals(this._oldVal, data)) {
                this._oldVal = data;
                super.add(data);
            }
        }
        catch (e) {
            super.addError(e);
        }
    }
}
