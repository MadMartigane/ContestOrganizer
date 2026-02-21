# page-tournament



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description | Type     | Default     |
| -------------- | --------------- | ----------- | -------- | ----------- |
| `tournamentId` | `tournament-id` |             | `number` | `undefined` |


## Dependencies

### Depends on

- [grid-basket](../grid-basket)
- [grid-default](../grid-default)
- [error-message](../error-message)
- [mad-input-number](../input-number)

### Graph
```mermaid
graph TD;
  page-tournament --> grid-basket
  page-tournament --> grid-default
  page-tournament --> error-message
  page-tournament --> mad-input-number
  grid-basket --> mad-select-team
  mad-select-team --> mad-team-tile
  grid-default --> mad-select-team
  style page-tournament fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
