"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const animalCalendarInjection_1 = require("./animalCalendarInjection");
class DogCalendarInjection extends animalCalendarInjection_1.AnimalCalendarInjection {
    constructor() {
        super(...arguments);
        this.imageFetcherCommand = "curl https://random.dog/woof.json";
        this.imageKey = "url";
        this.writeHtmlCommand = `echo \${1} > "${__dirname}/../dog.html"`;
        this.showCalendarCommand = `google-chrome file://${__dirname}/../dog.html`;
    }
}
const injection = new DogCalendarInjection();
module.exports = injection;
