import { Component, Host, h } from "@stencil/core";
import router, { type Router } from "../../modules/router";

@Component({
  tag: "app-root",
  styleUrl: "app-root.css",
  shadow: false,
})
export class AppRoot {
  private readonly router: Router = router;

  constructor() {
    this.router.setRedirection({
      from: "/app/:anything",
      to: "/home",
    });

    this.router.setDefaultUrl("/home");
    this.router.setNotFoundUrl("/404");
  }

  render() {
    return (
      <Host>
        <mad-route component="page-home" url="/home" />
        <mad-route component="page-tournament-select" url="/tournaments" />
        <mad-route
          component="page-team-select"
          url="/team-select/:teamId/:teamType"
        />
        <mad-route
          component="page-tournament"
          url="/tournament/:tournamentId"
        />
        <mad-route component="page-match" url="/match/:tournamentId" />
        <mad-route component="page-404" url="/404" />
        <mad-route component="page-config" url="/config" />
      </Host>
    );
  }
}
