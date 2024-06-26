import { HTTP_REQUEST_TYPE, HttpHeader, HttpRequestResponseTypesContants } from './http-request.types';
import { HttpRequestResponseTypes } from './http-request.constants';

export class HttpRequest {
  public readonly CONSTANTS: HttpRequestResponseTypesContants;

  constructor() {
    this.CONSTANTS = {
      RESPONSE_TYPES: HttpRequestResponseTypes,
    };
  }

  private xmlHttpOnError(req: XMLHttpRequest, reject: Function, error: string, promise: Promise<unknown>): Promise<unknown> {
    const errorMessage = `[HttpRequest][${req.status} ${req.statusText}]: ${error}`;
    reject(new Error(errorMessage));
    return promise;
  }

  private getFullUrl(url: string) {
    if (!url.startsWith('/')) {
      return url;
    }

    const fullUrl = `${window.location.origin}${window.location.pathname}${url}`.replace(`/${url}`, url);
    return fullUrl;
  }

  private async request(
    url: string,
    data: XMLHttpRequestBodyInit | null,
    responseType: XMLHttpRequestResponseType = HttpRequestResponseTypes.JSON,
    headers?: Array<HttpHeader>,
    type: HTTP_REQUEST_TYPE = 'GET',
  ): Promise<unknown> {
    const fullUrl = this.getFullUrl(url);

    const promise = new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();
      req.open(type, fullUrl);
      req.responseType = responseType;

      req.onerror = () => this.xmlHttpOnError(req, reject, 'Request failed.', promise);
      req.onabort = () => this.xmlHttpOnError(req, reject, 'Request aborted.', promise);

      req.onload = () => {
        const response = req.response;
        const status = req.status;

        if (status >= 400) {
          this.xmlHttpOnError(req, reject, 'Unable to load external data.', promise);
          return;
        }

        resolve(response);
      };

      if (headers) {
        headers.forEach(header => req.setRequestHeader(header.name, header.value));
      }

      req.send(data);
    });

    return promise;
  }

  private async promise(thing: any, action: string) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (action === 'reject') {
          reject(thing);
        } else {
          resolve(thing);
        }
      });
    });
  }

  public load(url: string, responseType: XMLHttpRequestResponseType = HttpRequestResponseTypes.JSON, headers?: Array<HttpHeader>): Promise<unknown> {
    return this.request(url, null, responseType, headers, 'GET');
  }

  public post(url: string, data: XMLHttpRequestBodyInit, responseType: XMLHttpRequestResponseType = HttpRequestResponseTypes.JSON, headers?: Array<HttpHeader>): Promise<unknown> {
    return this.request(url, data, responseType, headers, 'POST');
  }

  public async resolve(thing: any) {
    return this.promise(thing, 'resolve');
  }

  public async reject(thing: any) {
    return this.promise(thing, 'reject');
  }
}

const httpRequest = new HttpRequest();
export default httpRequest;
