@echo off
echo Starting React Frontend...
echo.
echo Make sure you have Node.js installed!
echo.
cd /d %~dp0
call npm install
call npm start
pause


