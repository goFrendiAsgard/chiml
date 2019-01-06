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
    bootstrap: string;
    component: {
        [key: string]: Partial<IComponent>;
    };
}
export interface IUserDeclarativeConfig {
    injection: {
        [key: string]: any;
    };
    bootstrap: string;
    component: {
        [key: string]: Partial<IUserComponent> | string | any[];
    };
}
export interface IComponent {
    arity: number;
    setup: string;
    parts: any[];
}
export interface IUserComponent {
    arity: number;
    setup: string | any[];
    parts: any[] | any | null;
}
export interface IMethodRunnerConfig {
    method: string;
    params: any[];
}
export interface IClassRunnerConfig {
    pipe: (...args: any[]) => AnyFunction;
    initClass?: any;
    initFunction?: AnyFunction;
    initParams: any[];
    executions: any[];
    evaluation?: IMethodRunnerConfig | any[];
}
export interface IChimera {
    declare: (partialDeclarativeConfig: Partial<IUserDeclarativeConfig>) => AnyFunction;
    inject: (containerFile: string, injectionFile?: string) => AnyFunction;
    invoker: (arity: number, methodName: string, ...params: any[]) => (...args: any[]) => any;
    fluent: (invokerConfigs: any[][], ...fluentParams: any[]) => (...args: any[]) => any;
    initAndFluent: (configs: any[], ...params: any[]) => (...args: any[]) => any;
    concurrent: (...fnList: AnyFunction[]) => AnyAsyncFunction;
    wrapCommand: (stringCommand: string) => AnyAsyncFunction;
    wrapNodeback: (fn: AnyFunction) => AnyAsyncFunction;
}
export declare type TChimera = IChimera;
export declare type TRamda = Static;
