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
            <sl-icon name="house" class="icon-xl"></sl-icon>
            <ion-label color="dark">Home</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="tab-tournament-select">
            <sl-icon name="trophy" class="icon-xl"></sl-icon>
            <ion-badge color="warning">{this.numberOfTournaments}</ion-badge>
            <ion-label color="dark">Tournois</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    );
  }
}
