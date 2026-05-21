export type AppRuntimeConfig = {
  supabaseUrl: string;
  supabasePublishableKey: string;
  apiBaseUrl?: string;
};

let loaded: AppRuntimeConfig | null = null;

function fromViteEnv(): AppRuntimeConfig | null {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!supabaseUrl || !supabasePublishableKey) return null;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '');
  return {
    supabaseUrl,
    supabasePublishableKey,
    ...(apiBaseUrl ? { apiBaseUrl } : {}),
  };
}

/** Вызывается один раз при старте приложения (см. main.tsx). */
export async function loadRuntimeConfig(): Promise<AppRuntimeConfig> {
  if (loaded) return loaded;

  const fromEnv = fromViteEnv();
  if (fromEnv) {
    loaded = fromEnv;
    return loaded;
  }

  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const res = await fetch(`${base}app-config.json`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(
      'Нет настроек Supabase: задайте VITE_SUPABASE_* при сборке или положите public/app-config.json',
    );
  }
  const json = (await res.json()) as Partial<AppRuntimeConfig>;
  if (!json.supabaseUrl?.trim() || !json.supabasePublishableKey?.trim()) {
    throw new Error('app-config.json: нужны supabaseUrl и supabasePublishableKey');
  }
  loaded = {
    supabaseUrl: json.supabaseUrl.trim(),
    supabasePublishableKey: json.supabasePublishableKey.trim(),
    apiBaseUrl: json.apiBaseUrl?.trim().replace(/\/+$/, ''),
  };
  return loaded;
}

export function getRuntimeConfig(): AppRuntimeConfig {
  if (!loaded) {
    throw new Error('Конфиг не загружен. Вызовите loadRuntimeConfig() до createClient().');
  }
  return loaded;
}
