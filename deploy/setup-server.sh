#!/usr/bin/env bash
# Первичная настройка чистого сервера Ubuntu 24.04 (запускать один раз от root):
#   bash setup-server.sh git@github.com:<владелец>/<репозиторий>.git
# Ставит Node 22, pm2, nginx, certbot; создаёт пользователя stay, папки, клонирует сайт, ставит cron.
set -euo pipefail
REPO="${1:?Укажите адрес репозитория}"
apt-get update
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
npm install -g pm2

id stay >/dev/null 2>&1 || adduser --disabled-password --gecos "" stay
sudo -u stay mkdir -p /home/stay/data /home/stay/.ssh
# Ключ сервера для чтения приватного репозитория (GitHub → репозиторий → Settings → Deploy keys → Add, только чтение).
[ -f /home/stay/.ssh/id_ed25519 ] || sudo -u stay ssh-keygen -t ed25519 -N "" -C "stay-vps" -f /home/stay/.ssh/id_ed25519
sudo -u stay sh -c 'ssh-keyscan -H github.com >> /home/stay/.ssh/known_hosts 2>/dev/null'
if [ ! -d /home/stay/app/.git ] && ! sudo -u stay git clone --depth 50 "$REPO" /home/stay/app; then
  echo "Не удалось склонировать $REPO. Добавьте этот ключ в Deploy keys репозитория и запустите скрипт ещё раз:"
  cat /home/stay/.ssh/id_ed25519.pub
  exit 1
fi
[ -f /home/stay/stay.env ] || { cp /home/stay/app/deploy/stay.env.example /home/stay/stay.env; chown stay:stay /home/stay/stay.env; chmod 600 /home/stay/stay.env; }

cp /home/stay/app/deploy/nginx-stay.conf /etc/nginx/sites-available/stay
ln -sf /etc/nginx/sites-available/stay /etc/nginx/sites-enabled/stay
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable

# pm2 стартует вместе с сервером.
env PATH="$PATH" pm2 startup systemd -u stay --hp /home/stay

# Ночной сброс кэша и снимок объектов (раньше это делал Vercel Cron), 03:00 по времени сервера.
CRON='0 3 * * * . /home/stay/stay.env && curl -fsS -H "Authorization: Bearer $CRON_SECRET" http://127.0.0.1:${PORT:-4321}/api/revalidate >/dev/null'
# Объекты из Portfolio: каждые 30 минут — только изменённые, ночью в 04:00 — все заново.
SYNC='cd /home/stay/app && node --env-file=/home/stay/stay.env scripts/portfolio-sync.mjs >> /home/stay/logs/portfolio-sync.log 2>&1'
SYNC_CRON="*/30 * * * * $SYNC
0 4 * * * $SYNC --full"
mkdir -p /home/stay/logs && chown stay:stay /home/stay/logs
( crontab -u stay -l 2>/dev/null | grep -v '/api/revalidate' | grep -v 'portfolio-sync'; echo "$CRON"; echo "$SYNC_CRON" ) | crontab -u stay -

echo "Готово. Дальше: заполнить /home/stay/stay.env, затем: sudo -u stay bash /home/stay/app/deploy/deploy.sh"
echo "SSL: certbot --nginx -d stay.com.tr -d www.stay.com.tr (когда домен смотрит на этот сервер)"
