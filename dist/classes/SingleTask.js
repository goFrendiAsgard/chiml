"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stringUtil_1 = require("../libraries/stringUtil");
var Mode;
(function (Mode) {
    Mode[Mode["parallel"] = 0] = "parallel";
    Mode[Mode["series"] = 1] = "series";
})(Mode || (Mode = {}));
function createRawObject(str) {
    const obj = { ins: null, out: "__ans", command: null };
    let shortArrowParts = stringUtil_1.smartSplit(str, "->");
    if (shortArrowParts.length === 1) {
        shortArrowParts = stringUtil_1.smartSplit(str, "<-").reverse();
    }
    if (shortArrowParts.length === 3) {
        obj.ins = stringUtil_1.smartSplit(shortArrowParts[0], ",");
        obj.command = shortArrowParts[1];
        obj.out = shortArrowParts[3];
    }
    else if (shortArrowParts.length === 2) {
        // pass
    }
    else {
        let longArrowParts = stringUtil_1.smartSplit(str, "-->");
        if (longArrowParts.length === 1) {
            longArrowParts = stringUtil_1.smartSplit(str, "<--").reverse();
        }
        if (longArrowParts.length === 2) {
            obj.ins = longArrowParts[0];
            obj.out = longArrowParts[1];
        }
    }
    return normalizeRawObject(obj);
}
function normalizeRawObject(obj) {
    const normalizedObj = {};
    return normalizedObj;
}
class SingleTask {
    constructor(config) {
        const rawObj = typeof config === "string" ?
            createRawObject(config) : normalizeRawObject(config);
        this.ins = "ins" in rawObj ? rawObj.ins : [];
        this.out = "out" in rawObj ? rawObj.out : "__ans";
        this.vars = "vars" in rawObj ? rawObj.vars : {};
        this.vars = "mode" in rawObj ? rawObj.mode : Mode.series;
        this.command = "command" in rawObj ? rawObj.command : "{$.assign}";
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