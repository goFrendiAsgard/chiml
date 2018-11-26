import { X } from "chiml";
import { BaseInjection } from "./baseInjection";
import { IBaseAnimalCalendarInjection, TAnimalCalendarInjection } from "./interfaces/descriptor";

class DogInjection extends BaseInjection implements IBaseAnimalCalendarInjection {
    public imageFetcherCommand: string = "curl https://random.dog/woof.json";
    public imageKey: string = "url";
    public writeHtmlCommand: string = `echo \${1} > "${__dirname}/../dog.html"`;
    public showCalendarCommand: string = `google-chrome file://${__dirname}/../dog.html`;
}

const injection: TAnimalCalendarInjection = Object.assign(new DogInjection(), X);
module.exports = injection;
