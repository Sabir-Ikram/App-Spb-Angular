@echo off
REM Start VoyageConnect Backend with Amadeus API Configuration
REM Make sure to set AMADEUS_API_KEY and AMADEUS_API_SECRET before running

if not defined AMADEUS_API_KEY (
    echo.
    echo ERROR: AMADEUS_API_KEY environment variable not set!
    echo.
    echo Please set your Amadeus API credentials:
    echo   setx AMADEUS_API_KEY "your_api_key"
    echo   setx AMADEUS_API_SECRET "your_api_secret"
    echo.
    exit /b 1
)

echo.
echo Starting VoyageConnect Backend...
echo API Key configured: %AMADEUS_API_KEY%
echo.

cd backend
call mvnw.ps1 spring-boot:run
