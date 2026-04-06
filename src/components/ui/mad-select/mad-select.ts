import { BaseElement } from "@core/base-element.js";
import { html, nothing } from "lit-html";
import { repeat } from "lit-html/directives/repeat.js";

/**
 * MadSelect - Custom select component with Shadow DOM and Form-Associated Custom Element (FACE) support
 * Projects options from light DOM <mad-option> children into shadow <select>
 * @element mad-select
 */
export class MadSelect extends BaseElement {
  /**
   * Enable Form-Associated Custom Element support
   */
  static formAssociated = true;

  /**
   * Attributes to observe for changes
   */
  static get observedAttributes(): string[] {
    return [
      "label",
      "placeholder",
      "size",
      "help-text",
      "value",
      "disabled",
      "name",
    ];
  }

  /**
   * ElementInternals for form integration
   */
  readonly #internals: ElementInternals;

  constructor() {
    super();

    // Attach ElementInternals for form integration
    this.#internals = this.attachInternals();

    // Set up slotchange listener for re-rendering when options change
    this._createRenderRoot().addEventListener("slotchange", () => {
      this._requestRender();
    });
  }

  /**
   * Get the current value of the select
   */
  get value(): string {
    const select = this._renderRoot.querySelector("select");
    return select?.value ?? "";
  }

  /**
   * Set the value of the select
   */
  set value(v: string) {
    const select = this._renderRoot.querySelector("select");
    if (select) {
      select.value = v;
    }
    this.#internals.setFormValue(v);
    this.setAttribute("value", v);
  }

  /**
   * Get the associated form element
   */
  get form(): HTMLFormElement | null {
    return this.#internals.form;
  }

  /**
   * Get the name attribute
   */
  get name(): string {
    return this.getAttribute("name") ?? "";
  }

  /**
   * Get the disabled state
   */
  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  /**
   * Set the disabled state
   */
  set disabled(v: boolean) {
    if (v) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }

  /**
   * Get validity state
   */
  get validity(): ValidityState {
    return this.#internals.validity;
  }

  /**
   * Get validation message
   */
  get validationMessage(): string {
    return this.#internals.validationMessage;
  }

  /**
   * Check if the element is a candidate for form validation
   */
  get willValidate(): boolean {
    return this.#internals.willValidate;
  }

  /**
   * Check validity and report it to the form
   */
  checkValidity(): boolean {
    return this.#internals.checkValidity();
  }

  /**
   * Report validity
   */
  reportValidity(): boolean {
    return this.#internals.reportValidity();
  }

  /**
   * Set custom validity message
   */
  setCustomValidity(message: string): void {
    this.#internals.setValidity({ customError: !!message }, message);
  }

  protected _setupProperties(): void {
    // Properties are handled via attributes
  }

  /**
   * Handle change event from the native select
   */
  #handleChange(): void {
    const select = this._renderRoot.querySelector("select");
    const selectedValue = select?.value ?? "";

    // Update form value
    this.#internals.setFormValue(selectedValue);

    // Emit custom change event
    this._emit("mad-change", { value: selectedValue });
  }

  protected _render(): void {
    const label = this.getAttribute("label") ?? "";
    const placeholder = this.getAttribute("placeholder") ?? "";
    const size = this.getAttribute("size") ?? "medium";
    const helpText = this.getAttribute("help-text") ?? "";
    const disabled = this.hasAttribute("disabled");
    const currentValue = this.getAttribute("value") ?? "";
    const options = Array.from(this.querySelectorAll("mad-option"));

    this._renderTemplate(html`
      <style>
        :host {
          display: block;
        }
        :host([hidden]) {
          display: none;
        }
        label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #404040;
          margin-bottom: 0.25rem;
        }
        @media (prefers-color-scheme: dark) {
          label {
            color: #d4d4d4;
          }
        }
        select {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #d4d4d4;
          background-color: #ffffff;
          color: #171717;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          line-height: 1.5;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        select:focus {
          outline: none;
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
        }
        select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        @media (prefers-color-scheme: dark) {
          select {
            border-color: #525252;
            background-color: #262626;
            color: #fafafa;
          }
        }
        .size-small {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }
        .size-medium {
          padding: 0.5rem 1rem;
          font-size: 1rem;
        }
        .size-large {
          padding: 0.75rem 1rem;
          font-size: 1.125rem;
        }
        .help-text {
          margin-top: 0.25rem;
          font-size: 0.875rem;
          color: #737373;
        }
        @media (prefers-color-scheme: dark) {
          .help-text {
            color: #a3a3a3;
          }
        }
      </style>
      <label part="label" style="display: ${label ? "block" : "none"}">${label}</label>
      <select
        part="select"
        class="size-${size}"
        ?disabled=${disabled}
        @change=${this.#handleChange}
      >
        ${
          placeholder && !currentValue
            ? html`<option value="" disabled selected>${placeholder}</option>`
            : nothing
        }
        ${repeat(
          options,
          (opt) => opt.getAttribute("value") ?? "",
          (opt) => html`
            <option
              value=${opt.getAttribute("value") ?? ""}
              ?selected=${opt.getAttribute("value") === currentValue}
            >${opt.textContent?.trim() ?? ""}</option>
          `
        )}
      </select>
      <p part="help-text" class="help-text" style="display: ${helpText ? "block" : "none"}">${helpText}</p>
    `);
  }

  protected _onAttributeChange(name: string, value: string | null): void {
    if (name === "value" && value !== null) {
      // Update form value when value attribute changes externally
      this.#internals.setFormValue(value);
    }
  }
}

customElements.define("mad-select", MadSelect);

/**
 * MadOption - Option element for use within MadSelect
 * Light DOM element that gets projected into the select
 * @element mad-option
 */
export class MadOption extends BaseElement {
  static get observedAttributes(): string[] {
    return ["value", "disabled"];
  }

  protected _setupProperties(): void {
    // No special properties needed
  }

  protected _render(): void {
    // Content is rendered by parent MadSelect
    // This element serves as a data holder for the select
  }
}

customElements.define("mad-option", MadOption);
