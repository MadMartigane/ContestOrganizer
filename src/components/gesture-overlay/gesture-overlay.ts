import { BaseElement } from "@core/base-element.js";
import { Signal } from "@core/signal.js";

interface TutorialStep {
  description: string;
  desktopHint?: string;
  gesture: string;
  icon: string;
  isPractice?: boolean;
  practiceGesture?: string;
  title: string;
}

const TUTORIAL_SECTIONS = {
  GESTURES: "gestures",
  DESKTOP: "desktop",
  PRACTICE: "practice",
} as const;

/**
 * GestureOverlay - Interactive tutorial overlay for first-time users.
 * @element gesture-overlay
 */
export class GestureOverlay extends BaseElement {
  private declare _isVisible: Signal<boolean>;
  private declare _currentStep: Signal<number>;
  private declare _section: Signal<
    (typeof TUTORIAL_SECTIONS)[keyof typeof TUTORIAL_SECTIONS]
  >;
  private declare _isPracticing: Signal<boolean>;
  private declare _practiceCompleted: Signal<boolean>;

  // Bound handlers for cleanup
  private _boundGestureHandler: ((_event: Event) => void) | null = null;
  private _boundKeyboardHandler: ((_event: KeyboardEvent) => void) | null =
    null;
  private _boundClickHandlers: Array<() => void> = [];

  private readonly _gestureSteps: TutorialStep[] = [
    {
      title: "Swipe Left / Right",
      description: "Navigate between tournaments",
      gesture: "swipe",
      icon: "arrows-left-right",
    },
    {
      title: "Swipe Up",
      description: "Open planning zone",
      gesture: "swipe-up",
      icon: "arrow-up",
    },
    {
      title: "Swipe Down",
      description: "Open archive zone",
      gesture: "swipe-down",
      icon: "arrow-down",
    },
    {
      title: "Long Press",
      description: "Open context menu",
      gesture: "long-press",
      icon: "hand-pointer",
    },
    {
      title: "Double Tap",
      description: "Quick action (+3 points)",
      gesture: "double-tap",
      icon: "computer-mouse",
    },
    {
      title: "Shake",
      description: "Undo last action",
      gesture: "shake",
      icon: "rotate-left",
    },
  ];

  private readonly _desktopSteps: TutorialStep[] = [
    {
      title: "Arrow Keys",
      description: "Navigate instead of swiping",
      gesture: "arrow-keys",
      icon: "keyboard",
      desktopHint: "Use arrow keys to navigate",
    },
    {
      title: "Right-Click",
      description: "Open context menu",
      gesture: "right-click",
      icon: "hand-pointer",
      desktopHint: "Right-click for context menu",
    },
    {
      title: "Command Palette",
      description: "Quick access to all actions",
      gesture: "shortcut",
      icon: "command",
      desktopHint: "Press ⌘K to open command palette",
    },
  ];

  private readonly _practiceStep: TutorialStep = {
    title: "Try it!",
    description: "Perform any gesture to continue",
    gesture: "any",
    icon: "sparkle",
    isPractice: true,
  };

  /** @inheritdoc */
  protected _setupProperties(): void {
    this._isVisible = new Signal<boolean>(false);
    this._currentStep = new Signal<number>(0);
    this._section = new Signal<
      (typeof TUTORIAL_SECTIONS)[keyof typeof TUTORIAL_SECTIONS]
    >(TUTORIAL_SECTIONS.GESTURES);
    this._isPracticing = new Signal<boolean>(false);
    this._practiceCompleted = new Signal<boolean>(false);

    this._trackSignal(this._isVisible);
    this._trackSignal(this._currentStep);
    this._trackSignal(this._section);
    this._trackSignal(this._isPracticing);
    this._trackSignal(this._practiceCompleted);
    this._initialized = true;
  }

  protected _createRenderRoot(): Element {
    return this;
  }

  /** @inheritdoc */
  connectedCallback(): void {
    super.connectedCallback();
    this._setupGestureListeners();
    this._checkFirstVisit();
  }

