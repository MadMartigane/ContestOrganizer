export interface AppConfig {
  API_SPORTS_KEY: string;
}

declare global {
  interface Window {
    APP_CONFIG?: AppConfig;
  }
}
