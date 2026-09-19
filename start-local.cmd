@echo off
cd /d "%~dp0"
node scripts/run-framework.mjs dev --host 127.0.0.1
pause
