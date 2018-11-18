import { X } from "../../dist/index.js";
import { TAnimalCalendarInjection } from "./interfaces/descriptor";

function composeHtml(imageUrl: string, calendar: string): string {
    return `<img style="max-width: 50%; float:left;" src="${imageUrl}" />` +
        `<pre style="float:right">${calendar}</pre>`;
}

export const baseInjection: TAnimalCalendarInjection = {
    calCommand: "ncal ${1} -h",
    composeHtml,
    imageFetcherCommand: "curl https://somewhere.com/randomImage.json",
    imageKey: "image",
    writeHtmlCommand: `echo \${1} > "${__dirname}/calendar.html"`,
    showCalendarCommand: `google-chrome file://${__dirname}/calendar.html`,
    ...X,
};
