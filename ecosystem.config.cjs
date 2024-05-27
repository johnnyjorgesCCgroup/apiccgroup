module.exports = {
  apps: [
    {
      name: 'my-app',
      script: 'app.js',
      instances: 'max', // utiliza todos los núcleos disponibles
      exec_mode: 'cluster', // usa el modo cluster para aprovechar múltiples núcleos
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
