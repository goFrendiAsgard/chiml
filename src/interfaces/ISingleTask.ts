import {CommandType, FunctionalMode, Mode} from "../enums/singleTaskProperty";

export interface ISingleTask {
    // properties
    id: string;
    src: string;
    dst: string;
    ins: string[];
    out: string;
    vars: {[key: string]: any};
    mode: Mode;
    branchCondition: string;
    loopCondition: string;
    command: string;
    commandList: ISingleTask[];
    commandType: CommandType;
    functionalMode: FunctionalMode;
    accumulator: string;
    expectLocalScope: boolean;
    hasParent: boolean;
    chimlPath: string;
    // methods
    getScript(): string;
    execute(...inputs): Promise<any>;
}
