# Сайт Stay на своём сервере (VPS)

Один и тот же код работает и на Vercel, и на своём сервере. Куда собирать, решает сборка:
на Vercel (есть переменная `VERCEL`) — адаптер Vercel, иначе — обычный Node-сервер (`STAY_TARGET=node`).

## Что на сервере работает иначе, чем на Vercel

| Что | Vercel | Свой сервер |
|---|---|---|
| Запуск | функции Vercel | `node dist/server/entry.mjs` под pm2 (1 процесс) |
| Настройки из админки (главная, SEO, объекты, ИИ-помощник, счётчики) | Vercel Blob | JSON-файлы в `STAY_DATA_DIR` (`src/lib/store.ts`) |
| Сжатие картинок | `/_vercel/image` | `/img` (sharp, кэш на диске, `src/pages/img.ts`) |
| Кэш страниц, 10 минут | CDN Vercel, сброс по тегам | в памяти процесса, сброс тем же `purge()` (`src/lib/pageCache.ts`) |
| Ночной сброс кэша 03:00 | Vercel Cron | cron пользователя `stay` |
| Выкладка | пуш в GitHub | пуш в `main` → GitHub Actions → SSH → `deploy/deploy.sh` |
| HTTPS | Vercel | nginx + бесплатный сертификат Let's Encrypt (certbot) |

## Сервер

Ubuntu 24.04, 2 ядра, 4 ГБ памяти, 40 ГБ диска. Сборка идёт на самом сервере, ей нужно около 1,5 ГБ памяти.

## Первый запуск

1. Зайти на сервер под root и выполнить:
   ```
   curl -fsSLO https://raw.githubusercontent.com/<владелец>/<репозиторий>/main/deploy/setup-server.sh
   bash setup-server.sh git@github.com:<владелец>/<репозиторий>.git
   ```
   Для приватного репозитория скрипт покажет ключ сервера: его нужно добавить в GitHub → репозиторий → Settings → Deploy keys (только чтение) и запустить скрипт ещё раз. Скрипт для приватного репозитория можно передать на сервер и как файл.
2. Заполнить `/home/stay/stay.env` по образцу `deploy/stay.env.example`: пароль админки, секреты, домены.
3. Собрать и запустить: `sudo -u stay bash /home/stay/app/deploy/deploy.sh`.
4. Направить домен на IP сервера (A-запись), потом выпустить SSL: `certbot --nginx -d stay.com.tr -d www.stay.com.tr`.

## Автовыкладка из GitHub

В репозитории в Settings → Secrets and variables → Actions добавить:
- `VPS_HOST` — IP или домен сервера;
- `VPS_USER` — `stay`;
- `VPS_SSH_KEY` — приватный ключ, публичная часть которого лежит на сервере в `/home/stay/.ssh/authorized_keys`.

После этого каждый пуш в `main` сам обновляет сайт (`.github/workflows/deploy-vps.yml`). Пока секретов нет, задача пропускается и ничего не ломает.

## Перенос настроек с Vercel

Настройки из админки (главная, SEO, отметки объектов) лежат в Vercel Blob. Перед переездом их можно скачать
и положить в `/home/stay/data/config/` с теми же именами файлов: `home.json`, `seo.json`, `objects.json`.
Ключ ИИ-помощника заново ввести в /admin: на сервере он шифруется другим секретом (`STAY_SECRET`).

## Полезное

- Логи: `sudo -u stay pm2 logs stay-site`
- Перезапуск: `sudo -u stay pm2 reload stay-site`
- Проверить кэш страницы: заголовок `x-stay-cache` (MISS — собрана сейчас, HIT — из кэша, STALE — старая копия при сбое API).
