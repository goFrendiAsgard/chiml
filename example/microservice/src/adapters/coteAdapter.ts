import {
    Event, ResponderAdvertisement, RequesterAdvertisement, PublisherAdvertisement,
    SubscriberAdvertisement, DiscoveryOptions, Responder, Requester, Publisher,
    Subscriber } from "cote";
import { ICoteAdapter, RequestListener, EventListener } from "../interfaces/adapters";
import { stringToArray } from "../utils";


const cote: ICoteAdapter = {
    createResponder,
    respondRequest,
    respondManyRequest,
    createRequester,
    sendRequest,
    createPublisher,
    publishEvent,
    createSubscriber,
    subscribeEvent,
    subscribeManyEvent,
};
export { cote };

function createResponder(advertisement: ResponderAdvertisement, discoveryOptions?: DiscoveryOptions): Responder {
    return new Responder(advertisement, discoveryOptions);
}

function respondRequest(type: string | string[], listener: RequestListener, responder: Responder): Responder {
    responder.on(type, listener);
    return responder;
}

function respondManyRequest(config: {[key: string]: RequestListener},responder: Responder): Responder{
}

function createRequester(advertisement: RequesterAdvertisement, discoveryOptions?: DiscoveryOptions): Requester {
    return new Requester(advertisement, discoveryOptions);
}

function sendRequest(event: Event, callback: (error: any, result: any) => void, requester: Requester): Requester {
    requester.send(event, callback);
    return requester;
}

function createPublisher(advertisement: PublisherAdvertisement, discoveryOptions?: DiscoveryOptions): Publisher {
    return new Publisher(advertisement, discoveryOptions);
}

function publishEvent(type: string, event: Event, publisher: Publisher): Publisher {
    publisher.publish(type, event);
    return publisher;
}

function createSubscriber(advertisement: SubscriberAdvertisement, discoveryOptions?: DiscoveryOptions): Subscriber {
    return new Subscriber(advertisement, discoveryOptions);
}

function subscribeEvent(type: string | string[], listener: EventListener, subscriber: Subscriber): Subscriber {
    subscriber.on(type, listener);
    return subscriber;
}

function subscribeManyEvent(config: {[key: string]: EventListener},subscriber: Subscriber): Subscriber {
}
