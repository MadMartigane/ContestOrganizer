import console from 'console';
import http from 'node:http';
import https from 'node:https';
import httpProxy from 'http-proxy';

const DEFAULT_PROXY_PORT = 3000;
const DEFAULT_PROXY_HOST = 'localhost';
const DEFAULT_DEV_PORT = 3333;
const DEFAULT_DEV_HOST = 'localhost';
const REQUEST_API_PATTERN = /\/api\//;

const API_OPTIONS = {
 hostname: 'marius.click',
 protocol: 'https:',
  port: 443,
  path: '/contest2',
};

function requestListener(clientReq, clientRes, stencilProxy) {
  if (!REQUEST_API_PATTERN.test(clientReq.url)) {
    console.log('[DEV]: ', clientReq.url);
    stencilProxy.web(clientReq, clientRes);
    return;
  }

  const options = {
    ...API_OPTIONS,
    method: clientReq.method,
    headers: {
      ...clientReq.headers,
      // To get the right certificates altnames
      host: API_OPTIONS.hostname,
    },
  };

  options.path += clientReq.url;

  const proxy = https.request(options, function (res) {
   clientRes.writeHead(res.statusCode, res.headers);
   res.pipe(clientRes, {
      end: true,
    });
  });

  clientReq.pipe(proxy, {
    end: true,
  });
}

function getDevProxy(host, port) {
  return new httpProxy.createProxyServer({
    target: {
      host,
      port,
    },
  });
}

function launchServer(proxyHost = DEFAULT_DEV_HOST, proxyPort = DEFAULT_PROXY_PORT, devHost = DEFAULT_DEV_HOST, devPort = DEFAULT_DEV_PORT) {
  /*
   * Listen to the `upgrade` event and proxy the
   * WebSocket requests as well.
   */
  const devProxy = getDevProxy(devHost, devPort);
  const server = http.createServer((req, res) => requestListener(req, res, devProxy));
  server.on('upgrade', function (req, socket, head) {
    devProxy.ws(req, socket, head);
  });

  server.listen(proxyPort, proxyHost, () => {
    console.log(` 🌎 [START]: proxy server listening on ${proxyHost}:${proxyPort}`);
    console.log(` 🌎 [START]: on behalf [API] ${API_OPTIONS.protocol}//${API_OPTIONS.hostname}:${API_OPTIONS.port}${API_OPTIONS.path}`);
    console.log(` 🌎 [START]: and       [DEV] http://${proxyHost}:${proxyPort}`);
  });
}

async function main(proxyHost, proxyPort, defaultDevHost, defaultDevPort) {
  console.warn('=========== ContestOrganizer API & Stencil proxy =====================');
  console.warn('======================================================================');
  console.warn(' ');
  console.warn(' ');

  const args = process.argv.slice(2);
  let devPort;
  if (args.length > 0) {
    const argDevPort = args.at(0);
    const checkPort = parseInt(argDevPort, 10);
    if (isNaN(checkPort)) {
      console.warn('⚠️  The first argument must be the port number.');
      process.exit(1);
    }

    devPort = checkPort;
  } else {
    devPort = defaultDevPort;
  }
  const devHost = defaultDevHost;

  launchServer(proxyHost, proxyPort, devHost, devPort);
}

main(DEFAULT_PROXY_HOST, DEFAULT_PROXY_PORT, DEFAULT_DEV_HOST, DEFAULT_DEV_PORT);

