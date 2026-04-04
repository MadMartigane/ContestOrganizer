import { BaseElement } from "../../core/base-element.js";
import type { GestureRecognizedEvent } from "../../core/gesture-engine.js";
import { GestureEngine } from "../../core/gesture-engine.js";

interface Match {
  host: { name: string };
  hostScore: number;
  id: number;
  visitor: { name: string };
  visitorScore: number;
}

interface LiveMatchCardProps {
  match: Match;
  onEnd: () => void;
  onScore: (team: "host" | "visitor", points: number) => void;
}

type Team = "host" | "visitor";

/**
 * LiveMatchCard - Enhanced match card with gesture-based scoring
 * @element mad-live-match-card
 */
export class LiveMatchCard extends BaseElement {
  private declare _hostGestureEngine: GestureEngine | null;
  private declare _visitorGestureEngine: GestureEngine | null;
  private declare _hostZone: HTMLElement | null;
  private declare _visitorZone: HTMLElement | null;
  private declare _match: Match;
  private declare _onScore: (team: "host" | "visitor", points: number) => void;
  private declare _onEnd: () => void;

  static get observedAttributes(): string[] {
    return [];
  }

  protected _setupProperties(): void {
    this._hostGestureEngine = null;
    this._visitorGestureEngine = null;
    this._hostZone = null;
    this._visitorZone = null;
    this._match = {
      id: 0,
      host: { name: "" },
      visitor: { name: "" },
      hostScore: 0,
      visitorScore: 0,
    };
    this._onScore = () => {
      /* Score callback set via setProps */
    };
    this._onEnd = () => {
      /* End callback set via setProps */
    };
    this._initialized = true;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._setupGestures();
  }

  disconnectedCallback(): void {
    this._cleanupGestures();
    super.disconnectedCallback();
  }

  /**
   * Set the match data and callbacks
   */
  setProps(props: LiveMatchCardProps): void {
    this._match = props.match;
    this._onScore = props.onScore;
    this._onEnd = props.onEnd;
    this._requestRender();
  }

  private _setupGestures(): void {
    // Wait for render then attach gesture handlers
    requestAnimationFrame(() => {
      this._hostZone = this.querySelector(".team.host") ?? null;
      this._visitorZone = this.querySelector(".team.visitor") ?? null;

      if (this._hostZone) {
        this._hostGestureEngine = new GestureEngine(this._hostZone);
        this._hostGestureEngine.enable();
        this._hostZone.addEventListener("gesture", this._handleHostGesture);
      }

      if (this._visitorZone) {
        this._visitorGestureEngine = new GestureEngine(this._visitorZone);
        this._visitorGestureEngine.enable();
        this._visitorZone.addEventListener(
          "gesture",
          this._handleVisitorGesture
        );
      }
    });
  }

  private _cleanupGestures(): void {
    if (this._hostZone) {
      this._hostZone.removeEventListener("gesture", this._handleHostGesture);
    }
    if (this._visitorZone) {
      this._visitorZone.removeEventListener(
        "gesture",
        this._handleVisitorGesture
      );
    }

    this._hostGestureEngine?.destroy();
    this._visitorGestureEngine?.destroy();
    this._hostGestureEngine = null;
    this._visitorGestureEngine = null;
  }

  private readonly _handleHostGesture = (event: Event): void => {
    const gestureEvent = event as GestureRecognizedEvent;
    this._handleGesture(gestureEvent.detail.type, "host");
  };

  private readonly _handleVisitorGesture = (event: Event): void => {
    const gestureEvent = event as GestureRecognizedEvent;
    this._handleGesture(gestureEvent.detail.type, "visitor");
  };

  private _handleGesture(type: string, team: Team): void {
    switch (type) {
      case "swipe-up":
        this._triggerScore(team, 1);
        break;
      case "double-tap":
        this._triggerScore(team, 3);
        break;
      case "long-press":
        this._showContextMenu(team);
        break;
      default:
        break;
    }
  }

  private _triggerScore(team: Team, points: number): void {
    this._animateScore(team);
    this._triggerHaptic();
    this._onScore(team, points);
  }

  private _animateScore(team: Team): void {
    const zone = team === "host" ? this._hostZone : this._visitorZone;
    if (!zone) {
      return;
    }
    const scoreEl = zone.querySelector(".score");
    if (!scoreEl) {
      return;
    }

    scoreEl.classList.remove("score-pop");
    // Trigger reflow to restart animation
    scoreEl.getBoundingClientRect();
    scoreEl.classList.add("score-pop");
  }

  private _triggerHaptic(): void {
    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
  }

  private _showContextMenu(team: Team): void {
    if (team === "host") {
      this._showHostMenu();
    } else {
      this._showVisitorMenu();
    }
  }

  private _showHostMenu(): void {
    // Context menu for additional actions - placeholder
  }

  private _showVisitorMenu(): void {
    // Context menu for additional actions - placeholder
  }

  protected _render(): void {
    this.innerHTML = `
      <style>
        .live-match-card {
          display: block;
        }
        .live-match-card-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1.5rem;
          background: #171717;
          border-radius: 1rem;
          box-shadow: 0 0 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.1);
          user-select: none;
          touch-action: none;
          position: relative;
          padding-bottom: 3.5rem;
        }
        .team {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1.5rem 2rem;
          background: #262626;
          border-radius: 0.75rem;
          min-width: 140px;
          cursor: pointer;
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .team:active {
          transform: scale(0.98);
          background: #404040;
        }
        .team .name {
          font-size: 1.125rem;
          font-weight: 600;
          color: #e5e5e5;
          text-align: center;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .team .score {
          font-size: 3rem;
          font-weight: 700;
          color: #fafafa;
          line-height: 1;
          transition: transform 0.1s ease;
        }
        .team .score-pop {
          animation: scorePop 0.3s ease-out;
        }
        @keyframes scorePop {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .gesture-hints {
          display: flex;
          gap: 0.75rem;
          font-size: 0.75rem;
          color: #737373;
          margin-top: 0.25rem;
        }
        .gesture-hints span {
          padding: 0.125rem 0.375rem;
          background: #404040;
          border-radius: 0.25rem;
        }
        .vs {
          font-size: 1rem;
          font-weight: 700;
          color: #737373;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .end-btn {
          position: absolute;
          bottom: -3rem;
          left: 50%;
          transform: translateX(-50%);
        }
      </style>
      <div class="live-match-card">
        <div class="live-match-card-inner">
          <div class="team host" data-team="host">
            <span class="name">${this._match.host.name}</span>
            <span class="score">${this._match.hostScore}</span>
            <div class="gesture-hints">
              <span>↑ +1</span>
              <span>2× +3</span>
            </div>
          </div>
          <div class="vs">VS</div>
          <div class="team visitor" data-team="visitor">
            <span class="name">${this._match.visitor.name}</span>
            <span class="score">${this._match.visitorScore}</span>
            <div class="gesture-hints">
              <span>↑ +1</span>
              <span>2× +3</span>
            </div>
          </div>
          <mad-button variant="danger" size="small" pill class="end-btn" data-action="end-match">End Match</mad-button>
        </div>
      </div>
    `;

    // Attach end button listener
    this.querySelector('[data-action="end-match"]')?.addEventListener(
      "click",
      this._handleEndClick
    );
  }

  private readonly _handleEndClick = (): void => {
    this._onEnd();
  };
}

customElements.define("mad-live-match-card", LiveMatchCard);
