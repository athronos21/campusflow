@echo off
setlocal
echo ====================================================
echo CampusFlow - One-Click Monorepo Launcher
echo ====================================================
cd /d "%~dp0"
call pnpm.cmd dev:all
pause
