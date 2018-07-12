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
function createHandlerScript(task, spaceCount = 0) {
    const ins = task.expectLocalScope ? getInputDeclaration(task) : "";
    const firstFlag = `__first${task.id}`;
    const branch = task.branchCondition;
    const loop = task.loopCondition;
    const template = getTemplate(task);
    return renderTemplate(template, { task, ins, firstFlag, branch, loop }, spaceCount);
}
exports.createHandlerScript = createHandlerScript;
function wrapJsSyncFunction(task, spaceCount) {
    const ins = task.ins.join(", ");
    const template = [
        "const __promise<%- task.id %> = new Promise((__resolve, __reject) => {",
        "  try {",
        "    <%- task.out %> = (<%- task.command %>)(<%- ins %>);",
        "    __resolve(true);",
        "  } catch (__error) {",
        "    __reject(__error);",
        "  }",
        "})",
    ].join("\n");
    return renderTemplate(template, { task, ins }, spaceCount);
}
function wrapJsAsyncFunction(task, spaceCount) {
    const ins = task.ins.length === 0 ? "" : task.ins.join(", ") + ", ";
    const template = [
        "const __promise<%- task.id %> = new Promise((__resolve, __reject) => {",
        "  (<%- task.command %>)(<%- ins %> (__error, ...__result) => {",
        "    if (__error) {",
        "      return __reject(__error);",
        "    }",
        "    if (__result.length === 0) {",
        "      <%- task.out %> = undefined;",
        "    } else if (__result.length === 1) {",
        "      <%- task.out %> = __result[0];",
        "    } else {",
        "      <%- task.out %> = __result;",
        "    }",
        "    return __resolve(true);",
        "  });",
        "});",
    ].join("\n");
    return renderTemplate(template, { task, ins }, spaceCount);
}
function wrapJsPromise(task, spaceCount) {
    const ins = task.ins.join(", ");
    const template = "const __promise<%- task.id %> = " +
        "<%- task.command %>.then((__result) => {<%- task.out %> = __result;});";
    return renderTemplate(template, { task, ins }, spaceCount);
}
function wrapCmd(task, spaceCount) {
    const ins = task.ins.join(", ");
    const command = task.command.replace(/\"/g, '\\"');
    const template = [
        "const __promise<%- task.id %> = ",
        '__cmd("<%- command %>", [<%- ins %>], {cwd: __dirname}, __isCompiled)',
        ".then((__result) => {<%- task.out %> = __result;});",
    ].join("");
    return renderTemplate(template, { command, task, ins }, spaceCount);
}
function createSubHandlerDeclaration(task, spaceCount) {
    return task.commandList.map((subTask) => createHandlerScript(subTask, spaceCount)).join("\n");
}
function getSubHandlerNames(task) {
    return task.commandList.map((subTask) => "__main" + subTask.id);
}
function wrapParallel(task, spaceCount) {
    const subHandlerDeclaration = createSubHandlerDeclaration(task, 0);
    const subHandlerNames = getSubHandlerNames(task);
    const parallelCall = subHandlerNames.map((name) => name + "()").join(", ");
    const template = "<%- subHandlerDeclaration %>\n" +
        "const __promise<%- task.id %> = Promise.all([<%- parallelCall %>]);";
    return renderTemplate(template, { task, parallelCall, subHandlerDeclaration }, spaceCount);
}
function wrapSeries(task, spaceCount) {
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
function getVariableDeclaration(variables, task, spaceCount) {
    const template = "let <%- variableName %> = <%- value %>;";
    const variableDeclaration = variables.filter((variableName) => {
        return task.ins.indexOf(variableName) === -1;
    }).map((variableName) => {
        const value = variableName in task.vars ? JSON.stringify(task.vars[variableName]) : "null";
        return renderTemplate(template, { variableName, value }, spaceCount);
    }).join("\n");
    return variableDeclaration;
}
function getNonFunctionalTemplate(task, unitTemplate) {
    return [
        unitTemplate,
        "function __main<%- task.id %>(...__ins) {",
        "  return __unit<%- task.id %>(...__ins);",
        "}",
    ].join("\n");
}
function getFunctionalUnitTemplate(task, unitTemplate) {
    const dstVariableDeclaration = task.hasParent ? "" :
        "  let " + getVariableName(task.dst) + ";\n";
    const functionalTemplate = unitTemplate.split("\n").map((line) => {
        return `  ${line}`;
    }).join("\n");
    return dstVariableDeclaration + functionalTemplate;
}
function getMapTemplate(task, unitTemplate) {
    const functionalUnitTemplate = getFunctionalUnitTemplate(task, unitTemplate);
    return [
        "function __main<%- task.id %>(__src = <%- task.src %>) {",
        functionalUnitTemplate,
        "  const __promises = __src.map((__element) => __unit<%- task.id %>(__element));",
        "  return Promise.all(__promises).then((__result) => {",
        "    <%- task.dst %> = __result;",
        "  }).then(() => Promise.resolve(<%- task.dst %>));",
        "}",
    ].join("\n");
}
function getFilterTemplate(task, unitTemplate) {
    const functionalUnitTemplate = getFunctionalUnitTemplate(task, unitTemplate);
    return [
        "function __main<%- task.id %>(__src = <%- task.src %>) {",
        functionalUnitTemplate,
        "  const __promises = __src.map((__element) => __unit<%- task.id %>(__element));",
        "  return Promise.all(__promises).then((__result) => {",
        "    __filtered = [];",
        "    for (let __i = 0; __i < __src.length; __i++){",
        "      if (__result[__i]) {",
        "        __filtered.push(__src[__i]);",
        "      }",
        "    }",
        "    <%- task.dst %> = __filtered;",
        "  }).then(() => Promise.resolve(<%- task.dst %>));",
        "}",
    ].join("\n");
}
function getReduceTemplate(task, unitTemplate) {
    const functionalUnitTemplate = getFunctionalUnitTemplate(task, unitTemplate);
    return [
        "function __main<%- task.id %>(__src = <%- task.src %>) {",
        "  let __accumulator = <%- task.accumulator %>;",
        functionalUnitTemplate,
        "  let __promise = Promise.resolve(true);",
        "  for (let __i = 0; __i < __src.length; __i++){",
        "    __promise = __promise.then(",
        "      () => __unit<%- task.id %>(__src[__i], __accumulator)",
        "    ).then((__result) => {",
        "      __accumulator = __result;",
        "    });",
        "  }",
        "  return __promise.then(() => {",
        "    <%- task.dst %> = __accumulator;",
        "  }).then(() => Promise.resolve(<%- task.dst %>));",
        "}",
    ].join("\n");
}
function getTemplate(task) {
    const variables = task.expectLocalScope ? getLocalScopeVariables(task) : [];
    const wrapper = getWrapper(task);
    const promiseScript = wrapper(task, 6);
    const variableDeclaration = getVariableDeclaration(variables, task, 2);
    const unitTemplate = [
        "function __unit<%- task.id %>(<%- ins %>) {",
        (variableDeclaration ? variableDeclaration + "\n" : ""),
        "  let <%- firstFlag %> = true;",
        "  function __fn<%- task.id %>() {",
        "    if ((<%- firstFlag %> && (<%- branch %>)) || (!<%- firstFlag %> && <%- loop %>)) {",
        promiseScript,
        "      __first<%- task.id %> = false;",
        "      return __promise<%- task.id %>.then(() => __fn<%- task.id %>());",
        "    }",
        "    return Promise.resolve(<%- task.out %>);",
        "  }",
        "  return __fn<%- task.id %>();",
        "}",
    ].join("\n");
    switch (task.functionalMode) {
        case singleTaskProperty_1.FunctionalMode.none: return getNonFunctionalTemplate(task, unitTemplate);
        case singleTaskProperty_1.FunctionalMode.map: return getMapTemplate(task, unitTemplate);
        case singleTaskProperty_1.FunctionalMode.filter: return getFilterTemplate(task, unitTemplate);
        case singleTaskProperty_1.FunctionalMode.reduce: return getReduceTemplate(task, unitTemplate);
    }
}
function getInputDeclaration(task) {
    return task.ins.map((inputName) => {
        if (inputName in task.vars) {
            const val = JSON.stringify(task.vars[inputName]);
            return `${inputName} = ${val}`;
        }
        return inputName;
    }).join(", ");
}
function getVariableName(variableName) {
    return (variableName.split(".")[0]).split("[")[0];
}
function getLocalScopeVariables(task) {
    let vars = Object.keys(task.vars);
    const out = getVariableName(task.out);
    if (task.ins.indexOf(out) === -1 && vars.indexOf(out) === -1) {
        vars.push(out);
    }
    for (const subTask of task.commandList) {
        const subVars = subTask.functionalMode === singleTaskProperty_1.FunctionalMode.none ? getLocalScopeVariables(subTask) : [subTask.dst];
        const uniqueSubVars = subVars.filter((element) => vars.indexOf(element) === -1);
        vars = vars.concat(uniqueSubVars);
    }
    return vars;
}
//# sourceMappingURL=singleTaskScriptGenerator.js.map