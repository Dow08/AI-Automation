module.exports = {
  apps: [
    {
      name: 'hermes-dashboard',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/mnt/e/Hermes/hermes-dashboard',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      error_file: '/mnt/e/Hermes/logs/hermes-error.log',
      out_file: '/mnt/e/Hermes/logs/hermes-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
