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
        io.eventListeners = [];
        io.addEventListener = (config) => io.eventListeners.push(config);
        io.addEventListeners = (configs) => {
            configs.forEach((config) => io.addEventListener(config));
        };
        io.applyEventListeners = () => {
            io.on("connection", (socket) => {
                for (const eventListener of io.eventListeners) {
                    // get event and handler
                    const { event, controller } = eventListener;
                    const handler = middlewares_1.createMiddleware({
                        authorizationWrapper: null, controller, propagateContext: true,
                    });
                    // register event
                    socket.on(event, (...ins) => {
                        // inject fake ctx to socket
                        const ctx = self.createContext(socket.request, new http.ServerResponse(socket.request));
                        Object.defineProperty(socket, "ctx", { value: ctx, writable: false, configurable: true });
                        // execute handler
                        handler(socket, ...ins).catch((error) => {
                            console.error(error);
                        });
                    });
                }
            });
        };
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
