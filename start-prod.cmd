@echo off
cd /d "%~dp0"
echo Iniciando servidor Next.js em modo producao (sem Turbopack)...
npx next start -p 3001
