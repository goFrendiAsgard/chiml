export declare type AnyFunction = (...args: any[]) => any;
export declare type AnyAsyncFunction = (...args: any[]) => Promise<any>;
export interface IDeclarativeConfig {
    injection: {
        [key: string]: any;
    };
    component: {
        [key: string]: IComponent;
    };
    bootstrap: string;
}
export interface IComponent {
    vals: any[];
    pipe: string;
}
