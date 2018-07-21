"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const https = require("https");
const Koa = require("koa");
const socketIo = require("socket.io");
const middlewares_1 = require("../libraries/middlewares");
class WebApp extends Koa {
    constructor() {
        super(...arguments);
        this.createServer = this.createHttpServer;
    }
    createIo(server) {
        const self = this;
        const io = socketIo(server);
        let eventListeners = [];
        const addEventListener = (config) => eventListeners.push(config);
        const addEventListeners = (configs) => {
            eventListeners = eventListeners.concat(configs);
        };
        Object.defineProperty(io, "eventListeners", { value: eventListeners, writable: false });
        Object.defineProperty(io, "addEventListener", { value: addEventListener, writable: false });
        Object.defineProperty(io, "addEventListeners", { value: addEventListeners, writable: false });
        Object.defineProperty(io, "applyEventListeners", {
            value: () => {
                io.on("connection", (socket) => {
                    for (const eventListener of eventListeners) {
                        const { event, handler } = eventListener;
                        const middleware = middlewares_1.createMiddleware(handler, { propagateContext: true });
                        socket.on(event, middleware);
                    }
                });
            },
            writable: false,
        });
        return io;
    }
    createHttpServer() {
        return http.createServer(this.callback());
    }
    createHttpsServer(options = {}) {
        return https.createServer(options, this.callback());
    }
    addJsonRpc(url, configs) {
        this.use(middlewares_1.createJsonRpcMiddleware(url, configs));
    }
    addAuthentication(config) {
        this.use(middlewares_1.createAuthenticationMiddleware(config));
    }
    addAuthorization(config) {
        this.use(middlewares_1.createAuthorizationMiddleware(config));
    }
    addMiddlewares(controllers) {
        for (const controller of controllers) {
            this.addMiddleware(controller);
        }
    }
    addRoutes(configs) {
        for (const config of configs) {
            this.addRoute(config);
        }
    }
    addMiddleware(controller) {
        this.use(middlewares_1.createMiddleware(controller));
    }
    addRoute(config) {
        this.use(middlewares_1.createRouteMiddleware(config));
    }
}
exports.WebApp = WebApp;
//# sourceMappingURL=WebApp.js.map