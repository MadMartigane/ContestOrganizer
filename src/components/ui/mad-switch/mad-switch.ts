import { BaseElement } from "@core/base-element.js";

/**
 * Shared template for MadSwitch - cloned for each instance
 */
const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: inline-block;
      vertical-align: middle;
    }

    :host([disabled]) {
      pointer-events: none;
      opacity: 0.6;
    }

    :host([disabled]) .switch {
      cursor: not-allowed;
    }

    :host([disabled]) .thumb {
      cursor: not-allowed;
    }

    .switch {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      outline: none;
    }

    .switch.focus-visible {
      outline: 2px solid #f97316;
      outline-offset: 2px;
    }

    .track {
      position: relative;
      flex-shrink: 0;
      overflow: hidden;
      border-radius: 9999px;
      transition: background-color 200ms ease;
    }

    .track.off {
      background-color: #d1d5db;
    }

    .track.on {
      background-color: #f97316;
    }

    .track.disabled {
      background-color: #9ca3af;
    }

    .thumb {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      border-radius: 50%;
      background-color: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      transition: transform 200ms ease;
    }

    .thumb.off {
      transform: translateY(-50%) translateX(0);
    }

    .thumb.on {
      transform: translateY(-50%) translateX(100%);
    }

    /* Size: small */
    :host([size="small"]) .track {
      width: 36px;
      height: 18px;
    }

    :host([size="small"]) .thumb {
      width: 14px;
      height: 14px;
      left: 2px;
    }

    :host([size="small"]) .thumb.on {
      transform: translateY(-50%) translateX(calc(36px - 14px - 4px));
    }

    /* Size: medium */
    :host(:not([size])) .track,
    :host([size="medium"]) .track {
      width: 48px;
      height: 24px;
    }

    :host(:not([size])) .thumb,
    :host([size="medium"]) .thumb {
      width: 20px;
      height: 20px;
      left: 2px;
    }

    :host(:not([size])) .thumb.on,
    :host([size="medium"]) .thumb.on {
      transform: translateY(-50%) translateX(calc(48px - 20px - 4px));
    }

    /* Size: large */
    :host([size="large"]) .track {
      width: 60px;
      height: 30px;
    }

    :host([size="large"]) .thumb {
      width: 26px;
      height: 26px;
      left: 2px;
    }

    :host([size="large"]) .thumb.on {
      transform: translateY(-50%) translateX(calc(60px - 26px - 4px));
    }

    /* Hidden input for accessibility */
    .input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      pointer-events: none;
    }

    ::slotted(*) {
      cursor: pointer;
      user-select: none;
    }

    :host([disabled]) ::slotted(*) {
      cursor: not-allowed;
      pointer-events: none;
    }

    .help-text {
      margin: 4px 0 0 0;
      font-size: 0.75rem;
      color: #6b7280;
      display: none;
    }

    .help-text.visible {
      display: block;
    }
  </style>

  <div class="switch" role="switch" aria-checked="false" tabindex="0">
    <input type="checkbox" class="input" />
    <div class="track off">
      <div class="thumb off"></div>
    </div>
    <slot></slot>
  </div>
  <p class="help-text" part="help-text" aria-live="polite"></p>
