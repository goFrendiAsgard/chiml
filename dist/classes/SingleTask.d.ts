import { CommandType, FunctionalMode, Mode } from "../enums/singleTaskProperty";
import { ISingleTask } from "../interfaces/ISingleTask";
declare type singleTaskConfig = string | {
    [key: string]: any;
};
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
    chimlPath: string;
    expectLocalScope: boolean;
    hasParent: boolean;
    constructor(config: singleTaskConfig, parentId?: string, id?: number);
    getScript(): string;
    execute(...inputs: any[]): Promise<any>;
}
export {};
