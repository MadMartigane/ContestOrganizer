import { Component, h, Host } from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: false,
})
export class AppRoot {
  render() {
    return (
      <Host>
        <mad-route url="/home" component="page-home"></mad-route>
        <mad-route url="/tournaments" component="page-tournament-select"></mad-route>
        <mad-route url="/team-select/:teamId/:teamType" component="page-team-select"></mad-route>
        <mad-route url="/tournament/:tournamentId" component="page-tournament"></mad-route>
        <mad-route url="/match/:tournamentId" component="page-match"></mad-route>
      </Host>
    );
  }
}
