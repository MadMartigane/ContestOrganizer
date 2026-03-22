# Configuration Management

## The Dichotomy
- **Development**: Uses Vite middleware in `vite.config.ts` to serve `config.js` dynamically.
- **Production/Pre-prod**: Uses `scripts/deploy.sh` to generate a static `www/config.js` file.

## Data Flow
- `window.APP_CONFIG` is populated by `/config.js`.
- `src/modules/api-sports/api-sports.constants.ts` reads from `window.APP_CONFIG`.

## Checklist for New Variables
1. Add variable to `REQUIRED_KEYS` in `scripts/deploy.sh`.
2. Update `vite.config.ts` middleware to include the new variable.
3. Update `src/types/config.d.ts` if necessary.

## @LLM-WARNING
If you modify configuration, you MUST update both `vite.config.ts` and `scripts/deploy.sh` to maintain parity.
