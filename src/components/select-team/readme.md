# mad-select-team



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute            | Description | Type                                              | Default     |
| ------------------ | -------------------- | ----------- | ------------------------------------------------- | ----------- |
| `color`            | `color`              |             | `string`                                          | `undefined` |
| `label`            | `label`              |             | `string`                                          | `undefined` |
| `placeholder`      | `placeholder`        |             | `string`                                          | `undefined` |
| `tournamentGridId` | `tournament-grid-id` |             | `number \| undefined`                             | `undefined` |
| `type`             | `type`               |             | `"Basket" \| "Foot" \| "NBA" \| "NFL" \| "Rugby"` | `undefined` |
| `value`            | --                   |             | `GenericTeam`                                     | `undefined` |


## Events

| Event             | Description | Type                                  |
| ----------------- | ----------- | ------------------------------------- |
| `madSelectChange` |             | `CustomEvent<GridTeamOnUpdateDetail>` |


## Dependencies

### Used by

 - [grid-basket](../grid-basket)
 - [grid-default](../grid-default)

### Depends on

- [mad-team-tile](../team-tile)

### Graph
```mermaid
graph TD;
  mad-select-team --> mad-team-tile
  grid-basket --> mad-select-team
  grid-default --> mad-select-team
  style mad-select-team fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
