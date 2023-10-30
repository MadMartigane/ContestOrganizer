import { ReferrerPolicyType, HttpRequestResponseTypes } from "./http-request.constants";

export type ReferrerPolicyTypeUnion = `${ReferrerPolicyType}`;

export interface NewScriptElementOptions {
    src?: string,
    type?: string,
    defer?: boolean,
    referrerpolicy?: ReferrerPolicyTypeUnion
}

export interface HttpRequestResponseTypesContants {
    RESPONSE_TYPES: typeof HttpRequestResponseTypes
}

export interface HttpHeader {
  name: string,
  value: string
}

export type HTTP_REQUEST_TYPE = "GET" | "POST";
