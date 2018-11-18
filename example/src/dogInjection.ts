import { baseInjection } from "./baseInjection";
import { TAnimalCalendarInjection } from "./interfaces/descriptor";

const injection: TAnimalCalendarInjection = Object.assign(baseInjection, {
    imageFetcherCommand: "curl https://random.dog/woof.json",
    imageKey: "url",
    writeHtmlCommand: `echo \${1} > "${__dirname}/../dog.html"`,
    showCalendarCommand: `google-chrome file://${__dirname}/../dog.html`,
});
module.exports = injection;
