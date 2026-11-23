// pm2: один процесс сайта (кэш страниц живёт в памяти процесса, поэтому не cluster).
module.exports = {
  apps: [
    {
      name: 'stay-site',
      cwd: '/home/stay/app',
      script: 'dist/server/entry.mjs',
      node_args: '--env-file=/home/stay/stay.env',
      exec_mode: 'fork',
      instances: 1,
      max_memory_restart: '1500M',
      time: true,
    },
  ],
};
