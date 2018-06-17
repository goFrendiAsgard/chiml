export declare function cmd(command: string, options?: {
    [key: string]: any;
}): Promise<string>;
export declare function composeCommand(command: string, ins?: any[]): string;
export declare function cmdComposedCommand(command: string, ins?: any[], options?: {
    [key: string]: any;
}): Promise<string>;
