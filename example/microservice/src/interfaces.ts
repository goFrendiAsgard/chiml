import * as cote from "cote";

export interface IStorage {
    append: (line: string) => Promise<any>;
    read: () => Promise<any>;
}

export interface IHistoryConfig {
    storage: IStorage;
    publisher: cote.Publisher;
    event: string;
}

export interface IHistory {
    storage: IStorage;
    publisher: cote.Publisher;
    event: string;
    constructor: (config: IHistoryConfig) => void;
    publishEvent: (req: any, cb: any) => void;
}

export interface IEventConfig {
    storage: IStorage;
}

export interface IEvent {
    storage: IStorage;
    constructor: (config: IEventConfig) => void;
    list: (req: any, cb: any) => void;
    append: (req: any, cb: any) => void;
}
