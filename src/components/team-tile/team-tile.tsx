import { Component, Host, h, Prop, State, Watch } from "@stencil/core";
import type { GenericTeam } from "../../components.d";
import apiFutDB from "../../modules/futbd/futdb";

@Component({
  tag: "mad-team-tile",
  styleUrl: "./team-tile.css",
  shadow: false,
})
export class MadTeamTile {
  private readonly apiFutDB: typeof apiFutDB;

  @State() private imgSrc: string;

  @Prop() team: GenericTeam | null;
  @Prop() reverse: boolean | null;
  @Prop() rank?: number;

  constructor() {
    this.apiFutDB = apiFutDB;

    this.loadImg(this.team?.id || null);
  }

  private loadImg(id: number | null) {
    if (this.team?.logo) {
      setTimeout(() => {
        this.imgSrc = this.team?.logo || "";
      });
    } else if (id) {
      this.apiFutDB.loadTeamImage(id).then((base64Img) => {
        this.imgSrc = base64Img;
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
          {this.team && this.imgSrc ? (
            <div
              class={
                this.reverse
                  ? "min-h-8 w-full md:w-1/2"
                  : "min-h-8 w-full md:w-1/2"
              }
            >
              <img
                alt={`${this.team?.name} club logo`}
                class={this.reverse ? "float-right w-16" : "float-left w-16"}
                src={this.imgSrc}
              />
            </div>
          ) : null}

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
