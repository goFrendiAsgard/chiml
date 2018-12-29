import { IAnimalCalendarInjection } from "./interfaces/animalCalendarInjection";
export declare class AnimalCalendarInjection implements IAnimalCalendarInjection {
    calCommand: string;
    imageFetcherCommand: string;
    imageKey: string;
    writeHtmlCommand: string;
    showCalendarCommand: string;
    composeHtml(imageUrl: string, calendar: string): string;
}
