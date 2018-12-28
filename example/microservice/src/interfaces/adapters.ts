export interface IMicroserviceAdapter {
    createResponder: () => any;
    createSubscriber: () => any;
    sendRequest: () => any;
    publish: () => any;
}

export interface IWebAppAdapter {
}
