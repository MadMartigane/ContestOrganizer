import { Component, Event, EventEmitter, Fragment, h, Prop, State } from "@stencil/core";
import apiFutDB from "../../modules/futbd/futdb";
import { PageTeamSelectEventDatail } from "./page-team-select.d";
import Utils from "../../modules/utils/utils";
import { GenericTeam, TournamentType } from "../../components.d";
import apiSports from "../../modules/api-sports/api-sports";

@Component({
  tag: "page-team-select",
  styleUrl: "page-team-select.css",
  shadow: false,
})
export class PageTeamSelect {
  private readonly apiFutDB: typeof apiFutDB;
  private readonly apiSports: typeof apiSports;

  private teams: Array<GenericTeam>;
  private searchValue: string;
  private minNumberSearchLetter: number;

  @State() private isLoading: boolean;
  @State() private suggested: Array<GenericTeam>;

  @Prop() teamId: string
  @Prop() teamType: TournamentType;

  @Event({
    composed: true,
    bubbles: true
  }) pageTeamNewSelection: EventEmitter<PageTeamSelectEventDatail>;

  constructor () {
    this.apiFutDB = apiFutDB;
    this.apiSports = apiSports;

    this.teams = [];
    this.suggested = [];
    this.searchValue = "";

    switch (this.teamType) {
      case TournamentType.NBA:
      case TournamentType.BASKET:
      case TournamentType.NFL:
      case TournamentType.RUGBY:
        this.minNumberSearchLetter = 3;
        this.isLoading = false;
        Utils.setFocus("ion-searchbar#page-team-select-search");
        break;
      default:
        this.minNumberSearchLetter = 2;
        this.isLoading = true;
        this.apiFutDB
          .loadTeams()
          .then((teams: Array<GenericTeam>) => {
            this.teams = teams;
          })
          .catch((error: any) => {
            console.log("teams on load error: ", error);
          })
          .finally(() => {
            this.isLoading = false;
            Utils.setFocus("ion-searchbar#page-team-select-search");
          });
        break;
    }
  }

  private async onSearchChange (ev: CustomEvent): Promise<void> {
    this.searchValue = ev.detail.value;

    if (this.searchValue.length < this.minNumberSearchLetter) {
      this.suggested = [];
      return;
    }

    const pattern = new RegExp(this.searchValue, "i");

    switch (this.teamType) {
      case TournamentType.NBA:
      case TournamentType.BASKET:
      case TournamentType.NFL:
      case TournamentType.RUGBY:
        this.suggested = await this.apiSports.searchTeam(this.teamType, this.searchValue);
        break;
      default:
        this.suggested = this.teams.filter((team) => pattern.test(team.name));
        break;
    }
  }

  onTeamSelected (team: GenericTeam) {
    this.pageTeamNewSelection.emit({
      id: this.teamId,
      team
    });

    const router = document.querySelector('ion-router');
    router?.back();
  }

  render() {
    return (
      <Fragment>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-buttons slot="start">
              <ion-back-button defaultHref="/app/conf"></ion-back-button>
            </ion-buttons>
            <ion-title>Sélectionne ton équipe</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content fullscreen class="ion-padding">
          { this.isLoading ?
            <ion-progress-bar type="indeterminate" color="secondary"></ion-progress-bar> :
            null
          }
          <ion-card>
            <ion-card-header>
              <h1>
                { this.isLoading ?
                  "Changement des équipes…" :
                  `Recherche ton équipe. (${this.minNumberSearchLetter} lettres min)`
                }
              </h1>
            </ion-card-header>
            <ion-card-content>
              <ion-searchbar
                id="page-team-select-search"
                debounce="400"
                inputmode="search"
                enterkeyhint="search"
                disabled={this.isLoading}
                animated="true"
                onIonInput={(ev: CustomEvent) => this.onSearchChange(ev)}
                placeholder="Recherche"></ion-searchbar>

                <ion-list>
                  <ion-radio-group value="selectedTeam">
                    { this.suggested.map((team) =>
                        <ion-item onClick={() => this.onTeamSelected(team)}>
                          <mad-team-tile
                            team={team}
                          ></mad-team-tile>
                          <ion-radio slot="end" value={team.id}></ion-radio>
                        </ion-item>

                    )}
                  </ion-radio-group>
                </ion-list>

                { this.searchValue?.length > 2 && !this.suggested.length ?
                  <ion-item color="warning">
                    <ion-icon name="sad-outline"></ion-icon>
                    <ion-label>
                      <h2>Aucun résultat</h2>
                    </ion-label>
                  </ion-item> :
                  null
                }
            </ion-card-content>
          </ion-card>
        </ion-content>
      </Fragment>
    );
  }

}
