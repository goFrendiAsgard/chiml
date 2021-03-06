import { Static } from "ramda";
export type AnyFunction = (...args: any[]) => any;
export type AnyAsyncFunction = (...args: any[]) => Promise<any>;

export interface IObjectWithMethod {
    [method: string]: AnyFunction;
}

export interface IKeyInParsedDict {
    found: boolean;
    value: any;
}

export interface IDeclarativeConfig {
    injection: {[key: string]: any};
    bootstrap: string;
    component: {[key: string]: Partial<IComponent>};
}

export interface IUserDeclarativeConfig {
    injection: {[key: string]: any};
    bootstrap: string;
    component: {[key: string]: Partial<IUserComponent> | string | any[]};
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
    pipe: (...args) => AnyFunction;
    initClass?: any;
    initFunction?: AnyFunction;
    initParams: any[];
    executions: any[];
    evaluation?: IMethodRunnerConfig | any[];
}

export interface IChimera {
    invoker: (arity: number, methodName: string, ...params: any[]) => (...args: any[]) => any;
    fluent: (invokerConfigs: any[][], ...fluentParams: any[]) => (...args: any[]) => any;
    initAndFluent: (configs: any[], ...params) => (...args: any[]) => any;
    concurrent: (...fnList: AnyFunction[]) => AnyAsyncFunction;
    wrapCommand: (stringCommand: string) => AnyAsyncFunction;
    wrapNodeback: (fn: AnyFunction) => AnyAsyncFunction;
}

export type TChimera = IChimera;
export type TRamda = Static;
