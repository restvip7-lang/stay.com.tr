#!/usr/bin/env bash
# Выкладка новой версии на сервере: забрать main из GitHub, собрать, перезапустить.
# Запускается из GitHub Actions по SSH (или руками): bash /home/stay/app/deploy/deploy.sh
set -euo pipefail
# Весь скрипт внутри функции: bash прочитает его целиком до git reset, который может поменять этот же файл.
main() {
  APP=/home/stay/app
  local BRANCH="${1:-main}"
  cd "$APP"
  set -a; . /home/stay/stay.env; set +a
  git fetch --depth 50 origin "$BRANCH"
  git reset --hard "origin/$BRANCH"
  npm ci --no-audit --no-fund
  STAY_TARGET=node npm run build
  pm2 startOrReload deploy/ecosystem.config.cjs --update-env
  pm2 save
  # Проверка, что сайт отвечает.
  for i in $(seq 1 20); do
    if curl -fsS -o /dev/null "http://127.0.0.1:${PORT:-4321}/ru/"; then echo "OK: $(git log -1 --format='%h %s')"; exit 0; fi
    sleep 2
  done
  echo "Сайт не ответил после выкладки" >&2
  pm2 logs stay-site --lines 50 --nostream >&2 || true
  exit 1
}
main "$@"
