import { Component, Event, EventEmitter, Host, Prop, h, State, Watch } from '@stencil/core';
import { TournamentType } from '../../modules/tournaments/tournaments.types';
import { GenericTeam } from '../../modules/team-row/team-row.d';
import { GridTeamOnUpdateDetail } from '../../modules/grid-common/grid-common.types';
import SlDrawer from '@shoelace-style/shoelace/dist/components/drawer/drawer';
import apiFutDB from '../../modules/futbd/futdb';
import apiSports from '../../modules/api-sports/api-sports';
import Utils from '../../modules/utils/utils';

@Component({
  tag: 'mad-select-team',
  styleUrl: './select-team.css',
  shadow: false,
})
export class MadSelectTeam {
  private readonly apiFutDB = apiFutDB;
  private readonly apiSports = apiSports;

  private argColor: string;
  private domDrawer: SlDrawer;
  private domDivBody?: HTMLDivElement;
  private teams: Array<GenericTeam>;
  private searchValue: string;
  private minNumberSearchLetter: number;

  @Prop() color: string;
  @Prop() placeholder: string;
  @Prop() label: string;
  @Prop() value: GenericTeam;
  @Prop() type: TournamentType;
  @Prop() tournamentGridId?: number;

  @State() private team: GenericTeam;
  @State() private isLoading: boolean;
  @State() private suggested: Array<GenericTeam>;

  @Event() madSelectChange: EventEmitter<GridTeamOnUpdateDetail>;

  @Watch('value')
  onValueChange() {
    this.team = this.value;
  }

  constructor() {
    this.argColor = this.color || 'primary';
    this.team = this.value;

    this.teams = [];
    this.suggested = [];
    this.searchValue = '';

    switch (this.type) {
      case TournamentType.NBA:
      case TournamentType.BASKET:
      case TournamentType.NFL:
      case TournamentType.RUGBY:
        this.minNumberSearchLetter = 3;
        this.isLoading = false;
        Utils.setFocus('ion-searchbar#page-team-select-search');
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
            console.warn('teams on load error: ', error);
          })
          .finally(() => {
            this.isLoading = false;
            Utils.setFocus('ion-searchbar#page-team-select-search');
          });
        break;
    }
  }

  private async onSearchChange(ev: CustomEvent): Promise<void> {
    this.searchValue = ev.detail.value;

    if (this.searchValue.length < this.minNumberSearchLetter) {
      this.suggested = [];
      return;
    }

    const pattern = new RegExp(this.searchValue, 'i');

    switch (this.type) {
      case TournamentType.NBA:
      case TournamentType.BASKET:
      case TournamentType.NFL:
      case TournamentType.RUGBY:
        this.suggested = await this.apiSports.searchTeam(this.type, this.searchValue);
        break;
      default:
        this.suggested = this.teams.filter(team => pattern.test(team.name));
        break;
    }
  }

  private onPageTeamNewSelection(team: GenericTeam) {
    this.team = team;
    this.madSelectChange.emit({ genericTeam: this.team, tournamentGridId: this.tournamentGridId || null });
  }

  private onTeamSelected(team: GenericTeam) {
    this.onPageTeamNewSelection(team);
    this.closeDrawer();
  }

  private openDrawer(): void {
    // @ts-ignore
    // TODO: this.domDrawer.style['--size'] = '40rem';
    this.domDrawer.show();
  }

  private closeDrawer(): void {
    this.domDrawer.hide();
  }

  public componentDidLoad() {
    if (this.domDivBody) {
      this.domDivBody.addEventListener('click', (ev: Event) => {
        ev.stopPropagation();
        this.openDrawer();
      });
    }

    if (this.domDrawer) {
      this.domDrawer.addEventListener('sl-initial-focus', (ev: Event) => {
        ev.stopPropagation();
        Utils.setFocus('ion-searchbar');
      });
    }
  }

  private renderTeamSelection() {
    return (
      <div class="page-content">
        {this.isLoading ? <ion-progress-bar type="indeterminate" color="secondary"></ion-progress-bar> : null}
        <ion-card>
          <ion-card-header>
            <h1>{this.isLoading ? 'Changement des équipes…' : `Recherche ton équipe. (${this.minNumberSearchLetter} lettres min)`}</h1>
          </ion-card-header>
          <ion-card-content>
            <ion-searchbar
              id="page-team-select-search"
              debounce={400}
              inputmode="search"
              enterkeyhint="search"
              disabled={this.isLoading}
              autocapitalize="off"
              animated
              onIonInput={(ev: CustomEvent) => this.onSearchChange(ev)}
              placeholder="Recherche"
            ></ion-searchbar>

            <ion-list>
              <ion-radio-group value="selectedTeam">
                {this.suggested.map(team => (
                  <ion-item onClick={() => this.onTeamSelected(team)}>
                    <mad-team-tile team={team}></mad-team-tile>
                    <ion-radio slot="end" value={team.id}></ion-radio>
                  </ion-item>
                ))}
              </ion-radio-group>
            </ion-list>

            {this.searchValue?.length > 2 && !this.suggested.length ? (
              <sl-alert variant="warning" open>
                <sl-icon name="emoji-frown" class="xxl"></sl-icon>
                <span class="container l">Aucun résultat</span>
              </sl-alert>
            ) : null}
          </ion-card-content>
        </ion-card>
      </div>
    );
  }
  render() {
    return (
      <Host
        class={{
          pointer: true,
        }}
      >
        <sl-drawer
          ref={(el: SlDrawer) => {
            this.domDrawer = el;
          }}
          no-header
          placement="start"
        >
          <h1 class="container-l">Sélection de l’équipe</h1>
          {this.renderTeamSelection()}

          <div slot="footer" class="grid-300">
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
          ref={el => {
            this.domDivBody = el;
          }}
        >
          {this.label ? <span>{this.label}</span> : null}
          {this.team?.id ? <mad-team-tile color={this.argColor} team={this.team}></mad-team-tile> : <span class="placeholder">{this.placeholder}</span>}
        </div>
      </Host>
    );
  }
}
