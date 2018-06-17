import { CommandType, FunctionalMode, Mode } from "../enums/singleTaskProperty";
import { ISingleTask } from "../interfaces/ISingleTask";
export declare class SingleTask implements ISingleTask {
    id: string;
    src: string;
    dst: string;
    ins: string[];
    out: string;
    vars: {
        [key: string]: any;
    };
    mode: Mode;
    branchCondition: string;
    loopCondition: string;
    command: string;
    commandList: SingleTask[];
    commandType: CommandType;
    functionalMode: FunctionalMode;
    accumulator: string;
    isMainParent: boolean;
    constructor(config: any, parentId?: string, id?: number);
    getScript(): string;
    execute(...inputs: any[]): Promise<any>;
}
