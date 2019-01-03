export interface IStorage {
    append: (line: string) => Promise<any>;
    read: () => Promise<any>;
}
