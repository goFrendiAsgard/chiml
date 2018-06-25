import * as httpRequest from "request";
import {WebApp} from "./WebApp";

const header = "<h1>Header</h1>";
const footer = "<footer>Footer</footer>";
const copyRight = "&copy; goFrendi";
const year = "2018";
const port = 3010;
const url = `http://localhost:${port}`;
const app = new WebApp();
let server;

it("able to add middleware (function)", (done) => {
  app.addMiddleware(async (ctx, next) => {
    ctx.body = header;
    await next();
    ctx.body += year;
  });
  done();
});

it("able to add middleware (chiml file)", (done) => {
  app.addMiddleware(async (ctx, next) => {
    await next();
    ctx.body += copyRight;
  });
  done();
});

it("able to add middleware (chiml script)", (done) => {
  app.addMiddleware(async (ctx, next) => {
    await next();
    ctx.body += footer;
  });
  done();
});

it("able to add route (function)", (done) => {
  app.addRoute("get", "/hello/:name", (ctx, name) => {
    ctx.body += `Hello ${name}`;
  });
  done();
});

it("able to add route (chiml file)", (done) => {
  app.addRoute("get", "/hi/:name", (ctx, name) => {
    ctx.body += `Hi ${name}`;
  });
  done();
});

it("able to add route (chiml script)", (done) => {
  app.addRoute("get", "/bonjour/:name", (ctx, name) => {
    ctx.body += `Bonjour ${name}`;
  });
  done();
});

it("able to create server and run it", (done) => {
  server = app.createServer();
  server.listen(port);
  expect(server.listening).toBeTruthy();
  done();
});

it("able to send request to undefined route", (done) => {
  httpRequest(url, (error, response, body) => {
    expect(error).toBeNull();
    expect(body).toBe(`${header}${footer}${copyRight}${year}`);
    done();
  });
});

it("able to send request to defined route (function)", (done) => {
  httpRequest(`${url}/hello/Frodo`, (error, response, body) => {
    expect(error).toBeNull();
    expect(body).toBe(`${header}Hello Frodo${footer}${copyRight}${year}`);
    done();
  });
});

it("able to send request to defined route (chiml file)", (done) => {
  httpRequest(`${url}/hi/Luke`, (error, response, body) => {
    expect(error).toBeNull();
    expect(body).toBe(`${header}Hi Luke${footer}${copyRight}${year}`);
    done();
  });
});

it("able to send request to defined route (chiml script)", (done) => {
  httpRequest(`${url}/bonjour/Kirk`, (error, response, body) => {
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
