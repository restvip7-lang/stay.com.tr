#!/usr/bin/env bash
# Привратник для ключа автовыкладки из GitHub. В /home/stay/.ssh/authorized_keys ключ пишется так:
#   command="/home/stay/bin/ssh-gate.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ssh-ed25519 AAAA... github-deploy
# Тогда этим ключом можно сделать только одно: передать архив сборки и выложить его —
#   ssh stay@сервер "release <id>" < site.tgz
# Никакой другой команды, оболочки или проброса портов ключ не даёт, даже если утечёт.
set -euo pipefail
cmd="${SSH_ORIGINAL_COMMAND:-}"
if [[ "$cmd" =~ ^release\ ([0-9a-f]{7,40})$ ]]; then
  id="${BASH_REMATCH[1]}"
  mkdir -p /home/stay/releases
  f="/home/stay/releases/$id.tgz"
  head -c 300000000 > "$f.part"   # не больше 300 МБ
  mv "$f.part" "$f"
  exec bash /home/stay/app/deploy/release.sh "$f"
fi
echo "Разрешена только команда: release <id>" >&2
exit 1
