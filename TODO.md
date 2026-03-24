# TODO - État de la Session de Développement

## 1. Contexte du Projet

**Projet** : ContestOrganizer - Outil pour organiser et profiter des concours sportifs
**Technologie** : Migration Stencil → Vanilla Web Components
**Stack** : TypeScript, Shoelace, BaseElement pattern, Signals

Le projet migre progressivement les composants Stencil vers des Web Components Vanilla utilisant `BaseElement` et le pattern Signal.

---

## NFL CORS Issue (TODO)

### Bug Description

Team search for NFL tournaments fails due to CORS restrictions.

### Technical Details

- **File:** `src/modules/api-sports/api-sports.ts:84-85`
- **API Endpoint:** `https://v1.americanfootball.api-sports.io/`
- **Error:** Browser blocks cross-origin requests

### Root Cause

The NFL API endpoint may not return proper CORS headers:

- Missing `Access-Control-Allow-Origin` header
- Missing `Access-Control-Allow-Methods` header
- Missing `Access-Control-Allow-Headers` header

### Potential Solutions

1. **Proxy Server:** Route NFL requests through a backend proxy
2. **API Key Configuration:** Verify API key is correctly configured for NFL
3. **Alternative API:** Use a different NFL data source with CORS support
4. **Backend Integration:** Move API calls to server-side

### Files to Modify

- `src/modules/api-sports/api-sports.ts`
- `src/modules/api-sports/api-sports.constants.ts`
- Potentially: Backend proxy configuration

### Priority

Medium - Feature works for other tournament types (FOOT, NBA, BASKET, RUGBY)
