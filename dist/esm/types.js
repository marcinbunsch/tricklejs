/**
 * streamMessageType - the types a message can be
 */
export var StreamMessageType;
(function (StreamMessageType) {
    StreamMessageType[StreamMessageType["Data"] = 0] = "Data";
    StreamMessageType[StreamMessageType["Error"] = 1] = "Error";
    StreamMessageType[StreamMessageType["Done"] = 2] = "Done";
})(StreamMessageType || (StreamMessageType = {}));
