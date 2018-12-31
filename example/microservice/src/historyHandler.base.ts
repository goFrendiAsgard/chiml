export function createListHandler(
    storage: {read: () => Promise<string[]>},
): (req: any, cb: (result: any) => any) => Promise<void> {
    return async (req: any, cb: (result: any) => any): Promise<void> => {
        const historyList = await storage.read();
        cb(historyList);
    };
}
