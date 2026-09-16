@ECHO OFF
TITLE WebHaber - Gelistirme Sunucusu
ECHO.
ECHO ==========================================
ECHO  WebHaber Gelistirme Ortami Baslatiliyor
ECHO ==========================================
ECHO.
ECHO [1/2] Backend sunucusu baslatiliyor (port 8000)...
START "WebHaber Backend" cmd /k "cd /d c:\Users\ozcan\haber-sitesi\backend && C:\Users\ozcan\php85\php.exe artisan serve"
TIMEOUT /T 2 /NOBREAK > NUL
ECHO [2/2] Frontend sunucusu baslatiliyor (port 3000)...
START "WebHaber Frontend" cmd /k "cd /d c:\Users\ozcan\haber-sitesi\frontend && npm run dev"
ECHO.
ECHO ==========================================
ECHO  Hazir!
ECHO  Backend:  http://localhost:8000
ECHO  Frontend: http://localhost:3000
ECHO  Admin:    http://localhost:3000/admin
ECHO ==========================================
ECHO.
PAUSE
