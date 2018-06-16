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
