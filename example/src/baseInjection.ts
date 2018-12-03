import { X } from "chiml";
import { TChimera } from "chiml/src/interfaces/descriptor";
import { IBaseAnimalCalendarInjection } from "./interfaces/descriptor";

export class BaseInjection implements IBaseAnimalCalendarInjection {

    public calCommand: string = "ncal ${1} -h";
    public imageFetcherCommand: string = "curl https://somewhere.com/randomImage.json";
    public imageKey: string = "image";
    public writeHtmlCommand: string = `echo \${1} > "${__dirname}/calendar.html"`;
    public showCalendarCommand: string = `google-chrome file://${__dirname}/calendar.html`;
    public X: TChimera = X;

    public composeHtml(imageUrl: string, calendar: string): string {
        return `<img style="max-width: 50%; float:left;" src="${imageUrl}" />` +
            `<pre style="float:right">${calendar}</pre>`;
    }

}
