@echo off
echo ========================================
echo   Installing Git for Windows
echo ========================================
echo.
echo This script will install Git system-wide.
echo You may be prompted for administrator privileges.
echo.
pause

"%TEMP%\Git-Installer.exe" /VERYSILENT /NORESTART /NOCANCEL /SP- /COMPONENTS=icons,ext\shellhere,assoc,assoc_sh

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo Please close and reopen PowerShell for Git to be available.
echo.
pause

