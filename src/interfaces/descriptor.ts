export type AnyFunction = (...args: any[]) => any;
export type AnyAsyncFunction = (...args: any[]) => Promise<any>;

export interface IDeclarativeConfig {
    injection: {[key: string]: any};
    component: {[key: string]: Partial<IComponent>};
    bootstrap: string;
    ins: string[];
    out: string;
}

export interface IUserDeclarativeConfig {
    injection: {[key: string]: any};
    component: {[key: string]: Partial<IUserComponent>};
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
