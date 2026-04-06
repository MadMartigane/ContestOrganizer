import { html, nothing, render } from "lit-html";
import { BaseElement } from "../../core/base-element.js";
import { GestureEngine } from "../../core/gesture-engine.js";
import { Signal } from "../../core/signal.js";
/**
 * GestureScoring - Full-screen scoring overlay with gesture feedback
 * @element gesture-scoring
 */
export class GestureScoring extends BaseElement {
  _gestureEngine = null;
  static get observedAttributes() {
    return ["is-active"];
  }
  _setupProperties() {
    this._match = new Signal(null);
    this._isActive = new Signal(false);
    this._lastAction = new Signal(null);
    this._trackSignal(this._match);
    this._trackSignal(this._isActive);
    this._trackSignal(this._lastAction);
    this._initialized = true;
  }
  connectedCallback() {
    super.connectedCallback();
    if (this._isActive.value) {
      this._setupGestures();
    }
  }
  disconnectedCallback() {
    this._gestureEngine?.disable();
    super.disconnectedCallback();
  }
  /**
   * Sets the match data for display
   */
  setMatch(match) {
    this._match.value = match;
  }
  /**
   * Activates or deactivates the gesture overlay
   */
  setActive(active) {
    this._isActive.value = active;
    if (active) {
      this._setupGestures();
    } else {
      this._gestureEngine?.disable();
    }
  }
  _setupGestures() {
    if (this._gestureEngine) {
      this._gestureEngine.disable();
    }
    this._gestureEngine = new GestureEngine(this);
    this._gestureEngine.enable();
    this._gestureEngine.addEventListener("gesture", (e) => {
      const customEvent = e;
      this._handleGesture(customEvent.detail);
    });
  }
  _handleGesture(gesture) {
    this._showGestureTrail(gesture);
    if (gesture.type === "shake") {
      this._undoLastAction();
    }
  }
  _showGestureTrail(gesture) {
    const trail = document.createElement("div");
    trail.className = "gesture-trail";
    trail.style.left = `${gesture.originX}px`;
    trail.style.top = `${gesture.originY}px`;
    this.appendChild(trail);
    setTimeout(() => trail.remove(), 500);
  }
  _undoLastAction() {
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
  _showUndoFeedback() {
    const toast = document.createElement("div");
    toast.className = "undo-toast";
    toast.textContent = "Undo successful";
    this.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }
  _render() {
    const isActive = this._isActive.value;
    const match = this._match.value;
    const lastAction = this._lastAction.value;
    if (!isActive) {
      render(nothing, this._renderRoot);
      return;
    }
    const hostScore = match?.goals?.host ?? 0;
    const visitorScore = match?.goals?.visitor ?? 0;
    const formattedTime = this._formatTime();
    const lastActionContent = lastAction
      ? html`<div class="last-action" aria-live="polite">
          +${lastAction.points} ${lastAction.team}<span class="undo-hint">Shake to undo</span>
        </div>`
      : nothing;
    this._renderTemplate(html`
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

      <div class="gesture-scoring gesture-overlay" role="dialog" aria-label="Scoring Overlay" aria-modal="true">
        <div class="score-display">
          <div class="team host">
            <span class="score">${hostScore}</span>
          </div>
          <div class="timer" aria-live="polite">${formattedTime}</div>
          <div class="team visitor">
            <span class="score">${visitorScore}</span>
          </div>
        </div>

        ${lastActionContent}
      </div>
    `);
  }
  _formatTime() {
    return "00:00";
  }
}
customElements.define("gesture-scoring", GestureScoring);
