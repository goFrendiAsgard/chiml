export type AnyFunction = (...args: any[]) => any;
export type AnyAsyncFunction = (...args: any[]) => Promise<any>;

export interface IDeclarativeConfig {
    vals: {[key: string]: any};
    comp: {[key: string]: IComponent};
    main: string;
}

export interface IComponent {
    vals: any[];
    pipe: string;
}
