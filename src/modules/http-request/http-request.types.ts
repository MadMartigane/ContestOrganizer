import type {
  HttpRequestResponseTypes,
  ReferrerPolicyType,
} from "./http-request.constants";

export type ReferrerPolicyTypeUnion = `${ReferrerPolicyType}`;

export interface NewScriptElementOptions {
  defer?: boolean;
  referrerpolicy?: ReferrerPolicyTypeUnion;
  src?: string;
  type?: string;
}

export interface HttpRequestResponseTypesContants {
  RESPONSE_TYPES: typeof HttpRequestResponseTypes;
}

export interface HttpHeader {
  name: string;
  value: string;
}

export type HTTP_REQUEST_TYPE = "GET" | "POST";
