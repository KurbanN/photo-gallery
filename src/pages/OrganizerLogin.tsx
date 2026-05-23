import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { APP_BRAND, usePageTitle } from '@/lib/brand';
import { createClient } from '@/lib/supabase/client';

function formatAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('email not confirmed')) {
    return (
      'Supabase требует подтверждение почты. Отключите: Authentication → Providers → Email → ' +
      'снимите «Confirm email», затем войдите снова или зарегистрируйтесь заново.'
    );
  }
  if (m.includes('invalid login credentials') || m.includes('invalid credentials')) {
    return 'Неверный email или пароль. Если вы новый пользователь — вкладка «Регистрация».';
  }
  if (m.includes('user already registered')) {
    return 'Этот email уже зарегистрирован — войдите с паролем.';
  }
  if (m.includes('password') && m.includes('short')) {
    return 'Пароль слишком короткий (минимум 6 символов в Supabase).';
  }
  if (m.includes('signup disabled') || m.includes('signups not allowed')) {
    return 'Регистрация отключена в Supabase. Включите Email в Authentication → Providers.';
  }
  return message;
}

export default function OrganizerLogin() {
  usePageTitle('Вход');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/dashboard', { replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate('/dashboard', { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const trimmed = email.trim();
      if (mode === 'register') {
        const { data, error: err } = await supabase.auth.signUp({
          email: trimmed,
          password,
        });
        if (err) throw err;
        if (data.session) return;
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: trimmed,
          password,
        });
        if (signInErr) {
          throw new Error(
            'Аккаунт создан, но вход не выполнен. В Supabase отключите «Confirm email» или подтвердите почту.',
          );
        }
        return;
      }
      const { error: err } = await supabase.auth.signInWithPassword({
        email: trimmed,
        password,
      });
      if (err) throw err;
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Ошибка';
      setError(formatAuthError(raw));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-xs uppercase tracking-[0.2em] text-muted hover:text-ink">
          ← На главную
        </Link>
        <p className="font-serif text-2xl mt-6 mb-1">{APP_BRAND}</p>
        <h1 className="text-sm uppercase tracking-[0.2em] text-muted mb-4">Кабинет организатора</h1>
        <p className="text-sm text-muted mb-4">
          {mode === 'login'
            ? 'Вход по email и паролю — без писем и ссылок.'
            : 'Создайте аккаунт. Доступ к мероприятиям выдаёт администратор.'}
        </p>
        <div className="flex gap-2 mb-6 text-[10px] uppercase tracking-[0.15em]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={mode === 'login' ? 'text-ink border-b border-ink' : 'text-muted'}
          >
            Вход
          </button>
          <span className="text-muted">·</span>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={mode === 'register' ? 'text-ink border-b border-ink' : 'text-muted'}
          >
            Регистрация
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="w-full border border-line px-3 py-3"
            autoComplete="email"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'register' ? 'Пароль (от 6 символов)' : 'Пароль'}
            className="w-full border border-line px-3 py-3"
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          />
          {error && <p className="text-sm text-red-700 leading-relaxed">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-paper py-3 text-xs uppercase tracking-[0.2em] flex justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>
      </div>
    </div>
  );
}
