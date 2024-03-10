import http from 'node:http';
import https from 'node:https';

const defaultPort = 3000;
const requestApiPattern = /\/api\//;

const apiOptions = {
  hostname: 'marius.click',
  protocol: 'https:',
  port: 443,
  path: '/contest2',
};
const devOptions = {
  hostname: 'localhost',
  protocol: 'http:',
  port: 3333,
  path: '',
};

function onRequest(clientReq, clientRes) {
  const defaults = {
    method: clientReq.method,
    headers: clientReq.headers,
  };

  let options, engine;
  if (requestApiPattern.test(clientReq.url)) {
    console.log('[API]: ', clientReq.url);
    options = {
      ...apiOptions,
      ...defaults,
    };
    // To get the right certificates altnames
    options.headers.host = apiOptions.hostname;

    engine = https;
  } else {
    console.log('[DEV]: ', clientReq.url);
    options = {
      ...devOptions,
      ...defaults,
    };
    engine = http;
  }

  options.path += clientReq.url;

  const proxy = engine.request(options, function (res) {
    clientRes.writeHead(res.statusCode, res.headers);
    res.pipe(clientRes, {
      end: true,
    });
  });

  clientReq.pipe(proxy, {
    end: true,
  });
}

console.log(`[START]: proxy server listening on localhost:${defaultPort}`);
console.log(`[START]: on behalf [API] ${apiOptions.protocol}//${apiOptions.hostname}:${apiOptions.port}${apiOptions.path}`);
console.log(`[START]: and [DEV]  ${devOptions.protocol}//${devOptions.hostname}:${devOptions.port}${devOptions.path}`);
http.createServer(onRequest).listen(defaultPort);
