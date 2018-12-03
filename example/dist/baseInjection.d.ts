import { TChimera } from "chiml/src/interfaces/descriptor";
import { IBaseAnimalCalendarInjection } from "./interfaces/descriptor";
export declare class BaseInjection implements IBaseAnimalCalendarInjection {
    calCommand: string;
    imageFetcherCommand: string;
    imageKey: string;
    writeHtmlCommand: string;
    showCalendarCommand: string;
    X: TChimera;
    composeHtml(imageUrl: string, calendar: string): string;
}
