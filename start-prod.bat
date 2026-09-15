@ECHO OFF
TITLE WebHaber - Production Server
ECHO.
ECHO ===================================================
ECHO  WebHaber Production Ortami Baslatiliyor
ECHO ===================================================
ECHO.

IF NOT EXIST backend\.env (
  ECHO [UYARI] backend\.env bulunamadi! .env.example kopyalaniyor...
  COPY backend\.env.example backend\.env
)

ECHO [1/3] Backend storage baglantisi kontrol ediliyor...
cd /d %~dp0backend
C:\php85\php.exe artisan storage:link >NUL 2>&1

ECHO [2/3] Backend API sunucusu baslatiliyor (port 8000)...
START "WebHaber API (Prod)" cmd /k "cd /d %~dp0backend && C:\php85\php.exe artisan serve --host=0.0.0.0 --port=8000"
TIMEOUT /T 2 /NOBREAK > NUL

ECHO [3/3] Frontend sunucusu baslatiliyor (port 3000)...
cd /d %~dp0frontend
START "WebHaber Frontend (Prod)" cmd /k "cd /d %~dp0frontend && npm start"

ECHO.
ECHO ===================================================
ECHO  Yayin Basarili!
ECHO  Site:     http://localhost:3000
ECHO  Admin:    http://localhost:3000/admin
ECHO  API:      http://localhost:8000/api
ECHO ===================================================
ECHO.
PAUSE
