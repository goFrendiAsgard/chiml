import {isFlanked, removeFlank, smartSplit} from "../libraries/stringUtil";

export enum Mode {
  parallel,
  series,
  single,
}

export enum CommandType {
  cmd,
  jsAsyncFunction,
  jsSyncFunction,
  jsPromise,
}

const jsArrowFunctionPattern = /^\(.*\)\s*=>.+/g;
const jsFunctionPattern = /^function\s*\(.*\)\s*{.+}$/g;

function splitByShortArrow(str: string): string[] {
  let shortArrowParts = smartSplit(str, "->");
  if (shortArrowParts.length === 1) {
    shortArrowParts = smartSplit(str, "<-").reverse();
  }
  return shortArrowParts;
}

function splitByLongArrow(str: string): string[] {
  let longArrowParts = smartSplit(str, "-->");
  if (longArrowParts.length === 1) {
    longArrowParts = smartSplit(str, "<--").reverse();
  }
  return longArrowParts;
}

function strToRawObj(str: string): {[key: string]: any} {
  const obj: {[key: string]: any} = {out: "__ans"};
  const longArrowParts = splitByLongArrow(str);
  if (longArrowParts.length === 2) {
    obj.ins = smartSplit(removeFlank(longArrowParts[0], "(", ")"), ",");
    obj.out = longArrowParts[1];
  } else {
    const shortArrowParts = splitByShortArrow(str);
    if (shortArrowParts.length === 3) {
      obj.ins = smartSplit(removeFlank(shortArrowParts[0], "(", ")"), ",");
      obj.do = shortArrowParts[1];
      obj.out = shortArrowParts[2];
    } else if (shortArrowParts.length === 2) {
      if (isFlanked(shortArrowParts[0], "(", ")")) {
        obj.ins = smartSplit(removeFlank(shortArrowParts[0], "(", ")"), ",");
        obj.do = shortArrowParts[1];
      } else {
        obj.do = shortArrowParts[0];
        obj.out = shortArrowParts[1];
      }
    } else {
      obj.do = shortArrowParts[0];
    }
  }
  return normalizeRawObject(obj);
}

function getNormalIns(ins: any): string[] {
  if (typeof ins === "string") {
    const newIns = smartSplit(ins, ",");
    if (newIns.length === 1 && newIns[0] === "") {
      return [];
    }
    return newIns;
  } else if (ins === null || ins === undefined) {
    return [];
  }
  return ins;
}

function parseCommand(normalizedObj: {[key: string]: any}, obj: {[key: string]: any}): {[key: string]: any} {
  if ("do" in obj && typeof obj.do === "string") {
    normalizedObj.command = obj.do ? obj.do : "(x) => x";
    if (isFlanked(normalizedObj.command, "{", "}")) {
      normalizedObj.command = removeFlank(normalizedObj.command, "{", "}");
      normalizedObj.commandType = CommandType.jsSyncFunction;
    } else if (isFlanked(normalizedObj.command, "<", ">")) {
      normalizedObj.command = removeFlank(normalizedObj.command, "<", ">");
      normalizedObj.commandType = CommandType.jsPromise;
    } else if (isFlanked(normalizedObj.command, "[", "]")) {
      normalizedObj.command = removeFlank(normalizedObj.command, "[", "]");
      normalizedObj.commandType = CommandType.jsAsyncFunction;
    } else {
      const command: string = normalizedObj.command;
      if (command.match(jsArrowFunctionPattern) || command.match(jsFunctionPattern)) {
        normalizedObj.commandType = CommandType.jsSyncFunction;
      } else {
        normalizedObj.commandType = CommandType.cmd;
      }
    }
    normalizedObj.mode = Mode.single;
  } else if ("do" in obj) {
    normalizedObj.commandList = obj.do;
    normalizedObj.mode = Mode.series;
  } else if ("series" in obj) {
    normalizedObj.commandList = obj.series;
    normalizedObj.mode = Mode.series;
  } else if ("parallel" in obj) {
    normalizedObj.commandList = obj.parallel;
    normalizedObj.mode = Mode.parallel;
  } else {
    normalizedObj.command = "(x) => x";
    normalizedObj.commandType = CommandType.jsSyncFunction;
    normalizedObj.mode = Mode.single;
  }
  return normalizedObj;
}

function normalizeRawObject(obj: {[key: string]: any}): {[key: string]: any} {
  let normalizedObj: {[key: string]: any} = {
    branchCondition: "if" in obj ? obj.if : "true",
    command: null,
    commandList: [],
    commandType: CommandType.cmd,
    ins: getNormalIns(obj.ins),
    loopCondition: "while" in obj ? obj.while : "false",
    mode: Mode.single,
    out: "out" in obj ? obj.out : "__ans",
    vars: "vars" in obj ? obj.vars : {},
  };
  normalizedObj = parseCommand(normalizedObj, obj);
  return normalizedObj;
}

export default class SingleTask {
  public ins: string[];
  public out: string;
  public branchCondition: string;
  public loopCondition: string;
  public command: string;
  public commandList: SingleTask[];
  public commandType: CommandType;
  public mode: Mode;
  public vars: {[key: string]: any};

  constructor(config: any) {
    const rawObj: {[key: string]: any} = typeof config === "string" ?
      strToRawObj(config) : normalizeRawObject(config);
    this.ins = rawObj.ins;
    this.out = rawObj.out;
    this.vars = rawObj.vars;
    this.vars = rawObj.mode;
    this.mode = rawObj.mode;
    this.branchCondition = rawObj.branchCondition;
    this.loopCondition = rawObj.loopCondition;
    this.command = rawObj.command;
    this.commandType = rawObj.commandType;
    this.commandList = rawObj.commandList;
    for (let i = 0; i < this.commandList.length; i++) {
      this.commandList[i] = new SingleTask(this.commandList[i]);
    }
  }

  public getScript(): string {
    // TODO: make this into script
    return "";
  }

  public execute(...inputs): Promise<any> {
    return new Promise((resolve, reject) => {
      const script = this.getScript();
      // TODO: vm.runInNewContext
      resolve(true);
    });
  }

}
