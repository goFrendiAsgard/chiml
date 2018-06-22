export declare function chimlToYaml(chiml: string): string;
export declare function chimlToConfig(chiml: string, firstTime?: boolean): Promise<any>;
export declare function doubleQuote(str: string): string;
export declare function isFlanked(str: string, openFlank: string, closeFlank: string): boolean;
export declare function parseStringArray(arr: string[]): any[];
export declare function removeFlank(str: string, openFlank: any, closeFlank: any): string;
export declare function smartSplit(str: string, delimiter: string): string[];
