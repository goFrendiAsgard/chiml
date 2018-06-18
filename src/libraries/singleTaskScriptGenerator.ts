import {render} from "ejs";
import {CommandType, FunctionalMode, Mode} from "../enums/singleTaskProperty";
import {ISingleTask} from "../interfaces/ISingleTask";

export function renderTemplate(template: string, config: {[key: string]: any}, spaceCount: number = 0): string {
  let spaces = "";
  for (let i = 0; i < spaceCount; i++) {
    spaces += " ";
  }
  let lines = render(template, config).split("\n");
  lines = lines.map((line) => spaces + line);
  return lines.join("\n");
}

function wrapJsSyncFunction(task: ISingleTask, spaceCount: number): string {
  const ins = task.ins.join(", ");
  const template = "const __promise<%- task.id %> = " +
    "Promise.resolve((<%- task.command %>)(<%- ins %>)).then(\n" +
    "  (__result) => <%- task.out %> = __result\n" +
    ");";
  return renderTemplate(template, {task, ins}, spaceCount);
}

function wrapJsAsyncFunction(task: ISingleTask, spaceCount: number): string {
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
  return renderTemplate(template, {task, ins}, spaceCount);
}

function wrapJsPromise(task: ISingleTask, spaceCount: number): string {
  const ins = task.ins.join(", ");
  const template = "const __promise<%- task.id %> = " +
    "<%- task.command %>.then((__result) => {<%- task.out %> = __result;});";
  return renderTemplate(template, {task, ins}, spaceCount);
}

function wrapCmd(task: ISingleTask, spaceCount: number): string {
  const ins = task.ins.join(", ");
  const template = "const __promise<%- task.id %> = " +
    'cmdComposedCommand("<%- task.command %>", [<%- ins %>])' +
    ".then((__result) => {<%- task.out %> = __result;});";
  return renderTemplate(template, {task, ins}, spaceCount);
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
  return renderTemplate(template, {task, parallelCall, subHandlerDeclaration}, spaceCount);
}

function wrapSeries(task: ISingleTask, spaceCount: number): string {
  const subHandlerDeclaration = createSubHandlerDeclaration(task, 0);
  const subHandlerNames = getSubHandlerNames(task);
  const seriesChain = subHandlerNames.map((name) => `.then(() => ${name}())`).join("");
  const template = "<%- subHandlerDeclaration %>\n" +
    "const __promise<%- task.id %> = Promise.resolve(true)<%- seriesChain %>;";
  return renderTemplate(template, {task, seriesChain, subHandlerDeclaration}, spaceCount);
}

function getWrapper(task: ISingleTask): (task: ISingleTask, spaceCount: number) => string {
  switch (task.mode) {
    case Mode.series: return wrapSeries;
    case Mode.parallel: return wrapParallel;
    case Mode.single:
      switch (task.commandType) {
        case CommandType.cmd: return wrapCmd;
        case CommandType.jsAsyncFunction: return wrapJsAsyncFunction;
        case CommandType.jsSyncFunction: return wrapJsSyncFunction;
        case CommandType.jsPromise: return wrapJsPromise;
      }
  }
}

function getVariableDeclaration(variables, task: ISingleTask, spaceCount): string {
  const template = "let <%- variableName %> = <%- value %>;";
  const variableDeclaration = variables.map((variableName) => {
    const value = variableName in task.vars ? JSON.stringify(task.vars[variableName]) : "null";
    return renderTemplate(template, {variableName, value}, spaceCount);
  }).join("\n");
  return variableDeclaration;
}

function getNonFunctionalTemplate(task: ISingleTask, unitTemplate: string): string {
  return `${unitTemplate}\n__main<%- task.id %> = __unit<%- task.id %>;`;
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
  return "function __main<%- task.id %>(__src = <%- task.src %>) {\n" +
    functionalUnitTemplate + "\n" +
    "  const __promises = __src.map((__element) => __unit<%- task.id %>(__element));\n" +
    "  return Promise.all(__promises).then((__result) => {\n" +
    "    <%- task.dst %> = __result;\n" +
    "  }).then(() => Promise.resolve(<%- task.dst %>));\n" +
    "}";
}

