// /src/components/scorer-common/scorer-common.ts
import { BaseElement } from "../../core/base-element.js";
import { Signal } from "../../core/signal.js";

// Design token imports (inline for self-containment)
const styles = `/* ========================================
   1. DESIGN TOKENS
   ======================================== */
.scorer-wrapper {
  display: block;
  width: 100%;
}

.scorer-container {
  /* Glassmorphism Base */
  --scorer-glass-bg: rgba(255, 255, 255, 0.85);
  --scorer-glass-border: rgba(255, 255, 255, 0.5);
  --scorer-glass-shadow:
    0 8px 32px rgba(31, 38, 135, 0.2),
    0 2px 8px rgba(31, 38, 135, 0.15);
  --scorer-glass-shadow-hover:
    0 16px 48px rgba(31, 38, 135, 0.25),
    0 4px 16px rgba(31, 38, 135, 0.2);
  --scorer-glass-blur: 16px;

  /* Accent Colors */
  --scorer-accent-warning: var(--sl-color-warning-500, #e8a61d);
  --scorer-accent-primary: var(--sl-color-primary-500, #4263eb);
  
  /* Text */
  --scorer-text-primary: var(--sl-color-neutral-900);
  --scorer-text-secondary: var(--sl-color-neutral-600);

  /* Animation */
  --scorer-transition-fast: 150ms ease;
  --scorer-transition-normal: 250ms ease;

  /* Focus Ring */
  --scorer-focus-ring: 0 0 0 2px var(--sl-color-primary-200);

  /* Spacing */
  --scorer-space-xs: 0.25rem;
  --scorer-space-sm: 0.5rem;
  --scorer-space-md: 0.75rem;
  --scorer-space-lg: 1rem;
}

/* ========================================
   2. DARK MODE
   ======================================== */
.scorer-container {
  --scorer-glass-bg: rgba(35, 35, 45, 0.9);
  --scorer-glass-border: rgba(255, 255, 255, 0.15);
  --scorer-glass-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.3);
  --scorer-glass-shadow-hover:
    0 16px 48px rgba(0, 0, 0, 0.5),
    0 4px 16px rgba(0, 0, 0, 0.4);
  --scorer-text-primary: #ffffff;
  --scorer-text-secondary: #e0e0e0;
  --scorer-focus-ring: 0 0 0 2px var(--sl-color-primary-400);
}

/* ========================================
   3. COMPONENT STYLES
   ======================================== */
.scorer-container {
  display: flex;
  justify-content: center;
  gap: var(--scorer-space-md);
  padding: var(--scorer-space-lg) 0;
}

.scorer-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  padding: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--scorer-text-primary);
  cursor: pointer;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.7) 100%
  );
  border: 1px solid var(--scorer-glass-border);
  border-radius: 9999px;
  box-shadow: var(--scorer-glass-shadow);
  backdrop-filter: blur(var(--scorer-glass-blur));
  -webkit-backdrop-filter: blur(var(--scorer-glass-blur));
  transition:
    transform var(--scorer-transition-normal),
    box-shadow var(--scorer-transition-normal),
    background var(--scorer-transition-fast);
  user-select: none;
}

.scorer-button::before {
  position: absolute;
  inset: 0;
  padding: 1px;
  pointer-events: none;
  content: "";
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.8),
    rgba(255, 255, 255, 0.1)
  );
  border-radius: inherit;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.scorer-button:hover:not(:disabled) {
  box-shadow: var(--scorer-glass-shadow-hover);
  transform: scale(1.05);
}

.scorer-button:active:not(:disabled) {
  transform: scale(0.95);
}

.scorer-button:focus-visible {
  outline: none;
  box-shadow: var(--scorer-focus-ring);
}

.scorer-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Decrement button - warning accent */
.scorer-button.decrement {
  color: var(--scorer-accent-warning);
}

/* Increment button - primary accent */
.scorer-button.increment {
  color: var(--scorer-accent-primary);
}

/* Icon in button */
.scorer-icon {
  display: inline-block;
  width: 1.25em;
  height: 1.25em;
  line-height: 1;
}

/* SVG icon fallback for environments without Shoelace icons */
.scorer-icon svg {
  display: block;
  width: 100%;
  height: 100%;
  fill: currentColor;
}

/* ========================================
   4. ACCESSIBILITY & REDUCED MOTION
   ======================================== */
@media (prefers-reduced-motion: reduce) {
  .scorer-button {
    transition: none;
  }
  .scorer-button:hover:not(:disabled) {
    transform: none;
  }
}
`;

export class MadScorerCommon extends BaseElement {
  // Signal for reactive state
  private declare _number: Signal<number>;

  // Property backing fields
  private _min = 0;
  private _max?: number;
  private _step = 1;
  private _value?: number;
  private _readonly = false;
  private _hidden = false;

