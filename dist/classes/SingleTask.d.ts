export declare enum Mode {
    parallel = 0,
    series = 1,
    single = 2
}
export declare enum CommandType {
    cmd = 0,
    jsAsyncFunction = 1,
    jsSyncFunction = 2,
    jsPromise = 3
}
export default class SingleTask {
    ins: string[];
    out: string;
    branchCondition: string;
    loopCondition: string;
    command: string;
    commandList: SingleTask[];
    commandType: CommandType;
    mode: Mode;
    vars: {
        [key: string]: any;
    };
    constructor(config: any);
    getScript(): string;
    execute(...inputs: any[]): Promise<any>;
}
