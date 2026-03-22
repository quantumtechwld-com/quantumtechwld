// PM2 Ecosystem — Quantum Technology Agency
// Uso: pm2 start ecosystem.config.cjs
//      pm2 reload ecosystem.config.cjs --update-env  (zero-downtime deploy)

module.exports = {
  apps: [
    {
      name: "quantum-agency",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/home/ubuntu/quantum-agency",

      // Cluster mode: usa todos os núcleos disponíveis da EC2
      instances: "max",
      exec_mode: "cluster",

      // Não reiniciar infinitamente se travar logo ao iniciar
      max_restarts: 5,
      min_uptime: "10s",

      // Variáveis de ambiente — valores reais ficam no .env.production.local
      // O Next.js lê automaticamente esse arquivo em NODE_ENV=production
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },

      // Logs
      out_file: "/home/ubuntu/logs/quantum-agency.out.log",
      error_file: "/home/ubuntu/logs/quantum-agency.err.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // Auto-restart ao consumir muita memória (proteção contra memory leak)
      max_memory_restart: "512M",

      // Graceful shutdown: aguarda conexões abertas fecharem
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
