import { HttpRequestResponseTypes } from "./http-request.constants";
export class HttpRequest {
  CONSTANTS;
  constructor() {
    this.CONSTANTS = {
      RESPONSE_TYPES: HttpRequestResponseTypes,
    };
  }
  xmlHttpOnError(req, reject, error, promise) {
    const errorMessage = `[HttpRequest][${req.status} ${req.statusText}]: ${error}`;
    reject(new Error(errorMessage));
    return promise;
  }
  getFullUrl(url) {
    if (!url.startsWith("/")) {
      return url;
    }
    const fullUrl =
      `${window.location.origin}${window.location.pathname}${url}`.replace(
        `/${url}`,
        url
      );
    return fullUrl;
  }
  request(url, data, responseType, headers, type = "GET") {
    const fullUrl = this.getFullUrl(url);
    const promise = new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();
      req.open(type, fullUrl);
      req.responseType = responseType;
      req.onerror = () =>
        this.xmlHttpOnError(req, reject, "Request failed.", promise);
      req.onabort = () =>
        this.xmlHttpOnError(req, reject, "Request aborted.", promise);
      req.onload = () => {
        const response = req.response;
        const status = req.status;
        if (status >= 400) {
          this.xmlHttpOnError(
            req,
            reject,
            "Unable to load external data.",
            promise
          );
          return;
        }
        resolve(response);
      };
      if (headers) {
        for (const header of headers) {
          req.setRequestHeader(header.name, header.value);
        }
      }
      req.send(data);
    });
    return promise;
  }
  promise(thing, action) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (action === "reject") {
          reject(thing);
        } else {
          resolve(thing);
        }
      });
    });
  }
  load(url, responseType, headers) {
    return this.request(url, null, responseType, headers, "GET");
  }
  post(url, data, responseType, headers) {
    return this.request(url, data, responseType, headers, "POST");
  }
  resolve(thing) {
    return this.promise(thing, "resolve");
  }
  reject(thing) {
    return this.promise(thing, "reject");
  }
}
const httpRequest = new HttpRequest();
export default httpRequest;
