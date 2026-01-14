@echo off
echo ============================================
echo     DNS FIX - Run as Administrator
echo ============================================
echo.
echo This will change your DNS to Google DNS (8.8.8.8)
echo.
pause

echo.
echo Detecting active network adapter...
for /f "tokens=2 delims=:" %%a in ('netsh interface show interface ^| findstr "Connected"') do set adapter=%%a

if "%adapter%"=="" (
    echo ERROR: Could not detect active network adapter
    pause
    exit /b 1
)

echo Found adapter: %adapter%
echo.
echo Setting DNS to 8.8.8.8 and 8.8.4.4...
netsh interface ip set dns name=%adapter% static 8.8.8.8 primary
netsh interface ip add dns name=%adapter% 8.8.4.4 index=2

echo.
echo Flushing DNS cache...
ipconfig /flushdns

echo.
echo Testing connection to Amadeus API...
ping -n 1 test.api.amadeus.com

if %errorlevel% equ 0 (
    echo.
    echo SUCCESS! DNS is now working!
    echo You can now start your backend.
) else (
    echo.
    echo WARNING: Still cannot reach Amadeus API
    echo You may need to restart your computer.
)

echo.
pause
