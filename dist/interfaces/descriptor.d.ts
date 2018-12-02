import { Static } from "ramda";
export declare type AnyFunction = (...args: any[]) => any;
export declare type AnyAsyncFunction = (...args: any[]) => Promise<any>;
export interface IKeyInParsedDict {
    found: boolean;
    value: any;
}
export interface IDeclarativeConfig {
    injection: {
        [key: string]: any;
    };
    component: {
        [key: string]: Partial<IComponent>;
    };
    bootstrap: string;
    ins: string[] | null;
    out: string | null;
}
export interface IUserDeclarativeConfig {
    injection: {
        [key: string]: any;
    };
    component: {
        [key: string]: Partial<IUserComponent>;
    };
    bootstrap: string;
    ins: string[] | string | null;
    out: string | null;
}
export interface IComponent {
    ins: string[] | null;
    out: string | null;
    perform: string;
    parts: any[];
}
export interface IUserComponent {
    ins: string[] | string | null;
    out: string;
    perform: string;
    parts: any[] | any | null;
}
export interface IBaseChimera {
    declarative: (partialDeclarativeConfig: Partial<IUserDeclarativeConfig>) => AnyFunction;
    foldInput: (fn: AnyFunction) => ((arr: any[]) => any);
    spreadInput: (fn: (arr: any[]) => any) => AnyFunction;
    concurrent: (...fnList: AnyAsyncFunction[]) => AnyAsyncFunction;
    wrapCommand: (stringCommand: string) => AnyAsyncFunction;
    wrapNodeback: (fn: AnyFunction) => AnyAsyncFunction;
    wrapSync: (fn: AnyFunction) => AnyAsyncFunction;
}
export declare type TChimera = IBaseChimera & Static;
