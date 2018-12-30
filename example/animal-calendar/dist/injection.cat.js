"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const baseCalendarInjection_1 = require("./baseCalendarInjection");
class CatCalendarInjection extends baseCalendarInjection_1.BaseCalendarInjection {
    constructor() {
        super(...arguments);
        this.imageFetcherCommand = "curl https://aws.random.cat/meow";
        this.imageKey = "file";
        this.writeHtmlCommand = `echo \${1} > "${__dirname}/../cat.html"`;
        this.showCalendarCommand = `google-chrome file://${__dirname}/../cat.html`;
    }
}
const injection = new CatCalendarInjection();
module.exports = injection;
