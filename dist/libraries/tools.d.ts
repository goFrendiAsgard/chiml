export declare function execute(...args: any[]): Promise<any>;
export declare function getCompiledScript(chiml: any): Promise<string>;
export declare function compile(chimlFiles: string[]): Promise<any>;
export declare function getFiles(dir: string): Promise<any>;
export declare function copyMultiDirs(configs: string[][], options?: {
    [key: string]: any;
}): Promise<any>;
