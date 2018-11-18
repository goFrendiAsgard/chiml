import { baseInjection } from "./baseInjection";
import { TAnimalCalendarInjection } from "./interfaces/descriptor";

const injection: TAnimalCalendarInjection = Object.assign(baseInjection, {
    imageFetcherCommand: "curl https://aws.random.cat/meow",
    imageKey: "file",
    writeHtmlCommand: `echo \${1} > "${__dirname}/../cat.html"`,
    showCalendarCommand: `google-chrome file://${__dirname}/../cat.html`,
});
module.exports = injection;
