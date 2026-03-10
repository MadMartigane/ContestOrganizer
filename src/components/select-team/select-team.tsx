import type SlDrawer from "@shoelace-style/shoelace/dist/components/drawer/drawer";
import type SlInput from "@shoelace-style/shoelace/dist/components/input/input.component";
import type SlMenu from "@shoelace-style/shoelace/dist/components/menu/menu.component";
import type SlMenuItem from "@shoelace-style/shoelace/dist/components/menu-item/menu-item.component";
import {
  Component,
  Event,
  type EventEmitter,
  Host,
  h,
  Prop,
  State,
  Watch,
} from "@stencil/core";
import apiSports from "../../modules/api-sports/api-sports";
import type { ClassifiedError } from "../../modules/error/error.utils";
import { classifyError } from "../../modules/error/error.utils";
import type { GridTeamOnUpdateDetail } from "../../modules/grid-common/grid-common.types";
import type { GenericTeam } from "../../modules/team-row/team-row.d";
import theSportsDbService from "../../modules/thesportsdb/thesportsdb.service";
import { TournamentType } from "../../modules/tournaments/tournaments.types";
import Utils from "../../modules/utils/utils";

@Component({
  tag: "mad-select-team",
  styleUrl: "./select-team.css",
  shadow: false,
})
export class MadSelectTeam {
  private readonly apiSports = apiSports;

  private domDrawer: SlDrawer;
  private domDivBody?: HTMLDivElement;
  private domInputSearch?: SlInput;
  private domSearchResultList?: SlMenu;
  private searchValue: string;
  private searchRequestId = 0;
  private readonly minNumberSearchLetter: number;

  @Prop() color: string;
  @Prop() placeholder: string;
  @Prop() label: string;
  @Prop() value: GenericTeam;
  @Prop() type: TournamentType;
  @Prop() tournamentGridId?: number;

  @State() private team: GenericTeam;
  @State() private isLoading: boolean;
  @State() private searchError: ClassifiedError | null = null;
  @State() private suggested: GenericTeam[];

  @Event() madSelectChange: EventEmitter<GridTeamOnUpdateDetail>;

  @Watch("value")
  onValueChange() {
    this.team = this.value;
  }

  constructor() {
    this.team = this.value;

    this.suggested = [];
    this.searchValue = "";
    this.searchError = null;

    // All sports use api-sports with same settings
    this.minNumberSearchLetter = 3;
    this.isLoading = false;
  }

  private async onSearchChange(value: string): Promise<void> {
    this.searchValue = value;

    if (this.searchValue.length < this.minNumberSearchLetter) {
      this.suggested = [];
      this.isLoading = false;
      this.searchError = null;
      return;
    }

    const requestId = ++this.searchRequestId;
    this.isLoading = true;
    this.searchError = null;

    try {
      let results: GenericTeam[];
      if (this.type === TournamentType.NBA) {
        results = await theSportsDbService.searchTeams(this.searchValue);
      } else {
        results = await this.apiSports.searchTeam(this.type, this.searchValue);
      }

      if (requestId === this.searchRequestId) {
        this.suggested = results;
        this.scrollOnSearchResult();
      }
    } catch (error) {
      if (requestId === this.searchRequestId) {
        this.searchError = classifyError(error);
        this.suggested = [];
      }
    } finally {
      if (requestId === this.searchRequestId) {
        this.isLoading = false;
      }
    }
  }

  private retrySearch(): void {
    this.onSearchChange(this.searchValue);
  }

  private renderErrorAlert() {
    if (!this.searchError) {
      return null;
    }

    return (
      <sl-alert class="my-2" open variant="danger">
        <sl-icon name="exclamation-triangle" slot="icon" />
        <strong>{this.searchError.title}</strong>
        <p class="text-sm">{this.searchError.message}</p>
        {this.searchError.retryable && (
          <sl-button
            onclick={() => this.retrySearch()}
            size="small"
            variant="primary"
          >
            <sl-icon name="arrow-clockwise" slot="prefix" />
            Réessayer
          </sl-button>
        )}
      </sl-alert>
    );
  }

  private scrollOnSearchResult() {
    Utils.scrollIntoView(this.domSearchResultList || "");
  }

  private onPageTeamNewSelection(team: GenericTeam) {
    this.team = team;
    this.madSelectChange.emit({
      genericTeam: this.team,
      tournamentGridId: this.tournamentGridId || null,
    });
  }

