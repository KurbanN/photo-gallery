# Деплой на обычный хостинг (PS.KZ, Apache/Nginx)

## Стек проекта

| Слой | Технология |
|------|------------|
| Фронтенд | **React 19** + **TypeScript** + **Vite 6** |
| Стили | **Tailwind CSS 4** |
| Маршрутизация | **React Router 7** (`BrowserRouter`) |
| Бэкенд (отдельно) | **Express** (Node) — **не загружается на PS.KZ** |
| БД и файлы | **Supabase** |

На PS.KZ размещается **только статический фронтенд** из папки `dist/`.  
API остаётся на Railway/Render/VPS; без него гости не смогут загружать фото.

---

## Почему в корневом `index.html` есть `/src/main.tsx`

Файл `index.html` в корне репозитория — **шаблон для режима разработки** (`npm run dev`).  
Vite подставляет этот скрипт, чтобы в dev грузились исходники с HMR.

При **production-сборке** Vite:

1. компилирует `src/main.tsx` в бандлы;
2. перезаписывает `dist/index.html`;
3. подключает JS/CSS из `dist/assets/*.js` и `*.css`.

Если на сайте в браузере видно `/src/main.tsx` — на хостинг загружен **исходный** `index.html`, а не содержимое папки **`dist/`**.

---

## Сборка для allmemories.live (корень домена)

На своём компьютере (нужен [Node.js](https://nodejs.org/) LTS):

```bash
cd d:\Project\photo-gallery
npm ci
```

Перед сборкой проверьте `public/app-config.json`:

```json
{
  "supabaseUrl": "https://....supabase.co",
  "supabasePublishableKey": "sb_publishable_...",
  "apiBaseUrl": "https://ваш-api.railway.app",
  "appUrl": "https://allmemories.live"
}
```

Сборка (базовый путь `/` — сайт в корне домена):

**Windows (PowerShell):**

```powershell
$env:VITE_BASE_PATH="/"
$env:VITE_APP_URL="https://allmemories.live"
npm run build:hosting
```

**macOS / Linux:**

```bash
VITE_BASE_PATH=/ VITE_APP_URL=https://allmemories.live npm run build:hosting
```

Опционально можно задать переменные при сборке вместо `app-config.json`:

```bash
VITE_SUPABASE_URL=... VITE_SUPABASE_PUBLISHABLE_KEY=... VITE_API_BASE_URL=... npm run build:hosting
```

### Результат сборки

| Параметр | Значение |
|----------|----------|
| Команда | `npm run build:hosting` |
| Папка для загрузки | **`dist/`** (полный путь: `d:\Project\photo-gallery\dist`) |
| Куда на PS.KZ | содержимое `dist/` → **`httpdocs/`** (или `public_html/`) |

После сборки в `dist/index.html` должны быть ссылки вида `/assets/index-xxxxx.js`, **без** `/src/main.tsx`.

---

## Что загрузить в httpdocs на PS.KZ

Загрузите **всё содержимое** папки `dist/`, а не саму папку `dist` как подкаталог:

```
httpdocs/
  index.html
  404.html              ← копия index.html (запас для SPA)
  .htaccess             ← правила Apache для React Router
  app-config.json       ← Supabase + URL API
  assets/
    index-xxxxxxxx.js
    index-xxxxxxxx.css
  demo-photos/          ← если есть демо-картинки
  … (остальные файлы из public/: favicon, landing/, qr-ornaments/, …)
```

**Не загружайте:** `src/`, `server/`, `node_modules/`, корневой `index.html` из репозитория, `package.json`.

### Проверка после загрузки

1. Откройте https://allmemories.live/ — лендинг без ошибок в консоли.
2. В DevTools → Network: скрипты грузятся из `/assets/`, не из `/src/`.
3. Прямая ссылка https://allmemories.live/dashboard/login открывается (не 404 Apache).
4. Гость: https://allmemories.live/e/demo (если настроено демо).

---

## Настройка сервера

### Apache (.htaccess)

В репозитории уже есть `public/.htaccess` — он копируется в `dist/.htaccess` при сборке.

Нужно, чтобы на PS.KZ был включён **mod_rewrite** (обычно включён).  
В панели хостинга: корень сайта = `httpdocs`, индексный файл `index.html`.

Если deep links дают 404 — проверьте, что `.htaccess` загружен (файлы с точкой иногда скрыты в FTP).

### Nginx (если PS.KZ отдаёт Nginx)

В конфиг виртуального хоста:

```nginx
root /path/to/httpdocs;
index index.html;

location / {
    try_files $uri $uri/ /index.html;
}

location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## API и Supabase (обязательно вне PS.KZ)

Фронт на PS.KZ **не заменяет** бэкенд.

1. **API** (Railway / Render / VPS): переменные окружения:
   - `APP_PUBLIC_URL=https://allmemories.live`
   - `ALLOWED_ORIGINS=https://allmemories.live,https://www.allmemories.live`
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET`

2. **Supabase → Authentication → URL Configuration:**
   - **Site URL:** `https://allmemories.live`
   - **Redirect URLs:** `https://allmemories.live/dashboard`, `https://allmemories.live/dashboard/login`

3. В `public/app-config.json` поле **`apiBaseUrl`** — URL вашего API без слэша в конце.

---

## Другие сценарии

| Сценарий | Команда | `VITE_BASE_PATH` |
|----------|---------|------------------|
| PS.KZ, домен в корне | `npm run build:hosting` | `/` |
| GitHub Pages `/photo-gallery/` | `npm run build:pages` | `/photo-gallery/` |
| Локальная проверка сборки | `npm run preview` | как при сборке |

Подробности API + GitHub Pages: [.github/DEPLOY.md](.github/DEPLOY.md).

---

## Краткая шпаргалка

```powershell
npm ci
$env:VITE_BASE_PATH="/"
$env:VITE_APP_URL="https://allmemories.live"
npm run build:hosting
```

→ Загрузить **`d:\Project\photo-gallery\dist\*`** в **`httpdocs/`** на PS.KZ.
