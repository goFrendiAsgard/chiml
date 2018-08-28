import { render } from "ejs";
import { CommandType, FunctionalMode, Mode } from "../enums/singleTaskProperty";
import { ISingleTask } from "../interfaces/ISingleTask";
import { doubleQuote } from "./stringUtil";

export function renderTemplate(template: string, config: { [key: string]: any }, spaceCount: number = 0): string {
    let spaces = "";
    for (let i = 0; i < spaceCount; i++) {
        spaces += " ";
    }
    let lines = render(template, config).split("\n");
    lines = lines.map((line) => spaces + line);
    return lines.join("\n");
}

export function createHandlerScript(task: ISingleTask, spaceCount: number = 0): string {
    const ins = task.expectLocalScope ? getInputDeclaration(task) : "";
    const firstFlag = `__first${task.id}`;
    const branch = task.branchCondition;
    const loop = task.loopCondition;
    const template = getTemplate(task);
    return renderTemplate(template, { task, ins, firstFlag, branch, loop }, spaceCount);
}

function wrapJsSyncFunction(task: ISingleTask, spaceCount: number): string {
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

function wrapJsFunctionWithCallback(task: ISingleTask, spaceCount: number): string {
    const ins = task.ins.length === 0 ? "" : task.ins.join(", ") + ", ";
    const template = [
        "const __promise<%- task.id %> = new Promise((__resolve, __reject) => {",
        "  (<%- task.command %>)(<%- ins %> (__error, ...__result) => {",
        "    if (__error) {",
        "      return __reject(__error);",
        "    }",
        "    <%- task.out %> = __result.length === 0 ? undefined : (__result.length === 1 ? __result[0] : __result);",
        "    return __resolve(true);",
        "  });",
        "});",
    ].join("\n");
    return renderTemplate(template, { task, ins }, spaceCount);
}

function wrapJsPromise(task: ISingleTask, spaceCount: number): string {
    const ins = task.ins.join(", ");
    const template = "const __promise<%- task.id %> = " +
        "<%- task.command %>.then((__result) => {<%- task.out %> = __result;});";
    return renderTemplate(template, { task, ins }, spaceCount);
}

function wrapCmd(task: ISingleTask, spaceCount: number): string {
    const ins = task.ins.join(", ");
    const command = task.command.replace(/\"/g, '\\"');
    const template = [
        "const __promise<%- task.id %> = ",
        '__cmd("<%- command %>", [<%- ins %>], {cwd: __dirname}, __isCompiled)',
        ".then((__result) => {<%- task.out %> = __result;});",
    ].join("");
    return renderTemplate(template, { command, task, ins }, spaceCount);
}

function createSubHandlerDeclaration(task: ISingleTask, spaceCount: number): string {
    return task.commandList.map((subTask) => createHandlerScript(subTask, spaceCount)).join("\n");
}

function getSubHandlerNames(task: ISingleTask): string[] {
    return task.commandList.map((subTask) => "__main" + subTask.id);
}

function wrapParallel(task: ISingleTask, spaceCount: number): string {
    const subHandlerDeclaration = createSubHandlerDeclaration(task, 0);
    const subHandlerNames = getSubHandlerNames(task);
    const parallelCall = subHandlerNames.map((name) => name + "()").join(", ");
    const template = "<%- subHandlerDeclaration %>\n" +
        "const __promise<%- task.id %> = Promise.all([<%- parallelCall %>]);";
    return renderTemplate(template, { task, parallelCall, subHandlerDeclaration }, spaceCount);
}

function wrapSeries(task: ISingleTask, spaceCount: number): string {
    const subHandlerDeclaration = createSubHandlerDeclaration(task, 0);
    const subHandlerNames = getSubHandlerNames(task);
    const seriesChain = subHandlerNames.map((name) => `.then(() => ${name}())`).join("");
    const template = "<%- subHandlerDeclaration %>\n" +
        "const __promise<%- task.id %> = Promise.resolve(true)<%- seriesChain %>;";
    return renderTemplate(template, { task, seriesChain, subHandlerDeclaration }, spaceCount);
}

function getWrapper(task: ISingleTask): (task: ISingleTask, spaceCount: number) => string {
    switch (task.mode) {
        case Mode.series: return wrapSeries;
        case Mode.parallel: return wrapParallel;
        case Mode.single:
            switch (task.commandType) {
                case CommandType.cmd: return wrapCmd;
                case CommandType.jsFunctionWithCallback: return wrapJsFunctionWithCallback;
                case CommandType.jsSyncFunction: return wrapJsSyncFunction;
                case CommandType.jsPromise: return wrapJsPromise;
            }
    }
}

function getReadableModeDescription(task: ISingleTask): string {
    switch (task.mode) {
        case Mode.series: return "Series";
        case Mode.parallel: return "Parallel";
        case Mode.single:
            switch (task.commandType) {
                case CommandType.cmd: return "Command : " + task.command;
                case CommandType.jsFunctionWithCallback: return "JS Function with Node Callback : " + task.command;
                case CommandType.jsSyncFunction: return "JS Function : " + task.command;
                case CommandType.jsPromise: return "JS Promise : " + task.command;
            }
    }
}

function getVariableDeclaration(variables, task: ISingleTask, spaceCount): string {
    const template = "let <%- variableName %> = <%- value %>;";
    const variableDeclaration = variables.filter((variableName) => {
        return task.ins.indexOf(variableName) === -1;
    }).map((variableName) => {
        const value = variableName in task.vars ? getVariableValue(task.vars[variableName]) : "null";
        return renderTemplate(template, { variableName, value }, spaceCount);
    }).join("\n");
    return variableDeclaration;
}

function getNonFunctionalTemplate(task: ISingleTask, unitTemplate: string): string {
    return [
        unitTemplate,
        "function __main<%- task.id %>(...__ins) {",
        "  return __unit<%- task.id %>(...__ins);",
        "}",
    ].join("\n");
}

function getFunctionalUnitTemplate(task: ISingleTask, unitTemplate: string): string {
    const dstVariableDeclaration = task.hasParent ? "" :
        "  let " + getVariableName(task.dst) + ";\n";
    const functionalTemplate = unitTemplate.split("\n").map((line) => {
        return `  ${line}`;
    }).join("\n");
    return dstVariableDeclaration + functionalTemplate;
}

function getMapTemplate(task: ISingleTask, unitTemplate: string): string {
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

function getFilterTemplate(task: ISingleTask, unitTemplate: string): string {
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

function getReduceTemplate(task: ISingleTask, unitTemplate: string): string {
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

function getTemplate(task: ISingleTask): string {
    const variables = task.expectLocalScope ? getLocalScopeVariables(task) : [];
    const wrapper = getWrapper(task);
    const readableModeDescription = getReadableModeDescription(task);
    const quotedReadableModeDescription = JSON.stringify(readableModeDescription);
    const promiseScript = wrapper(task, 6);
    const variableDeclaration = getVariableDeclaration(variables, task, 2);
    let readableFunctionalMode = doubleQuote(getReadableFunctionalMode(task.functionalMode));
    if (readableFunctionalMode !== "\"Normal\"") {
        readableFunctionalMode = [
            readableFunctionalMode,
            "JSON.stringify(<%- task.src %>)",
        ].join(" + ");
    }
    const unitTemplate = [
        "/* " + readableModeDescription + " */",
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
        "  return __fn<%- task.id %>().catch((__error) => {",
        "    __error = __error && 'message' in __error ? __error : new Error(__error);",
        "    if (__error && !__error.__propagated) {",
        "      __error.message = [",
        '        "",',
        '        "MODE    : " + ' + readableFunctionalMode + ",",
        '        "INPUT   : " + JSON.stringify([<%- ins %>], null, 2).split("\\n").join("\\n  "),',
        '        "PROCESS : " + ' + quotedReadableModeDescription + '.split("\\n").join("\\n  "),',
        '        "ERROR   : " + (__error.message).split("\\n").join("\\n  "),',
        '      ].join("\\n");',
        "      __error.__propagated = true;",
        "    }",
        "    throw(__error);",
        "  });",
        "}",
    ].join("\n");
    switch (task.functionalMode) {
        case FunctionalMode.none: return getNonFunctionalTemplate(task, unitTemplate);
        case FunctionalMode.map: return getMapTemplate(task, unitTemplate);
        case FunctionalMode.filter: return getFilterTemplate(task, unitTemplate);
        case FunctionalMode.reduce: return getReduceTemplate(task, unitTemplate);
    }
}

function getReadableFunctionalMode(functionalMode: number) {
    switch (functionalMode) {
        case FunctionalMode.none: return "Normal";
        case FunctionalMode.map: return "Map";
        case FunctionalMode.filter: return "Filter";
        case FunctionalMode.reduce: return "Reduce";
    }
}

function getInputDeclaration(task: ISingleTask): string {
    return task.ins.map((inputName) => {
        if (inputName in task.vars) {
            const val = getVariableValue(task.vars[inputName]);
            return `${inputName} = ${val}`;
        }
        return inputName;
    }).join(", ");
}

function getVariableValue(value) {
    return JSON.stringify(value);
}

function getVariableName(variableName: string): string {
    return (variableName.split(".")[0]).split("[")[0];
}

function getLocalScopeVariables(task: ISingleTask): string[] {
    let vars: string[] = Object.keys(task.vars);
    const out = getVariableName(task.out);
    if (task.ins.indexOf(out) === -1 && vars.indexOf(out) === -1) {
        vars.push(out);
    }
    for (const subTask of task.commandList) {
        const subVars = subTask.functionalMode === FunctionalMode.none ?
            getLocalScopeVariables(subTask) : [subTask.dst];
        const uniqueSubVars = subVars.filter((element) => vars.indexOf(element) === -1);
        vars = vars.concat(uniqueSubVars);
    }
    return vars;
}
