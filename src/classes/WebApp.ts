import * as http from "http";
import * as https from "https";
import * as Koa from "koa";
import * as socketIo from "socket.io";
import { Logger } from "../classes/Logger";
import { ISocketIoEventListener } from "../interfaces/ISocketIoEventListener";
import { ISocketIoInjectedSocket } from "../interfaces/ISocketIoInjectedSocket";
import { ISocketIoServer } from "../interfaces/ISocketIoServer";
import {
    createAuthenticationMiddleware,
    createAuthorizationMiddleware,
    createJsonRpcMiddleware,
    createMiddleware,
    createRouteMiddleware,
    isAuthorized,
} from "../libraries/middlewares";

const defaultLogger = new Logger();

function defaultSocketIoAuthorizationWrapper(
    middleware: (socket: ISocketIoInjectedSocket, ...args: any[]) => any,
    config: { [key: string]: any },
): (socket: ISocketIoInjectedSocket, ...args: any[]) => any {
    return (socket: ISocketIoInjectedSocket, ...args: any[]) => {
        const { ctx } = socket;
        if (isAuthorized(ctx, config)) {
            return middleware(socket, ...args);
        }
        const next = args[args.length - 1];
        return next();
    };
}

export class WebApp extends Koa {

    public createServer = this.createHttpServer;

    private authenticationMiddleware: (...ins: any[]) => any = null;
    private authorizationMiddleware: (...ins: any[]) => any = null;

    public createIo(server: http.Server | https.Server): ISocketIoServer {
        const self = this;
        const io: ISocketIoServer = socketIo(server) as ISocketIoServer;
        io.eventListeners = [];
        io.addEventListener = (config: ISocketIoEventListener) => io.eventListeners.push(config);
        io.addEventListeners = (configs: ISocketIoEventListener[]) => {
            configs.forEach((config) => io.addEventListener(config));
        };
        io.applyEventListeners = () => {
            io.on("connection", (socket: socketIo.Socket) => {
                for (const eventListener of io.eventListeners) {
                    // get event and handler
                    const { event, controller } = eventListener;
                    const logger = "logger" in eventListener && eventListener.logger ?
                        eventListener.logger : defaultLogger;
                    const handler = createMiddleware({
                        authorizationWrapper: defaultSocketIoAuthorizationWrapper,
                        controller,
                        propagateContext: true,
                    });
                    // register event
                    socket.on(event, async (...ins: any[]) => {
                        const request = socket.request;
                        const httpServerResponse = new http.ServerResponse(socket.request);
                        // inject fake ctx to socket
                        const ctx = self.createContext(request, httpServerResponse);
                        if (self.authenticationMiddleware) {
                            await self.authenticationMiddleware(ctx, async () => null);
                        }
                        if (self.authorizationMiddleware) {
                            await self.authorizationMiddleware(ctx, async () => null);
                        }
                        Object.defineProperty(socket, "ctx", { value: ctx, writable: false, configurable: true });
                        // execute handler
                        handler(socket, ...ins).catch((error) => {
                            logger.error(error);
                        });
                    });
                }
            });
        };
        return io;
    }

    public createHttpServer(): http.Server {
        return http.createServer(this.callback());
    }

    public createHttpsServer(options: { [key: string]: any } = {}): https.Server {
        return https.createServer(options, this.callback());
    }

    public addJsonRpc(url: string, configs: any[]): void {
        this.use(createJsonRpcMiddleware(url, configs));
    }

    public addAuthentication(config: { [key: string]: any }): void {
        if (this.authenticationMiddleware) {
            throw(new Error("Cannot set authentication middleware"));
        }
        this.authenticationMiddleware = createAuthenticationMiddleware(config);
        this.use(this.authenticationMiddleware);
    }

    public addAuthorization(config: { [key: string]: any }): void {
        if (this.authorizationMiddleware) {
            throw(new Error("Cannot set authorization middleware"));
        }
        this.authorizationMiddleware = createAuthorizationMiddleware(config);
        this.use(this.authorizationMiddleware);
    }

    public addMiddlewares(controllers: any[]): void {
        for (const controller of controllers) {
            this.addMiddleware(controller);
        }
    }

    public addRoutes(configs: Array<{ [key: string]: any }>): void {
        for (const config of configs) {
            this.addRoute(config);
        }
    }

    public addMiddleware(controller: any): void {
        this.use(createMiddleware(controller));
    }

    public addRoute(config: { [key: string]: any }): void {
        this.use(createRouteMiddleware(config));
    }

}
