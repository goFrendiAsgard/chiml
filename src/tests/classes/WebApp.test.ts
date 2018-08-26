import { dirname as pathDirName, resolve as pathResolve } from "path";
import * as io from "socket.io-client";
import { WebApp } from "../../classes/WebApp";
import { createJsonRpcProxy } from "../../libraries/createJsonRpcProxy";
import { httpRequest, jsonRpcRequest } from "../../libraries/http";

const testcaseDirPath = pathResolve(pathDirName(pathDirName(pathDirName(__dirname))), "testcase", "webApp");
const header = "<h1>Header</h1>";
const footer = "<footer>Footer</footer>";
const copyRight = "&copy; goFrendi";
const year = "2018";
const port = 3010;
const url = `http://localhost:${port}`;
const app = new WebApp();
let server;

test("able to add routes before middlewares", (done) => {
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
        { url: "/add/:n1/:n2", controller: pathResolve(testcaseDirPath, "compiled-page.chiml") },
        // propagateContext
        {
            controller: pathResolve(testcaseDirPath, "compiled-route.chiml"),
            propagateContext: true,
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

test("able to add authentication, authorization, and authorized routes", (done) => {
    // authentication
    app.addAuthentication({
        controller: (ctx) => {
            return ctx.query.user;
        },
    });
    // authorization
    app.addAuthorization({
        controller: (ctx) => {
            switch (ctx.state.user) {
                case "alice": return "admin";
                case "bob": return ["author", "contributor"];
                default: return null;
            }
        },
    });
    // authorized middlewares
    const routes = [
        { url: "/adminDashboard", controller: () => "Admin Dashboard Page", roles: ["admin"] },
        { url: "/authorDashboard", controller: () => "Author Dashboard Page", roles: ["author"] },
        { url: "/contributorDashboard", controller: () => "Contributor Dashboard Page", roles: ["contributor"] },
        {
            controller: () => "Admin and Author Dashboard Page",
            roles: ["admin", "author"],
            url: "/adminAndAuthorDashboard",
        },
        { url: "/memberDashboard", controller: () => "Member Dashboard Page", roles: ["loggedIn"] },
        { url: "/registrationForm", controller: () => "Registration Form Page", roles: ["loggedOut"] },
        { url: "/landingPage", controller: () => "Landing Page", roles: ["loggedIn", "loggedOut"] },
    ];
    app.addRoutes(routes);
    done();
});

test("able to add jsonRpc middleware", (done) => {
    const configs = [
        { method: "add", controller: pathResolve(testcaseDirPath, "compiled-page.chiml") },
        { method: "plus", controller: pathResolve(testcaseDirPath, "compiled-page.chiml"), roles: ["admin"] },
        { method: "invalid", controller: "invalid.chiml" },
    ];
    app.addJsonRpc("/jsonrpc", configs);
    done();
});

test("able to add middlewares", (done) => {
    const configs = [
        // function
        async (ctx, next) => {
            ctx.body = header;
            await next();
            ctx.body += year;
        },
        // chiml file
        pathResolve(testcaseDirPath, "middleware.chiml"),
        // chiml script
        '(ctx, next) -> (ctx, next) => {return next().then(()=>{ctx.body += "<footer>Footer</footer>"});}',
    ];
    app.addMiddlewares(configs);
    done();
});

test("able to add pages after middlewares", (done) => {
    const propagateContext = true;
    const configs = [
        // function
        { url: "/page-hello/:name", controller: (name) => `Hello ${name}` },
        // chiml file
        { url: "/page-hi/:name", controller: pathResolve(testcaseDirPath, "page.chiml") },
        // chiml script
        { url: "/page-bonjour/:name", controller: "(name) -> (name) => `Bonjour ${name}`" },
        // function (with propagateContext)
        { propagateContext, url: "/hello/:name", controller: (ctx, name) => ctx.body += `Hello ${name}` },
        // chiml file (with propagateContext)
        { propagateContext, url: "/hi/:name", controller: pathResolve(testcaseDirPath, "route.chiml") },
        // chiml script (with propagateContext)
        {
            controller: "(ctx, name) -> (ctx, name) => ctx.body += `Bonjour ${name}`",
            propagateContext,
            url: "/bonjour/:name",
        },
    ];
    app.addRoutes(configs);
    done();
});

test("able to create http server and run it", (done) => {
    server = app.createServer();
    server.listen(port);
    expect(server.listening).toBeTruthy();
    done();
});

test("able to create io", (done) => {
    const configs = [
        {
            controller: (socket, message) => {
                socket.emit("snap", message + 1);
            },
            event: "snip",
        },
        {
            controller: (socket, message) => {
                socket.emit("snip", message + 1);
            },
            event: "snap",
        },
    ];
    const serverIo = app.createIo(server);
    serverIo.addEventListeners(configs);
    serverIo.applyEventListeners();
    done();
});

test("able to send io request", (done) => {
    const socket = io.connect(url);
    socket.emit("snip", 73);
    socket.on("snap", (message) => {
        expect(message).toBe(74);
        socket.disconnect();
        done();
    });
});

test("able to create https server", (done) => {
    const httpsServer = app.createHttpsServer();
    expect(httpsServer).toBeDefined();
    done();
});

const unauthorizedTest = {
    adminAndAuthorDashboard: false,
    adminDashboard: false,
    authorDashboard: false,
    contributorDashboard: false,
    landingPage: true,
    memberDashboard: false,
    registrationForm: true,
};

for (const subUrl in unauthorizedTest) {
    if (subUrl in unauthorizedTest) {
        it(`able to reply unauthorized request to /${subUrl}`, (done) => {
            httpRequest(`${url}/${subUrl}`, (error, body) => {
                if (unauthorizedTest[subUrl]) {
                    expect(body).toMatch(/^.+\sPage$/g);
                    return done();
                }
                expect(body.match(/^.+\sPage$/g)).toBeFalsy();
                return done();
            });
        });
    }
}

const authorizedTest = {
    alice: {
        adminAndAuthorDashboard: true,
        adminDashboard: true,
        authorDashboard: false,
        contributorDashboard: false,
        landingPage: true,
        memberDashboard: true,
        registrationForm: false,
    },
    bob: {
        adminAndAuthorDashboard: true,
        adminDashboard: false,
        authorDashboard: true,
        contributorDashboard: true,
        landingPage: true,
        memberDashboard: true,
        registrationForm: false,
    },
    charlie: {
        adminAndAuthorDashboard: false,
        adminDashboard: false,
        authorDashboard: false,
        contributorDashboard: false,
        landingPage: true,
        memberDashboard: true,
        registrationForm: false,
    },
};

for (const user in authorizedTest) {
    if (user in authorizedTest) {
        for (const subUrl in authorizedTest[user]) {
            if (subUrl in authorizedTest[user]) {
                test(`able to reply authorized request to /${subUrl}?user=${user}`, (done) => {
                    httpRequest(`${url}/${subUrl}?user=${user}`, (error, body) => {
                        if (authorizedTest[user][subUrl]) {
                            expect(body).toMatch(/^.+\sPage$/g);
                            return done();
                        }
                        expect(body.match(/^.+\sPage$/g)).toBeFalsy();
                        return done();
                    });
                });
            }
        }
    }
}

test("able to reply request to /first", (done) => {
    httpRequest(`${url}/first`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe("Roses are red");
        done();
    });
});

test("able to reply request to /second", (done) => {
    httpRequest(`${url}/second`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe("Violet is blue");
        done();
    });
});

test("able to reply request to /add/5/3", (done) => {
    httpRequest(`${url}/add/5/3`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe("8");
        done();
    });
});