`;

/**
 * MadSwitch - A toggle switch component with animation
 * @element mad-switch
 * @fires mad-change - Fired when the switch toggles, detail: {checked: boolean}
 */
export class MadSwitch extends BaseElement {
  private _switchElement: HTMLElement | null = null;
  private _inputElement: HTMLInputElement | null = null;
  private _trackElement: HTMLElement | null = null;
  private _thumbElement: HTMLElement | null = null;
  private _helpTextElement: HTMLElement | null = null;
  private readonly _internals: ElementInternals | null = null;

  static get observedAttributes(): string[] {
    return ["checked", "disabled", "size", "help-text"];
  }

  constructor() {
    super();
    // Set up ElementInternals for ARIA
    try {
      this._internals = this.attachInternals();
    } catch {
      // attachInternals not supported (e.g., in older browsers)
      this._internals = null;
    }
  }

  protected _setupProperties(): void {
    // Properties are handled via getters/setters
  }

  connectedCallback(): void {
    // Use BaseElement's render root (created in super.connectedCallback)
    super.connectedCallback();

    // Append template content to render root
    const root = this._renderRoot;
    if (root instanceof ShadowRoot) {
      root.appendChild(template.content.cloneNode(true));
    } else {
      // Fallback for light DOM
      this.appendChild(template.content.cloneNode(true));
    }

    this._cacheElements();
    this._setupEventListeners();
    this._updateVisualState();

    // Set ARIA role via ElementInternals
    if (this._internals) {
      this._internals.role = "switch";
    }
  }

  private _cacheElements(): void {
    const root = this._renderRoot;
    if (!root) {
      return;
    }

    if (root instanceof ShadowRoot) {
      this._switchElement = root.querySelector(".switch");
      this._inputElement = root.querySelector("input");
      this._trackElement = root.querySelector(".track");
      this._thumbElement = root.querySelector(".thumb");
      this._helpTextElement = root.querySelector(".help-text");
    } else {
      // Fallback for light DOM
      this._switchElement = this.querySelector(".switch");
      this._inputElement = this.querySelector("input");
      this._trackElement = this.querySelector(".track");
      this._thumbElement = this.querySelector(".thumb");
      this._helpTextElement = this.querySelector(".help-text");
    }
  }

  private _setupEventListeners(): void {
    // Click to toggle — listen on host to catch slotted content clicks
    this.addEventListener("click", this._handleClick);

    // Keyboard support — listen on host
    this.addEventListener("keydown", this._handleKeydown);

    // Input change event
    this._inputElement?.addEventListener("change", this._handleChange);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("click", this._handleClick);
    this.removeEventListener("keydown", this._handleKeydown);
  }

  private readonly _handleClick = (): void => {
    if (this.disabled) {
      return;
    }
    this._toggle();
  };

  private readonly _handleKeydown = (event: KeyboardEvent): void => {
    if (this.disabled) {
      return;
    }

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      this._toggle();
    }
  };

  private readonly _handleChange = (): void => {
    if (this._inputElement) {
      this._updateVisualState();
    }
  };

  private _toggle(): void {
    const newChecked = !this.checked;
    this.checked = newChecked;
    this._updateVisualState();
    this._emit("mad-change", { checked: newChecked });
  }

  private _updateVisualState(): void {
    const checked = this.checked;
    const disabled = this.disabled;

    // Update input
    if (this._inputElement) {
      this._inputElement.checked = checked;
    }

    // Update aria-checked on switch element
    if (this._switchElement) {
      this._switchElement.setAttribute("aria-checked", String(checked));
    }

    // Update track
    if (this._trackElement) {
      this._trackElement.classList.remove("off", "on", "disabled");
      if (disabled) {
        this._trackElement.classList.add("disabled");
      } else {
        this._trackElement.classList.add(checked ? "on" : "off");
      }
    }

    // Update thumb
    if (this._thumbElement) {
      this._thumbElement.classList.remove("off", "on");
      this._thumbElement.classList.add(checked ? "on" : "off");
    }

    // Update help text
    if (this._helpTextElement) {
      const helpText = this.getAttribute("help-text") ?? "";
      this._helpTextElement.textContent = helpText;
      this._helpTextElement.classList.toggle("visible", helpText.length > 0);
    }
  }

  /**
   * Checked state of the switch
   */
  get checked(): boolean {
    return this.hasAttribute("checked");
  }

  set checked(value: boolean) {
    if (value) {
      this.setAttribute("checked", "");
    } else {
      this.removeAttribute("checked");
    }
  }

  /**
   * Disabled state of the switch
   */
  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean) {
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }

  /**
   * Size of the switch: 'small' | 'medium' | 'large'
   */
  get size(): "small" | "medium" | "large" {
    const s = this.getAttribute("size");
    if (s === "small" || s === "large") {
      return s;
    }
    return "medium";
  }

  set size(value: "small" | "medium" | "large") {
    this.setAttribute("size", value);
  }

  protected _render(): void {
    // Render is handled in connectedCallback via shadow DOM
    // Just update visual state when called
    this._updateVisualState();
  }

  protected _onAttributeChange(name: string, _value: string | null): void {
    if (
      name === "checked" ||
      name === "disabled" ||
      name === "size" ||
      name === "help-text"
    ) {
      this._updateVisualState();
    }
  }
}

customElements.define("mad-switch", MadSwitch);
