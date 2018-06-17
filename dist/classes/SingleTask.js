"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const singleTaskProperty_1 = require("../enums/singleTaskProperty");
const singleTaskConfigProcessor_1 = require("../libraries/singleTaskConfigProcessor");
class SingleTask {
    constructor(config, parentId = "", id = 0) {
        const normalizedConfig = typeof config === "string" ?
            singleTaskConfigProcessor_1.strToNormalizedConfig(config) : singleTaskConfigProcessor_1.normalizeRawConfig(config);
        this.ins = normalizedConfig.ins;
        this.out = normalizedConfig.out;
        this.vars = normalizedConfig.vars;
        this.vars = normalizedConfig.mode;
        this.mode = normalizedConfig.mode;
        this.branchCondition = normalizedConfig.branchCondition;
        this.loopCondition = normalizedConfig.loopCondition;
        this.command = normalizedConfig.command;
        this.commandType = normalizedConfig.commandType;
        this.commandList = normalizedConfig.commandList;
        this.src = normalizedConfig.src;
        this.dst = normalizedConfig.dst;
        this.accumulator = normalizedConfig.accumulator;
        this.functionalMode = normalizedConfig.functionalMode;
        this.id = parentId + "_" + id;
        this.isMainParent = parentId === "" || this.functionalMode !== singleTaskProperty_1.FunctionalMode.none;
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
exports.SingleTask = SingleTask;
//# sourceMappingURL=SingleTask.js.map