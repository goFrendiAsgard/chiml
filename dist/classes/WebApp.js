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
        const applyEventListeners = () => {
            io.on("connection", (socket) => {
                for (const eventListener of eventListeners) {
                    const { event, controller } = eventListener;
                    const handler = middlewares_1.createMiddleware(controller, { propagateContext: true });
                    socket.on(event, (...ins) => {
                        const ctx = self.createContext(socket.request, new http.ServerResponse(socket.request));
                        Object.defineProperty(socket, "ctx", { value: ctx, writable: false, configurable: true });
                        handler(socket, ...ins).catch((error) => {
                            console.error(error);
                        });
                    });
                }
            });
        };
        Object.defineProperty(io, "eventListeners", { value: eventListeners, writable: false });
        Object.defineProperty(io, "addEventListener", { value: addEventListener, writable: false });
        Object.defineProperty(io, "addEventListeners", { value: addEventListeners, writable: false });
        Object.defineProperty(io, "applyEventListeners", { value: applyEventListeners, writable: false });
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