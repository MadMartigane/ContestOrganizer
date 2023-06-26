import { HttpHeader, HttpRequestResponseTypesContants } from "./http-request.d";
import { HttpRequestResponseTypes } from "./http-request.constants";

export class HttpRequest {

  public readonly CONSTANTS: HttpRequestResponseTypesContants;

  constructor(
  ) {
    this.CONSTANTS = {
      RESPONSE_TYPES: HttpRequestResponseTypes
    };
  }

  private xmlHttpOnError (
    req: XMLHttpRequest,
    reject: Function,
    error: string,
    promise: Promise<unknown>
  ): Promise<unknown> {
    const errorMessage = `[HttpRequest][${req.status} ${req.statusText}]: ${error}`;
    reject(new Error(errorMessage));
    return promise;
  }

  public load(
    url: string,
    responseType: XMLHttpRequestResponseType = HttpRequestResponseTypes.JSON,
    headers?: Array<HttpHeader>
  ): Promise<unknown> {

    const promise = new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();
      req.open("GET", url);
      req.responseType = responseType;

      req.onerror = () => this.xmlHttpOnError(req, reject, "Request failed.", promise);
      req.onabort = () => this.xmlHttpOnError(req, reject, "Request aborted.", promise);

      req.onload = () => {
        const response = req.response;
        const status = req.status;

        if (status >= 400) {
          this.xmlHttpOnError(req, reject, "Unable to load external data.", promise);
          return;
        }

        resolve(response);
      };

      if (headers) {
        headers.forEach((header) => req.setRequestHeader(header.name, header.value));
      }

      req.send(null);
    });

    return promise;
  }

  private async promise(thing: any, action: string) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (action === "reject") {
          reject(thing);
        } else {
          resolve(thing);
        }
      });
    })
  }


  public async resolve(thing: any) {
    return this.promise(thing, "resolve");
  }

  public async reject(thing: any) {
    return this.promise(thing, "reject");
  }

}

const httpRequest = new HttpRequest();
export default httpRequest;

