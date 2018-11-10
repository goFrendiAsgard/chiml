export declare type AnyFunction = (...args: any[]) => any;
export declare type AnyAsyncFunction = (...args: any[]) => Promise<any>;
export interface IDeclarativeConfig {
    vals: {
        [key: string]: any;
    };
    comp: {
        [key: string]: IComponent;
    };
    main: string;
}
export interface IComponent {
    vals: any[];
    pipe: string;
    parsedVals?: any[];
    fn?: AnyFunction;
}
