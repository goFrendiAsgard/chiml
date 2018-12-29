export interface IAnimalCalendarInjection {
    calCommand: string;
    composeHtml: (imageUrl: string, calendar: string) => string;
    imageFetcherCommand: string;
    imageKey: string;
    writeHtmlCommand: string;
    showCalendarCommand: string;
}
