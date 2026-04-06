import { BaseElement } from "@core/base-element.js";
import { html, nothing } from "lit-html";
import errorMessageStyles from "./error-message.css?raw";
/**
 * ErrorMessage - A vanilla web component that displays an error message with optional home button.
 * Replaces the Stencil error-message component.
 * @element error-message
 */
export class ErrorMessage extends BaseElement {
  /** @inheritdoc */
  static get observedAttributes() {
    return ["message", "go-home-button"];
  }
  /** Internal message property */
  _message = "";
  /** Internal goHomeButton property with default value */
  _goHomeButton = true;
  /**
   * Gets the current error message.
   * @returns The error message string
   */
  get message() {
    return this._message;
  }
  /**
   * Sets the error message.
   * @param value - The error message to display
   */
  set message(value) {
    this.setAttribute("message", value);
  }
  /**
   * Gets whether the home button is displayed.
   * @returns True if home button should be shown, false otherwise
   */
  get goHomeButton() {
    return this._goHomeButton;
  }
  /**
   * Sets whether to show the home button.
   * @param value - Boolean indicating whether to show the home button
   */
  set goHomeButton(value) {
    this.setAttribute("go-home-button", String(value));
  }
  /**
   * Parses a boolean attribute value.
   * @param value - The attribute value (string or null)
   * @param defaultValue - Default value if attribute is not set
   * @returns Parsed boolean value
   */
  _parseBoolean(value, defaultValue) {
    if (value === null) {
      return defaultValue;
    }
    return value !== "false";
  }
  /** @inheritdoc */
  connectedCallback() {
    super.connectedCallback();
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(errorMessageStyles);
    this._injectStyles(sheet);
  }
  /** @inheritdoc */
  _setupProperties() {
    this._message = this.getAttribute("message") ?? "";
    this._goHomeButton = this._parseBoolean(
      this.getAttribute("go-home-button"),
      true
    );
  }
  /** @inheritdoc */
  _onAttributeChange(name, value) {
    switch (name) {
      case "message":
        this._message = value ?? "";
        break;
      case "go-home-button":
        this._goHomeButton = this._parseBoolean(value, true);
        break;
      default:
        // Unknown attribute - no action needed
        break;
    }
  }
  _getStyles() {
    return html`
      <style>
        :host { display: block; }
      </style>
    `;
  }
  _renderHomeButton() {
    return html`
      <div class="grid-300">
        <mad-button href="#/home" size="large" variant="brand">
          <mad-icon name="house" slot="start"></mad-icon>
          <span>Retour à l'accueil</span>
        </mad-button>
      </div>
    `;
  }
  _renderContent() {
    return html`
      ${this._getStyles()}
      <mad-callout class="my-8" open variant="danger" role="alert">
        <mad-icon class="text-5xl" name="triangle-exclamation" slot="start"></mad-icon>
        <h1 class="text-red-600">Erreur</h1>
        <strong class="container">${this._message}</strong>
      </mad-callout>
      ${this._goHomeButton ? this._renderHomeButton() : nothing}
    `;
  }
  /** @inheritdoc */
  _render() {
    this._renderTemplate(this._renderContent());
  }
}
// Register the custom element
customElements.define("error-message", ErrorMessage);
