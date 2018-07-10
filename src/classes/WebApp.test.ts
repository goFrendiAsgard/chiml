import * as cacheRequirePaths from "cache-require-paths";
import {dirname as pathDirName, resolve as pathResolve} from "path";
import {httpRequest, jsonRpcRequest} from "../libraries/http";
import {WebApp} from "./WebApp";

const testcaseDirPath = pathResolve(pathDirName(pathDirName(__dirname)), "testcase", "webApp");
const header = "<h1>Header</h1>";
const footer = "<footer>Footer</footer>";
const copyRight = "&copy; goFrendi";
const year = "2018";
const port = 3010;
const url = `http://localhost:${port}`;
const app = new WebApp();
let server;

it("able to add routes before middlewares", (done) => {
  const configs = [
    // function
    {url: "/first", controller: () => "Roses are red"},
    // function with custom outProcessor
    {
      controller: () => "blue",
      outProcessor: (ctx, out) => ctx.body = `Violet is ${out}`,
      url: "/second",
    },
    // compiled chiml files
    {url: "/add/:n1/:n2", controller: pathResolve(testcaseDirPath, "compiled-page.chiml")},
    // propagateCtx
    {
      controller: pathResolve(testcaseDirPath, "compiled-route.chiml"),
      propagateCtx: true,
      url: "/minus/:n1/:n2",
    },
    // without controller
    {
      url: "/echo/:whatever",
    },
  ];
  app.addRoutes(configs);
  done();
});

it("able to add jsonRpc middleware", (done) => {
  const configs = [
    {method: "add", controller: pathResolve(testcaseDirPath, "compiled-page.chiml")},
    {method: "invalid", controller: "invalid.chiml"},
  ];
  app.addJsonRpcMiddleware("/jsonrpc", configs);
  done();
});

it("able to add authentication, authorization, and routes", (done) => {
  // TODO: think this one better
  app.addAuthenticationMiddleware({controller: async (ctx, next) => {
    await next();
  }});
});

it("able to add middlewares", (done) => {
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

it("able to add pages after middlewares", (done) => {
  const propagateCtx = true;
  const configs = [
    // function
    {url: "/page-hello/:name", controller: (name) => `Hello ${name}`},
    // chiml file
    {url: "/page-hi/:name", controller: pathResolve(testcaseDirPath, "page.chiml")},
    // chiml script
    {url: "/page-bonjour/:name", controller: "(name) -> (name) => `Bonjour ${name}`"},
    // function (with propagateCtx)
    {propagateCtx, url: "/hello/:name", controller: (ctx, name) => ctx.body += `Hello ${name}`},
    // chiml file (with propagateCtx)
    {propagateCtx, url: "/hi/:name", controller: pathResolve(testcaseDirPath, "route.chiml")},
    // chiml script (with propagateCtx)
    {propagateCtx, url: "/bonjour/:name", controller: "(ctx, name) -> (ctx, name) => ctx.body += `Bonjour ${name}`"},
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
  httpRequest(`${url}/first`, (error, body) => {
    expect(error).toBeNull();
    expect(body).toBe("Roses are red");
    done();
  });
});

it("able to reply request to /second", (done) => {
  httpRequest(`${url}/second`, (error, body) => {
    expect(error).toBeNull();
    expect(body).toBe("Violet is blue");
    done();
  });
});

it("able to reply request to /add/5/3", (done) => {
  httpRequest(`${url}/add/5/3`, (error, body) => {
    expect(error).toBeNull();
    expect(body).toBe("8");
    done();
  });
});

it("able to reply request to /minus/5/3", (done) => {
  httpRequest(`${url}/minus/5/3`, (error, body) => {
    expect(error).toBeNull();
    expect(body).toBe("2");
    done();
  });
});

it("able to reply request to /echo/blah", (done) => {
  httpRequest(`${url}/echo/blah`, (error, body) => {
    expect(error).toBeNull();
    expect(body).toBe("blah");
    done();
  });
});

it("able to reply request to undefined route", (done) => {
  httpRequest(url, (error, body) => {
    expect(error).toBeNull();
    expect(body).toBe(`${header}${footer}${copyRight}${year}`);
    done();
  });
});

it("able to reply request to /hello/Frodo", (done) => {
  httpRequest(`${url}/hello/Frodo`, (error, body) => {
    expect(error).toBeNull();
    expect(body).toBe(`${header}Hello Frodo${footer}${copyRight}${year}`);
    done();
  });
});

it("able to reply request to /hi/Luke", (done) => {
  httpRequest(`${url}/hi/Luke`, (error, body) => {
    expect(error).toBeNull();
    expect(body).toBe(`${header}Hi Luke${footer}${copyRight}${year}`);
    done();
  });
});

it("able to reply request to /bonjour/Kirk", (done) => {
  httpRequest(`${url}/bonjour/Kirk`, (error, body) => {
    expect(error).toBeNull();
    expect(body).toBe(`${header}Bonjour Kirk${footer}${copyRight}${year}`);
    done();
  });
});

it("able to reply request to /page-hello/Frodo", (done) => {
  httpRequest(`${url}/page-hello/Frodo`, (error, body) => {
    expect(error).toBeNull();
    expect(body).toBe(`${header}Hello Frodo${footer}${copyRight}${year}`);
    done();
  });
});

it("able to reply request to /page-hi/Luke", (done) => {
  httpRequest(`${url}/page-hi/Luke`, (error, body) => {
    expect(error).toBeNull();
    expect(body).toBe(`${header}Hi Luke${footer}${copyRight}${year}`);
    done();
  });
});

it("able to reply request to /page-bonjour/Kirk", (done) => {
  httpRequest(`${url}/page-bonjour/Kirk`, (error, body) => {
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
  httpRequest(requestConfig, (error, body) => {
    expect(error).toBeNull();
    expect(JSON.parse(body)).toMatchObject({id: 1, result: 9, jsonrpc: "2.0"});
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
  httpRequest(requestConfig, (error, body) => {
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

it("able to reply request to /jsonrpc (using httpRequest, invalid json)", (done) => {
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

it("able to reply request to /jsonrpc (using jsonRpcRequest)", (done) => {
  jsonRpcRequest(`${url}/jsonrpc`, "add", 4, 5, (error, result) => {
    expect(error).toBeNull();
    expect(result).toBe(9);
    done();
  });
});

it("able to reject invalid request to /jsonrpc (using jsonRpcRequest)", (done) => {
  jsonRpcRequest(`${url}/jsonrpc`, "invalid", 4, 5, (error, result) => {
    expect(error).toBeDefined();
    done();
  });
});

it("able to reject invalid url (using jsonRpcRequest)", (done) => {
  jsonRpcRequest("ftp://nonexists.nonsense", "invalid", 4, 5, (error, result) => {
    expect(error).toBeDefined();
    done();
  });
});

it("able to reject invalid url that is not jsonrpc (using jsonRpcRequest)", (done) => {
  jsonRpcRequest(`${url}/page-bonjour/Kirk`, "invalid", 4, 5, (error, result) => {
    expect(error).toBeDefined();
    done();
  });
});

it("able to close server", (done) => {
  server.close();
  expect(server.listening).toBeFalsy();
  done();
});
