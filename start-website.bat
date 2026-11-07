@echo off
title Ancient India Research - lokaler Server
REM Startet das lokale Forschungsarchiv und oeffnet es im Browser.
REM Dieses Fenster offen lassen, solange die Seite genutzt wird. Schliessen = Server beenden.
set URL=http://localhost:5173

REM Laeuft der Server schon? Dann nur Browser oeffnen.
curl -s -o nul %URL%
if %errorlevel%==0 (
  start "" %URL%
  exit /b
)

cd /d "%~dp0website"
if not exist node_modules (
  echo Installiere Abhaengigkeiten ...
  call npm install || goto :error
)
echo Starte Server auf %URL% ...  (Fenster offen lassen)
call npm run dev
goto :eof

:error
echo Installation fehlgeschlagen. Ist Node.js installiert?  https://nodejs.org
pause
