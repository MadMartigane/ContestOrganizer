// Runtime config - values replaced at deploy time by scripts/deploy.sh
// In dev: values come from .env via Vite
// In prod: values are injected by deploy script
export const API_SPORTS_KEY = import.meta.env.VITE_API_SPORTS_KEY ?? "";
