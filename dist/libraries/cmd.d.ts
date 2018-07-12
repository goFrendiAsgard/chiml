export declare function cmd(command: string, options?: {
    [key: string]: any;
}): Promise<string>;
export declare function composeCommand(command: string, ins?: any[]): string;
export declare function cmdComposedCommand(command: string, ins?: any[], opts?: {
    [key: string]: any;
}, isCompiled?: boolean): Promise<any>;
export declare function getChimlCompiledScriptPath(chimlPath: string, cwd: string): string;
