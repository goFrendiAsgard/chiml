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

function getVariableDeclaration(task: ISingleTask, spaceCount): string {
  const variables = task.isMainParent ? getVariables(task) : [];
  const template = "let <%- variableName %> = <%- value %>;";
  let variableDeclaration = variables.map((variableName) => {
    const value = variableName in task.vars ? JSON.stringify(task.vars[variableName]) : "null";
    return renderTemplate(template, {variableName, value}, spaceCount);
  }).join("\n");
  if (variableDeclaration !== "") {
    variableDeclaration += "\n";
  }
  return variableDeclaration;
}

function getNonFunctionalTemplate(task: ISingleTask, unitTemplate: string): string {
  return `${unitTemplate}\n__main<%- task.id %> = __unit<%- task.id %>;`;
}

function getFunctionalUnitTemplate(unitTemplate: string): string {
  return unitTemplate.split("\n").map((line) => `  ${line}`).join("\n");
}

function getMapTemplate(task: ISingleTask, unitTemplate: string): string {
  const functionalUnitTemplate = getFunctionalUnitTemplate(unitTemplate);
  return "function __main<%- task.id %>() {\n" +
    functionalUnitTemplate + "\n" +
    "  const __promises = <%- task.src %>.map((__element) => __unit<%- task.id %>(__element));\n" +
    "  return Promise.all(__promises).then((__result) => <%- task.dst %> = __result);\n" +
    "}";
}

function getFilterTemplate(task: ISingleTask, unitTemplate: string): string {
  return unitTemplate + "\n" +
    "__main<%- task.id %> = __unit<%- task.id %>;";
}

function getReduceTemplate(task: ISingleTask, unitTemplate: string): string {
  return unitTemplate + "\n" +
    "__main<%- task.id %> = __unit<%- task.id %>;";
}

function getTemplate(task: ISingleTask): string {
  const unitTemplate = "function __unit<%- task.id %>(<%- ins %>) {\n" +
    "<%- variableDeclaration -%>" +
    "  let <%- firstFlag %> = true;\n" +
    "  function __fn<%- task.id %>() {\n" +
    "    if ((<%- firstFlag %> && (<%- branch %>)) || (!<%- firstFlag %> && <%- loop %>)) {\n" +
    "<%- promiseScript -%>" +
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
  const wrapper = getWrapper(task);
  const promiseScript = wrapper(task, spaceCount + 6) + "\n";
  const variableDeclaration = getVariableDeclaration(task, spaceCount + 2);
  const ins = task.isMainParent ? task.ins.join(", ") : "";
  const firstFlag = `__first${task.id}`;
  const branch = task.branchCondition;
  const loop = task.loopCondition;
  const template = getTemplate(task);
  return renderTemplate(template, {task, promiseScript, variableDeclaration, ins, firstFlag, branch, loop}, spaceCount);
}

function getTopLevelVariable(variableName: string): string {
  return (variableName.split(".")[0]).split("[")[0];
}

function getVariables(task: ISingleTask): string[] {
  let vars: string[] = Object.keys(task.vars);
  const out = getTopLevelVariable(task.out);
  const dst = getTopLevelVariable(task.dst);
  if (task.ins.indexOf(out) === -1 && vars.indexOf(out) === -1) {
    if (task.mode === Mode.single) {
      vars.push(out);
    }
    for (const subTask of task.commandList) {
      const subVars = subTask.functionalMode === FunctionalMode.none ? getVariables(subTask) : [subTask.dst];
      const uniqueSubVars = subVars.filter((element) => vars.indexOf(element) === -1);
      vars = vars.concat(uniqueSubVars);
    }
  }
  return vars;
}