  private onTeamSelected(team: GenericTeam) {
    this.onPageTeamNewSelection(team);
    this.closeDrawer();
  }

  private onTeamRadioChange(ev: CustomEvent): void {
    ev.stopPropagation();

    const detail = ev.detail as { item: SlMenuItem };
    const teamId = detail.item.dataset.teamId;

    const team: GenericTeam | undefined = this.suggested.find(
      (candidate) => candidate.id === Number(teamId)
    );
    if (team) {
      this.onTeamSelected(team);
    }

    // TODO: warn
  }

  private openDrawer(): void {
    this.domDrawer.show();
    if (this.domInputSearch) {
      Utils.setFocus(this.domInputSearch as unknown as HTMLElement);
    }
  }

  private closeDrawer(): void {
    this.domDrawer.hide();
  }

  componentDidRender() {
    Utils.installEventHandler(
      this.domSearchResultList,
      "sl-select",
      (ev: CustomEvent) => {
        ev.stopPropagation();
        this.onTeamRadioChange(ev);
      }
    );

    Utils.installEventHandler(this.domDivBody, "click", (ev: CustomEvent) => {
      ev.stopPropagation();
      this.openDrawer();
    });

    Utils.installEventHandler(
      this.domInputSearch as unknown as HTMLElement,
      "sl-input",
      (ev: CustomEvent) => {
        ev.stopPropagation();
        Utils.debounce("select-team-input-search", () => {
          this.onSearchChange(this.domInputSearch?.value || "");
        });
      }
    );
  }

  private renderTeamResultList() {
    return (
      <sl-menu
        ref={(el: SlMenu) => {
          this.domSearchResultList = el;
        }}
      >
        {this.suggested.map((team: GenericTeam) => (
          <sl-menu-item data-team-id={team.id}>
            <mad-team-tile team={team} />

            <span slot="suffix">
              <sl-icon
                class="text-4xl text-neutral"
                name="arrow-right-circle"
              />
            </span>
          </sl-menu-item>
        ))}
      </sl-menu>
    );
  }

  private renderResultsContent() {
    if (this.isLoading) {
      return (
        <div class="flex flex-col items-center justify-center py-8">
          <div class="mb-3">
            <sl-spinner class="text-4xl" />
          </div>
          <span class="text-neutral">Chargement des équipes…</span>
        </div>
      );
    }

    if (this.suggested.length) {
      return this.renderTeamResultList();
    }

    if (this.searchValue?.length > 2) {
      return (
        <sl-alert open variant="warning">
          <sl-icon
            class="text-6xl text-warning"
            name="emoji-frown"
            slot="icon"
          />
          <span class="mx-2 text-2xl">Aucun résultat</span>
        </sl-alert>
      );
    }

    return null;
  }

  private renderTeamSelection() {
    return (
      <div class="footer">
        <sl-card>
          <div slot="header">
            <h3>{`Recherche ton équipe. (${this.minNumberSearchLetter} lettres min)`}</h3>
          </div>
          <div>
            <div class="my-4">
              <sl-input
                autocomplete="off"
                autofocus
                disabled={this.isLoading}
                placeholder="nom de d'équipe"
                ref={(el: SlInput) => {
                  this.domInputSearch = el;
                }}
                size="medium"
                type="text"
              >
                <sl-icon name="search" slot="prefix" />
              </sl-input>
            </div>

            {this.renderErrorAlert()}

            {this.renderResultsContent()}
          </div>
        </sl-card>
      </div>
    );
  }
  render() {
    return (
      <Host
        class={{
          "cursor-pointer": true,
        }}
      >
        <sl-drawer
          no-header
          placement="start"
          ref={(el: SlDrawer) => {
            this.domDrawer = el;
          }}
        >
          {this.renderTeamSelection()}

          <div class="grid-300" slot="footer">
            <sl-button
              onclick={() => {
                this.closeDrawer();
              }}
              variant="primary"
            >
              Annuler
            </sl-button>
          </div>
        </sl-drawer>
        <div
          ref={(el) => {
            this.domDivBody = el;
          }}
        >
          {this.label ? <span>{this.label}</span> : null}
          {this.team?.id ? (
            <mad-team-tile team={this.team} />
          ) : (
            <span class="text-neutral text-sm">{this.placeholder}</span>
          )}
        </div>
      </Host>
    );
  }
}
