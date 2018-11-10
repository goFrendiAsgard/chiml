export interface IDeclarativeConfig {
    definition: {
        [key: string]: any;
    };
    declaration: {
        [key: string]: IDeclaration;
    };
    action: string;
}
export interface IDeclaration {
    [key: string]: any[];
}
