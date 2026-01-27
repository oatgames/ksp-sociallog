/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_AUTH_TOKEN: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_INVENTORY_URL: string;
  readonly VITE_KK_API_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
