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
const path_1 = require("path");
const http_1 = require("../libraries/http");
const WebApp_1 = require("./WebApp");
const testcaseDirPath = path_1.resolve(path_1.dirname(path_1.dirname(__dirname)), "testcase", "webApp");
const header = "<h1>Header</h1>";
const footer = "<footer>Footer</footer>";
const copyRight = "&copy; goFrendi";
const year = "2018";
const port = 3010;
const url = `http://localhost:${port}`;
const app = new WebApp_1.WebApp();
let server;
it("able to add routes before middlewares", (done) => {
    const routes = [
        // function
        { url: "/first", controller: () => "Roses are red" },
        // function with custom outProcessor
        {
            controller: () => "blue",
            outProcessor: (ctx, out) => ctx.body = `Violet is ${out}`,
            url: "/second",
        },
        // compiled chiml files
        { url: "/add/:n1/:n2", controller: path_1.resolve(testcaseDirPath, "compiled-page.chiml") },
        // propagateCtx
        {
            controller: path_1.resolve(testcaseDirPath, "compiled-route.chiml"),
            propagateCtx: true,
            url: "/minus/:n1/:n2",
        },
        // without controller
        {
            url: "/echo/:whatever",
        },
    ];
    app.addRoutes(routes);
    done();
});
it("able to add jsonRpc middleware", (done) => {
    const configs = [
        { method: "add", controller: path_1.resolve(testcaseDirPath, "compiled-page.chiml") },
        { method: "invalid", controller: "invalid.chiml" },
    ];
    app.addJsonRpcMiddleware("/jsonrpc", configs);
    done();
});
it("able to add authentication, authorization, and routes", (done) => {
    // authentication
    app.addAuthenticationMiddleware({ controller: (ctx) => {
            return ctx.query("user");
        } });
    /*
    // authorization
    app.addAuthorizationMiddleware({controller: (ctx) => {
      switch (ctx.state.auth) {
        case "alice": return "admin";
        case "bob": return ["author", "contributor"];
        default: return null;
      }
    }});
    */
    // authorized middlewares
    const routes = [
        { url: "/adminDashboard", controller: () => "Admin Dashboard", roles: ["admin"] },
        { url: "/authorDashboard", controller: () => "Author Dashboard", roles: ["author"] },
        { url: "/contributorDashboard", controller: () => "Contributor Dashboard", roles: ["contributor"] },
        { url: "/adminAndAuthorDashboard", controller: () => "Admin and Author Dashboard", roles: ["admin", "author"] },
        { url: "/memberDashboard", controller: () => "Member Dashboard", roles: ["loggedIn"] },
        { url: "/registrationForm", controller: () => "RegistrationForm", roles: ["loggedOut"] },
        { url: "/landingPage", controller: () => "Landing Page", roles: ["loggedIn", "loggedOut"] },
    ];
    app.addRoutes(routes);
    done();
});
it("able to add middlewares", (done) => {
    const configs = [
        // function
        (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            ctx.body = header;
            yield next();
            ctx.body += year;
        }),
        // chiml file
        path_1.resolve(testcaseDirPath, "middleware.chiml"),
        // chiml script
        '(ctx, next) -> (ctx, next) => {return next().then(()=>{ctx.body += "<footer>Footer</footer>"});}',
    ];
    app.addMiddlewares(configs);
    done();
});
it("able to add pages after middlewares", (done) => {
    const propagateCtx = true;
    const configs = [
        // function
        { url: "/page-hello/:name", controller: (name) => `Hello ${name}` },
        // chiml file
        { url: "/page-hi/:name", controller: path_1.resolve(testcaseDirPath, "page.chiml") },
        // chiml script
        { url: "/page-bonjour/:name", controller: "(name) -> (name) => `Bonjour ${name}`" },
        // function (with propagateCtx)
        { propagateCtx, url: "/hello/:name", controller: (ctx, name) => ctx.body += `Hello ${name}` },
        // chiml file (with propagateCtx)
        { propagateCtx, url: "/hi/:name", controller: path_1.resolve(testcaseDirPath, "route.chiml") },
        // chiml script (with propagateCtx)
        { propagateCtx, url: "/bonjour/:name", controller: "(ctx, name) -> (ctx, name) => ctx.body += `Bonjour ${name}`" },
    ];
    app.addRoutes(configs);
    done();
});
it("able to create http server and run it", (done) => {
    server = app.createServer();
    server.listen(port);
    expect(server.listening).toBeTruthy();
    done();
});
it("able to create https server", (done) => {
    const httpsServer = app.createHttpsServer();
    expect(httpsServer).toBeDefined();
    done();
});
it("able to reply request to /first", (done) => {
    http_1.httpRequest(`${url}/first`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe("Roses are red");
        done();
    });
});
it("able to reply request to /second", (done) => {
    http_1.httpRequest(`${url}/second`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe("Violet is blue");
        done();
    });
});
it("able to reply request to /add/5/3", (done) => {
    http_1.httpRequest(`${url}/add/5/3`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe("8");
        done();
    });
});
it("able to reply request to /minus/5/3", (done) => {
    http_1.httpRequest(`${url}/minus/5/3`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe("2");
        done();
    });
});
it("able to reply request to /echo/blah", (done) => {
    http_1.httpRequest(`${url}/echo/blah`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe("blah");
        done();
    });
});
it("able to reply request to undefined route", (done) => {
    http_1.httpRequest(url, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe(`${header}${footer}${copyRight}${year}`);
        done();
    });
});
it("able to reply request to /hello/Frodo", (done) => {
    http_1.httpRequest(`${url}/hello/Frodo`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe(`${header}Hello Frodo${footer}${copyRight}${year}`);
        done();
    });
});
it("able to reply request to /hi/Luke", (done) => {
    http_1.httpRequest(`${url}/hi/Luke`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe(`${header}Hi Luke${footer}${copyRight}${year}`);
        done();
    });
});
it("able to reply request to /bonjour/Kirk", (done) => {
    http_1.httpRequest(`${url}/bonjour/Kirk`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe(`${header}Bonjour Kirk${footer}${copyRight}${year}`);
        done();
    });
});
it("able to reply request to /page-hello/Frodo", (done) => {
    http_1.httpRequest(`${url}/page-hello/Frodo`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe(`${header}Hello Frodo${footer}${copyRight}${year}`);
        done();
    });
});
it("able to reply request to /page-hi/Luke", (done) => {
    http_1.httpRequest(`${url}/page-hi/Luke`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe(`${header}Hi Luke${footer}${copyRight}${year}`);
        done();
    });
});
it("able to reply request to /page-bonjour/Kirk", (done) => {
    http_1.httpRequest(`${url}/page-bonjour/Kirk`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe(`${header}Bonjour Kirk${footer}${copyRight}${year}`);
        done();
    });
});
it("able to reply request to /jsonrpc (using httpRequest)", (done) => {
    const requestConfig = {
        body: JSON.stringify({
            id: 1,
            jsonrpc: "2.0",
            method: "add",
            params: [4, 5],
        }),
        method: "POST",
        url: `${url}/jsonrpc`,
    };
    http_1.httpRequest(requestConfig, (error, body) => {
        expect(error).toBeNull();
        expect(JSON.parse(body)).toMatchObject({ id: 1, result: 9, jsonrpc: "2.0" });
        done();
    });
});
it("able to reply request to /jsonrpc (using httpRequest, invalid chiml location)", (done) => {
    const requestConfig = {
        body: JSON.stringify({
            id: 1,
            jsonrpc: "2.0",
            method: "invalid",
            params: [4, 5],
        }),
        method: "POST",
        url: `${url}/jsonrpc`,
    };
    http_1.httpRequest(requestConfig, (error, body) => {
        expect(error).toBeNull();
        expect(JSON.parse(body)).toMatchObject({
            error: {
                code: -32603,
                data: "Internal Error",
                message: "",
            },
            jsonrpc: "2.0",
        });
        done();
    });
});
it("able to reply request to /jsonrpc (using httpRequest, invalid id)", (done) => {
    const requestConfig = {
        body: JSON.stringify({
            id: 1.5,
            jsonrpc: "2.0",
            method: "add",
            params: [4, 5],
        }),
        method: "POST",
        url: `${url}/jsonrpc`,
    };
    http_1.httpRequest(requestConfig, (error, body) => {
        expect(error).toBeNull();
        expect(JSON.parse(body)).toMatchObject({
            error: {
                code: -32600,
                data: "Invalid Request",
                message: "id should be null, undefined, or interger",
            },
            jsonrpc: "2.0",
        });
        done();
    });
});
it("able to reply request to /jsonrpc (using httpRequest, invalid version)", (done) => {
    const requestConfig = {
        body: JSON.stringify({
            id: 1,
            jsonrpc: "2.5",
            method: "add",
            params: [4, 5],
        }),
        method: "POST",
        url: `${url}/jsonrpc`,
    };
    http_1.httpRequest(requestConfig, (error, body) => {
        expect(error).toBeNull();
        expect(JSON.parse(body)).toMatchObject({
            error: {
                code: -32600,
                data: "Invalid Request",
                message: "jsonrpc must be exactly \"2.0\"",
            },
            jsonrpc: "2.0",
        });
        done();
    });
});
it("able to reply request to /jsonrpc (using httpRequest, invalid params)", (done) => {
    const requestConfig = {
        body: JSON.stringify({
            id: 1,
            jsonrpc: "2.0",
            method: "add",
            params: 4,
        }),
        method: "POST",
        url: `${url}/jsonrpc`,
    };
    http_1.httpRequest(requestConfig, (error, body) => {
        expect(error).toBeNull();
        expect(JSON.parse(body)).toMatchObject({
            error: {
                code: -32602,
                data: "Invalid Params",
                message: "invalid params",
            },
            jsonrpc: "2.0",
        });
        done();
    });
});
it("able to reply request to /jsonrpc (using httpRequest, invalid method: wrong data type)", (done) => {
    const requestConfig = {
        body: JSON.stringify({
            id: 1,
            jsonrpc: "2.0",
            method: 73,
            params: [4, 5],
        }),
        method: "POST",
        url: `${url}/jsonrpc`,
    };
    http_1.httpRequest(requestConfig, (error, body) => {
        expect(error).toBeNull();
        expect(JSON.parse(body)).toMatchObject({
            error: {
                code: -32600,
                data: "Invalid Request",
                message: "method must be string",
            },
            jsonrpc: "2.0",
        });
        done();
    });
});
it("able to reply request to /jsonrpc (using httpRequest, invalid method: non exists)", (done) => {
    const requestConfig = {
        body: JSON.stringify({
            id: 1,
            jsonrpc: "2.0",
            method: "nonexists",
            params: [4, 5],
        }),
        method: "POST",
        url: `${url}/jsonrpc`,
    };
    http_1.httpRequest(requestConfig, (error, body) => {
        expect(error).toBeNull();
        expect(JSON.parse(body)).toMatchObject({
            error: {
                code: -32601,
                data: "Method Not Found",
                message: "method not found",
            },
            jsonrpc: "2.0",
        });
        done();
    });
});
it("able to reply request to /jsonrpc (using httpRequest, invalid json)", (done) => {
    const requestConfig = {
        body: "Invalid Json",
        method: "POST",
        url: `${url}/jsonrpc`,
    };
    http_1.httpRequest(requestConfig, (error, body) => {
        expect(error).toBeNull();
        expect(JSON.parse(body)).toMatchObject({
            error: {
                code: -32700,
                data: "Parse Error",
                message: "",
            },
            jsonrpc: "2.0",
        });
        done();
    });
});
it("able to reply request to /jsonrpc (using jsonRpcRequest)", (done) => {
    http_1.jsonRpcRequest(`${url}/jsonrpc`, "add", 4, 5, (error, result) => {
        expect(error).toBeNull();
        expect(result).toBe(9);
        done();
    });
});
it("able to reject invalid request to /jsonrpc (using jsonRpcRequest)", (done) => {
    http_1.jsonRpcRequest(`${url}/jsonrpc`, "invalid", 4, 5, (error, result) => {
        expect(error).toBeDefined();
        done();
    });
});
it("able to reject invalid url (using jsonRpcRequest)", (done) => {
    http_1.jsonRpcRequest("ftp://nonexists.nonsense", "invalid", 4, 5, (error, result) => {
        expect(error).toBeDefined();
        done();
    });
});
it("able to reject invalid url that is not jsonrpc (using jsonRpcRequest)", (done) => {
    http_1.jsonRpcRequest(`${url}/page-bonjour/Kirk`, "invalid", 4, 5, (error, result) => {
        expect(error).toBeDefined();
        done();
    });
});
it("able to close server", (done) => {
    server.close();
    expect(server.listening).toBeFalsy();
    done();
});
