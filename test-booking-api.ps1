# Complete Booking.com API Test Script
# Run this after subscribing to apidojo-booking-v1 on RapidAPI

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Booking.com API Integration Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$apiKey = "f8773763f0msh3f297929be5fb34p1f60f6jsn64bf649558e9"
$apiHost = "apidojo-booking-v1.p.rapidapi.com"
$backendUrl = "http://localhost:8080"

# Test 1: Direct API Call
Write-Host "[1/4] Testing Booking API directly..." -ForegroundColor Yellow
try {
    $headers = @{
        'x-rapidapi-key' = $apiKey
        'x-rapidapi-host' = $apiHost
    }
    $url = "https://$apiHost/properties/list-by-map?room_qty=1&guest_qty=1&bbox=48.815573,2.224199,48.902145,2.469921&price_filter_currencycode=EUR&languagecode=en-us&travel_purpose=leisure&order_by=popularity&offset=0"
    
    $response = Invoke-RestMethod -Uri $url -Headers $headers -TimeoutSec 15
    
    if ($response.result -and $response.result.Count -gt 0) {
        Write-Host "      ✓ SUCCESS - API is responding!" -ForegroundColor Green
        Write-Host "      Hotels found: $($response.result.Count)" -ForegroundColor Green
    } else {
        Write-Host "      ✗ API responded but no hotels found" -ForegroundColor Red
    }
} catch {
    Write-Host "      ✗ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "      → You need to SUBSCRIBE to apidojo-booking-v1 on RapidAPI" -ForegroundColor Yellow
    Write-Host "      → Visit: https://rapidapi.com/apidojo/api/booking-com" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Backend Health Check
Write-Host "[2/4] Testing backend health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$backendUrl/api/health/booking" -Method GET
    
    if ($health.status -eq "SUCCESS") {
        Write-Host "      ✓ Backend can reach Booking API" -ForegroundColor Green
        Write-Host "      HTTP Status: $($health.httpStatus)" -ForegroundColor Green
    } else {
        Write-Host "      ✗ Backend health check failed" -ForegroundColor Red
        Write-Host "      Error: $($health.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "      ⚠ Health endpoint not available (backend may need rebuild)" -ForegroundColor Yellow
}

Write-Host ""

# Test 3: Hotels Endpoint
Write-Host "[3/4] Testing hotels endpoint..." -ForegroundColor Yellow
try {
    $hotels = Invoke-RestMethod -Uri "$backendUrl/api/hotels?city=Paris" -Method GET
    
    if ($hotels) {
        try {
            $parsed = $hotels | ConvertFrom-Json
            if ($parsed.result -and $parsed.result.Count -gt 0) {
                Write-Host "      ✓ Hotels endpoint working!" -ForegroundColor Green
                Write-Host "      Hotels returned: $($parsed.result.Count)" -ForegroundColor Green
                Write-Host "      Sample hotel: $($parsed.result[0].hotel_name)" -ForegroundColor Green
            } else {
                Write-Host "      ⚠ Endpoint working but no hotels returned" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "      ⚠ Response parsing issue" -ForegroundColor Yellow
        }
    } else {
        Write-Host "      ✗ Empty response" -ForegroundColor Red
    }
} catch {
    Write-Host "      ✗ Backend not responding - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Other APIs (Destinations & Flights)
Write-Host "[4/4] Verifying other APIs still work..." -ForegroundColor Yellow
try {
    $dest = Invoke-RestMethod -Uri "$backendUrl/api/amadeus/destinations?keyword=Paris" -Method GET
    Write-Host "      ✓ Amadeus Destinations: OK" -ForegroundColor Green
} catch {
    Write-Host "      ⚠ Amadeus Destinations: Not tested" -ForegroundColor Yellow
}

try {
    $flights = Invoke-RestMethod -Uri "$backendUrl/api/flights?origin=PAR&destination=LON&departureDate=2026-03-01" -Method GET
    Write-Host "      ✓ Amadeus Flights: OK" -ForegroundColor Green
} catch {
    Write-Host "      ⚠ Amadeus Flights: Not tested" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Test Complete" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. If all tests passed, open http://localhost:4200" -ForegroundColor White
Write-Host "2. You should see hotels from Booking.com" -ForegroundColor White
Write-Host "3. If Test 1 failed, subscribe at: https://rapidapi.com/apidojo/api/booking-com" -ForegroundColor White
Write-Host ""