  /** @inheritdoc */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._removeGestureListeners();
    if (this._boundKeyboardHandler) {
      document.removeEventListener("keydown", this._boundKeyboardHandler);
      this._boundKeyboardHandler = null;
    }
    this._cleanupClickHandlers();
  }

  private _setupGestureListeners(): void {
    this._boundGestureHandler = this._handleGesture.bind(this);
    document.addEventListener("gesture-detected", this._boundGestureHandler);
    document.addEventListener("gesture-triggered", this._boundGestureHandler);
  }

  private _removeGestureListeners(): void {
    if (this._boundGestureHandler) {
      document.removeEventListener(
        "gesture-detected",
        this._boundGestureHandler
      );
      document.removeEventListener(
        "gesture-triggered",
        this._boundGestureHandler
      );
      this._boundGestureHandler = null;
    }
  }

  private _handleGesture(_event: Event): void {
    if (!(this._isVisible.value && this._isPracticing.value)) {
      return;
    }
    this._practiceCompleted.value = true;
    setTimeout(() => this._completePractice(), 500);
  }

  private _handleKeyboard(_event: KeyboardEvent): void {
    if (_event.key === "Enter" || _event.key === " ") {
      const nextBtn = this._renderRoot.querySelector(
        "#next-btn"
      ) as HTMLButtonElement | null;
      if (nextBtn && !nextBtn.hasAttribute("disabled")) {
        nextBtn.click();
      }
    }
    if (_event.key === "Escape") {
      this._skipTutorial();
    }
  }

  private _checkFirstVisit(): void {
    const hasSeenTutorial = localStorage.getItem("gesture-tutorial-seen");
    if (!hasSeenTutorial) {
      this.show();
    }
  }

  show(): void {
    this._isVisible.value = true;
    this._currentStep.value = 0;
    this._section.value = TUTORIAL_SECTIONS.GESTURES;
    this._isPracticing.value = false;
    this._practiceCompleted.value = false;
  }

  hide(): void {
    this._isVisible.value = false;
    localStorage.setItem("gesture-tutorial-seen", "true");
  }

  replay(): void {
    localStorage.removeItem("gesture-tutorial-seen");
    this.show();
  }

  private _getCurrentSteps(): TutorialStep[] {
    const section = this._section.value;
    if (section === TUTORIAL_SECTIONS.GESTURES) {
      return this._gestureSteps;
    }
    if (section === TUTORIAL_SECTIONS.DESKTOP) {
      return this._desktopSteps;
    }
    if (section === TUTORIAL_SECTIONS.PRACTICE) {
      return [this._practiceStep];
    }
    return this._gestureSteps;
  }

  private _getTotalSteps(): number {
    return this._gestureSteps.length + this._desktopSteps.length + 1;
  }

  private _getGlobalStepIndex(): number {
    const gestureSteps = this._currentStep.value;
    if (this._section.value === TUTORIAL_SECTIONS.GESTURES) {
      return gestureSteps;
    }
    if (this._section.value === TUTORIAL_SECTIONS.DESKTOP) {
      return this._gestureSteps.length + gestureSteps;
    }
    return this._gestureSteps.length + this._desktopSteps.length;
  }

  private _nextStep(): void {
    const steps = this._getCurrentSteps();

    if (this._currentStep.value < steps.length - 1) {
      this._currentStep.value++;
    } else {
      this._advanceSection();
    }
  }

  private _advanceSection(): void {
    const section = this._section.value;
    if (section === TUTORIAL_SECTIONS.GESTURES) {
      this._section.value = TUTORIAL_SECTIONS.DESKTOP;
      this._currentStep.value = 0;
    } else if (section === TUTORIAL_SECTIONS.DESKTOP) {
      this._startPractice();
    } else {
      this.hide();
    }
  }

  private _startPractice(): void {
    this._section.value = TUTORIAL_SECTIONS.PRACTICE;
    this._currentStep.value = 0;
    this._isPracticing.value = true;
    this._practiceCompleted.value = false;
  }

  private _completePractice(): void {
    this._isPracticing.value = false;
    this._advanceSection();
  }

  private _skipTutorial(): void {
    this.hide();
  }

  private _renderStepIndicators(): string {
    const totalSteps = this._getTotalSteps();
    const currentGlobal = this._getGlobalStepIndex();
    const indicators: string[] = [];

    for (let i = 0; i < totalSteps; i++) {
      const isActive = i === currentGlobal;
      const isCompleted = i < currentGlobal;
      let sectionClass = "";
      if (isCompleted) {
        sectionClass = "completed";
      } else if (isActive) {
        sectionClass = "active";
      }
      indicators.push(`<span class="${sectionClass}"></span>`);
    }

    return indicators.join("");
  }

  private _renderSectionLabel(): string {
    const section = this._section.value;
    if (section === TUTORIAL_SECTIONS.GESTURES) {
      return "Touch Gestures";
    }
    if (section === TUTORIAL_SECTIONS.DESKTOP) {
      return "Desktop Shortcuts";
    }
    if (section === TUTORIAL_SECTIONS.PRACTICE) {
      return "Practice Mode";
    }
    return "";
  }

  private _renderPracticeArea(completed: boolean): string {
    const iconName = completed ? "check-circle" : "hand";
    const message = completed ? "Great job!" : "Perform any gesture here";
    return `
      <div class="practice-area ${completed ? "completed" : ""}">
        <div class="practice-zone">
          <mad-icon name="${iconName}" size="large"></mad-icon>
          <p>${message}</p>
        </div>
      </div>
    `;
  }

  private _renderGesturePrompt(): string {
    return `
      <div class="gesture-prompt">
        <span class="prompt-text">Swipe, tap, or shake!</span>
      </div>
    `;
  }

  private _cleanupClickHandlers(): void {
    for (const cleanup of this._boundClickHandlers) {
      cleanup();
    }
    this._boundClickHandlers = [];
  }

  /** @inheritdoc */
  protected _render(): void {
    this._cleanupClickHandlers();

    const isVisible = this._isVisible.value;

    if (!isVisible) {
      this.innerHTML = "";
      return;
    }

    const steps = this._getCurrentSteps();
    const currentStep = this._currentStep.value;
    const step = steps[currentStep];
    const isPractice = this._isPracticing.value;
    const practiceCompleted = this._practiceCompleted.value;
    const globalStepIndex = this._getGlobalStepIndex();
    const totalSteps = this._getTotalSteps();
    const isLastStep =
      this._section.value === TUTORIAL_SECTIONS.PRACTICE &&
      currentStep === steps.length - 1;

    let buttonVariant: string;
    let buttonText: string;
    if (isLastStep) {
      buttonText = "Finish!";
      buttonVariant = "success";
    } else {
      buttonText = "Next";
      buttonVariant = "brand";
    }

    const nextButtonDisabled =
      isPractice && !practiceCompleted ? "disabled" : "";

    this.innerHTML = `
      <div class="gesture-overlay" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
        <div class="gesture-card ${isPractice ? "practice" : ""}">
          ${isPractice ? this._renderPracticeArea(practiceCompleted) : ""}
          
          <div class="gesture-animation">
            <mad-icon name="${step.icon}" size="large"></mad-icon>
            ${isPractice ? this._renderGesturePrompt() : ""}
          </div>
          
          <mad-badge pill variant="brand">${this._renderSectionLabel()}</mad-badge>
          <h3 id="tutorial-title">${step.title}</h3>
          <p>${step.description}</p>
          
          ${step.desktopHint ? `<p class="desktop-hint">${step.desktopHint}</p>` : ""}
          
          <div class="step-indicator" role="progressbar" aria-valuenow="${globalStepIndex + 1}" aria-valuemin="1" aria-valuemax="${totalSteps}">
            ${this._renderStepIndicators()}
          </div>
          
          <span class="step-counter">Step ${globalStepIndex + 1} of ${totalSteps}</span>
          
          <div class="actions">
            <mad-button id="skip-btn" variant="default">Skip Tutorial</mad-button>
            <mad-button id="replay-btn" variant="default" title="Replay Tutorial">
              <mad-icon name="arrow-counterclockwise" size="small"></mad-icon>
            </mad-button>
            <mad-button id="next-btn" variant="${buttonVariant}" ${nextButtonDisabled}>
              ${buttonText}
            </mad-button>
          </div>
        </div>
      </div>
    `;

    this._attachEventListeners(isPractice, isLastStep);
  }

  private _attachEventListeners(
    isPractice: boolean,
    isLastStep: boolean
  ): void {
    const skipBtn = this._renderRoot.querySelector("#skip-btn");
    const replayBtn = this._renderRoot.querySelector("#replay-btn");
    const nextBtn = this._renderRoot.querySelector(
      "#next-btn"
    ) as HTMLButtonElement | null;

    const skipHandler = (): void => {
      this._skipTutorial();
    };
    skipBtn?.addEventListener("click", skipHandler);
    this._boundClickHandlers.push(() =>
      skipBtn?.removeEventListener("click", skipHandler)
    );

    const replayHandler = (): void => {
      this.replay();
    };
    replayBtn?.addEventListener("click", replayHandler);
    this._boundClickHandlers.push(() =>
      replayBtn?.removeEventListener("click", replayHandler)
    );

    const nextHandler = (): void => {
      if (isLastStep) {
        this.hide();
        return;
      }
      if (isPractice && !this._practiceCompleted.value) {
        return;
      }
      this._nextStep();
    };
    nextBtn?.addEventListener("click", nextHandler);
    this._boundClickHandlers.push(() =>
      nextBtn?.removeEventListener("click", nextHandler)
    );

    this._boundKeyboardHandler = this._handleKeyboard.bind(this);
    document.addEventListener("keydown", this._boundKeyboardHandler);
  }

  /** @inheritdoc */
  protected _adoptedStyle(): string {
    return `
      <style>
        .gesture-overlay {
          display: block;
          font-family: var(--font-sans, system-ui, sans-serif);
        }

        .gesture-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 300ms ease-out;
        }

        .gesture-card {
          background: var(--wa-color-neutral-900);
          border-radius: 16px;
          padding: 32px;
          max-width: 400px;
          width: 90%;
          text-align: center;
          box-shadow: var(--wa-shadow-x-large);
          animation: slideUp 400ms cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        .gesture-card.practice {
          padding-bottom: 200px;
        }

        .gesture-animation {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface-2, #252542);
          border-radius: 50%;
          position: relative;
        }

        .gesture-animation mad-icon {
          color: var(--accent-primary, #6366f1);
        }

        h3 {
          margin: 0 0 8px;
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary, #f1f1f1);
        }

        p {
          margin: 0 0 16px;
          color: var(--text-secondary, #a1a1aa);
          font-size: 16px;
          line-height: 1.5;
        }

        .desktop-hint {
          background: var(--surface-2, #252542);
          padding: 8px 16px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .step-indicator {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .step-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--surface-3, #3a3a5c);
          transition: all 200ms ease;
        }

        .step-indicator span.active {
          background: var(--accent-primary, #6366f1);
          transform: scale(1.25);
        }

        .step-indicator span.completed {
          background: var(--success, #22c55e);
        }

        .step-counter {
          display: block;
          font-size: 12px;
          color: var(--text-tertiary, #71717a);
          margin-bottom: 20px;
        }

        .actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .actions mad-button:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
        }

        .practice-area {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 180px;
          background: var(--surface-2, #252542);
          border-radius: 0 0 16px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .practice-zone {
          text-align: center;
          padding: 20px;
        }

        .practice-zone mad-icon {
          color: var(--text-tertiary, #71717a);
          margin-bottom: 8px;
        }

        .practice-area.completed .practice-zone mad-icon {
          color: var(--success, #22c55e);
        }

        .practice-zone p {
          margin: 0;
          font-size: 14px;
        }

        .gesture-prompt {
          position: absolute;
          bottom: -40px;
          left: 50%;
          transform: translateX(-50%);
          animation: bounce 1s infinite;
        }

        .prompt-text {
          font-size: 12px;
          color: var(--text-tertiary, #71717a);
          white-space: nowrap;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-5px); }
        }
      </style>
    `;
  }
}

customElements.define("gesture-overlay", GestureOverlay);
