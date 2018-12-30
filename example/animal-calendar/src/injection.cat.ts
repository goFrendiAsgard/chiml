import { BaseCalendarInjection } from "./baseCalendarInjection";
import { IBaseCalendarInjection } from "./interfaces/baseCalendarInjection";

class CatCalendarInjection extends BaseCalendarInjection implements IBaseCalendarInjection {
    public imageFetcherCommand: string = "curl https://aws.random.cat/meow";
    public imageKey: string = "file";
    public writeHtmlCommand: string = `echo \${1} > "${__dirname}/../cat.html"`;
    public showCalendarCommand: string = `google-chrome file://${__dirname}/../cat.html`;
}

const injection = new CatCalendarInjection();
module.exports = injection;
