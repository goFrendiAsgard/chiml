enum Mode {
  parallel,
  series,
}

function createRawObject(str: string): {[key: string]: any} {
  const obj = {};
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

  public execute(...inputs): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

}
