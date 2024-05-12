import { Component, Event, EventEmitter, Host, Prop, h, State, Watch } from '@stencil/core';
import { TournamentType } from '../../modules/tournaments/tournaments.types';
import { GenericTeam } from '../../modules/team-row/team-row.d';
import { GridTeamOnUpdateDetail } from '../../modules/grid-common/grid-common.types';
import SlDrawer from '@shoelace-style/shoelace/dist/components/drawer/drawer';
import apiFutDB from '../../modules/futbd/futdb';
import apiSports from '../../modules/api-sports/api-sports';
import Utils from '../../modules/utils/utils';
import SlInput from '@shoelace-style/shoelace/dist/components/input/input.component';
import SlMenu from '@shoelace-style/shoelace/dist/components/menu/menu.component';
import SlMenuItem from '@shoelace-style/shoelace/dist/components/menu-item/menu-item.component';

@Component({
  tag: 'mad-select-team',
  styleUrl: './select-team.css',
  shadow: false,
})
export class MadSelectTeam {
  private readonly apiFutDB = apiFutDB;
  private readonly apiSports = apiSports;

  private domDrawer: SlDrawer;
  private domDivBody?: HTMLDivElement;
  private domInputSearch?: SlInput;
  private domSearchResultList?: SlMenu;
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
          });
        break;
    }
  }

  private async onSearchChange(value: string): Promise<void> {
    this.searchValue = value;
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

    this.scrollOnSearchResult();
  }

  private scrollOnSearchResult() {
    Utils.scrollIntoView(this.domSearchResultList || '');
  }

  private onPageTeamNewSelection(team: GenericTeam) {
    this.team = team;
    this.madSelectChange.emit({ genericTeam: this.team, tournamentGridId: this.tournamentGridId || null });
  }

  private onTeamSelected(team: GenericTeam) {
    this.onPageTeamNewSelection(team);
    this.closeDrawer();
  }

  private onTeamRadioChange(ev: CustomEvent): void {
    ev.stopPropagation();

    const detail = ev.detail as { item: SlMenuItem };
    const teamId = detail.item.dataset.teamId;

    const team: GenericTeam | undefined = this.suggested.find(candidate => candidate.id === Number(teamId));
    if (team) {
      this.onTeamSelected(team);
    }

    // TODO: warn
  }

  private openDrawer(): void {
    this.domDrawer.show();
    if (this.domInputSearch) {
      Utils.setFocus(this.domInputSearch);
    }
  }

  private closeDrawer(): void {
    this.domDrawer.hide();
  }

  public componentDidRender() {
    Utils.installEventHandler(this.domSearchResultList, 'sl-select', (ev: CustomEvent) => {
      ev.stopPropagation();
      this.onTeamRadioChange(ev);
    });

    Utils.installEventHandler(this.domDivBody, 'click', (ev: CustomEvent) => {
      ev.stopPropagation();
      this.openDrawer();
    });

    Utils.installEventHandler(this.domInputSearch, 'sl-input', (ev: CustomEvent) => {
      ev.stopPropagation();
      Utils.debounce('select-team-input-search', () => {
        this.onSearchChange(this.domInputSearch?.value || '');
      });
    });
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
            <mad-team-tile team={team}></mad-team-tile>

            <span slot="suffix">
              <sl-icon class="text-neutral text-4xl" name="arrow-right-circle"></sl-icon>
            </span>
          </sl-menu-item>
        ))}
      </sl-menu>
    );
  }

  private renderTeamSelection() {
    return (
      <div class="footer">
        {this.isLoading ? <sl-progress-bar indeterminate></sl-progress-bar> : null}
        <sl-card>
          <div slot="header">
            <h3>{this.isLoading ? 'Changement des équipes…' : `Recherche ton équipe. (${this.minNumberSearchLetter} lettres min)`}</h3>
          </div>
          <div>
            <div class="my-4">
              <sl-input
                ref={(el: SlInput) => {
                  this.domInputSearch = el;
                }}
                type="text"
                autocomplete="off"
                disabled={this.isLoading}
                placeholder="nom de d’équipe"
                autofocus
                size="medium"
              >
                <sl-icon name="search" slot="prefix"></sl-icon>
              </sl-input>
            </div>

            {this.suggested.length ? this.renderTeamResultList() : null}

            {this.searchValue?.length > 2 && !this.suggested.length ? (
              <sl-alert variant="warning" open>
                <sl-icon name="emoji-frown" slot="icon" class="text-6xl text-warning"></sl-icon>
                <span class="mx-2 text-2xl">Aucun résultat</span>
              </sl-alert>
            ) : null}
          </div>
        </sl-card>
      </div>
    );
  }
  render() {
    return (
      <Host
        class={{
          'cursor-pointer': true,
        }}
      >
        <sl-drawer
          ref={(el: SlDrawer) => {
            this.domDrawer = el;
          }}
          no-header
          placement="start"
        >
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
          {this.team?.id ? <mad-team-tile team={this.team}></mad-team-tile> : <span class="text-neutral text-sm">{this.placeholder}</span>}
        </div>
      </Host>
    );
  }
}
