import * as http from "http";
import * as https from "https";
import * as Koa from "koa";
import * as socketIo from "socket.io";
import { ISocketIoEventListener } from "../interfaces/ISocketIoEventListener";
import { ISocketIoServer } from "../interfaces/ISocketIoServer";
import {
    createAuthenticationMiddleware,
    createAuthorizationMiddleware,
    createJsonRpcMiddleware,
    createMiddleware,
    createRouteMiddleware,
} from "../libraries/middlewares";

export class WebApp extends Koa {

    public createServer = this.createHttpServer;

    public createIo(server: http.Server | https.Server): ISocketIoServer {
        const self = this;
        const io = socketIo(server) as ISocketIoServer;
        io.eventListeners = [];
        io.addEventListener = (config: ISocketIoEventListener) => io.eventListeners.push(config);
        io.addEventListeners = (configs: ISocketIoEventListener[]) => {
            configs.forEach((config) => io.addEventListener(config));
        };
        io.applyEventListeners = () => {
            io.on("connection", (socket) => {
                for (const eventListener of io.eventListeners) {
                    // get event and handler
                    const { event, controller } = eventListener;
                    const handler = createMiddleware(controller, { propagateContext: true });
                    // register event
                    socket.on(event, (...ins: any[]) => {
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
        this.use(createAuthenticationMiddleware(config));
    }

    public addAuthorization(config: { [key: string]: any }): void {
        this.use(createAuthorizationMiddleware(config));
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
