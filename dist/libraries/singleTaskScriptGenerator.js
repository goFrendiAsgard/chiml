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
function wrapJsSyncFunction(task, spaceCount = 0) {
    const ins = task.ins.join(", ");
    const template = "const __promise<%- task.id %> = " +
        "Promise.resolve((<%- task.command %>)(<%- ins %>)).then(\n" +
        "  (__result) => <%- task.out %> = __result\n" +
        ");";
    return renderTemplate(template, { task, ins }, spaceCount);
}
function wrapJsAsyncFunction(task, spaceCount = 0) {
    const ins = task.ins.join(", ");
    const template = "const __promise<%- task.id %> = " +
        "new Promise((__resolve, __reject) => {\n" +
        "  (<%- task.command %>)(<%- ins %>, (__error, __result) => {\n" +
        "    if (__error) {\n" +
        "      return __reject(__error);\n" +
        "    }\n" +
        "    <%- task.out %> = __result;\n" +
        "    return __resolve(true);\n" +
        "  });\n" +
        "});";
    return renderTemplate(template, { task, ins }, spaceCount);
}
function wrapJsPromise(task, spaceCount = 0) {
    const ins = task.ins.join(", ");
    const template = "const __promise<%- task.id %> = " +
        "<%- task.command %>.then((__result) => {<%- task.out %> = __result;});";
    return renderTemplate(template, { task, ins }, spaceCount);
}
function wrapCmd(task, spaceCount = 0) {
    const ins = task.ins.join(", ");
    const template = "const __promise<%- task.id %> = " +
        'cmdComposedCommand("<%- task.command %>", [<%- ins %>])' +
        ".then((__result) => {<%- task.out %> = __result;});";
    return renderTemplate(template, { task, ins }, spaceCount);
}
function createSubHandlerDeclaration(task, spaceCount = 0) {
    return task.commandList.map((subTask) => createHandlerScript(subTask, spaceCount)).join("\n");
}
function getSubHandlerNames(task) {
    return task.commandList.map((subTask) => "__main" + subTask.id);
}
function wrapParallel(task, spaceCount = 0) {
    const subHandlerDeclaration = createSubHandlerDeclaration(task, 0);
    const subHandlerNames = getSubHandlerNames(task);
    const parallelCall = subHandlerNames.map((name) => name + "()").join(", ");
    const template = "<%- subHandlerDeclaration %>\n" +
        "const __promise<%- task.id %> = Promise.all([<%- parallelCall %>]);";
    return renderTemplate(template, { task, parallelCall, subHandlerDeclaration }, spaceCount);
}
function wrapSeries(task, spaceCount = 0) {
    const subHandlerDeclaration = createSubHandlerDeclaration(task, 0);
    const subHandlerNames = getSubHandlerNames(task);
    const seriesChain = subHandlerNames.map((name) => `.then(() => ${name}())`).join("");
    const template = "<%- subHandlerDeclaration %>\n" +
        "const __promise<%- task.id %> = Promise.resolve(true)<%- seriesChain %>;";
    return renderTemplate(template, { task, seriesChain, subHandlerDeclaration }, spaceCount);
}
function getWrapper(task) {
    switch (task.mode) {
        case singleTaskProperty_1.Mode.series: return wrapSeries;
        case singleTaskProperty_1.Mode.parallel: return wrapParallel;
        case singleTaskProperty_1.Mode.single:
            switch (task.commandType) {
                case singleTaskProperty_1.CommandType.cmd: return wrapCmd;
                case singleTaskProperty_1.CommandType.jsAsyncFunction: return wrapJsAsyncFunction;
                case singleTaskProperty_1.CommandType.jsSyncFunction: return wrapJsSyncFunction;
                case singleTaskProperty_1.CommandType.jsPromise: return wrapJsPromise;
            }
    }
}
function getVariableDeclaration(task, spaceCount) {
    const variables = task.isMainParent ? getVariables(task) : [];
    const template = "let <%- variableName %> = <%- value %>;";
    let variableDeclaration = variables.map((variableName) => {
        const value = variableName in task.vars ? JSON.stringify(task.vars[variableName]) : "null";
        return renderTemplate(template, { variableName, value }, spaceCount);
    }).join("\n");
    if (variableDeclaration !== "") {
        variableDeclaration += "\n";
    }
    return variableDeclaration;
}
function createHandlerScript(task, spaceCount = 0) {
    const wrapper = getWrapper(task);
    const promiseScript = wrapper(task, spaceCount + 2) + "\n";
    const variableDeclaration = getVariableDeclaration(task, spaceCount + 2);
    const ins = task.isMainParent ? task.ins.join(", ") : "";
    const firstFlag = `__first${task.id}`;
    const branch = task.branchCondition;
    const loop = task.loopCondition;
    const template = "function __main<%- task.id %>(<%- ins %>) {\n" +
        "  let <%- firstFlag %> = true;\n" +
        "<%- variableDeclaration -%>" +
        "<%- promiseScript -%>" +
        "  function __fn<%- task.id %>() {\n" +
        "    if ((<%- firstFlag %> && (<%- branch %>)) || (!<%- firstFlag %> && <%- loop %>)) {\n" +
        "      __first<%- task.id %> = false;\n" +
        "      return __promise<%- task.id %>.then(() => __fn<%- task.id %>());\n" +
        "    }\n" +
        "    return Promise.resolve(<%- task.out %>);\n" +
        "  }\n" +
        "  return __fn<%- task.id %>();\n" +
        "}";
    return renderTemplate(template, { task, promiseScript, variableDeclaration, ins, firstFlag, branch, loop }, spaceCount);
}
exports.createHandlerScript = createHandlerScript;
function getTopLevelVariable(variableName) {
    return (variableName.split(".")[0]).split("[")[0];
}
function getVariables(task) {
    let vars = Object.keys(task.vars);
    const out = getTopLevelVariable(task.out);
    if (task.ins.indexOf(out) === -1 && vars.indexOf(out) === -1) {
        if (task.mode === singleTaskProperty_1.Mode.single) {
            vars.push(out);
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
