declare enum Mode {
    parallel = 0,
    series = 1
}
export default class SingleTask {
    ins: string[];
    out: string;
    branchCondition: string;
    loopCondition: string;
    command: any[];
    mode: Mode;
    vars: {
        [key: string]: any;
    };
    constructor(config: any);
    getScript(): string;
    execute(...inputs: any[]): Promise<any>;
}
export {};
