@echo off
chcp 65001 >nul
title Instalar SeoulMate en XAMPP
set DEST=C:\xampp\htdocs\SeoulMate

echo.
echo  === SeoulMate: instalacion en XAMPP ===
echo.
if not exist "C:\xampp\htdocs" (
  echo  No encuentro C:\xampp\htdocs. Instala XAMPP o copia esta carpeta manualmente a tu htdocs.
  pause
  exit /b 1
)
if "%~dp0"=="" goto :err
echo  Copiando archivos a %DEST% ...
xcopy "%~dp0*" "%DEST%\" /E /I /Y /Q >nul
if errorlevel 1 (
  echo  No se pudo copiar. Recuerda: primero EXTRAE TODO el zip ^(clic derecho - Extraer todo^) y ejecuta este archivo desde la carpeta extraida.
  pause
  exit /b 1
)
echo.
echo  Listo. Falta solo esto, una vez:
echo   1. En XAMPP enciende Apache y MySQL.
echo   2. En phpMyAdmin ^(http://localhost/phpmyadmin^) pestaña SQL: pega todo schema.sql y pulsa Continuar.
echo.
echo  Abriendo el sitio...
start "" "http://localhost/SeoulMate/index.html"
start "" "http://localhost/phpmyadmin"
pause
exit /b 0
:err
exit /b 1
