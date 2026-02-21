# page-match



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description | Type     | Default     |
| -------------- | --------------- | ----------- | -------- | ----------- |
| `tournamentId` | `tournament-id` |             | `number` | `undefined` |


## Dependencies

### Depends on

- [mad-scorer-basket](../scorer-basket)
- [mad-scorer-common](../scorer-common)
- [mad-scorer-rugby](../scorer-rugby)
- [mad-match-tile](../match-tile)
- [mad-team-tile](../team-tile)
- [error-message](../error-message)

### Graph
```mermaid
graph TD;
  page-match --> mad-scorer-basket
  page-match --> mad-scorer-common
  page-match --> mad-scorer-rugby
  page-match --> mad-match-tile
  page-match --> mad-team-tile
  page-match --> error-message
  mad-match-tile --> mad-team-tile
  style page-match fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
