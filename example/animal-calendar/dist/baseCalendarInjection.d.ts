import { IBaseCalendarInjection } from "./interfaces/baseCalendarInjection";
export declare class BaseCalendarInjection implements IBaseCalendarInjection {
    calCommand: string;
    imageFetcherCommand: string;
    imageKey: string;
    writeHtmlCommand: string;
    showCalendarCommand: string;
    composeHtml(imageUrl: string, calendar: string): string;
}
