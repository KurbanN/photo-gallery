import { createBrowserClient } from '@supabase/ssr';
import { getRuntimeConfig } from '../runtime-config';

/**
 * Клиент Supabase для браузера (publishable / anon key).
 * Конфиг: VITE_* при сборке или public/app-config.json на GitHub Pages.
 */
export function createClient() {
  const { supabaseUrl, supabasePublishableKey } = getRuntimeConfig();
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
