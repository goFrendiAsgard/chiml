import { Static } from "ramda";
export declare type AnyFunction = (...args: any[]) => any;
export declare type AnyAsyncFunction = (...args: any[]) => Promise<any>;
export interface IObjectWithMethod {
    [method: string]: AnyFunction;
}
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
        [key: string]: Partial<IUserComponent> | string | any[];
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
    perform: string | any[];
    parts: any[] | any | null;
}
export interface IMethodRunnerConfig {
    method: string;
    params: any[];
}
export interface IClassRunnerConfig {
    pipe: (...args: any[]) => AnyFunction;
    initClass: {
        [method: string]: AnyFunction;
    };
    initParams: any[];
    executions: IMethodRunnerConfig[];
    evaluation?: IMethodRunnerConfig;
}
export interface IChimera {
    declare: (partialDeclarativeConfig: Partial<IUserDeclarativeConfig>) => AnyFunction;
    inject: (containerFile: string, injectionFile?: string) => AnyFunction;
    initClassAndRun: (configs: Partial<IClassRunnerConfig>) => any;
    createClassInitiator: (cls: any) => (...args: any[]) => IObjectWithMethod;
    createMethodEvaluator: (methodName: string, ...args: any[]) => (obj: IObjectWithMethod) => any;
    createMethodExecutor: <T extends IObjectWithMethod>(methodName: string, ...args: any[]) => (obj: T) => T;
    foldInput: (fn: AnyFunction) => ((arr: any[]) => any);
    spreadInput: (fn: (arr: any[]) => any) => AnyFunction;
    concurrent: (...fnList: AnyAsyncFunction[]) => AnyAsyncFunction;
    wrapCommand: (stringCommand: string) => AnyAsyncFunction;
    wrapNodeback: (fn: AnyFunction) => AnyAsyncFunction;
    wrapSync: (fn: AnyFunction) => AnyAsyncFunction;
}
export declare type TChimera = IChimera;
export declare type TRamda = Static;
