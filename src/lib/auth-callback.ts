import { createClient } from './supabase/client';

function dashboardPath(): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}dashboard`.replace(/\/{2,}/g, '/');
}

/** Обменивает ?code= из письма на сессию и убирает код из адресной строки. */
export async function handleAuthCallbackFromUrl(): Promise<boolean> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) return false;

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;

  const target = dashboardPath();
  window.history.replaceState({}, '', target);
  return true;
}
