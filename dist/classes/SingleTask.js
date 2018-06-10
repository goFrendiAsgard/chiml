"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Mode;
(function (Mode) {
    Mode[Mode["parallel"] = 0] = "parallel";
    Mode[Mode["series"] = 1] = "series";
})(Mode || (Mode = {}));
function createRawObject(str) {
    const obj = {};
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