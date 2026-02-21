# grid-default



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description | Type             | Default     |
| -------------- | --------------- | ----------- | ---------------- | ----------- |
| `tournamentId` | `tournament-id` |             | `null \| number` | `undefined` |


## Events

| Event                  | Description | Type                                 |
| ---------------------- | ----------- | ------------------------------------ |
| `gridTournamentChange` |             | `CustomEvent<TournamentUpdateEvent>` |


## Dependencies

### Used by

 - [page-tournament](../page-tournament)

### Depends on

- [mad-select-team](../select-team)

### Graph
```mermaid
graph TD;
  grid-default --> mad-select-team
  mad-select-team --> mad-team-tile
  page-tournament --> grid-default
  style grid-default fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
