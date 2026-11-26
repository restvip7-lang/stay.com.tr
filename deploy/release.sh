#!/usr/bin/env bash
# Выкладка готовой сборки на сервер (сборка идёт в GitHub Actions, сервер её только принимает —
# памяти на сервере мало, собирать сайт на нём нельзя).
#
#   bash release.sh /home/stay/releases/<id>.tgz
#
# Архив: dist/, deploy/, scripts/, package.json, package-lock.json (собирает .github/workflows/deploy-vps.yml).
# scripts/ — то, что запускает cron (portfolio-sync.mjs, очистка кеша картинок); если в архиве их нет, остаются прежние.
# Шаги: распаковать → если поменялись зависимости, поставить их (только для работы, без сборочных) →
# подменить dist (старый остаётся в dist.prev) → перезапустить pm2 → проверить /ru/ →
# при сбое вернуть прежнюю версию → прогреть кэш главных страниц → оставить 3 последних архива.
set -euo pipefail
export PATH=/home/stay/node/bin:$PATH
main() {
  local ARCHIVE="$1"
  local APP=/home/stay/app
  mkdir -p /home/stay/releases
  REL="$(mktemp -d /home/stay/releases/unpack.XXXXXX)"
  trap 'rm -rf "$REL"' EXIT
  set -a; . /home/stay/stay.env; set +a
  local URL="http://127.0.0.1:${PORT:-4321}"
  HOST_HDR="${STAY_DOMAINS%%,*}"; HOST_HDR="${HOST_HDR:-stay.com.tr}"

  tar -xzf "$ARCHIVE" -C "$REL"
  [ -f "$REL/dist/server/entry.mjs" ] || { echo "В архиве нет dist/server/entry.mjs" >&2; exit 1; }
  cd "$APP"

  # Зависимости: только если поменялся package-lock.json. Прежние держим рядом для отката.
  local DEPS=0
  if ! cmp -s "$REL/package-lock.json" "$APP/package-lock.json"; then
    DEPS=1
    rm -rf node_modules.prev package.json.prev package-lock.json.prev
    [ -d node_modules ] && cp -a node_modules node_modules.prev
    cp package.json package.json.prev; cp package-lock.json package-lock.json.prev
    cp "$REL/package.json" "$REL/package-lock.json" .
    npm ci --omit=dev --no-audit --no-fund
  fi

  rm -rf dist.prev
  mv dist dist.prev
  mv "$REL/dist" dist
  rm -rf deploy.prev && mv deploy deploy.prev && mv "$REL/deploy" deploy
  local SCRIPTS=0
  if [ -d "$REL/scripts" ]; then
    SCRIPTS=1
    rm -rf scripts.prev; [ -d scripts ] && mv scripts scripts.prev
    mv "$REL/scripts" scripts
  fi

  pm2 startOrReload deploy/ecosystem.config.cjs --update-env
  if ! healthy "$URL"; then
    echo "Новая версия не отвечает — возвращаю прежнюю" >&2
    pm2 logs stay-site --lines 40 --nostream >&2 || true
    rm -rf dist && mv dist.prev dist
    rm -rf deploy && mv deploy.prev deploy
    if [ "$SCRIPTS" = 1 ]; then rm -rf scripts; [ -d scripts.prev ] && mv scripts.prev scripts; fi
    if [ "$DEPS" = 1 ]; then
      rm -rf node_modules; [ -d node_modules.prev ] && mv node_modules.prev node_modules
      mv package.json.prev package.json; mv package-lock.json.prev package-lock.json
    fi
    pm2 startOrReload deploy/ecosystem.config.cjs --update-env
    healthy "$URL" && echo "Прежняя версия работает" >&2
    exit 1
  fi
  pm2 save >/dev/null

  # Прогрев кэша страниц: после перезапуска он пустой, первые посетители ждали бы сборку страниц.
  for p in /en/ /tr/ /ru/turkey/sale/ /en/turkey/sale/ /ru/turkey/rent/ /ru/about/; do curl -fsS -o /dev/null -H "Host: $HOST_HDR" "$URL$p" || true; done

  # Храним 3 последних архива.
  { ls -1t /home/stay/releases/*.tgz 2>/dev/null || true; } | tail -n +4 | xargs -r rm -f
  echo "OK: $(cat dist/.release 2>/dev/null || basename "$ARCHIVE")"
}

healthy() {
  for _ in $(seq 1 20); do
    curl -fsS -o /dev/null -H "Host: $HOST_HDR" "$1/ru/" && return 0
    sleep 2
  done
  return 1
}

main "$@"
