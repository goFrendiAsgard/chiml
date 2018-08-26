"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const https = require("https");
const Koa = require("koa");
const socketIo = require("socket.io");
const Logger_1 = require("../classes/Logger");
const middlewares_1 = require("../libraries/middlewares");
const defaultLogger = new Logger_1.Logger();
function defaultSocketIoAuthorizationWrapper(middleware, config) {
    return (socket, ...args) => {
        const { ctx } = socket;
        if (middlewares_1.isAuthorized(ctx, config)) {
            return middleware(socket, ...args);
        }
        const next = args[args.length - 1];
        return next();
    };
}
class WebApp extends Koa {
    constructor() {
        super(...arguments);
        this.createServer = this.createHttpServer;
        this.authenticationMiddleware = null;
        this.authorizationMiddleware = null;
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
                    const logger = "logger" in eventListener && eventListener.logger ?
                        eventListener.logger : defaultLogger;
                    const handler = middlewares_1.createMiddleware({
                        authorizationWrapper: defaultSocketIoAuthorizationWrapper,
                        controller,
                        propagateContext: true,
                    });
                    // register event
                    socket.on(event, (...ins) => __awaiter(this, void 0, void 0, function* () {
                        const request = socket.request;
                        const httpServerResponse = new http.ServerResponse(socket.request);
                        // inject fake ctx to socket
                        const ctx = self.createContext(request, httpServerResponse);
                        if (self.authenticationMiddleware) {
                            yield self.authenticationMiddleware(ctx, () => __awaiter(this, void 0, void 0, function* () { return null; }));
                        }
                        if (self.authorizationMiddleware) {
                            yield self.authorizationMiddleware(ctx, () => __awaiter(this, void 0, void 0, function* () { return null; }));
                        }
                        Object.defineProperty(socket, "ctx", { value: ctx, writable: false, configurable: true });
                        // execute handler
                        handler(socket, ...ins).catch((error) => {
                            logger.error(error);
                        });
                    }));
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
        if (this.authenticationMiddleware) {
            throw (new Error("Cannot set authentication middleware"));
        }
        this.authenticationMiddleware = middlewares_1.createAuthenticationMiddleware(config);
        this.use(this.authenticationMiddleware);
    }
    addAuthorization(config) {
        if (this.authorizationMiddleware) {
            throw (new Error("Cannot set authorization middleware"));
        }
        this.authorizationMiddleware = middlewares_1.createAuthorizationMiddleware(config);
        this.use(this.authorizationMiddleware);
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
