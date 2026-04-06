import { html } from "lit-html";
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
 * @fires score - Dispatched when a score is added via gesture (detail: { team: "host" | "visitor", points: number })
 */
export class LiveMatchCard extends BaseElement {
  private declare _hostGestureEngine: GestureEngine | null;
  private declare _visitorGestureEngine: GestureEngine | null;
  private declare _match: Match;
  private declare _onScore: (team: "host" | "visitor", points: number) => void;
  private declare _onEnd: () => void;

  static get observedAttributes(): string[] {
    return [];
  }

  protected _setupProperties(): void {
    this._hostGestureEngine = null;
    this._visitorGestureEngine = null;
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
    // Initialize gesture engines after render
    requestAnimationFrame(() => {
      const hostZone = this._renderRoot.querySelector(".team.host");
      const visitorZone = this._renderRoot.querySelector(".team.visitor");

      if (hostZone) {
        this._hostGestureEngine = new GestureEngine(hostZone as HTMLElement);
        this._hostGestureEngine.enable();
      }

      if (visitorZone) {
        this._visitorGestureEngine = new GestureEngine(
          visitorZone as HTMLElement
        );
        this._visitorGestureEngine.enable();
      }
    });
  }

  disconnectedCallback(): void {
    this._hostGestureEngine?.destroy();
    this._visitorGestureEngine?.destroy();
    this._hostGestureEngine = null;
    this._visitorGestureEngine = null;
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

  private _handleHostGesture(event: Event): void {
    const gestureEvent = event as GestureRecognizedEvent;
    this._handleGesture(gestureEvent.detail.type, "host");
  }

  private _handleVisitorGesture(event: Event): void {
    const gestureEvent = event as GestureRecognizedEvent;
    this._handleGesture(gestureEvent.detail.type, "visitor");
  }

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
    const selector = team === "host" ? ".team.host" : ".team.visitor";
    const zone = this._renderRoot.querySelector(selector);
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
    const hostName = this._match.host.name;
    const hostScore = this._match.hostScore;
    const visitorName = this._match.visitor.name;
    const visitorScore = this._match.visitorScore;

    this._renderTemplate(html`
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
          <div
            class="team host"
            data-team="host"
            role="button"
            aria-label="Host team swipe to score"
            @gesture=${this._handleHostGesture}
          >
            <span class="name">${hostName}</span>
            <span class="score">${hostScore}</span>
            <div class="gesture-hints">
              <span>↑ +1</span>
              <span>2× +3</span>
            </div>
          </div>
          <div class="vs" aria-hidden="true">VS</div>
          <div
            class="team visitor"
            data-team="visitor"
            role="button"
            aria-label="Visitor team swipe to score"
            @gesture=${this._handleVisitorGesture}
          >
            <span class="name">${visitorName}</span>
            <span class="score">${visitorScore}</span>
            <div class="gesture-hints">
              <span>↑ +1</span>
              <span>2× +3</span>
            </div>
          </div>
          <mad-button
            variant="danger"
            size="small"
            pill
            class="end-btn"
            data-action="end-match"
            aria-label="End match"
            @click=${this._handleEndClick.bind(this)}
          >End Match</mad-button>
        </div>
      </div>
    `);
  }

  private _handleEndClick(): void {
    this._onEnd();
  }
}

customElements.define("mad-live-match-card", LiveMatchCard);