function getFilterTemplate(task: ISingleTask, unitTemplate: string): string {
  const functionalUnitTemplate = getFunctionalUnitTemplate(task, unitTemplate);
  return "function __main<%- task.id %>(__src = <%- task.src %>) {\n" +
    functionalUnitTemplate + "\n" +
    "  const __promises = __src.map((__element) => __unit<%- task.id %>(__element));\n" +
    "  return Promise.all(__promises).then((__result) => {\n" +
    "    __filtered = [];\n" +
    "    for (let __i = 0; __i < __src.length; __i++){\n" +
    "      if (__result[__i]) {\n" +
    "        __filtered.push(__src[__i]);\n" +
    "      }\n" +
    "    }\n" +
    "    <%- task.dst %> = __filtered;\n" +
    "  }).then(() => Promise.resolve(<%- task.dst %>));\n" +
    "}";
}

function getReduceTemplate(task: ISingleTask, unitTemplate: string): string {
  const functionalUnitTemplate = getFunctionalUnitTemplate(task, unitTemplate);
  return "function __main<%- task.id %>(__src = <%- task.src %>) {\n" +
    "  let __accumulator = <%- task.accumulator %>;\n" +
    functionalUnitTemplate + "\n" +
    "  let __promise = Promise.resolve(true);\n" +
    "  for (let __i = 0; __i < __src.length; __i++){\n" +
    "    __promise = __promise.then(\n" +
    "      () => __unit<%- task.id %>(__src[__i], __accumulator)\n" +
    "    ).then((__result) => {\n" +
    "      __accumulator = __result;\n" +
    "    });\n" +
    "  }\n" +
    "  return __promise.then(() => {\n" +
    "    <%- task.dst %> = __accumulator;\n" +
    "  }).then(() => Promise.resolve(<%- task.dst %>));\n" +
    "}";
}

function getTemplate(task: ISingleTask): string {
  const variables = task.expectLocalScope ? getLocalScopeVariables(task) : [];
  const wrapper = getWrapper(task);
  const promiseScript = wrapper(task, 6);
  const variableDeclaration = getVariableDeclaration(variables, task, 2);
  const unitTemplate = "function __unit<%- task.id %>(<%- ins %>) {\n" +
    (variableDeclaration ? variableDeclaration + "\n" : "") +
    "  let <%- firstFlag %> = true;\n" +
    "  function __fn<%- task.id %>() {\n" +
    "    if ((<%- firstFlag %> && (<%- branch %>)) || (!<%- firstFlag %> && <%- loop %>)) {\n" +
    promiseScript + "\n" +
    "      __first<%- task.id %> = false;\n" +
    "      return __promise<%- task.id %>.then(() => __fn<%- task.id %>());\n" +
    "    }\n" +
    "    return Promise.resolve(<%- task.out %>);\n" +
    "  }\n" +
    "  return __fn<%- task.id %>();\n" +
    "}";
  switch (task.functionalMode) {
    case FunctionalMode.none: return getNonFunctionalTemplate(task, unitTemplate);
    case FunctionalMode.map: return getMapTemplate(task, unitTemplate);
    case FunctionalMode.filter: return getFilterTemplate(task, unitTemplate);
    case FunctionalMode.reduce: return getReduceTemplate(task, unitTemplate);
  }
}

export function createHandlerScript(task: ISingleTask, spaceCount: number = 0): string {
  const ins = task.expectLocalScope ? task.ins.join(", ") : "";
  const firstFlag = `__first${task.id}`;
  const branch = task.branchCondition;
  const loop = task.loopCondition;
  const template = getTemplate(task);
  return renderTemplate(template, {task, ins, firstFlag, branch, loop}, spaceCount);
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
    const subVars = subTask.functionalMode === FunctionalMode.none ? getLocalScopeVariables(subTask) : [subTask.dst];
    const uniqueSubVars = subVars.filter((element) => vars.indexOf(element) === -1);
    vars = vars.concat(uniqueSubVars);
  }
  return vars;
}
