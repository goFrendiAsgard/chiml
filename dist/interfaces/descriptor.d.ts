import { Static } from "ramda";
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
    ins: string[];
    out: string;
}
export interface IUserDeclarativeConfig {
    injection: {
        [key: string]: any;
    };
    component: {
        [key: string]: Partial<IUserComponent>;
    };
    bootstrap: string;
    ins: string[] | string;
    out: string;
}
export interface IComponent {
    ins: string[];
    out: string;
    pipe: string;
    parts: any[];
}
export interface IUserComponent {
    ins: string[] | string;
    out: string;
    pipe: string;
    parts: any[] | any;
}
interface IBaseChimera {
    declarative: (partialDeclarativeConfig: Partial<IUserDeclarativeConfig>) => AnyFunction;
    foldInput: (fn: AnyFunction) => ((arr: any[]) => any);
    spreadInput: (fn: (arr: any[]) => any) => AnyFunction;
    parallel: (...fnList: AnyAsyncFunction[]) => AnyAsyncFunction;
    wrapCommand: (stringCommand: string) => AnyAsyncFunction;
    wrapNodeback: (fn: AnyFunction) => AnyAsyncFunction;
    wrapSync: (fn: AnyFunction) => AnyAsyncFunction;
}
export declare type TChimera = IBaseChimera & Static;
export {};
