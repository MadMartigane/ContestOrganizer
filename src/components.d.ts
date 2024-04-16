/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { TournamentType, TournamentUpdateEvent } from "./modules/tournaments/tournaments.types";
import { InputChangeEventDetail } from "@ionic/core";
import { TeamRow } from "./modules/team-row/team-row";
import { GenericTeam } from "./modules/team-row/team-row.d";
import { GridTeamOnUpdateDetail } from "./modules/grid-common/grid-common.types";
import { GenericTeam as GenericTeam1, TournamentType as TournamentType1 } from "./components.d";
import { PageTeamSelectEventDatail } from "./components/page-team-select/page-team-select.d";
export { TournamentType, TournamentUpdateEvent } from "./modules/tournaments/tournaments.types";
export { InputChangeEventDetail } from "@ionic/core";
export { TeamRow } from "./modules/team-row/team-row";
export { GenericTeam } from "./modules/team-row/team-row.d";
export { GridTeamOnUpdateDetail } from "./modules/grid-common/grid-common.types";
export { GenericTeam as GenericTeam1, TournamentType as TournamentType1 } from "./components.d";
export { PageTeamSelectEventDatail } from "./components/page-team-select/page-team-select.d";
export namespace Components {
    interface AppRoot {
    }
    interface AppTabs {
    }
    interface GridBasket {
        "tournamentId": number | null;
    }
    interface GridDefault {
        "tournamentId": number | null;
    }
    interface MadInputNumber {
        "label"?: string;
        "max"?: number;
        "min"?: number;
        "placeholder": string;
        "readonly"?: boolean;
        "step"?: number;
        "value"?: number;
    }
    interface MadMatchTile {
        "hostPending": Promise<TeamRow | null>;
        "visitorPending": Promise<TeamRow | null>;
    }
    interface MadScorerBasket {
        "color": string;
        "label"?: string;
        "max"?: number;
        "min"?: number;
        "placeholder": string;
        "readonly"?: boolean;
        "value"?: number;
    }
    interface MadSelectTeam {
        "color": string;
        "label": string;
        "placeholder": string;
        "tournamentGridId"?: number;
        "type": TournamentType;
        "value": GenericTeam;
    }
    interface MadTeamTile {
        "reverse": Boolean | null;
        "team": GenericTeam1 | null;
    }
    interface PageHome {
    }
    interface PageMatch {
        "tournamentId": number;
    }
    interface PageTeamSelect {
        "teamId": string;
        "teamType": TournamentType1;
    }
    interface PageTournament {
        "tournamentId": number;
    }
    interface PageTournamentSelect {
    }
}
export interface GridBasketCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLGridBasketElement;
}
export interface GridDefaultCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLGridDefaultElement;
}
export interface MadInputNumberCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLMadInputNumberElement;
}
export interface MadScorerBasketCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLMadScorerBasketElement;
}
export interface MadSelectTeamCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLMadSelectTeamElement;
}
export interface PageTeamSelectCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLPageTeamSelectElement;
}
declare global {
    interface HTMLAppRootElement extends Components.AppRoot, HTMLStencilElement {
    }
    var HTMLAppRootElement: {
        prototype: HTMLAppRootElement;
        new (): HTMLAppRootElement;
    };
    interface HTMLAppTabsElement extends Components.AppTabs, HTMLStencilElement {
    }
    var HTMLAppTabsElement: {
        prototype: HTMLAppTabsElement;
        new (): HTMLAppTabsElement;
    };
    interface HTMLGridBasketElementEventMap {
        "gridTournamentChange": TournamentUpdateEvent;
    }
    interface HTMLGridBasketElement extends Components.GridBasket, HTMLStencilElement {
        addEventListener<K extends keyof HTMLGridBasketElementEventMap>(type: K, listener: (this: HTMLGridBasketElement, ev: GridBasketCustomEvent<HTMLGridBasketElementEventMap[K]>) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof HTMLGridBasketElementEventMap>(type: K, listener: (this: HTMLGridBasketElement, ev: GridBasketCustomEvent<HTMLGridBasketElementEventMap[K]>) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    }
    var HTMLGridBasketElement: {
        prototype: HTMLGridBasketElement;
        new (): HTMLGridBasketElement;
    };
    interface HTMLGridDefaultElementEventMap {
        "gridTournamentChange": TournamentUpdateEvent;
    }
    interface HTMLGridDefaultElement extends Components.GridDefault, HTMLStencilElement {
        addEventListener<K extends keyof HTMLGridDefaultElementEventMap>(type: K, listener: (this: HTMLGridDefaultElement, ev: GridDefaultCustomEvent<HTMLGridDefaultElementEventMap[K]>) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof HTMLGridDefaultElementEventMap>(type: K, listener: (this: HTMLGridDefaultElement, ev: GridDefaultCustomEvent<HTMLGridDefaultElementEventMap[K]>) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    }
    var HTMLGridDefaultElement: {
        prototype: HTMLGridDefaultElement;
        new (): HTMLGridDefaultElement;
    };
    interface HTMLMadInputNumberElementEventMap {
        "madNumberChange": InputChangeEventDetail;
    }
    interface HTMLMadInputNumberElement extends Components.MadInputNumber, HTMLStencilElement {
        addEventListener<K extends keyof HTMLMadInputNumberElementEventMap>(type: K, listener: (this: HTMLMadInputNumberElement, ev: MadInputNumberCustomEvent<HTMLMadInputNumberElementEventMap[K]>) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof HTMLMadInputNumberElementEventMap>(type: K, listener: (this: HTMLMadInputNumberElement, ev: MadInputNumberCustomEvent<HTMLMadInputNumberElementEventMap[K]>) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    }
    var HTMLMadInputNumberElement: {
        prototype: HTMLMadInputNumberElement;
        new (): HTMLMadInputNumberElement;
    };
    interface HTMLMadMatchTileElement extends Components.MadMatchTile, HTMLStencilElement {
    }
    var HTMLMadMatchTileElement: {
        prototype: HTMLMadMatchTileElement;
        new (): HTMLMadMatchTileElement;
    };
    interface HTMLMadScorerBasketElementEventMap {
        "madNumberChange": InputChangeEventDetail;
    }
    interface HTMLMadScorerBasketElement extends Components.MadScorerBasket, HTMLStencilElement {
        addEventListener<K extends keyof HTMLMadScorerBasketElementEventMap>(type: K, listener: (this: HTMLMadScorerBasketElement, ev: MadScorerBasketCustomEvent<HTMLMadScorerBasketElementEventMap[K]>) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof HTMLMadScorerBasketElementEventMap>(type: K, listener: (this: HTMLMadScorerBasketElement, ev: MadScorerBasketCustomEvent<HTMLMadScorerBasketElementEventMap[K]>) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    }
    var HTMLMadScorerBasketElement: {
        prototype: HTMLMadScorerBasketElement;
        new (): HTMLMadScorerBasketElement;
    };
    interface HTMLMadSelectTeamElementEventMap {
        "madSelectChange": GridTeamOnUpdateDetail;
    }
    interface HTMLMadSelectTeamElement extends Components.MadSelectTeam, HTMLStencilElement {
        addEventListener<K extends keyof HTMLMadSelectTeamElementEventMap>(type: K, listener: (this: HTMLMadSelectTeamElement, ev: MadSelectTeamCustomEvent<HTMLMadSelectTeamElementEventMap[K]>) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof HTMLMadSelectTeamElementEventMap>(type: K, listener: (this: HTMLMadSelectTeamElement, ev: MadSelectTeamCustomEvent<HTMLMadSelectTeamElementEventMap[K]>) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    }
    var HTMLMadSelectTeamElement: {
        prototype: HTMLMadSelectTeamElement;
        new (): HTMLMadSelectTeamElement;
    };
    interface HTMLMadTeamTileElement extends Components.MadTeamTile, HTMLStencilElement {
    }
    var HTMLMadTeamTileElement: {
        prototype: HTMLMadTeamTileElement;
        new (): HTMLMadTeamTileElement;
    };
    interface HTMLPageHomeElement extends Components.PageHome, HTMLStencilElement {
    }
    var HTMLPageHomeElement: {
        prototype: HTMLPageHomeElement;
        new (): HTMLPageHomeElement;
    };
    interface HTMLPageMatchElement extends Components.PageMatch, HTMLStencilElement {
    }
    var HTMLPageMatchElement: {
        prototype: HTMLPageMatchElement;
        new (): HTMLPageMatchElement;
    };
    interface HTMLPageTeamSelectElementEventMap {
        "pageTeamNewSelection": PageTeamSelectEventDatail;
    }
    interface HTMLPageTeamSelectElement extends Components.PageTeamSelect, HTMLStencilElement {
        addEventListener<K extends keyof HTMLPageTeamSelectElementEventMap>(type: K, listener: (this: HTMLPageTeamSelectElement, ev: PageTeamSelectCustomEvent<HTMLPageTeamSelectElementEventMap[K]>) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof HTMLPageTeamSelectElementEventMap>(type: K, listener: (this: HTMLPageTeamSelectElement, ev: PageTeamSelectCustomEvent<HTMLPageTeamSelectElementEventMap[K]>) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    }
    var HTMLPageTeamSelectElement: {
        prototype: HTMLPageTeamSelectElement;
        new (): HTMLPageTeamSelectElement;
    };
    interface HTMLPageTournamentElement extends Components.PageTournament, HTMLStencilElement {
    }
    var HTMLPageTournamentElement: {
        prototype: HTMLPageTournamentElement;
        new (): HTMLPageTournamentElement;
    };
    interface HTMLPageTournamentSelectElement extends Components.PageTournamentSelect, HTMLStencilElement {
    }
    var HTMLPageTournamentSelectElement: {
        prototype: HTMLPageTournamentSelectElement;
        new (): HTMLPageTournamentSelectElement;
    };
    interface HTMLElementTagNameMap {
        "app-root": HTMLAppRootElement;
        "app-tabs": HTMLAppTabsElement;
        "grid-basket": HTMLGridBasketElement;
        "grid-default": HTMLGridDefaultElement;
        "mad-input-number": HTMLMadInputNumberElement;
        "mad-match-tile": HTMLMadMatchTileElement;
        "mad-scorer-basket": HTMLMadScorerBasketElement;
        "mad-select-team": HTMLMadSelectTeamElement;
        "mad-team-tile": HTMLMadTeamTileElement;
        "page-home": HTMLPageHomeElement;
        "page-match": HTMLPageMatchElement;
        "page-team-select": HTMLPageTeamSelectElement;
        "page-tournament": HTMLPageTournamentElement;
        "page-tournament-select": HTMLPageTournamentSelectElement;
    }
}
declare namespace LocalJSX {
    interface AppRoot {
    }
    interface AppTabs {
    }
    interface GridBasket {
        "onGridTournamentChange"?: (event: GridBasketCustomEvent<TournamentUpdateEvent>) => void;
        "tournamentId"?: number | null;
    }
    interface GridDefault {
        "onGridTournamentChange"?: (event: GridDefaultCustomEvent<TournamentUpdateEvent>) => void;
        "tournamentId"?: number | null;
    }
    interface MadInputNumber {
        "label"?: string;
        "max"?: number;
        "min"?: number;
        "onMadNumberChange"?: (event: MadInputNumberCustomEvent<InputChangeEventDetail>) => void;
        "placeholder"?: string;
        "readonly"?: boolean;
        "step"?: number;
        "value"?: number;
    }
    interface MadMatchTile {
        "hostPending"?: Promise<TeamRow | null>;
        "visitorPending"?: Promise<TeamRow | null>;
    }
    interface MadScorerBasket {
        "color"?: string;
        "label"?: string;
        "max"?: number;
        "min"?: number;
        "onMadNumberChange"?: (event: MadScorerBasketCustomEvent<InputChangeEventDetail>) => void;
        "placeholder"?: string;
        "readonly"?: boolean;
        "value"?: number;
    }
    interface MadSelectTeam {
        "color"?: string;
        "label"?: string;
        "onMadSelectChange"?: (event: MadSelectTeamCustomEvent<GridTeamOnUpdateDetail>) => void;
        "placeholder"?: string;
        "tournamentGridId"?: number;
        "type"?: TournamentType;
        "value"?: GenericTeam;
    }
    interface MadTeamTile {
        "reverse"?: Boolean | null;
        "team"?: GenericTeam1 | null;
    }
    interface PageHome {
    }
    interface PageMatch {
        "tournamentId"?: number;
    }
    interface PageTeamSelect {
        "onPageTeamNewSelection"?: (event: PageTeamSelectCustomEvent<PageTeamSelectEventDatail>) => void;
        "teamId"?: string;
        "teamType"?: TournamentType1;
    }
    interface PageTournament {
        "tournamentId"?: number;
    }
    interface PageTournamentSelect {
    }
    interface IntrinsicElements {
        "app-root": AppRoot;
        "app-tabs": AppTabs;
        "grid-basket": GridBasket;
        "grid-default": GridDefault;
        "mad-input-number": MadInputNumber;
        "mad-match-tile": MadMatchTile;
        "mad-scorer-basket": MadScorerBasket;
        "mad-select-team": MadSelectTeam;
        "mad-team-tile": MadTeamTile;
        "page-home": PageHome;
        "page-match": PageMatch;
        "page-team-select": PageTeamSelect;
        "page-tournament": PageTournament;
        "page-tournament-select": PageTournamentSelect;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "app-root": LocalJSX.AppRoot & JSXBase.HTMLAttributes<HTMLAppRootElement>;
            "app-tabs": LocalJSX.AppTabs & JSXBase.HTMLAttributes<HTMLAppTabsElement>;
            "grid-basket": LocalJSX.GridBasket & JSXBase.HTMLAttributes<HTMLGridBasketElement>;
            "grid-default": LocalJSX.GridDefault & JSXBase.HTMLAttributes<HTMLGridDefaultElement>;
            "mad-input-number": LocalJSX.MadInputNumber & JSXBase.HTMLAttributes<HTMLMadInputNumberElement>;
            "mad-match-tile": LocalJSX.MadMatchTile & JSXBase.HTMLAttributes<HTMLMadMatchTileElement>;
            "mad-scorer-basket": LocalJSX.MadScorerBasket & JSXBase.HTMLAttributes<HTMLMadScorerBasketElement>;
            "mad-select-team": LocalJSX.MadSelectTeam & JSXBase.HTMLAttributes<HTMLMadSelectTeamElement>;
            "mad-team-tile": LocalJSX.MadTeamTile & JSXBase.HTMLAttributes<HTMLMadTeamTileElement>;
            "page-home": LocalJSX.PageHome & JSXBase.HTMLAttributes<HTMLPageHomeElement>;
            "page-match": LocalJSX.PageMatch & JSXBase.HTMLAttributes<HTMLPageMatchElement>;
            "page-team-select": LocalJSX.PageTeamSelect & JSXBase.HTMLAttributes<HTMLPageTeamSelectElement>;
            "page-tournament": LocalJSX.PageTournament & JSXBase.HTMLAttributes<HTMLPageTournamentElement>;
            "page-tournament-select": LocalJSX.PageTournamentSelect & JSXBase.HTMLAttributes<HTMLPageTournamentSelectElement>;
        }
    }
}
