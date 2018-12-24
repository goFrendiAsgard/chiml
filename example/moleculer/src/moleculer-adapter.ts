import { ServiceBroker, ServiceSchema } from "moleculer";
import * as ApiService from "moleculer-web";

export const moleculerAdapter = {
    createServiceBroker,
    createService,
    startBrokerService,
};

function createServiceBroker(options: {[key: string]: any}): ServiceBroker {
    const defaultOptions = { logger: console };
    return new ServiceBroker(Object.assign({}, defaultOptions, options));
}

function createService(serviceBroker: ServiceBroker, options: ServiceSchema): ServiceBroker {
    const defaultOptions = {};
    serviceBroker.createService(Object.assign({}, defaultOptions, options));
    return serviceBroker;
}

function startBrokerService(serviceBroker: ServiceBroker): ServiceBroker {
    serviceBroker.start();
    return serviceBroker;
}
