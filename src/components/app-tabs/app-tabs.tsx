import { Component, h, State } from '@stencil/core';
import tournaments from '../../modules/tournaments/tournaments';

@Component({
  tag: 'app-tabs',
  styleUrl: 'app-tabs.css',
  shadow: false,
})
export class AppTabs {
  private readonly tournaments: typeof tournaments;

  @State() private numberOfTournaments: number;

  constructor() {
    this.tournaments = tournaments;
    this.numberOfTournaments = tournaments.length;

    this.tournaments.onUpdate(() => {
      this.numberOfTournaments = tournaments.length;
    });
  }

  render() {
    return (
      <ion-tabs>
        <ion-tab tab="tab-home">
          <ion-nav></ion-nav>
        </ion-tab>
        <ion-tab tab="tab-tournament-select">
          <ion-nav></ion-nav>
        </ion-tab>
        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="tab-home">
            <mad-icon name="home" primary m></mad-icon>
            <p>Home</p>
          </ion-tab-button>
          <ion-tab-button tab="tab-tournament-select">
            <mad-icon name="trophy" primary m></mad-icon>
            <ion-badge color="warning">{this.numberOfTournaments}</ion-badge>
            <p>Tournois</p>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    );
  }
}
