import { BaseElement } from "../../core/base-element.js";
import { GestureEngine } from "../../core/gesture-engine.js";
import { Signal } from "../../core/signal.js";
import type { Match } from "../../modules/matchs/matchs.js";

interface LastAction {
  points: number;
  team: string;
  timestamp: number;
}

/**
 * GestureScoring - Full-screen scoring overlay with gesture feedback
 * @element gesture-scoring
 */
export class GestureScoring extends BaseElement {
  private declare _match: Signal<Match | null>;
  private declare _isActive: Signal<boolean>;
  private declare _lastAction: Signal<LastAction | null>;
  private _gestureEngine: GestureEngine | null = null;

  static get observedAttributes(): string[] {
    return ["is-active"];
  }

  protected _setupProperties(): void {
    this._match = new Signal<Match | null>(null);
    this._isActive = new Signal<boolean>(false);
    this._lastAction = new Signal<LastAction | null>(null);

    this._trackSignal(this._match);
    this._trackSignal(this._isActive);
    this._trackSignal(this._lastAction);

    this._initialized = true;
  }

  protected _createRenderRoot(): Element {
    return this; // Light DOM
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this._isActive.value) {
      this._setupGestures();
    }
  }

  disconnectedCallback(): void {
    this._gestureEngine?.disable();
    super.disconnectedCallback();
  }

  /**
   * Sets the match data for display
   */
  setMatch(match: Match): void {
    this._match.value = match;
  }

  /**
   * Activates or deactivates the gesture overlay
   */
  setActive(active: boolean): void {
    this._isActive.value = active;
    if (active) {
      this._setupGestures();
    } else {
      this._gestureEngine?.disable();
    }
  }

  private _setupGestures(): void {
    if (this._gestureEngine) {
      this._gestureEngine.disable();
    }
    this._gestureEngine = new GestureEngine(this);
    this._gestureEngine.enable();
    this._gestureEngine.addEventListener("gesture", (e: Event) => {
      const customEvent = e as CustomEvent;
      this._handleGesture(customEvent.detail);
    });
  }

  private _handleGesture(gesture: {
    type: string;
    originX: number;
    originY: number;
  }): void {
    this._showGestureTrail(gesture);

    if (gesture.type === "shake") {
      this._undoLastAction();
    }
  }

  private _showGestureTrail(gesture: {
    type: string;
    originX: number;
    originY: number;
  }): void {
    const trail = document.createElement("div");
    trail.className = "gesture-trail";
    trail.style.left = `${gesture.originX}px`;
    trail.style.top = `${gesture.originY}px`;
    this.appendChild(trail);

    setTimeout(() => trail.remove(), 500);
  }

  private _undoLastAction(): void {
    const lastAction = this._lastAction.value;
    if (lastAction && Date.now() - lastAction.timestamp < 5000) {
      this.dispatchEvent(
        new CustomEvent("undo-score", {
          detail: lastAction,
          bubbles: true,
          composed: true,
        })
      );

      this._showUndoFeedback();
    }
  }

  private _showUndoFeedback(): void {
    const toast = document.createElement("div");
    toast.className = "undo-toast";
    toast.textContent = "Undo successful";
    this.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }

  protected _render(): void {
    const isActive = this._isActive.value;
    const match = this._match.value;
    const lastAction = this._lastAction.value;

    if (!isActive) {
      this.innerHTML = "";
      return;
    }

    const hostScore = match?.goals?.host ?? 0;
    const visitorScore = match?.goals?.visitor ?? 0;

    this.innerHTML = `
      <style>
        .gesture-scoring {
          display: block;
          position: fixed;
          inset: 0;
          z-index: 9999;
          pointer-events: none;
        }

        .gesture-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          pointer-events: auto;
        }

        .score-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3rem;
        }

        .team {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .team.host {
          text-align: right;
        }

        .team.visitor {
          text-align: left;
        }

        .score {
          font-size: 8rem;
          font-weight: bold;
          line-height: 1;
        }

        .timer {
          font-size: 3rem;
          font-variant-numeric: tabular-nums;
        }

        .last-action {
          margin-top: 2rem;
          font-size: 1.5rem;
          color: white;
          text-align: center;
        }

        .undo-hint {
          display: block;
          margin-top: 0.5rem;
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .gesture-trail {
          position: fixed;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          animation: trail-fade 0.5s ease-out forwards;
          pointer-events: none;
        }

        @keyframes trail-fade {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(2);
          }
        }

        .undo-toast {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          padding: 1rem 2rem;
          background: var(--wa-color-neutral-100);
          color: var(--wa-color-neutral-900);
          border-radius: 0.5rem;
          font-size: 1.25rem;
          animation: toast-in 0.3s ease-out;
        }

        @keyframes toast-in {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(1rem);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      </style>

      <div class="gesture-scoring gesture-overlay">
        <div class="score-display">
          <div class="team host">
            <span class="score">${hostScore}</span>
          </div>
          <div class="timer">${this._formatTime()}</div>
          <div class="team visitor">
            <span class="score">${visitorScore}</span>
          </div>
        </div>

        ${
          lastAction
            ? `<div class="last-action">+${lastAction.points} ${lastAction.team}<span class="undo-hint">Shake to undo</span></div>`
            : ""
        }
      </div>
    `;
  }

  private _formatTime(): string {
    return "00:00";
  }
}

customElements.define("gesture-scoring", GestureScoring);
