# Деплой: GitHub Pages + API

## 1. GitHub Pages (фронтенд)

Репозиторий: `KurbanN/photo-gallery` → сайт: **https://kurbann.github.io/photo-gallery/**

После push в `main` workflow `.github/workflows/deploy-pages.yml` собирает Vite и публикует `dist`.

### Почему в консоли 404 на `/api/...`

GitHub Pages — **только статика**. Без `VITE_API_BASE_URL` браузер бьёт в `https://kurbann.github.io/api/...` и получает 404.
Нужен отдельный хост для Express (шаг 2 ниже) и переменная с его URL.

### Один раз в настройках GitHub

1. **Settings → Pages → Build and deployment → Source:** `GitHub Actions`
2. **Settings → Secrets and variables → Actions → Variables** (не Secrets для публичных ключей Supabase):

| Variable | Пример |
|----------|--------|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | anon key из Supabase |
| `VITE_API_BASE_URL` | URL вашего API без слэша в конце, напр. `https://photo-gallery-api.onrender.com` |

3. **Supabase → Authentication → URL Configuration** (важно для magic link):
   - **Site URL:** `https://kurbann.github.io/photo-gallery` (не `http://localhost:3000` — иначе письмо ведёт на localhost)
   - **Redirect URLs** (каждый URL отдельной строкой):
     - `https://kurbann.github.io/photo-gallery/dashboard`
     - `http://localhost:5174/photo-gallery/dashboard` (если локально с base path)
     - `http://localhost:5174/dashboard` (vite dev, если base `/`)
4. В `public/app-config.json` укажите `"appUrl": "https://kurbann.github.io/photo-gallery"` — тогда ссылка в письме всегда на прод, даже если форму открыли с localhost.

5. На сервере API задайте `APP_PUBLIC_URL=https://kurbann.github.io/photo-gallery` и  
   `ALLOWED_ORIGINS=https://kurbann.github.io,https://kurbann.github.io/photo-gallery`

### Проверка

- Откройте Actions → «Deploy to GitHub Pages» → зелёный deploy
- Откройте https://kurbann.github.io/photo-gallery/
- Гость: `/e/{slug}` (QR ведёт сюда)

## 2. API (Express) — обязательно для гостей и кабинета

GitHub Pages отдаёт только статику. Бэкенд нужен отдельно (Render, Fly, Railway, VPS).

### Render (рекомендуется)

1. [render.com](https://render.com) → **New → Web Service** → репозиторий `photo-gallery`
2. **Root Directory** пусто, **Build Command:** `npm ci && npm run build`, **Start Command:** `npm start`
3. **Environment** (из `.env` локально / Supabase dashboard):

   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET=wedding-photos`
   - `APP_PUBLIC_URL=https://kurbann.github.io/photo-gallery`
   - `ALLOWED_ORIGINS=https://kurbann.github.io,https://kurbann.github.io/photo-gallery`

4. После деплоя скопируйте URL сервиса (например `https://photo-gallery-api.onrender.com`) в GitHub **Variable** `VITE_API_BASE_URL`
5. **Actions → Deploy to GitHub Pages → Run workflow** (пересборка фронта)

Или используйте `render.yaml` в корне репозитория (Blueprint).

Минимальные переменные на хосте API:

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET`
- `APP_PUBLIC_URL=https://kurbann.github.io/photo-gallery`
- `ALLOWED_ORIGINS=...` (см. выше)
- `PORT` (часто задаётся платформой)

Сборка: `npm run build` → старт: `npm start`

После деплоя API подставьте его URL в `VITE_API_BASE_URL` и перезапустите workflow Pages (push или **Actions → Run workflow**).
