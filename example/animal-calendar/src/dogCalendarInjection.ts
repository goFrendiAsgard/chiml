import { AnimalCalendarInjection } from "./animalCalendarInjection";
import { IAnimalCalendarInjection } from "./interfaces/animalCalendarInjection";

class DogCalendarInjection extends AnimalCalendarInjection implements IAnimalCalendarInjection {
    public imageFetcherCommand: string = "curl https://random.dog/woof.json";
    public imageKey: string = "url";
    public writeHtmlCommand: string = `echo \${1} > "${__dirname}/../dog.html"`;
    public showCalendarCommand: string = `google-chrome file://${__dirname}/../dog.html`;
}

const injection = new DogCalendarInjection();
module.exports = injection;
