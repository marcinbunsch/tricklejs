import { StreamCallback, StreamInterface } from "./types";
interface constructorParams {
    broadcast: boolean;
    onListen?: StreamCallback;
    onPause?: StreamCallback;
    onResume?: StreamCallback;
    onCancel?: StreamCallback;
}
export default class StreamController<T> {
    private _srcStream;
    private _dstStream;
    private _sink;
    private _streamProxy;
    private _done;
    onListen: StreamCallback | undefined;
    onPause: StreamCallback | undefined;
    onResume: StreamCallback | undefined;
    onCancel: StreamCallback | undefined;
    private _onListen;
    private _onPause;
    private _onResume;
    private _onCancel;
    /**
     * StreamController Constructor
     *
     * Controller that allows sending data, error and done events on its stream.
     * This class is used to control and expose a stream that other code can listen to.
     *
     * @param params listeners: onListen, onPause, onResume, onCancel
     * @template T the type of data to be passed on the stream
     */
    constructor(params?: constructorParams);
    add(data: T): void;
    addError(error: string | Error): void;
    addStream(stream: StreamInterface<T>, options?: {
        cancelOnError: boolean;
    }): Promise<void>;
    close(): void;
    get stream(): StreamInterface<T>;
    get sink(): _streamSink<T>;
    get isPaused(): boolean;
    get isClosed(): boolean;
    get done(): Promise<void>;
    static broadcast<T>(): StreamController<T>;
}
/**
 * Object that only contains add, addError and close methods
 * for a given stream.
 */
/** @ignore */
declare class _streamSink<T> {
    private _streamController;
    constructor(_streamController: StreamController<T>);
    add(data: T): void;
    addError(error: string | Error): void;
    addStream(stream: StreamInterface<T>, options?: {
        cancelOnError: boolean;
    }): Promise<void>;
    close(): void;
    get done(): Promise<void>;
}
export {};
//# sourceMappingURL=stream_controller.d.ts.map