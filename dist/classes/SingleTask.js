"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vm_1 = require("vm");
const singleTaskProperty_1 = require("../enums/singleTaskProperty");
const sandbox_1 = require("../libraries/sandbox");
const singleTaskConfigProcessor_1 = require("../libraries/singleTaskConfigProcessor");
const singleTaskScriptGenerator_1 = require("../libraries/singleTaskScriptGenerator");
class SingleTask {
    constructor(config, parentId = "", id = 0) {
        const normalizedConfig = typeof config === "string" ?
            singleTaskConfigProcessor_1.strToNormalizedConfig(config) : singleTaskConfigProcessor_1.normalizeRawConfig(config);
        this.ins = normalizedConfig.ins;
        this.out = normalizedConfig.out;
        this.vars = normalizedConfig.vars;
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
        this.chimlPath = normalizedConfig.chimlPath;
        this.id = parentId + "_" + id;
        this.hasParent = parentId !== "";
        this.expectLocalScope = parentId === "" || this.functionalMode !== singleTaskProperty_1.FunctionalMode.none;
        for (let i = 0; i < this.commandList.length; i++) {
            this.commandList[i] = new SingleTask(this.commandList[i], this.id, i);
        }
    }
    getScript() {
        return singleTaskScriptGenerator_1.createHandlerScript(this);
    }
    execute(...inputs) {
        return new Promise((resolve, reject) => {
            try {
                const sandbox = sandbox_1.createSandbox(this.chimlPath);
                const script = this.getScript();
                vm_1.runInNewContext(script, sandbox);
                const handler = sandbox.__main_0;
                handler(...inputs)
                    .then(resolve)
                    .catch(reject);
            }
            catch (error) {
                reject(error);
            }
        });
    }
}
exports.SingleTask = SingleTask;
