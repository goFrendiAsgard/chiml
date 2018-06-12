import {smartSplit} from "../libraries/stringUtil";
enum Mode {
  parallel,
  series,
}

function createRawObject(str: string): {[key: string]: any} {
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
  const normalizedObj = {};
  return normalizedObj;
}

export default class SingleTask {
  public ins: string[];
  public out: string;
  public branchCondition: string;
  public loopCondition: string;
  public command: any[];
  public mode: Mode;
  public vars: {[key: string]: any};

  constructor(config: any) {
    const rawObj: {[key: string]: any} = typeof config === "string" ?
      createRawObject(config) : normalizeRawObject(config);
    this.ins = "ins" in rawObj ? rawObj.ins : [];
    this.out = "out" in rawObj ? rawObj.out : "__ans";
    this.vars = "vars" in rawObj ? rawObj.vars : {};
    this.vars = "mode" in rawObj ? rawObj.mode : Mode.series;
    this.command = "command" in rawObj ? rawObj.command : "{$.assign}";
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
