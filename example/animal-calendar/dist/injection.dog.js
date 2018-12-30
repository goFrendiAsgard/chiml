"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const baseCalendarInjection_1 = require("./baseCalendarInjection");
class DogCalendarInjection extends baseCalendarInjection_1.BaseCalendarInjection {
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
