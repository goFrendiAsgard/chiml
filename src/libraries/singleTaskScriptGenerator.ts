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

function wrapJsSyncFunction(task: ISingleTask, spaceCount: number = 0): string {
  const ins = task.ins.join(", ");
  const template = "const __promise<%- task.id %> = " +
    "Promise.resolve((<%- task.command %>)(<%- ins %>)).then(\n" +
    "  (__result) => <%- task.out %> = __result;\n" +
    ");";
  return renderTemplate(template, {task, ins}, spaceCount);
}

function wrapJsAsyncFunction(task: ISingleTask, spaceCount: number = 0): string {
  const ins = task.ins.join(", ");
  const template = "const __promise<%- task.id %> = " +
    "new Promise((__resolve, __reject) => {\n" +
    "  (<%- task.command %>)(<%- ins %>, (__error, __result) => {\n" +
    "    if (__error) {\n" +
    "      return __reject(__error);\n" +
    "    }\n" +
    "    <%- task.out %> = __result;\n" +
    "    return __resolve(true);\n" +
    "  })\n" +
    "});";
  return renderTemplate(template, {task, ins}, spaceCount);
}

function wrapJsPromise(task: ISingleTask, spaceCount: number = 0): string {
  const ins = task.ins.join(", ");
  const template = "const __promise<%- task.id %> = " +
    "<%- task.command %>.then((__result) => {<%- task.out %> = __result;});";
  return renderTemplate(template, {task, ins}, spaceCount);
}

function wrapCmd(task: ISingleTask, spaceCount: number = 0): string {
  const ins = task.ins.join(", ");
  const template = "const __promise<%- task.id %> = " +
    'cmdComposedCommand("<%- task.command %>", [<%- ins %>])' +
    ".then((__result) => {<%- task.out %> = __result;});";
  return renderTemplate(template, {task, ins}, spaceCount);
}

function createSubHandlerDeclaration(task: ISingleTask, spaceCount: number = 0): string {
  return task.commandList.map((subTask) => createHandlerScript(subTask, spaceCount)).join("\n");
  return "";
}

function getSubHandlerNames(task: ISingleTask): string[] {
  return task.commandList.map((subTask) => "__main_" + task.id);
}

function wrapParallel(task: ISingleTask, spaceCount: number = 0): string {
  const subHandlerDeclaration = createSubHandlerDeclaration(task, 0);
  const subHandlerNames = getSubHandlerNames(task);
  const parallelCall = subHandlerNames.map((name) => name + "()").join(", ");
  const template = "<%- subHandlerDeclaration %>\n" +
    "const __promise<%- task.id %> = Promise.all([<%- parallelCall %>]);";
  return renderTemplate(template, {task, parallelCall, subHandlerDeclaration}, spaceCount);
}

function wrapSeries(task: ISingleTask, spaceCount: number = 0): string {
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

export function createHandlerScript(task: ISingleTask, spaceCount: number = 0): string {
  const promiseSpaceIndent = spaceCount + 2;
  const wrapper = getWrapper(task);
  const promiseScript = wrapper(task, promiseSpaceIndent);
  const vars = task.isMainParent ? getVariables(task) : {};
  const template = 'function __main<%- task.id %>(<%- task.ins.join(", ") %>) {\n' +
    "<%- promiseScript -%>\n\n" +
    "  return __promise<%- task.id %>;\n" +
    "}";
  return renderTemplate(template, {task, promiseScript}, spaceCount);
}

export function getVariables(task: ISingleTask): string[] {
  let vars: string[] = [];
  if (task.ins.indexOf(task.out) === -1) {
    if (task.mode === Mode.single) {
      vars.push(task.out);
    }
    for (const subTask of task.commandList) {
      const subVars = subTask.functionalMode === FunctionalMode.none ? getVariables(subTask) : [subTask.dst];
      const uniqueSubVars = subVars.filter((element) => vars.indexOf(element) === -1);
      vars = vars.concat(uniqueSubVars);
    }
  }
  return vars;
}
