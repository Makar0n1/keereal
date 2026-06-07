# Сайт-портфолио с админ-конструктором

Production-ready портфолио фриланс-разработчика на **Next.js 15 (App Router) + PostgreSQL + Prisma + Tailwind**. Публичная часть рендерится на сервере (SSR/SSG + ISR) — боты получают готовый HTML. Админка — конструктор страниц из блоков (виджетов).

## Возможности

- **Публичная часть** (тёмная тема, mobile-first, SSR/SSG): главная, `/projects`, `/projects/[slug]`, `/about`, `/contact`, кастомная 404.
- **Конструктор страниц**: каждая страница кейса — упорядоченный массив блоков в БД. 13 виджетов из коробки, drag-and-drop сортировка, дублирование, скрытие, удаление, предпросмотр черновика по защищённой ссылке.
- **Реестр виджетов**: добавление нового типа = одна папка (`src/widgets/<name>/`), без миграций.
- **Кейсы** (`Project`): slug, обложка, теги, год, статус draft/published, избранное, SEO-поля, блоки.
- **Заявки**: форма обратной связи → таблица `leads` (без почты). Антиспам: honeypot + rate-limit по IP + минимальное время заполнения. В админке — статусы, заметки, счётчик новых.
- **SEO**: `generateMetadata`, авто `sitemap.xml` и `robots.txt`, OG-теги, автогенерация og-image (`next/og`), JSON-LD (Person, CreativeWork), канонические URL, `next/image`, обязательный alt у изображений.
- **Auth**: единственный администратор, argon2, сессия в httpOnly cookie, rate-limit и аудит входов.
- **Настройки**: имя/позиционирование, контакты, hero-тексты, сниппет аналитики — редактируются без правки кода.
- **Деплой**: docker-compose (next + postgres + nginx с TLS), бэкап `pg_dump` по крону, сидер с демо-данными.

## Технологии

`Next.js 15` · `React 19` · `TypeScript (strict)` · `Prisma` · `PostgreSQL` · `Tailwind CSS` · `zod` · `@dnd-kit` · `sharp` · `@node-rs/argon2`

---

## Быстрый старт (локально)

Требуется Node 20+ и Docker.

```bash
# 1. Переменные окружения
cp .env.example .env        # отредактируйте при необходимости

# 2. Зависимости
npm install

# 3. База данных (Postgres в docker)
docker compose -p portfolio up -d db

# 4. Миграции + демо-данные (3 кейса, страница «Обо мне», админ)
npx prisma migrate dev
npm run db:seed

# 5. Запуск
npm run dev
```

- Сайт: http://localhost:3000
- Админка: http://localhost:3000/admin
- Логин/пароль администратора берутся из `ADMIN_EMAIL` / `ADMIN_PASSWORD` в `.env`
  (по умолчанию `admin@example.com` / `admin12345`).

Создать/сменить администратора отдельно:

```bash
npm run create:admin
```

> Примечание: имя каталога содержит кириллицу, поэтому docker-compose вызывается с явным
> именем проекта `-p portfolio` (оно же задано как `COMPOSE_PROJECT_NAME` в `.env`).

---

## Структура

```
src/
  app/
    (public)/            # публичные страницы (свой layout с шапкой/подвалом)
    admin/
      login/             # вход (вне защищённого layout)
      (panel)/           # защищённая часть: обзор, проекты, страницы, заявки, настройки
    api/
      contact/           # приём заявок
      admin/upload/      # загрузка изображений (sharp → webp)
      admin/preview/     # включение/выключение предпросмотра черновика
    og/                  # генерация og-image
    sitemap.ts, robots.ts
    uploads/[...path]/   # отдача загруженных файлов (dev/фолбэк; в prod — nginx)
  components/
    public/              # компоненты публичной части
    admin/               # поля форм, UI, конструктор (builder/)
  lib/                   # prisma, auth, storage-адаптер, валидация, утилиты
  widgets/               # реестр виджетов
    <widget>/def.ts      #   схема (zod) + метаданные + дефолты
    <widget>/render.tsx  #   серверный рендер на публичной части
    <widget>/editor.tsx  #   форма редактирования в админке
    registry.ts          #   список определений (без миграций)
    render-registry.tsx  #   карта серверных компонентов
    editor-registry.tsx  #   карта клиентских редакторов
prisma/
  schema.prisma, seed.ts
docker/                  # entrypoint, backup.sh
nginx/                   # конфиг reverse-proxy + TLS
```

