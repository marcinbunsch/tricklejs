import { StreamSubscriptionActions } from "./stream_subscription";

export interface StreamInterface<T> {
  listen(
    onData: StreamListener<T>,
    callbacks?: StreamListenOptions
  ): StreamSubscriptionActions;
  asBroadcastStream(): StreamInterface<T>;
  close(): void;
  every(condition: (data: T) => boolean): Promise<boolean>;
  first(): Promise<T>;
  firstWhere(condition: (data: T) => boolean): Promise<T>;
  forEach(fn: (data: T) => void): Promise<void>;
  reduce(reducer: (prev: any, next: T) => any): Promise<any>;
  map<U>(transform: (data: T) => U): StreamInterface<U>;
  asyncMap<U>(transform: (data: T) => Promise<U>): StreamInterface<U>;
  take(n: number): StreamInterface<T>;
  takeWhile(condition: (data: T) => boolean): StreamInterface<T>;
  skip(n: number): StreamInterface<T>;
  skipWhile(condition: (data: T) => boolean): StreamInterface<T>;
  where(condition: (data: T) => boolean): StreamInterface<T>;
  toArray(): Promise<Array<T>>;
  toSet(): Promise<Set<T>>;
  isBroadcast: boolean;
  isClosed: boolean;
  addEventListener(
    event: "onListen" | "onPause" | "onResume" | "onCancel",
    callback: StreamCallback
  ): void;
  removeEventListener(
    event: "onListen" | "onPause" | "onResume" | "onCancel",
    callback: StreamCallback
  ): void;
}
/**
 * streamMessageType - the types a message can be
 */
export enum StreamMessageType {
  Data,
  Error,
  Done,
}

/**
 * StreamMessageData - represents data in a stream
 * @template T - The type of data i nthe stream
 */
export interface StreamMessageData<T> {
  type: StreamMessageType.Data;
  data: T;
}

/**
 * StreamMessageError - represents errors in the stream
 */
export interface StreamMessageError {
  type: StreamMessageType.Error;
  data: Error;
}

/**
 * StreamMessageDone - represents the done message in the stream
 */
export interface StreamMessageDone {
  type: StreamMessageType.Done;
}

/**
 * StreamMessage - the messages in the stream
 */
export type StreamMessage<T> =
  | StreamMessageData<T>
  | StreamMessageError
  | StreamMessageDone;

/**
 * streamListener - listeners of the stream
 * @param data - the data passed to the listener
 * @template T - the type of the data
 */
export interface StreamListener<T> {
  (data: T): void;
}

/**
 * streamErrorListener - error listeners on the stream
 * @param error - the error
 */
export interface StreamErrorListener {
  (e: Error): void;
}

/**
 * StreamCallback - callbacks for the stream (eg: onDone, onPause, onResume...)
 */
export interface StreamCallback {
  (): void;
}

/**
 * StreamListenOptions - the optional callbacks when listening to a stream
 */
export interface StreamListenOptions {
  onError?: StreamErrorListener;
  onDone?: StreamCallback;
  onPause?: StreamCallback;
  onResume?: StreamCallback;
  cancelOnError?: boolean;
}
