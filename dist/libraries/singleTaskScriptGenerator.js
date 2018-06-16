"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ejs_1 = require("ejs");
const singleTaskProperty_1 = require("../enums/singleTaskProperty");
function renderTemplate(template, config, spaceCount = 0) {
    let spaces = "";
    for (let i = 0; i < spaceCount; i++) {
        spaces += " ";
    }
    let lines = ejs_1.render(template, config).split("\n");
    lines = lines.map((line) => spaces + line);
    return lines.join("\n");
}
exports.renderTemplate = renderTemplate;
function getVariables(task) {
    let vars = [];
    if (task.ins.indexOf(task.out) === -1) {
        if (task.mode === singleTaskProperty_1.Mode.single) {
            vars.push(task.out);
        }
        for (const subTask of task.commandList) {
            const subVars = subTask.functionalMode === singleTaskProperty_1.FunctionalMode.none ? getVariables(subTask) : [subTask.dst];
            const uniqueSubVars = subVars.filter((element) => vars.indexOf(element) === -1);
            vars = vars.concat(uniqueSubVars);
        }
    }
    return vars;
}
exports.getVariables = getVariables;
//# sourceMappingURL=singleTaskScriptGenerator.js.map