  // Event emitter
  private readonly _emitChange: (value: string) => void;

  static get observedAttributes(): string[] {
    return ["min", "max", "step", "value", "readonly", "hidden"];
  }

  constructor() {
    super();
    this._emitChange = (value: string) => {
      this._emit("madNumberChange", { value });
    };
  }

  protected _setupProperties(): void {
    // 1. Initialize all signals first
    this._number = new Signal<number>(0);

    // 2. Track all signals
    this._trackSignal(this._number);

    // 3. Mark initialization as complete (REQUIRED)
    this._initialized = true;
  }

  protected _createRenderRoot(): Element {
    return this; // Light DOM - no shadow root
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
    if (oldValue === newValue) {
      return;
    }

    switch (name) {
      case "min":
        this._min = newValue === null ? 0 : Number(newValue);
        break;
      case "max":
        this._max = newValue === null ? undefined : Number(newValue);
        break;
      case "step":
        this._step = newValue === null ? 1 : Number(newValue);
        break;
      case "value":
        this._value = newValue === null ? undefined : Number(newValue);
        // Initialize number from value attribute
        if (this._value !== undefined) {
          this._number.value = this._value;
        }
        break;
      case "readonly":
        this._readonly = newValue !== null;
        break;
      case "hidden":
        this._hidden = newValue !== null;
        break;
      default:
        // Unknown attribute - ignore
        break;
    }

    this._requestRender();
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Initialize number from value or min
    const initialValue = this._value ?? this._min ?? 0;
    this._number.value = initialValue;
  }

  // Public getter for current value (useful for testing/debugging)
  get value(): number {
    return this._number.value;
  }

  // Hidden property
  get hidden(): boolean {
    return this._hidden;
  }

  set hidden(value: boolean) {
    this._hidden = value;
    this._requestRender();
  }

  // Internal methods
  private _increment(): void {
    if (this._readonly) {
      return;
    }

    let newValue = this._number.value + this._step;
    if (this._max !== undefined && newValue > this._max) {
      newValue = this._max;
    }
    this._number.value = newValue;
    this._emitChange(String(newValue));
  }

  private _decrement(): void {
    if (this._readonly) {
      return;
    }

    let newValue = this._number.value - this._step;
    if (this._min !== undefined && newValue < this._min) {
      newValue = this._min;
    }
    this._number.value = newValue;
    this._emitChange(String(newValue));
  }

  protected _render(): void {
    const isReadonly = this._readonly;

    this.innerHTML = `
      <style>${styles}
.scorer-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.scorer-wrapper.hidden {
  display: none !important;
}

/* Enhanced button glassmorphism */
.scorer-button {
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.6) 40%,
    rgba(240, 248, 255, 0.4) 100%
  );
  box-shadow: 
    0 8px 32px rgba(31, 38, 135, 0.15),
    0 2px 8px rgba(31, 38, 135, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.8),
    inset 0 -1px 1px rgba(0, 0, 0, 0.05);
}

.scorer-button::before {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0.1) 100%
  );
}

.scorer-button:hover:not(:disabled) {
  box-shadow: 
    0 16px 48px rgba(31, 38, 135, 0.2),
    0 4px 16px rgba(31, 38, 135, 0.15),
    inset 0 1px 2px rgba(255, 255, 255, 0.9),
    inset 0 -1px 2px rgba(0, 0, 0, 0.08);
  transform: scale(1.08);
}
</style>
      <div class="scorer-wrapper${this._hidden ? " hidden" : ""}">
        <div class="scorer-container">
        <button
          type="button"
          class="scorer-button decrement"
          ${isReadonly ? "disabled" : ""}
          aria-label="Decrement score"
          title="Decrease score"
        >
          <span class="scorer-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.5 8a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1-.5-.5z"/>
            </svg>
          </span>
        </button>
        
        <button
          type="button"
          class="scorer-button increment"
          ${isReadonly ? "disabled" : ""}
          aria-label="Increment score"
          title="Increase score"
        >
          <span class="scorer-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3.5a.5.5 0 0 1 .5.5v4h4a.5.5 0 0 1 0 1h-4v4a.5.5 0 0 1-1 0v-4h-4a.5.5 0 0 1 0-1h4v-4A.5.5 0 0 1 8 3.5z"/>
            </svg>
          </span>
        </button>
        </div>
      </div>
    `;

    // Attach event listeners AFTER rendering
    const decrementBtn = this.querySelector(".scorer-button.decrement");
    const incrementBtn = this.querySelector(".scorer-button.increment");

    decrementBtn?.addEventListener("click", () => this._decrement());
    incrementBtn?.addEventListener("click", () => this._increment());
  }
}

// Register the custom element
customElements.define("mad-scorer-common", MadScorerCommon);
