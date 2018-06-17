import { ISingleTask } from "../interfaces/ISingleTask";
export declare function renderTemplate(template: string, config: {
    [key: string]: any;
}, spaceCount?: number): string;
export declare function createHandlerScript(task: ISingleTask, spaceCount?: number): string;
