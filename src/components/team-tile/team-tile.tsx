import { Component, Element, Host, h, Prop, State, Watch } from "@stencil/core";
import type { GenericTeam } from "../../components.d";

@Component({
  tag: "mad-team-tile",
  styleUrl: "./team-tile.css",
  shadow: false,
})
export class MadTeamTile {
  @Element() private readonly el: HTMLElement;

  @State() private imgSrc: string;

  private intersectionObserver: IntersectionObserver | null = null;
  private imageLoaded = false;

  @Prop() team: GenericTeam | null;
  @Prop() reverse: boolean | null;
  @Prop() rank?: number;

  constructor() {
    this.imgSrc = "";
    this.imageLoaded = false;
  }

  componentDidLoad() {
    // Only load image when component becomes visible
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.imageLoaded) {
          this.imageLoaded = true;
          this.loadImg(this.team?.id || null);
          this.intersectionObserver?.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    this.intersectionObserver.observe(this.el);
  }

  disconnectedCallback() {
    this.intersectionObserver?.disconnect();
  }

  private loadImg(_id: number | null) {
    if (this.team?.logo) {
      // API-Sports teams have direct logo URL
      setTimeout(() => {
        this.imgSrc = this.team?.logo || "";
      });
    }
  }

  @Watch("team")
  onTeamChange(newTeam: GenericTeam | null) {
    if (!newTeam) {
      return;
    }

    this.loadImg(newTeam.id);
  }

  private renderImage() {
    if (this.imgSrc) {
      return (
        <img
          alt={`${this.team?.name} club logo`}
          class={this.reverse ? "float-right w-16" : "float-left w-16"}
          height="64"
          src={this.imgSrc}
          width="64"
        />
      );
    }
    return <sl-spinner />;
  }

  render() {
    return (
      <Host class="relative">
        {this.rank && (
          <div
            class={`rank-badge rank-${this.rank <= 3 ? this.rank : "other"} ${this.reverse ? "rank-badge-left" : "rank-badge-right"}`}
          >
            {this.rank}
          </div>
        )}
        <div class="w-full">
          {this.team && (
            <div
              class={
                this.reverse
                  ? "min-h-8 w-full md:w-1/2"
                  : "min-h-8 w-full md:w-1/2"
              }
            >
              {this.renderImage()}
            </div>
          )}

          <div
            class={
              this.reverse
                ? "float-right min-h-8 w-full md:float-none md:w-1/2"
                : "float-left min-h-8 w-full md:float-none md:w-1/2"
            }
          >
            <div
              class={
                this.reverse
                  ? "float-right my-1 w-full text-right"
                  : "float-left my-1 w-full text-left"
              }
            >
              {this.team ? (
                <span class="text-balance">{this.team?.name}</span>
              ) : (
                <span>⏳</span>
              )}
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
