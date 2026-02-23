import { HttpRequestResponseTypes } from "./http-request.constants";
import type {
  HTTP_REQUEST_TYPE,
  HttpHeader,
  HttpRequestResponseTypesContants,
} from "./http-request.types";

export class HttpRequest {
  readonly CONSTANTS: HttpRequestResponseTypesContants;

  constructor() {
    this.CONSTANTS = {
      RESPONSE_TYPES: HttpRequestResponseTypes,
    };
  }

  private xmlHttpOnError(
    req: XMLHttpRequest,
    reject: (reason?: unknown) => void,
    error: string,
    promise: Promise<unknown>
  ): Promise<unknown> {
    const errorMessage = `[HttpRequest][${req.status} ${req.statusText}]: ${error}`;
    reject(new Error(errorMessage));
    return promise;
  }

  private getFullUrl(url: string) {
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

  private request(
    url: string,
    data: XMLHttpRequestBodyInit | null,
    responseType: XMLHttpRequestResponseType = HttpRequestResponseTypes.JSON,
    headers?: HttpHeader[],
    type: HTTP_REQUEST_TYPE = "GET"
  ): Promise<unknown> {
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

  private promise(thing: unknown, action: string) {
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

  load(
    url: string,
    responseType: XMLHttpRequestResponseType = HttpRequestResponseTypes.JSON,
    headers?: HttpHeader[]
  ): Promise<unknown> {
    return this.request(url, null, responseType, headers, "GET");
  }

  post(
    url: string,
    data: XMLHttpRequestBodyInit,
    responseType: XMLHttpRequestResponseType = HttpRequestResponseTypes.JSON,
    headers?: HttpHeader[]
  ): Promise<unknown> {
    return this.request(url, data, responseType, headers, "POST");
  }

  resolve(thing: unknown) {
    return this.promise(thing, "resolve");
  }

  reject(thing: unknown) {
    return this.promise(thing, "reject");
  }
}

const httpRequest = new HttpRequest();
export default httpRequest;
