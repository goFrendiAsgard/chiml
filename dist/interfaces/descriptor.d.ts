export declare type AnyFunction = (...args: any[]) => any;
export declare type AnyAsyncFunction = (...args: any[]) => Promise<any>;
export interface IDeclarativeConfig {
    injection: {
        [key: string]: any;
    };
    component: {
        [key: string]: Partial<IComponent>;
    };
    bootstrap: string;
    out: string;
}
export interface IComponent {
    ins: string[];
    out: string;
    pipe: string;
    parts: any[];
}
