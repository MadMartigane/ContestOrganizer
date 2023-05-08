import { Component, Event, EventEmitter, Fragment, h, Prop, State } from "@stencil/core";
import ApiFutDB from "../../modules/futbd/futdb";
import { FutDBTeam } from "../../modules/futbd/futdb.d";
import { PageTeamSelectEventDatail } from "./page-team-select.d";
import utils from "../../modules/utils/utils";

@Component({
  tag: "page-team-select",
  styleUrl: "page-team-select.css",
  shadow: false,
})
export class PageTeamSelect {
  private readonly apiFutDB: typeof ApiFutDB;
  private readonly utils: typeof utils;

  private teams: Array<FutDBTeam>;
  private searchValue: string;

  @State() private isLoading: boolean;
  @State() private suggested: Array<FutDBTeam>;

  @Prop() teamId: string

  @Event({
    composed: true,
    bubbles: true
  }) pageTeamNewSelection: EventEmitter<PageTeamSelectEventDatail>;

  constructor () {
    this.apiFutDB = ApiFutDB;
    this.utils = utils;

    this.teams = [];
    this.suggested = [];
    this.isLoading = true;
    this.searchValue = "";

    this.apiFutDB
      .loadTeams()
      .then((teams: Array<FutDBTeam>) => {
          this.teams = teams;
      })
      .catch((error: any) => {
        console.log("teams on load error: ", error);
      })
      .finally(() => {
        this.isLoading = false;
        this.utils.setFocus("ion-searchbar#page-team-select-search");
      });
  }

  onSearchChange (ev: CustomEvent): void {
    this.searchValue = ev.detail.value;

    if (this.searchValue.length < 2) {
      this.suggested = [];
      return;
    }

    const pattern = new RegExp(this.searchValue, "i");
    this.suggested = this.teams.filter((team) => pattern.test(team.name));
  }

  onTeamSelected (team: FutDBTeam) {
    this.pageTeamNewSelection.emit({
      id: this.teamId,
      team
    });

    const router = document.querySelector('ion-router');
    router.back();
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
                  "Recherche ton équipe. (2 lettres min)"
                }
              </h1>
            </ion-card-header>
            <ion-card-content>
              <ion-searchbar
                id="page-team-select-search"
                debounce="250"
                inputmode="search"
                disabled={this.isLoading}
                animated="true"
                onIonChange={(ev: CustomEvent) => this.onSearchChange(ev)}
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
