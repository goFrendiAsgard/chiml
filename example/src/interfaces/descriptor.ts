import { TChimera } from "../../../dist/interfaces/descriptor";
export interface IBaseAnimalCalendarInjection {
    calCommand: string;
    composeHtml: (imageUrl: string, calendar: string) => string;
    imageFetcherCommand: string;
    imageKey: string;
    writeHtmlCommand: string;
    showCalendarCommand: string;
}

export type TAnimalCalendarInjection = TChimera & IBaseAnimalCalendarInjection;
