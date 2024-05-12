import StreamSubscription from "./stream_subscription";
import { StreamSubscriptionActions } from "./stream_subscription";
import { StreamListener, StreamListenOptions, StreamCallback, StreamInterface } from "./types";
/** @ignore */
type StreamEventsMap = {
    [key: string]: Array<StreamCallback>;
};
/**
 * Stream
 * @template T - the type for the data in the stream
 */
export default class Stream<T> implements StreamInterface<T> {
    private _subscription;
    /** The buffer containing the stream messages */
    private _buffer;
    /** internal flag representing the paused state of the stream */
    private _isPaused;
    /** internal flag representing the closed state of the stream */
    protected _isClosed: boolean;
    protected _eventCallbacks: StreamEventsMap;
    /**
     * Derive a stream from a promise.
     *
     * @param promise - The promise to convert to a stream
     * @returns Stream - The stream
     * @template T - the type of the data resolved by the promise
     */
    static fromPromise<T>(promise: Promise<T>): StreamInterface<T>;
    /**
     * Derives a stream from promises
     *
     * Resolved values are data on the stream. Rejected values are errors on the stream.
     * Stream is closed after all promises have been resolved.
     * @param promises
     * @template T the type of data resolved by the promises
     */
    static fromPromises<T>(promises: Iterable<Promise<T>>): StreamInterface<T>;
    /**
     * Derives a new stream from an existing stream.
     *
     * @param stream
     * @returns stream
     * @template T the type of the data in the stream
     */
    static fromStream<T>(stream: Stream<T>): StreamInterface<T>;
    /**
     * _emit - emit messages to listeners
     */
    /** @ignore */
    private _emit;
    /**
     * Fire callbacks for event listeners
     *
     * @param name - the event name
     */
    protected _callEventListeners(name: string): void;
    /**
     * Cancel a StreamSubscription
     *
     * This is called when StreamSubscription.cancel() is called.
     */
    cancel(_: StreamSubscription<T>): void;
    /**
     * Subscribes a listener and callbacks to the stream.
     *
     * Override to alter the behavior on how listeners are managed.
     * @param onData - the listener
     * @param callbacks - the optional error and ondone callbacks
     */
    listen(onData: StreamListener<T>, callbacks?: StreamListenOptions): StreamSubscriptionActions;
    /**
     * Add messages to the stream.
     *
     * Override to alter how data is processed
     * @param data - the data to add
     */
    add(data: T): void;
    /**
     * Add errors to the stream.
     *
     * Override to alter how errors are processed
     * @param message - the error or error message
     */
    addError(message: string | Error): void;
    /**
     * Pause the stream.
     *
     * When a stream is paused, listeners are no longer notified for incoming messages.
     * Unless the stream is a broadcast stream, messages are buffered until the stream is resumed.
     */
    pause(): void;
    /**
     * Resume the stream.
     *
     * Unless the stream is a broadcast stream, buffered messages will be
     * dispatched to listeners when the stream resumes.
     */
    resume(): void;
    /**
     * Close the stream.
     *
     * When a stream is closed, add messages/errors to the stream are then prohibbited.
     */
    close(): void;
    /**
     * Add an event listener to the stream.
     *
     * This is used to be notified for events such as:
     * onListen, onPause, onResume, onCancel.
     *
     * @param name - the name of the event
     * @param callback
     */
    addEventListener(name: string, callback: StreamCallback): void;
    /**
     * Remove an event listener from the stream.
     *
     * @param name - the name of the event
     * @param callback
     */
    removeEventListener(name: string, callback: StreamCallback): void;
    /**
     * Whether the stream is a broadcast stream
     */
    get isBroadcast(): boolean;
    /**
     * The **closed** state of the stream.
     *
     * @return boolean
     */
    get isClosed(): boolean;
    /**
     * The **paused** state of the stream.
     *
     * @returns boolean
     */
    get isPaused(): boolean;
    /**
     * asBroadcastStream
     *
     * Creates a multilistener enabled stream that receives messages from the current stream.
     * The broadcast stream subscribes to the current stream when it receives its first listener.
     */
    asBroadcastStream(): StreamInterface<T>;
    /**
     * Derives new stream that emits mapped values.
     *
     * @param transform - the function that maps data of type T => type U
     * @template T original data type
     * @template U new data type
     */
    map<M>(transform: (data: T) => M): StreamInterface<M>;
    /**
     * Derives new stream that emits mapped values, accepting promises.
     *
     * When the transform function returns a promise, the stream will pause until the promise resolves.
     *
     * @param transform - the function that maps data of type T => Promise<U> | U
     * @template T original data type
     * @template U new data type
     */
    asyncMap<U>(transform: (data: T) => Promise<U> | U): StreamInterface<U>;
    /**
     * Derives new stream that consumes only the first *n* messages of the current stream.
     *
     * @param n - the number of messages to consume
     */
    take(n: number): StreamInterface<T>;
    /**
     * Dervices a new stream that continues to receive messages from the current stream
     * as long as the `condition` function returns true.
     *
     * @param condition - function that returns true to continue taking
     */
    takeWhile(condition: (data: T) => boolean): StreamInterface<T>;
    /**
     * Derives new stream that skips the first *n* messages of the current stream.
     *
     * @param n - the number of messages to skip
     */
    skip(n: number): StreamInterface<T>;
    /**
     * Derives new stream that continues to skip elements in the parent stream
     * until the `condition` function returns false.
     *
     * @param condition
     */
    skipWhile(condition: (data: T) => boolean): StreamInterface<T>;
    /**
     * Derives new stream that only receives messages from the parent stream if
     * the message matches the condition.
     *
     * @param condition
     */
    where(condition: (data: T) => boolean): StreamInterface<T>;
    /**
     * Derives new stream that only passes data from the parent stream if the data does not equal
     * the previously passed data.
     *
     * @param equals - function that checks if two values are the same
     */
    distinct(equals?: (oldVal: T | null, newVal: T | null) => boolean): StreamInterface<T>;
    /**
     * Checks if every message in the stream satisfies a certain condition
     *
     * @param condition
     * @returns Promise - Resolved if every message satifies the condtion, Rejects otherwise
     */
    every(condition: (data: T) => boolean): Promise<boolean>;
    /**
     * first - gets the first element in the stream
     *
     * Resolves the first element on the stream.
     * Rejects if there is an error before the first element is found.
     * Rejects if the stream is empty.
     *
     * @returns Promise
     */
    first(): Promise<T>;
    /**
     * firstWhere - gets the first element on the stream that matches a condition
     *
     * Resolves the first element that meets the condition.
     * Rejects if there is an error before the first element is found.
     * Rejects if the stream is empty.
     *
     * @param condition
     */
    firstWhere(condition: (data: T) => boolean): Promise<T>;
    /**
     * forEach - calls the callback for each element in the stream
     *
     * @param listener
     * @returns Promise - Resolved when the stream has ended, Rejected on error.
     */
    forEach(listener: StreamListener<T>): Promise<void>;
    /**
     * Calls a reducer function and returns value from the final call.
     *
     * @param reducer - fn that returns the new value by taking previous and current messages
     * @param initialValue - the initial value
     */
    reduce(reducer: (prev: any, next: T) => any, initialValue?: any): Promise<any>;
    /**
     * Takes the elements of a stream and outputs it into an Array.
     *
     * Note: if the stream outputs an error, the promise rejects with the error
     * from the stream.
     *
     * @returns Promise
     */
    toArray(): Promise<Array<T>>;
    /**
     * Takes the elements of a stream and outputs it into a Set.
     *
     * Note: if the stream outputs an error, the partial result will be
     * provided in the reject of the promise.
     * @returns Set
     */
    toSet(): Promise<Set<T>>;
}
export {};
//# sourceMappingURL=stream.d.ts.map