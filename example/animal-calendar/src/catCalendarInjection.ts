import { AnimalCalendarInjection } from "./animalCalendarInjection";
import { IAnimalCalendarInjection } from "./interfaces/animalCalendarInjection";

class CatCalendarInjection extends AnimalCalendarInjection implements IAnimalCalendarInjection {
    public imageFetcherCommand: string = "curl https://aws.random.cat/meow";
    public imageKey: string = "file";
    public writeHtmlCommand: string = `echo \${1} > "${__dirname}/../cat.html"`;
    public showCalendarCommand: string = `google-chrome file://${__dirname}/../cat.html`;
}

const injection = new CatCalendarInjection();
module.exports = injection;
