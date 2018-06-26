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
const httpRequest = require("request");
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
it("able to add page (function) before middleware", (done) => {
    app.addPage("get", "/first", () => "Roses are red");
    done();
});
it("able to add page (function) with custom outProcessor, before middleware", (done) => {
    app.addPage("get", "/second", () => "blue", (ctx, out) => ctx.body = `Violet is ${out}`);
    done();
});
it("able to add compiled page", (done) => {
    app.addPage("get", "/add/:n1/:n2", path_1.resolve(testcaseDirPath, "compiled-page.chiml"));
    done();
});
it("able to add compiled route", (done) => {
    app.addRoute("get", "/minus/:n1/:n2", path_1.resolve(testcaseDirPath, "compiled-route.chiml"));
    done();
});
it("able to add middleware (function)", (done) => {
    app.addMiddleware((ctx, next) => __awaiter(this, void 0, void 0, function* () {
        ctx.body = header;
        yield next();
        ctx.body += year;
    }));
    done();
});
it("able to add middleware (chiml file)", (done) => {
    app.addMiddleware(path_1.resolve(testcaseDirPath, "middleware.chiml"));
    done();
});
it("able to add middleware (chiml script)", (done) => {
    app.addMiddleware('(ctx, next) -> (ctx, next) => {return next().then(()=>{ctx.body += "<footer>Footer</footer>"});}');
    done();
});
it("able to add page (function)", (done) => {
    app.addPage("get", "/page-hello/:name", (name) => `Hello ${name}`);
    done();
});
it("able to add page (chiml file)", (done) => {
    app.addPage("get", "/page-hi/:name", path_1.resolve(testcaseDirPath, "page.chiml"));
    done();
});
it("able to add page (chiml script)", (done) => {
    app.addPage("get", "/page-bonjour/:name", "(name) -> (name) => `Bonjour ${name}`");
    done();
});
it("able to add route (function)", (done) => {
    app.addRoute("get", "/hello/:name", (ctx, name) => ctx.body += `Hello ${name}`);
    done();
});
it("able to add route (chiml file)", (done) => {
    app.addRoute("get", "/hi/:name", path_1.resolve(testcaseDirPath, "route.chiml"));
    done();
});
it("able to add route (chiml script)", (done) => {
    app.addRoute("get", "/bonjour/:name", "(ctx, name) -> (ctx, name) => ctx.body += `Bonjour ${name}`");
    done();
});
it("able to create server and run it", (done) => {
    server = app.createServer();
    server.listen(port);
    expect(server.listening).toBeTruthy();
    done();
});
it("able to send request to /first", (done) => {
    httpRequest(`${url}/first`, (error, response, body) => {
        expect(error).toBeNull();
        expect(body).toBe("Roses are red");
        done();
    });
});
it("able to send request to /second", (done) => {
    httpRequest(`${url}/second`, (error, response, body) => {
        expect(error).toBeNull();
        expect(body).toBe("Violet is blue");
        done();
    });
});
it("able to send request to /add/5/3", (done) => {
    httpRequest(`${url}/add/5/3`, (error, response, body) => {
        expect(error).toBeNull();
        expect(body).toBe("8");
        done();
    });
});
it("able to send request to /minus/5/3", (done) => {
    httpRequest(`${url}/minus/5/3`, (error, response, body) => {
        expect(error).toBeNull();
        expect(body).toBe("2");
        done();
    });
});
it("able to send request to undefined route", (done) => {
    httpRequest(url, (error, response, body) => {
        expect(error).toBeNull();
        expect(body).toBe(`${header}${footer}${copyRight}${year}`);
        done();
    });
});
it("able to send request to /hello/Frodo", (done) => {
    httpRequest(`${url}/hello/Frodo`, (error, response, body) => {
        expect(error).toBeNull();
        expect(body).toBe(`${header}Hello Frodo${footer}${copyRight}${year}`);
        done();
    });
});
it("able to send request to /hi/Luke", (done) => {
    httpRequest(`${url}/hi/Luke`, (error, response, body) => {
        expect(error).toBeNull();
        expect(body).toBe(`${header}Hi Luke${footer}${copyRight}${year}`);
        done();
    });
});
it("able to send request to /bonjour/Kirk", (done) => {
    httpRequest(`${url}/bonjour/Kirk`, (error, response, body) => {
        expect(error).toBeNull();
        expect(body).toBe(`${header}Bonjour Kirk${footer}${copyRight}${year}`);
        done();
    });
});
it("able to send request to /page-hello/Frodo", (done) => {
    httpRequest(`${url}/page-hello/Frodo`, (error, response, body) => {
        expect(error).toBeNull();
        expect(body).toBe(`${header}Hello Frodo${footer}${copyRight}${year}`);
        done();
    });
});
it("able to send request to /page-hi/Luke", (done) => {
    httpRequest(`${url}/page-hi/Luke`, (error, response, body) => {
        expect(error).toBeNull();
        expect(body).toBe(`${header}Hi Luke${footer}${copyRight}${year}`);
        done();
    });
});
it("able to send request to /page-bonjour/Kirk", (done) => {
    httpRequest(`${url}/page-bonjour/Kirk`, (error, response, body) => {
        expect(error).toBeNull();
        expect(body).toBe(`${header}Bonjour Kirk${footer}${copyRight}${year}`);
        done();
    });
});
it("able to close server", (done) => {
    server.close();
    expect(server.listening).toBeFalsy();
    done();
});
//# sourceMappingURL=WebApp.test.js.map