declare enum Mode {
    parallel = 0,
    series = 1
}
export default class SingleTask {
    ins: string[];
    out: string;
    command: any[];
    mode: Mode;
    vars: {
        [key: string]: any;
    };
    constructor(config: any);
    execute(...inputs: any[]): Promise<any>;
}
export {};
