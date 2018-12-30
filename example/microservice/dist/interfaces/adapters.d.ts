import { Event, ResponderAdvertisement, RequesterAdvertisement, PublisherAdvertisement, SubscriberAdvertisement, DiscoveryOptions, Responder, Requester, Publisher, Subscriber } from "cote";
export interface ICoteAdapter {
    createResponder: (advertisement: ResponderAdvertisement, discoveryOptions?: DiscoveryOptions) => Responder;
    respond: (type: string | string[], callback: (error: any, result: any) => void, responder: Responder) => Responder;
    createRequester: (advertisement: RequesterAdvertisement, discoveryOptions?: DiscoveryOptions) => Requester;
    request: (event: Event, callback: (error: any, result: any) => void, requester: Requester) => Requester;
    createPublisher: (advertisement: PublisherAdvertisement, discoveryOptions?: DiscoveryOptions) => Publisher;
    publish: (type: string, event: Event, publisher: Publisher) => Publisher;
    createSubscriber: (advertisement: SubscriberAdvertisement, discoveryOptions?: DiscoveryOptions) => Subscriber;
    subscribe: (type: string | string[], listener: (event: Event) => void, subscriber: Subscriber) => Subscriber;
}
export interface IExpressAdapter {
}
