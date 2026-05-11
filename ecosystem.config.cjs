// PM2 Ecosystem — Quantum Technology Agency
// Uso: pm2 start ecosystem.config.cjs
//      pm2 reload ecosystem.config.cjs --update-env  (zero-downtime deploy)
//
// Alerta de downtime: pm2-health monitora a app e envia email quando ela cai.
// Instalação (apenas 1x no servidor):
//   pm2 install pm2-health
// Configuração (1x no servidor):
//   pm2 set pm2-health:smtp_host smtp.resend.com
//   pm2 set pm2-health:smtp_port 465
//   pm2 set pm2-health:smtp_secure true
//   pm2 set pm2-health:smtp_user resend
//   pm2 set pm2-health:smtp_password <RESEND_API_KEY do .env EMAIL_SERVER_PASSWORD>
//   pm2 set pm2-health:mail_from "noreply@quantumtechwld.com"
//   pm2 set pm2-health:mail_to felipepodesta@quantum-tech.com.br
//   pm2 set pm2-health:hold_period 30
//   pm2 set pm2-health:restart_crunch 5

module.exports = {
  apps: [
    {
      name: "quantum-agency",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/home/deploy/quantum-agency",

      // Cluster mode: 2 instâncias fixas — equilíbrio entre throughput e uso de RAM
      // Ajuste conforme o tipo de instância VPS (VPS HostGator: 2 instâncias)
      instances: 2,
      exec_mode: "cluster",

      // Limita o heap V8 por worker: 2 workers × 350 MB = 700 MB max heap.
      node_args: "--max-old-space-size=350",

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
      out_file: "/home/deploy/logs/quantum-agency.out.log",
      error_file: "/home/deploy/logs/quantum-agency.err.log",
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
