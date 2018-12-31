export declare function createListHandler(storage: {
    read: () => Promise<string[]>;
}): (req: any, cb: (result: any) => any) => Promise<void>;
