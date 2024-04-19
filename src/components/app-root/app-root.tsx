import { Component, h, Host, State } from '@stencil/core';
import { Router } from '../../modules/router/';
import router from '../../modules/router/';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: false,
})
export class AppRoot {
  private readonly ionicApp: boolean = true;
  private readonly router: Router = router;

  @State() private route: string;

  constructor() {
    this.route = this.router.route;
  }

  private renderIonicApp() {
    return (
      <ion-app>
        <ion-router useHash={true}>
          <ion-route-redirect from="/" to="/home"></ion-route-redirect>
          <ion-route url="/home" component="page-home"></ion-route>
          <ion-route url="/tournaments" component="page-tournament-select"></ion-route>
          <ion-route url="/team-select/:teamId/:teamType" component="page-team-select"></ion-route>
          <ion-route url="/tournament/:tournamentId" component="page-tournament"></ion-route>
          <ion-route url="/match/:tournamentId" component="page-match"></ion-route>
        </ion-router>
        <ion-nav></ion-nav>
      </ion-app>
    );
  }

  private renderStencilApp() {
    return <div>{this?.route && this.router.match('/home') ? <page-home></page-home> : null}</div>;
  }

  render() {
    return <Host>{this.ionicApp ? this.renderIonicApp() : this.renderStencilApp()}</Host>;
  }
}
