/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FEEDBACK_API?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
