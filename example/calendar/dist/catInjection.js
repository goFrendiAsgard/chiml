"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const baseInjection_1 = require("./baseInjection");
class CatInjection extends baseInjection_1.BaseInjection {
    constructor() {
        super(...arguments);
        this.imageFetcherCommand = "curl https://aws.random.cat/meow";
        this.imageKey = "file";
        this.writeHtmlCommand = `echo \${1} > "${__dirname}/../cat.html"`;
        this.showCalendarCommand = `google-chrome file://${__dirname}/../cat.html`;
    }
}
const injection = new CatInjection();
module.exports = injection;
