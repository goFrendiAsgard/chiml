import {smartSplit} from "../libraries/stringUtil";

enum Mode {
  parallel,
  series,
  single,
}

enum CommandType {
  cmd,
  jsAsyncFunction,
  jsSyncFunction,
  jsPromise,
}

function strToRawObj(str: string): {[key: string]: any} {
  const obj = {ins: null, out: "__ans", command: null};
  let shortArrowParts = smartSplit(str, "->");
  if (shortArrowParts.length === 1) {
    shortArrowParts = smartSplit(str, "<-").reverse();
  }
  if (shortArrowParts.length === 3) {
    obj.ins = smartSplit(shortArrowParts[0], ",");
    obj.command = shortArrowParts[1];
    obj.out = shortArrowParts[3];
  } else if (shortArrowParts.length === 2) {
    // pass
  } else {
    let longArrowParts = smartSplit(str, "-->");
    if (longArrowParts.length === 1) {
      longArrowParts = smartSplit(str, "<--").reverse();
    }
    if (longArrowParts.length === 2) {
      obj.ins = longArrowParts[0];
      obj.out = longArrowParts[1];
    }
  }
  return normalizeRawObject(obj);
}

function normalizeRawObject(obj: {[key: string]: any}): {[key: string]: any} {
  const normalizedObj: {[key: string]: any} = {
    ins: "ins" in obj ? obj.ins : [],
    mode: Mode.single,
    out: "out" in obj ? obj.out : "__ans",
    vars: "vars" in obj ? obj.vars : {},
  };
  if ("command" in obj) {
    if (!obj.command) {
      normalizedObj.command = "(x) => x";
    }
    normalizedObj.mode = Mode.single;
  }
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
    this.command = rawObj.command;
    this.commandList = rawObj.commandList;
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
