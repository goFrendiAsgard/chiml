import { IStorage } from "./interfaces";

export function createListHandler(storage: IStorage): (req: any, cb: (result: any) => any) => Promise<void> {
    return async (req: any, cb: (result: any) => any): Promise<void> => {
        const historyList = await storage.read();
        cb(historyList);
    };
}

export function createAppendHandler(storage: IStorage): (data: any) => Promise<void> {
    return async (data: any): Promise<void> => {
        storage.append(data);
    };
}