## Как добавить новый виджет

1. Создайте папку `src/widgets/my-widget/` с тремя файлами:
   - `def.ts` — `defineWidget({ type, name, category, icon, schema, defaultData })`
   - `render.tsx` — серверный компонент `({ data }) => …`
   - `editor.tsx` — клиентская форма `({ data, onChange }) => …`
2. Зарегистрируйте в трёх местах: `registry.ts`, `render-registry.tsx`, `editor-registry.tsx`.

Миграции БД не требуются — данные блока хранятся в `Block.data` (jsonb) и валидируются схемой виджета.

---

## Деплой на VPS (docker-compose)

```bash
# 1. Клонируйте репозиторий на сервер и настройте окружение
cp .env.example .env
# Обязательно задайте:
#   SESSION_SECRET   — длинная случайная строка:  openssl rand -base64 48
#   POSTGRES_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD
#   NEXT_PUBLIC_SITE_URL=https://ваш-домен

# 2. TLS-сертификаты в ./nginx/certs/ (fullchain.pem, privkey.pem)
#    Например, через certbot/Let's Encrypt; затем скопируйте в эту папку.
#    Для теста можно сгенерировать самоподписанный:
#    openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
#      -keyout nginx/certs/privkey.pem -out nginx/certs/fullchain.pem -subj "/CN=localhost"

# 3. Первый запуск с автосидом демо-данных (опционально)
RUN_SEED=true docker compose -p portfolio up -d --build

# 4. Последующие запуски
docker compose -p portfolio up -d --build
```

При старте контейнер приложения автоматически применяет миграции (`prisma migrate deploy`).
Открыть `https://ваш-домен`, админка — `https://ваш-домен/admin`.

### Сервисы compose

- `db` — PostgreSQL 16 (том `db_data`)
- `app` — Next.js (standalone), том `uploads_data` для загруженных файлов
- `nginx` — reverse-proxy с TLS, отдаёт `/uploads` и статику напрямую
- `backup` — ежедневный `pg_dump` в `./backups` (03:00), ротация по `BACKUP_KEEP_DAYS`

### Бэкапы

Дампы складываются в `./backups/*.sql.gz`. Восстановление:

```bash
gunzip -c backups/portfolio-YYYYMMDD-HHMMSS.sql.gz | \
  docker compose -p portfolio exec -T db psql -U portfolio -d portfolio
```

---

## Скрипты

| Команда | Назначение |
|---|---|
| `npm run dev` | dev-сервер |
| `npm run build` | production-сборка (`prisma generate` + `next build`) |
| `npm run start` | запуск собранного приложения |
| `npm run typecheck` | проверка типов |
| `npm run prisma:migrate` | миграции (dev) |
| `npm run prisma:deploy` | миграции (prod) |
| `npm run db:seed` | демо-данные |
| `npm run create:admin` | создать/обновить администратора |

## Безопасность

- Все мутации админки — через server actions / route handlers с проверкой сессии (`requireUser`).
- Вся входная валидация — `zod` (формы, API, данные блоков).
- Пароли — argon2id; сессии — случайный токен, в БД хранится только его хеш.
- Rate-limit на логин и на форму заявок; аудит попыток входа (`LoginAttempt`).
- Сниппет аналитики из настроек вставляется как есть — задавайте его только из доверенного источника.

## Хранилище файлов

Загрузки идут через storage-адаптер (`src/lib/storage`). Сейчас — локальный диск (том `/uploads`),
изображения обрабатываются `sharp` (resize + webp). Чтобы перейти на S3, реализуйте `StorageAdapter`
и выберите его в `getStorage()` — вызывающий код менять не нужно.
