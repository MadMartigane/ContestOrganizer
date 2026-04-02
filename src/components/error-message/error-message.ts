import { BaseElement } from "@core/base-element.js";

/**
 * ErrorMessage - A vanilla web component that displays an error message with optional home button.
 * Replaces the Stencil error-message component.
 * @element error-message
 */
export class ErrorMessage extends BaseElement {
  /** @inheritdoc */
  static get observedAttributes(): string[] {
    return ["message", "go-home-button"];
  }

  /** Internal message property */
  private _message = "";

  /** Internal goHomeButton property with default value */
  private _goHomeButton = true;

  /**
   * Gets the current error message.
   * @returns The error message string
   */
  get message(): string {
    return this._message;
  }

  /**
   * Sets the error message.
   * @param value - The error message to display
   */
  set message(value: string) {
    this.setAttribute("message", value);
  }

  /**
   * Gets whether the home button is displayed.
   * @returns True if home button should be shown, false otherwise
   */
  get goHomeButton(): boolean {
    return this._goHomeButton;
  }

  /**
   * Sets whether to show the home button.
   * @param value - Boolean indicating whether to show the home button
   */
  set goHomeButton(value: boolean) {
    this.setAttribute("go-home-button", String(value));
  }

  /**
   * Parses a boolean attribute value.
   * @param value - The attribute value (string or null)
   * @param defaultValue - Default value if attribute is not set
   * @returns Parsed boolean value
   */
  private _parseBoolean(value: string | null, defaultValue: boolean): boolean {
    if (value === null) {
      return defaultValue;
    }
    return value !== "false";
  }

  /** @inheritdoc */
  protected _setupProperties(): void {
    this._message = this.getAttribute("message") ?? "";
    this._goHomeButton = this._parseBoolean(
      this.getAttribute("go-home-button"),
      true
    );
  }

  /** @inheritdoc */
  protected _onAttributeChange(name: string, value: string | null): void {
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

  /** @inheritdoc */
  protected _render(): void {
    const homeButtonHtml = this._goHomeButton
      ? `<div class="grid-300">
          <wa-button href="#/home" size="large" variant="brand">
            <wa-icon name="house" slot="start"></wa-icon>
            <span>Retour à l'accueil</span>
          </wa-button>
        </div>`
      : "";

    this.innerHTML = `<wa-callout class="my-8" open variant="danger">
      <wa-icon class="text-5xl" name="triangle-exclamation" slot="start"></wa-icon>
      <h1 class="text-danger">Erreur</h1>
      <strong class="container">${this._message}</strong>
    </wa-callout>
    ${homeButtonHtml}`;
  }
}

// Register the custom element
customElements.define("error-message", ErrorMessage);
