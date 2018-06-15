export declare enum Mode {
    parallel = 0,
    series = 1,
    single = 2
}
export declare enum FunctionalMode {
    none = 0,
    map = 1,
    filter = 2,
    reduce = 3
}
export declare enum CommandType {
    cmd = 0,
    jsAsyncFunction = 1,
    jsSyncFunction = 2,
    jsPromise = 3
}
export default class SingleTask {
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
    constructor(config: any, parentId?: string, id?: number);
    getScript(): string;
    execute(...inputs: any[]): Promise<any>;
}
