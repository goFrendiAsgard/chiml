import {CommandType, FunctionalMode, Mode} from "../enums/singleTaskProperty";
import {ISingleTask} from "../interfaces/ISingleTask";
import {normalizeRawConfig, strToNormalizedConfig} from "../libraries/singleTaskConfigProcessor";

export class SingleTask implements ISingleTask {
  public id: string;
  public src: string;
  public dst: string;
  public ins: string[];
  public out: string;
  public vars: {[key: string]: any};
  public mode: Mode;
  public branchCondition: string;
  public loopCondition: string;
  public command: string;
  public commandList: SingleTask[];
  public commandType: CommandType;
  public functionalMode: FunctionalMode;
  public accumulator: string;
  public isMainParent: boolean;

  constructor(config: any, parentId: string = "", id: number = 0) {
    const normalizedConfig: {[key: string]: any} = typeof config === "string" ?
      strToNormalizedConfig(config) : normalizeRawConfig(config);
    this.ins = normalizedConfig.ins;
    this.out = normalizedConfig.out;
    this.vars = normalizedConfig.vars;
    this.mode = normalizedConfig.mode;
    this.branchCondition = normalizedConfig.branchCondition;
    this.loopCondition = normalizedConfig.loopCondition;
    this.command = normalizedConfig.command;
    this.commandType = normalizedConfig.commandType;
    this.commandList = normalizedConfig.commandList;
    this.src = normalizedConfig.src;
    this.dst = normalizedConfig.dst;
    this.accumulator = normalizedConfig.accumulator;
    this.functionalMode = normalizedConfig.functionalMode;
    this.id = parentId + "_" + id;
    this.isMainParent = parentId === "" || this.functionalMode !== FunctionalMode.none;
    for (let i = 0; i < this.commandList.length; i++) {
      this.commandList[i] = new SingleTask(this.commandList[i], this.id, i);
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