test("able to reply request to /minus/5/3", (done) => {
    httpRequest(`${url}/minus/5/3`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe("2");
        done();
    });
});

test("able to reply request to /echo/blah", (done) => {
    httpRequest(`${url}/echo/blah`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe("blah");
        done();
    });
});

test("able to reply request to undefined route", (done) => {
    httpRequest(url, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe(`${header}${footer}${copyRight}${year}`);
        done();
    });
});

test("able to reply request to /hello/Frodo", (done) => {
    httpRequest(`${url}/hello/Frodo`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe(`${header}Hello Frodo${footer}${copyRight}${year}`);
        done();
    });
});

test("able to reply request to /hi/Luke", (done) => {
    httpRequest(`${url}/hi/Luke`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe(`${header}Hi Luke${footer}${copyRight}${year}`);
        done();
    });
});

test("able to reply request to /bonjour/Kirk", (done) => {
    httpRequest(`${url}/bonjour/Kirk`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe(`${header}Bonjour Kirk${footer}${copyRight}${year}`);
        done();
    });
});

test("able to reply request to /page-hello/Frodo", (done) => {
    httpRequest(`${url}/page-hello/Frodo`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe(`${header}Hello Frodo${footer}${copyRight}${year}`);
        done();
    });
});

test("able to reply request to /page-hi/Luke", (done) => {
    httpRequest(`${url}/page-hi/Luke`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe(`${header}Hi Luke${footer}${copyRight}${year}`);
        done();
    });
});

test("able to reply request to /page-bonjour/Kirk", (done) => {
    httpRequest(`${url}/page-bonjour/Kirk`, (error, body) => {
        expect(error).toBeNull();
        expect(body).toBe(`${header}Bonjour Kirk${footer}${copyRight}${year}`);
        done();
    });
});

test("able to reply request to /jsonrpc (using httpRequest)", (done) => {
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
    httpRequest(requestConfig, (error, body) => {
        expect(error).toBeNull();
        expect(JSON.parse(body)).toMatchObject({ id: 1, result: 9, jsonrpc: "2.0" });
        done();
    });
});

