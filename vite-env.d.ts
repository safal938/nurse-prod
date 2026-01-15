/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WS_SIMULATION_BASE_URL: string;
  readonly VITE_WS_REALTIME_BASE_URL: string;
  readonly GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
