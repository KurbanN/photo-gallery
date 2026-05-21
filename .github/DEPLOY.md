# Деплой: GitHub Pages + API

## 1. GitHub Pages (фронтенд)

Репозиторий: `KurbanN/photo-gallery` → сайт: **https://kurbann.github.io/photo-gallery/**

После push в `main` workflow `.github/workflows/deploy-pages.yml` собирает Vite и публикует `dist`.

### Один раз в настройках GitHub

1. **Settings → Pages → Build and deployment → Source:** `GitHub Actions`
2. **Settings → Secrets and variables → Actions → Variables** (не Secrets для публичных ключей Supabase):

| Variable | Пример |
|----------|--------|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | anon key из Supabase |
| `VITE_API_BASE_URL` | URL вашего API без слэша в конце, напр. `https://photo-gallery-api.onrender.com` |

3. **Supabase → Authentication → URL Configuration → Redirect URLs** добавьте:
   - `https://kurbann.github.io/photo-gallery/dashboard`
   - `http://localhost:5174/dashboard` (локально)

4. На сервере API задайте `APP_PUBLIC_URL=https://kurbann.github.io/photo-gallery` и  
   `ALLOWED_ORIGINS=https://kurbann.github.io,https://kurbann.github.io/photo-gallery`

### Проверка

- Откройте Actions → «Deploy to GitHub Pages» → зелёный deploy
- Откройте https://kurbann.github.io/photo-gallery/
- Гость: `/e/{slug}` (QR ведёт сюда)

## 2. API (Express)

GitHub Pages отдаёт только статику. Бэкенд нужен отдельно (Render, Fly, Railway, VPS).

Минимальные переменные на хосте API:

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET`
- `APP_PUBLIC_URL=https://kurbann.github.io/photo-gallery`
- `ALLOWED_ORIGINS=...` (см. выше)
- `PORT` (часто задаётся платформой)

Сборка: `npm run build` → старт: `npm start`

После деплоя API подставьте его URL в `VITE_API_BASE_URL` и перезапустите workflow Pages (push или **Actions → Run workflow**).
