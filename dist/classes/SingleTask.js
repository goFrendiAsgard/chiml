"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stringUtil_1 = require("../libraries/stringUtil");
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
    CommandType[CommandType["jsAsyncFunction"] = 1] = "jsAsyncFunction";
    CommandType[CommandType["jsSyncFunction"] = 2] = "jsSyncFunction";
    CommandType[CommandType["jsPromise"] = 3] = "jsPromise";
})(CommandType = exports.CommandType || (exports.CommandType = {}));
const jsArrowFunctionPattern = /^\(.*\)\s*=>.+/g;
const jsFunctionPattern = /^function\s*\(.*\)\s*{.+}$/g;
function splitBy(str, splitter, reverseSplitter) {
    let parts = stringUtil_1.smartSplit(str, splitter);
    if (parts.length === 1) {
        parts = stringUtil_1.smartSplit(str, reverseSplitter).reverse();
    }
    return parts;
}
function splitByShortArrow(str) {
    return splitBy(str, "->", "<-");
}
function splitByLongArrow(str) {
    return splitBy(str, "-->", "<--");
}
function strToRawObj(str) {
    const obj = { out: "__ans" };
    const longArrowParts = splitByLongArrow(str);
    if (longArrowParts.length === 2) {
        obj.ins = stringUtil_1.smartSplit(stringUtil_1.removeFlank(longArrowParts[0], "(", ")"), ",");
        obj.out = longArrowParts[1];
    }
    else {
        const shortArrowParts = splitByShortArrow(str);
        if (shortArrowParts.length === 3) {
            obj.ins = stringUtil_1.smartSplit(stringUtil_1.removeFlank(shortArrowParts[0], "(", ")"), ",");
            obj.do = shortArrowParts[1];
            obj.out = shortArrowParts[2];
        }
        else if (shortArrowParts.length === 2) {
            if (stringUtil_1.isFlanked(shortArrowParts[0], "(", ")")) {
                obj.ins = stringUtil_1.smartSplit(stringUtil_1.removeFlank(shortArrowParts[0], "(", ")"), ",");
                obj.do = shortArrowParts[1];
            }
            else {
                obj.do = shortArrowParts[0];
                obj.out = shortArrowParts[1];
            }
        }
        else {
            obj.do = shortArrowParts[0];
        }
    }
    return normalizeRawObject(obj);
}
function getNormalIns(ins) {
    if (typeof ins === "string") {
        const newIns = stringUtil_1.smartSplit(ins, ",");
        if (newIns.length === 1 && newIns[0] === "") {
            return [];
        }
        return newIns;
    }
    else if (ins === null || ins === undefined) {
        return [];
    }
    return ins;
}
function parseSingleCommand(normalizedObj, obj) {
    if ("do" in obj && typeof obj.do === "string") {
        normalizedObj.command = obj.do ? obj.do : "(x) => x";
        if (stringUtil_1.isFlanked(normalizedObj.command, "{", "}")) {
            normalizedObj.command = stringUtil_1.removeFlank(normalizedObj.command, "{", "}");
            normalizedObj.commandType = CommandType.jsSyncFunction;
        }
        else if (stringUtil_1.isFlanked(normalizedObj.command, "<", ">")) {
            normalizedObj.command = stringUtil_1.removeFlank(normalizedObj.command, "<", ">");
            normalizedObj.commandType = CommandType.jsPromise;
        }
        else if (stringUtil_1.isFlanked(normalizedObj.command, "[", "]")) {
            normalizedObj.command = stringUtil_1.removeFlank(normalizedObj.command, "[", "]");
            normalizedObj.commandType = CommandType.jsAsyncFunction;
        }
        else {
            const command = normalizedObj.command;
            if (command.match(jsArrowFunctionPattern) || command.match(jsFunctionPattern)) {
                normalizedObj.commandType = CommandType.jsSyncFunction;
            }
            else {
                normalizedObj.commandType = CommandType.cmd;
            }
        }
        normalizedObj.mode = Mode.single;
    }
    return normalizedObj;
}
function parseNestedCommand(normalizedObj, obj) {
    if ("do" in obj && typeof obj.do !== "string") {
        normalizedObj.commandList = obj.do;
        normalizedObj.mode = Mode.series;
    }
    else if ("series" in obj) {
        normalizedObj.commandList = obj.series;
        normalizedObj.mode = Mode.series;
    }
    else if ("parallel" in obj) {
        normalizedObj.commandList = obj.parallel;
        normalizedObj.mode = Mode.parallel;
    }
    else if (!normalizedObj.command) {
        normalizedObj.command = "(x) => x";
        normalizedObj.commandType = CommandType.jsSyncFunction;
        normalizedObj.mode = Mode.single;
    }
    return normalizedObj;
}
function parseFunctionalCommand(normalizedObj, obj) {
    if ("map" in obj || "filter" in obj || "reduce" in obj) {
        normalizedObj.dst = obj.into;
        if ("map" in obj) {
            normalizedObj.src = obj.map;
            normalizedObj.functionalMode = FunctionalMode.map;
        }
        else if ("filter" in obj) {
            normalizedObj.src = obj.filter;
            normalizedObj.functionalMode = FunctionalMode.filter;
        }
        else if ("reduce" in obj) {
            normalizedObj.src = obj.reduce;
            normalizedObj.functionalMode = FunctionalMode.reduce;
        }
    }
    return normalizedObj;
}
function parseCommand(normalizedObj, obj) {
    normalizedObj = parseFunctionalCommand(normalizedObj, obj);
    normalizedObj = parseSingleCommand(normalizedObj, obj);
    normalizedObj = parseNestedCommand(normalizedObj, obj);
    return normalizedObj;
}
function normalizeRawObject(obj) {
    let normalizedObj = {
        accumulator: "accumulator" in obj ? obj.accumulator : "0",
        branchCondition: "if" in obj ? obj.if : "true",
        command: null,
        commandList: [],
        commandType: CommandType.cmd,
        dst: null,
        functionalMode: FunctionalMode.none,
        ins: getNormalIns(obj.ins),
        loopCondition: "while" in obj ? obj.while : "false",
        mode: Mode.single,
        out: "out" in obj ? obj.out : "__ans",
        src: null,
        vars: "vars" in obj ? obj.vars : {},
    };
    normalizedObj = parseCommand(normalizedObj, obj);
    return normalizedObj;
}
class SingleTask {
    constructor(config, parentId = "_", id = 1) {
        const rawObj = typeof config === "string" ?
            strToRawObj(config) : normalizeRawObject(config);
        this.ins = rawObj.ins;
        this.out = rawObj.out;
        this.vars = rawObj.vars;
        this.vars = rawObj.mode;
        this.mode = rawObj.mode;
        this.branchCondition = rawObj.branchCondition;
        this.loopCondition = rawObj.loopCondition;
        this.command = rawObj.command;
        this.commandType = rawObj.commandType;
        this.commandList = rawObj.commandList;
        this.src = rawObj.src;
        this.dst = rawObj.dst;
        this.accumulator = rawObj.accumulator;
        this.functionalMode = rawObj.functionalMode;
        this.id = parentId + id;
        for (let i = 0; i < this.commandList.length; i++) {
            this.commandList[i] = new SingleTask(this.commandList[i], this.id, i);
        }
    }
    getScript() {
        // TODO: make this into script
        return "";
    }
    execute(...inputs) {
        return new Promise((resolve, reject) => {
            const script = this.getScript();
            // TODO: vm.runInNewContext
            resolve(true);
        });
    }
}
exports.default = SingleTask;
//# sourceMappingURL=SingleTask.js.map