test("able to reply request to /jsonrpc (using httpRequest, invalid chiml location)", (done) => {
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
    httpRequest(requestConfig, (error, body) => {
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

test("able to reply request to /jsonrpc (using httpRequest, invalid id)", (done) => {
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
    httpRequest(requestConfig, (error, body) => {
        expect(error).toBeNull();
        expect(JSON.parse(body)).toMatchObject({
            error: {
                code: -32600,
                data: "Invalid Request",
                message: "id should be null, undefined, or integer",
            },
            jsonrpc: "2.0",
        });
        done();
    });
});

test("able to reply request to /jsonrpc (using httpRequest, invalid version)", (done) => {
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
    httpRequest(requestConfig, (error, body) => {
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

test("able to reply request to /jsonrpc (using httpRequest, invalid params)", (done) => {
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
    httpRequest(requestConfig, (error, body) => {
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

test("able to reply request to /jsonrpc (using httpRequest, invalid method: wrong data type)", (done) => {
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
    httpRequest(requestConfig, (error, body) => {
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

test("able to reply request to /jsonrpc (using httpRequest, invalid method: non exists)", (done) => {
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
    httpRequest(requestConfig, (error, body) => {
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

test("able to reply request to /jsonrpc (using httpRequest, invalid json)", (done) => {
    const requestConfig = {
        body: "Invalid Json",
        method: "POST",
        url: `${url}/jsonrpc`,
    };
    httpRequest(requestConfig, (error, body) => {
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

test("able to reply request to /jsonrpc (using jsonRpcRequest)", (done) => {
    jsonRpcRequest(`${url}/jsonrpc`, "add", 4, 5, (error, result) => {
        expect(error).toBeNull();
        expect(result).toBe(9);
        done();
    });
});

test("able to reply authorized request to /jsonrpc (using jsonRpcRequest)", (done) => {
    jsonRpcRequest(`${url}/jsonrpc?user=alice`, "plus", 4, 5, (error, result) => {
        expect(error).toBeNull();
        expect(result).toBe(9);
        done();
    });
});

test("able to reject unauthorized request to /jsonrpc (using jsonRpcRequest)", (done) => {
    jsonRpcRequest(`${url}/jsonrpc?user=bob`, "plus", 4, 5, (error, result) => {
        expect(error).toBeDefined();
        done();
    });
});

test("able to reject invalid request to /jsonrpc (using jsonRpcRequest)", (done) => {
    jsonRpcRequest(`${url}/jsonrpc`, "invalid", 4, 5, (error, result) => {
        expect(error).toBeDefined();
        done();
    });
});

test("able to reject invalid url (using jsonRpcRequest)", (done) => {
    jsonRpcRequest("ftp://nonexists.nonsense", "invalid", 4, 5, (error, result) => {
        expect(error).toBeDefined();
        done();
    });
});

test("able to reject invalid url that is not jsonrpc (using jsonRpcRequest)", (done) => {
    jsonRpcRequest(`${url}/page-bonjour/Kirk`, "invalid", 4, 5, (error, result) => {
        expect(error).toBeDefined();
        done();
    });
});

test("able to reply authorized request to /jsonrpc (using jsonRpcProxy)", (done) => {
    createJsonRpcProxy(`${url}/jsonrpc?user=alice`).call("plus", 4, 5, (error, result) => {
        expect(error).toBeNull();
        expect(result).toBe(9);
        done();
    });
});

test("able to reply authorized request to /jsonrpc (using jsonRpcProxy with object as config)", (done) => {
    createJsonRpcProxy({ url: `${url}/jsonrpc?user=alice` }).call("plus", 4, 5, (error, result) => {
        expect(error).toBeNull();
        expect(result).toBe(9);
        done();
    });
});

test("able to reject unauthorized request to /jsonrpc (using jsonRpcProxy)", (done) => {
    createJsonRpcProxy(`${url}/jsonrpc?user=bob`).call("plus", 4, 5, (error, result) => {
        expect(error).toBeDefined();
        done();
    });
});

test("able to reject invalid request to /jsonrpc (using jsonRpcProxy)", (done) => {
    createJsonRpcProxy(`${url}/jsonrpc`).call("invalid", 4, 5, (error, result) => {
        expect(error).toBeDefined();
        done();
    });
});

test("able to reject invalid url (using jsonRpcProxy)", (done) => {
    createJsonRpcProxy("ftp://nonexists.nonsense").call("invalid", 4, 5, (error, result) => {
        expect(error).toBeDefined();
        done();
    });
});

test("able to reject invalid url that is not jsonrpc (using jsonRpcProxy)", (done) => {
    createJsonRpcProxy(`${url}/page-bonjour/Kirk`).call("invalid", 4, 5, (error, result) => {
        expect(error).toBeDefined();
        done();
    });
});

test("able to close server", (done) => {
    server.close();
    expect(server.listening).toBeFalsy();
    done();
});
