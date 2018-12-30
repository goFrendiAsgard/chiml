import {
    Event, ResponderAdvertisement, RequesterAdvertisement, PublisherAdvertisement,
    SubscriberAdvertisement, DiscoveryOptions, Responder, Requester, Publisher,
    Subscriber } from "cote";

export type RequestListener = (error: any, result: any) => void;
export type EventListener = (event: Event) => void;

export interface ICoteAdapter {

    // responder
    createResponder: (
        advertisement: ResponderAdvertisement,
        discoveryOptions?: DiscoveryOptions) => Responder;
    respondRequest: (
        type: string | string[],
        listener: RequestListener,
        responder: Responder) => Responder;
    respondManyRequest: (
        config: {[key: string]: RequestListener},
        responder: Responder) => Responder;

    // requester
    createRequester: (
        advertisement: RequesterAdvertisement,
        discoveryOptions?: DiscoveryOptions) => Requester;
    sendRequest: (
        event: Event,
        callback: (error: any, result: any) => void,
        requester: Requester) => Requester;

    // publisher
    createPublisher: (
        advertisement: PublisherAdvertisement,
        discoveryOptions?: DiscoveryOptions) => Publisher;
    publishEvent: (
        type: string,
        event: Event,
        publisher: Publisher) => Publisher;

    // subscriber
    createSubscriber: (
        advertisement: SubscriberAdvertisement,
        discoveryOptions?: DiscoveryOptions) => Subscriber;
    subscribeEvent: (
        type: string | string[],
        listener: EventListener,
        subscriber: Subscriber) => Subscriber;
    subscribeManyEvent: (
        config: {[key: string]: EventListener},
        subscriber: Subscriber) => Subscriber;

}

export interface IExpressAdapter {
}
