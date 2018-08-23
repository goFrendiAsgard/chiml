"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Mode;
(function (Mode) {
    Mode[Mode["parallel"] = 0] = "parallel";
    Mode[Mode["series"] = 1] = "series";
    Mode[Mode["single"] = 2] = "single";
})(Mode = exports.Mode || (exports.Mode = {}));
var FunctionalMode;
(function (FunctionalMode) {
    FunctionalMode[FunctionalMode["none"] = 0] = "none";
    FunctionalMode[FunctionalMode["map"] = 1] = "map";
    FunctionalMode[FunctionalMode["filter"] = 2] = "filter";
    FunctionalMode[FunctionalMode["reduce"] = 3] = "reduce";
})(FunctionalMode = exports.FunctionalMode || (exports.FunctionalMode = {}));
var CommandType;
(function (CommandType) {
    CommandType[CommandType["cmd"] = 0] = "cmd";
    CommandType[CommandType["jsFunctionWithCallback"] = 1] = "jsFunctionWithCallback";
    CommandType[CommandType["jsSyncFunction"] = 2] = "jsSyncFunction";
    CommandType[CommandType["jsPromise"] = 3] = "jsPromise";
})(CommandType = exports.CommandType || (exports.CommandType = {}));
