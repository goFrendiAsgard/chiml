"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cote_1 = require("cote");
class CoteAdapter {
    createResponder(advertisement, discoveryOptions) {
        return new cote_1.Responder(advertisement, discoveryOptions);
    }
    respond(type, callback, responder) {
        responder.on(type, callback);
        return responder;
    }
    createRequester(advertisement, discoveryOptions) {
        return new cote_1.Requester(advertisement, discoveryOptions);
    }
    request(event, callback, requester) {
        requester.send(event, callback);
        return requester;
    }
    createPublisher(advertisement, discoveryOptions) {
        return new cote_1.Publisher(advertisement, discoveryOptions);
    }
    publish(type, event, publisher) {
        publisher.publish(type, event);
        return publisher;
    }
    createSubscriber(advertisement, discoveryOptions) {
        return new cote_1.Subscriber(advertisement, discoveryOptions);
    }
    subscribe(type, listener, subscriber) {
        subscriber.on(type, listener);
        return subscriber;
    }
}
exports.coteAdapter = new CoteAdapter();
