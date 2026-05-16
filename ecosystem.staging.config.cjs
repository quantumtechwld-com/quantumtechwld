// PM2 Ecosystem — Quantum Technology Agency (STAGING)
// Uso: pm2 start ecosystem.staging.config.cjs
//      pm2 reload ecosystem.staging.config.cjs --update-env  (zero-downtime redeploy)
//
// Diferenças em relação ao ecosystem.config.cjs de produção:
//  - name: quantum-agency-staging
//  - cwd: /home/deploy/quantum-agency-staging
//  - PORT: 3001 (produção usa 3000)
//  - instances: 1 (fork, não cluster — staging não precisa de throughput)
//  - max-old-space-size: 350 MB (igual à produção por worker)

module.exports = {
  apps: [
    {
      name: "quantum-agency-staging",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/home/deploy/quantum-agency-staging",

      // 1 instância em modo fork para economizar RAM no mesmo VPS
      instances: 1,
      exec_mode: "fork",

      node_args: "--max-old-space-size=350",

      max_restarts: 5,
      min_uptime: "10s",

      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
      },

      // Logs separados para não misturar com produção
      out_file: "/home/deploy/logs/quantum-agency-staging.out.log",
      error_file: "/home/deploy/logs/quantum-agency-staging.err.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
