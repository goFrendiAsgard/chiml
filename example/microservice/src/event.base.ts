import * as cote from "cote";
import { IHistory, IHistoryConfig, IStorage } from "./interfaces";

export default class History implements IHistory {

    public storage: IStorage;
    public publisher: cote.Publisher;
    public event: string;

    constructor(config: IHistoryConfig) {
        this.storage = config.storage;
        this.publisher = config.publisher;
        this.event = config.event;
    }

    public publishEvent(req: any, cb: any) {
        this.publisher.publish(this.event, req);
        cb(null, `New event ${req} published`);
    }

}
