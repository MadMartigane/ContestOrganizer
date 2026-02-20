/* See
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script */
export enum ReferrerPolicyType {
  noReferer = "no-referrer",
  noRefererWhenDowngrade = "no-referrer-when-downgrade",
  origin = "origin",
  originWhenCrosOrigin = "origin-when-cross-origin",
  sameOrigin = "same-origin",
  strictOrigin = "strict-origin",
  strictOriginWhenCrossOrigin = "strict-origin-when-cross-origin",
  unsafeUrl = "unsafe-url",
}

export enum HttpRequestResponseTypes {
  ARRAY_BUFFER = "arraybuffer",
  BLOB = "blob",
  DOCUMENT = "document",
  JSON = "json",
  TEXT = "text",
}
