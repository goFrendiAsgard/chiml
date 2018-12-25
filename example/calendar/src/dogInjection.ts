import { BaseInjection } from "./baseInjection";
import { IBaseAnimalCalendarInjection } from "./interfaces/descriptor";

class DogInjection extends BaseInjection implements IBaseAnimalCalendarInjection {
    public imageFetcherCommand: string = "curl https://random.dog/woof.json";
    public imageKey: string = "url";
    public writeHtmlCommand: string = `echo \${1} > "${__dirname}/../dog.html"`;
    public showCalendarCommand: string = `google-chrome file://${__dirname}/../dog.html`;
}

const injection = new DogInjection();
module.exports = injection;
